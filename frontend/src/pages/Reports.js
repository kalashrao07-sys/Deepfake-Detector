// ============================================================
// src/pages/Reports.js
// Shows user's upload history and allows reporting fake content
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFile, FiInfo } from 'react-icons/fi';
import { getUserHistory } from '../services/api';

function parseReasons(value, fallbackDetails, prediction) {
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

function Reports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getUserHistory(user.id);
      setUploads(res.data.uploads);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell cyber-grid" style={{ padding: '40px 0', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: 920 }}>
        <div style={{ marginBottom: 30 }}>
          <div className="dashboard-tag" style={{ marginBottom: 10 }}>
            MY SCAN REPORTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', margin: 0 }}>
              Report Timeline
            </h1>
            <span className="cyber-badge mono">[{uploads.length}] RECORDS FOUND</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 10 }}>
            Full history of all your uploaded media and detection results.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading your reports...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="custom-card" style={{ textAlign: 'center', padding: 60 }}>
            <FiFile size={48} style={{ color: 'var(--text-secondary)', marginBottom: 16, opacity: 0.4 }} />
            <h4 style={{ fontWeight: 700 }}>No Reports Yet</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Upload a file to see your detection results here.</p>
          </div>
        ) : (
          <div className="timeline-wrap">
            {uploads.map((upload) => (
              <div key={upload.id} className="timeline-item">
                <div className="timeline-date">
                  {new Date(upload.upload_date).toLocaleString()}
                </div>
                <div className="custom-card report-card">
                  <span className={`report-badge ${upload.prediction === 'Real' ? 'score-badge-real' : 'score-badge-fake'}`}>
                    {upload.prediction}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 18, paddingRight: 90 }}>
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: 6 }}>
                        {upload.file_name.substring(14) || upload.file_name}
                      </h4>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{upload.file_type}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>Authenticity Score</span>
                    <span>{upload.authenticity_score}%</span>
                  </div>
                  <div className="report-bar" style={{ marginBottom: 14 }}>
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${upload.authenticity_score}%`,
                        background: upload.prediction === 'Real'
                          ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
                          : 'linear-gradient(90deg, var(--danger), var(--warning))',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {upload.prediction === 'Real'
                      ? 'This scan leans toward authentic media.'
                      : 'This scan contains strong indicators of manipulation.'}
                  </div>

                  <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Summary:</strong>{' '}
                    {upload.analysis_details || (upload.prediction === 'Real'
                      ? 'Low AI probability and consistent authenticity signals.'
                      : 'High AI probability and strong manipulation indicators.')}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text-secondary)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      <FiInfo />
                      Reason Details
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {parseReasons(upload.analysis_reasons, upload.analysis_details, upload.prediction).map((reason, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'var(--text-primary)',
                            fontSize: 13,
                            lineHeight: 1.6,
                          }}
                        >
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;