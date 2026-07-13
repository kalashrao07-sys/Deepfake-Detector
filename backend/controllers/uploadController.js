// ============================================================
// controllers/uploadController.js
// Real AI detection using:
//   - Sightengine API  → images & videos
//   - Gemini API       → PDF, PPT, DOCX, TXT
// ============================================================

const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

function safeParseReasons(value, fallbackDetails, prediction) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (error) {
      return [value];
    }
  }

  if (fallbackDetails) {
    return [fallbackDetails];
  }

  if (prediction === 'Real') {
    return ['Low AI probability and consistent authenticity signals.'];
  }

  if (prediction === 'Fake') {
    return ['High AI probability and strong manipulation indicators.'];
  }

  return [];
}

// ============================================================
// SIGHTENGINE DETECTION — for images and videos
// aiProb returned: 0.0 = real, 1.0 = AI-generated
// ============================================================

async function analyzeWithSightengine(filePath, mimeType) {
  try {
    const isVideo = mimeType.startsWith('video/');

    if (isVideo) {
      // ---- Video: submit then poll for result ----
      const form = new FormData();
      form.append('media', fs.createReadStream(filePath));
      form.append('models', 'genai');
      form.append('api_user', process.env.SIGHTENGINE_USER);
      form.append('api_secret', process.env.SIGHTENGINE_SECRET);

      const submitRes = await axios.post(
        'https://api.sightengine.com/1.0/video/check-workflow.json',
        form,
        { headers: form.getHeaders() }
      );

      const workflowId = submitRes.data.workflow_id;
      let aiScore = 0.5;
      let attempts = 0;

      // Poll every 3 seconds, up to 10 times
      while (attempts < 10) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await axios.get(
          'https://api.sightengine.com/1.0/video/check-workflow.json',
          {
            params: {
              workflow_id: workflowId,
              api_user: process.env.SIGHTENGINE_USER,
              api_secret: process.env.SIGHTENGINE_SECRET,
            },
          }
        );

        if (pollRes.data.status === 'finished') {
          const frames = pollRes.data.data?.frames || [];
          if (frames.length > 0) {
            const total = frames.reduce((sum, f) => sum + (f.genai?.score || 0), 0);
            aiScore = total / frames.length;
          }
          break;
        }
        attempts++;
      }

      return buildResult(aiScore, 'video');

    } else {
      // ---- Image: direct check ----
      const form = new FormData();
      form.append('media', fs.createReadStream(filePath));
      form.append('models', 'genai');
      form.append('api_user', process.env.SIGHTENGINE_USER);
      form.append('api_secret', process.env.SIGHTENGINE_SECRET);

      const res = await axios.post(
        'https://api.sightengine.com/1.0/check.json',
        form,
        { headers: form.getHeaders() }
      );

      // type.ai_generated is the probability (0=real, 1=AI)
      const aiProb = res.data?.type?.ai_generated ?? 0.5;
      return buildResult(aiProb, 'image');
    }

  } catch (err) {
    console.error('Sightengine error:', err.response?.data || err.message);
    return {
      prediction: 'Unknown',
      authenticityScore: 50,
      details: 'Sightengine API error — could not analyze file',
      reasons: ['Sightengine could not complete the analysis.'],
    };
  }
}

// ============================================================
// GEMINI DETECTION — for PDF, DOCX, PPTX, TXT
// Sends file content to Gemini and asks if it's AI-written
// ============================================================

async function analyzeWithGemini(filePath, mimeType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    const prompt = `You are an expert AI content detection system.

Analyze this document and determine if the content is AI-generated or human-written.

Look for these AI indicators:
- Overly perfect structure and formatting
- Repetitive sentence patterns
- Lack of personal voice or specific details
- Generic transitions and phrasing
- Unnaturally consistent tone with zero errors

Respond ONLY with a valid JSON object, no extra text:
{
  "prediction": "Fake",
  "ai_probability": 0.85,
  "authenticity_score": 15,
      "reason": "One sentence explanation",
      "reasons": ["Short reason 1", "Short reason 2", "Short reason 3"]
}

Rules:
- prediction must be exactly "Fake" (AI-generated) or "Real" (human-written)
- ai_probability: 0.0 = definitely human, 1.0 = definitely AI
- authenticity_score: 0 to 100, higher = more human/authentic
- These must be consistent: if prediction is Fake, authenticity_score should be low`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        ],
      }
    );

    // Parse Gemini's JSON response
    const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      prediction: parsed.prediction,
      authenticityScore: parseFloat(Number(parsed.authenticity_score).toFixed(2)),
      details: parsed.reason || 'Gemini document analysis complete',
      reasons: safeParseReasons(parsed.reasons, parsed.reason || 'Gemini document analysis complete', parsed.prediction),
    };

  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    return {
      prediction: 'Unknown',
      authenticityScore: 50,
      details: 'Gemini API error — could not analyze document',
    };
  }
}

