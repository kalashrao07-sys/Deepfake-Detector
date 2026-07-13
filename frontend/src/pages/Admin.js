// ============================================================
// src/pages/Admin.js
// Admin dashboard - view all uploads and users, delete uploads
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiUsers, FiUpload, FiBarChart2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { adminGetUploads, adminGetUsers, adminDeleteUpload, adminGetStats } from '../services/api';

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [activeTab, setActiveTab] = useState('uploads');  // 'uploads' or 'users'
  const [uploads, setUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only admins can access this page
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uploadsRes, usersRes, statsRes] = await Promise.all([
        adminGetUploads(),
        adminGetUsers(),
        adminGetStats(),
      ]);
      setUploads(uploadsRes.data.uploads);
      setUsers(usersRes.data.users);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an upload
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    try {
      await adminDeleteUpload(id);
      setUploads(uploads.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const statCards = stats ? [
    { icon: <FiUsers size={22} />, label: 'Total Users', value: stats.totalUsers, color: 'var(--primary)' },
    { icon: <FiUpload size={22} />, label: 'Total Uploads', value: stats.totalUploads, color: 'var(--secondary)' },
    { icon: <FiCheckCircle size={22} />, label: 'Real Media', value: stats.realCount, color: 'var(--success)' },
    { icon: <FiAlertTriangle size={22} />, label: 'Fake Detected', value: stats.fakeCount, color: 'var(--danger)' },
  ] : [];

  return (
    <div className="page-shell cyber-grid" style={{ padding: '40px 0', minHeight: '90vh' }}>
      <div className="container">
        <div style={{ marginBottom: 30 }}>
          <div className="admin-header-row">
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', margin: 0 }}>
              Admin Dashboard
            </h1>
            <span className="admin-badge">ADMIN ACCESS</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 10 }}>
            Manage all uploads, users, and system data.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              {statCards.map((s, i) => (
                <div key={i} className="col-md-6">
                  <div className="custom-card admin-stat-card" style={{ minHeight: 150 }}>
                    <div className="admin-watermark">{s.icon}</div>
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '75%' }}>
                      <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-tabs" style={{ marginBottom: 20 }}>
              {[
                { key: 'uploads', label: 'All Uploads', icon: <FiUpload /> },
                { key: 'users', label: 'All Users', icon: <FiUsers /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'uploads' && (
              <div className="admin-table-shell">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>File</th>
                      <th>Prediction</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((u) => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>#{u.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.user_name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{u.user_email}</div>
                        </td>
                        <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.file_name}
                        </td>
                        <td className={`status-cell ${u.prediction === 'Real' ? 'real' : 'fake'}`}>
                          <span className={u.prediction === 'Real' ? 'score-badge-real' : 'score-badge-fake'}>
                            {u.prediction}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{u.authenticity_score}%</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {new Date(u.upload_date).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="admin-trash-btn"
                            aria-label="Delete upload"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    No uploads found.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-table-shell">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                        <td style={{ color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
