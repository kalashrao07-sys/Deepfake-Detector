// ============================================================
// src/pages/Login.js — with post-login loading screen
// ============================================================

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import { loginUser } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const pendingRole = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(form);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Store role so we can redirect after loading screen
      pendingRole.current = res.data.user.role;
      // Show loading screen instead of navigating immediately
      setShowLoadingScreen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Called when loading screen finishes — then redirect
  const handleLoadingDone = () => {
    if (pendingRole.current === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {showLoadingScreen && (
        <LoadingScreen
          message="Authenticating Identity..."
          duration={1500}
          onComplete={handleLoadingDone}
        />
      )}

      <div className="auth-shell page-shell">
        <aside className="auth-panel-left cyber-grid">
          <div className="auth-panel-left-content">
            <div className="cyber-badge mono" style={{ marginBottom: 18 }}>
              SECURE ACCESS CHANNEL
            </div>
            <div className="auth-form-title" style={{ color: 'var(--text-primary)' }}>
              DEEPGUARD
            </div>
            <p className="auth-form-subtitle" style={{ maxWidth: 300 }}>
              Authenticate to enter the detection grid and review forensic scans in real time.
            </p>
          </div>
          <div className="vertical-label">SCANNING AUTHORITY</div>
        </aside>

        <main className="auth-panel-right">
          <div className="auth-form fade-in">
            <div style={{ marginBottom: 28 }}>
              <div className="dashboard-tag" style={{ marginBottom: 10 }}>
                <FiShield /> SYSTEM LOGIN
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 8 }}>Login</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Access your DeepGuard dashboard and analysis tools.</p>
            </div>

          {error && (
            <div style={{
              background: 'rgba(255,61,87,0.1)',
              border: '1px solid rgba(255,61,87,0.3)',
              color: '#ff3d57',
              padding: '10px 16px',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-wrap">
              <label className="auth-input-label">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail className="auth-input-icon" />
                <input
                  className="custom-input auth-input-line auth-input-with-icon"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrap">
              <label className="auth-input-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock className="auth-input-icon" />
                <input
                  className="custom-input auth-input-line auth-input-with-icon"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-custom"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Register
              </Link>
            </p>
          </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Login;