// ============================================================
// Helper: Convert Sightengine AI probability to our result format
// ============================================================

function buildResult(aiProb, mediaType) {
  const authenticityScore = parseFloat(((1 - aiProb) * 100).toFixed(2));
  const prediction = aiProb >= 0.5 ? 'Fake' : 'Real';

  let details = '';
  let reasons = [];
  if (aiProb >= 0.8)
    details = `High confidence AI-generated ${mediaType} — ${(aiProb * 100).toFixed(0)}% AI probability detected by Sightengine`;
  else if (aiProb >= 0.5)
    details = `Likely AI-generated ${mediaType} — ${(aiProb * 100).toFixed(0)}% AI probability detected by Sightengine`;
  else if (aiProb >= 0.3)
    details = `Likely authentic ${mediaType} with minor AI indicators — ${(aiProb * 100).toFixed(0)}% AI probability`;
  else
    details = `Authentic ${mediaType} — only ${(aiProb * 100).toFixed(0)}% AI probability detected by Sightengine`;

  if (prediction === 'Fake') {
    reasons = [
      `AI probability is ${(aiProb * 100).toFixed(0)}%, which is at or above the fake threshold.`,
      'The detected pattern contains stronger manipulation indicators than authenticity signals.',
      'The media behaves more like generated content than a clean original capture.',
    ];
  } else {
    reasons = [
      `AI probability stays low at ${(aiProb * 100).toFixed(0)}%, which supports a real result.`,
      'No strong synthetic artifact pattern was detected in the analysis.',
      'Authenticity signals outweighed manipulation indicators during inspection.',
    ];
  }

  return { prediction, authenticityScore, details, reasons };
}

// ============================================================
// Determine which API to use based on MIME type
// ============================================================

function getFileCategory(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'text/plain'
  ) return 'document';
  return 'unknown';
}

// ============================================================
// MAIN UPLOAD HANDLER
// ============================================================

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const category = getFileCategory(mimeType);

    if (category === 'unknown') {
      return res.status(400).json({ message: 'Unsupported file type. Upload images, videos, PDFs, DOCX, or PPTX.' });
    }

    let analysis;
    let analyzedBy;

    if (category === 'image' || category === 'video') {
      console.log(`🔍 Analyzing ${category} with Sightengine...`);
      analysis = await analyzeWithSightengine(filePath, mimeType);
      analyzedBy = 'Sightengine';
    } else {
      console.log(`🔍 Analyzing document with Gemini...`);
      analysis = await analyzeWithGemini(filePath, mimeType);
      analyzedBy = 'Gemini';
    }

    // Save to MySQL
    const [result] = await db.query(
      `INSERT INTO uploads (user_id, file_name, file_type, prediction, authenticity_score, analysis_details, analysis_reasons)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        req.file.filename,
        mimeType,
        analysis.prediction,
        analysis.authenticityScore,
        analysis.details,
        JSON.stringify(analysis.reasons || []),
      ]
    );

    res.status(201).json({
      message: 'File analyzed successfully!',
      uploadId: result.insertId,
      fileName: req.file.filename,
      prediction: analysis.prediction,
      authenticityScore: analysis.authenticityScore,
      details: analysis.details,
      reasons: analysis.reasons,
      analyzedBy,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// ---- GET USER UPLOAD HISTORY ----
const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      `SELECT id, file_name, file_type, prediction, authenticity_score, analysis_details, analysis_reasons, upload_date
       FROM uploads WHERE user_id = ? ORDER BY upload_date DESC`,
      [userId]
    );
    res.json({ uploads: rows });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

// ---- GET SINGLE UPLOAD REPORT ----
const getReport = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const [rows] = await db.query(
      `SELECT u.*, us.name as user_name, us.email as user_email
       FROM uploads u JOIN users us ON u.user_id = us.id
       WHERE u.id = ?`,
      [uploadId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Upload not found' });
    res.json({
      report: {
        ...rows[0],
        reasons: safeParseReasons(rows[0].analysis_reasons, rows[0].analysis_details, rows[0].prediction),
      },
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

// ---- REPORT A FAKE UPLOAD ----
const reportUpload = async (req, res) => {
  try {
    const { uploadId, userId, reason } = req.body;
    if (!uploadId || !userId || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await db.query(
      'INSERT INTO reports (upload_id, user_id, reason) VALUES (?, ?, ?)',
      [uploadId, userId, reason]
    );
    res.status(201).json({ message: 'Report submitted successfully!' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Error submitting report' });
  }
};

module.exports = { uploadFile, getHistory, getReport, reportUpload };
