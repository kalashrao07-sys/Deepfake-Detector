// ============================================================
// src/pages/Dashboard.js
// User dashboard with stats and recent uploads
// ============================================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUpload, FiCheckCircle, FiAlertTriangle, FiFile, FiClock, FiArrowRight } from 'react-icons/fi';
import { getUserHistory } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
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
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate quick stats
  const totalUploads = uploads.length;
  const realCount = uploads.filter((u) => u.prediction === 'Real').length;
  const fakeCount = uploads.filter((u) => u.prediction === 'Fake').length;

  const stats = [
    { icon: <FiFile size={24} />, label: 'Total Scans', value: totalUploads, color: 'var(--primary)' },
    { icon: <FiCheckCircle size={24} />, label: 'Real Media', value: realCount, color: 'var(--success)' },
    { icon: <FiAlertTriangle size={24} />, label: 'Fake Detected', value: fakeCount, color: 'var(--danger)' },
  ];

  return (
    <div className="page-shell cyber-grid" style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ marginBottom: 30 }}>
          <div className="dashboard-tag" style={{ marginBottom: 12 }}>
            SYSTEM ACCESS GRANTED
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', marginBottom: 10 }}>
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's an overview of your detection activity.</p>
        </div>

        <div className="row g-3 mb-4">
          {stats.map((s, i) => (
            <div key={i} className="col-md-4">
              <div className={`custom-card stat-strip-card ${i === 1 ? 'success' : i === 2 ? 'danger' : ''}`}>
                <div className="stat-icon-label">
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                </div>
                <div className="stat-strip-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <Link to="/detect" style={{ textDecoration: 'none' }}>
              <div className="custom-card quick-action-card" style={{ cursor: 'pointer', minHeight: 148 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <div className="dashboard-tag" style={{ marginBottom: 12 }}>
                      <FiUpload /> START SCAN
                    </div>
                    <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Scan New File</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>Upload an image or video to check for deepfakes.</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6">
            <Link to="/reports" style={{ textDecoration: 'none' }}>
              <div className="custom-card quick-action-card" style={{ cursor: 'pointer', minHeight: 148 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <div className="dashboard-tag" style={{ marginBottom: 12 }}>
                      <FiClock /> HISTORY LOG
                    </div>
                    <h5 style={{ fontWeight: 700, marginBottom: 8 }}>View History</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>See all your previous scans and results.</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="custom-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '22px 24px 0' }}>
            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Recent Scans</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 18 }}>Latest activity from your account.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : uploads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              <FiUpload size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>No scans yet. Upload your first file!</p>
              <Link to="/detect" className="btn-primary-custom" style={{ textDecoration: 'none', marginTop: 12 }}>
                Start Scanning
              </Link>
            </div>
          ) : (
            <div className="custom-table-wrapper">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.slice(0, 5).map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontSize: 13 }}>{u.file_name.substring(14)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{u.file_type}</td>
                      <td className="status-cell">
                        <span className={u.prediction === 'Real' ? 'score-badge-real' : 'score-badge-fake'}>
                          {u.prediction}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{u.authenticity_score}%</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {new Date(u.upload_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
