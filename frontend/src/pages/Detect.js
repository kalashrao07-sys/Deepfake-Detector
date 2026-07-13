// ============================================================
// src/pages/Detect.js — Upload & Analyze any file type
// Images/Videos → Sightengine | Documents → Gemini
// ============================================================

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUpload, FiCheckCircle, FiAlertTriangle,
  FiX, FiSearch, FiImage, FiVideo, FiFile
} from 'react-icons/fi';
import { uploadFile } from '../services/api';

// Helper: pick icon based on file type
function FileIcon({ mimeType, size = 20 }) {
  if (mimeType?.startsWith('image/')) return <FiImage size={size} style={{ color: 'var(--primary)' }} />;
  if (mimeType?.startsWith('video/')) return <FiVideo size={size} style={{ color: 'var(--primary)' }} />;
  return <FiFile size={size} style={{ color: 'var(--primary)' }} />;
}

// Helper: which API will be used
function getApiLabel(mimeType) {
  if (!mimeType) return '';
  if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) return 'Sightengine';
  return 'Gemini';
}

function Detect() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError('');
    // Only show preview for images
    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect({ target: { files: e.dataTransfer.files } });
  };

  const handleScan = async () => {
    if (!file) return setError('Please select a file first.');
    if (!user) { navigate('/login'); return; }

    setLoading(true);
    setProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const res = await uploadFile(formData, (pct) => setProgress(pct));
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const apiLabel = getApiLabel(file?.type);

  const supportedFormats = [
    'JPG / PNG / WEBP',
    'MP4 / MOV / AVI',
    'PDF',
    'DOCX',
    'PPTX',
    'TXT',
  ];

  return (
    <div className="page-shell cyber-grid" style={{ padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: 920 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="dashboard-tag" style={{ marginBottom: 12 }}>
            FORENSIC ANALYSIS ENGINE
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', marginBottom: 10 }}>
            <span className="gradient-text">Detect</span> Manipulation Before It Spreads
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 720 }}>
            Upload a media file and DeepGuard will run the correct forensic engine, then return a structured authenticity verdict.
          </p>
        </div>

        {!result && (
          <div className="format-row" style={{ marginBottom: 22 }}>
            {supportedFormats.map((format) => (
              <span key={format} className="cyber-badge format-chip">{format}</span>
            ))}
          </div>
        )}

        {!result && (
          <div className="custom-card" style={{ padding: 24, marginBottom: 24 }}>
            <div
              className={`upload-zone ${file ? 'active' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !file && fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.docx,.pptx,.xlsx,.txt"
                style={{ display: 'none' }}
              />

              {!file ? (
                <div>
                  <FiUpload size={64} style={{ color: 'var(--primary)', opacity: 0.7, marginBottom: 18 }} />
                  <div className="mono" style={{ fontSize: 16, letterSpacing: '0.14em', marginBottom: 10, color: 'var(--text-primary)' }}>
                    DROP FILE TO INITIATE SCAN
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 0 }}>
                    Images, videos, PDFs, DOCX, PPTX, XLSX, TXT - up to 50MB.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 14, marginBottom: 18, objectFit: 'contain' }}
                    />
                  )}
                  <div className="upload-terminal" onClick={(e) => e.stopPropagation()}>
                    <div className="terminal-bar" style={{ marginBottom: 14 }}>
                      <span className="terminal-dot primary" />
                      <span className="terminal-dot success" />
                      <span className="terminal-dot" />
                      <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 12, letterSpacing: '0.14em' }}>
                        FILE READY
                      </span>
                    </div>
                    <div className="terminal-entry"><span>&gt;</span><span>File: {file.name}</span></div>
                    <div className="terminal-entry"><span>&gt;</span><span>Type: {file.type || 'unknown'}</span></div>
                    <div className="terminal-entry"><span>&gt;</span><span>Size: {(file.size / 1024).toFixed(1)} KB</span></div>
                    <div className="terminal-entry"><span>&gt;</span><span>Engine: {apiLabel || 'Pending'}</span></div>
                    <div className="terminal-entry" style={{ marginTop: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReset(); }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, fontFamily: 'JetBrains Mono' }}
                      >
                        &gt; CLEAR FILE
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,61,87,0.1)',
                border: '1px solid rgba(255,61,87,0.3)',
                color: '#ff3d57',
                padding: '10px 16px',
                borderRadius: 8,
                marginTop: 16,
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {loading && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {progress < 100 ? 'Uploading...' : `Analyzing with ${apiLabel}...`}
                  </span>
                  <span className="mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>{progress}%</span>
                </div>
                <div className="scan-line-shell" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                  <span>{apiLabel} is analyzing your file...</span>
                  <span className="mono">{progress}%</span>
                </div>
              </div>
            )}

            {file && !loading && (
              <button
                className="btn-primary-custom"
                onClick={handleScan}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 18, fontSize: 16 }}
              >
                <FiSearch /> Analyze with {apiLabel}
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="custom-card fade-in result-hero">
            <div style={{ minHeight: '30%' }}>
              <div className="dashboard-tag" style={{ marginBottom: 12 }}>
                {result.prediction === 'Real' ? 'AUTHENTIC SIGNAL' : 'MANIPULATION DETECTED'}
              </div>
              <div className="result-verdict" style={{ color: result.prediction === 'Real' ? 'var(--secondary)' : 'var(--danger)' }}>
                {result.prediction === 'Real' ? 'AUTHENTIC CONTENT' : 'MANIPULATED CONTENT'}
              </div>
            </div>

            <div className="result-divider" />

            <div style={{ display: 'grid', gap: 24, alignItems: 'center' }}>
              <div>
                <div className="score-ring">
                  <div className="score-ring-value" style={{ color: result.prediction === 'Real' ? 'var(--secondary)' : 'var(--danger)' }}>
                    {result.authenticityScore}%
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.12em' }}>
                  AUTHENTICITY SCORE
                </div>
              </div>

              <div className="result-breakdown">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>File</span>
                  <span>{result.fileName?.substring(14) || result.fileName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Engine</span>
                  <span>{result.analyzedBy}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Finding</span>
                  <span style={{ textAlign: 'right' }}>{result.details}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Key Reasons
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {(result.reasons?.length ? result.reasons : [result.details]).map((reason, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 1, background: 'rgba(0,212,255,0.12)' }} />
                <button
                  className="btn-primary-custom"
                  onClick={handleReset}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <FiUpload /> Analyze Another File
                </button>
              </div>
            </div>
          </div>
        )}

        {!file && !result && (
          <div className="row g-3" style={{ marginTop: 8 }}>
            {[
              { step: '01', title: 'Upload Any File', desc: 'Image, video, PDF, DOCX, or PPTX' },
              { step: '02', title: 'Real API Analysis', desc: 'Sightengine or Gemini analyzes it' },
              { step: '03', title: 'Genuine Result', desc: 'Get a real AI-detection score' },
            ].map((item) => (
              <div key={item.step} className="col-md-4">
                <div className="custom-card" style={{ textAlign: 'center', minHeight: 160 }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, letterSpacing: '0.12em' }}>
                    {item.step}
                  </div>
                  <h6 style={{ fontWeight: 700 }}>{item.title}</h6>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Detect;
