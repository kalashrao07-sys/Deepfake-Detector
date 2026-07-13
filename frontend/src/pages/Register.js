// ============================================================
// src/pages/Register.js — with post-register loading screen
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiShield, FiCheck } from 'react-icons/fi';
import { registerUser } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(form);
      // Show loading screen before redirecting to login
      setShowLoadingScreen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Called when loading screen finishes
  const handleLoadingDone = () => {
    navigate('/login');
  };

  return (
    <>
      {showLoadingScreen && (
        <LoadingScreen
          message="Setting Up Your Account..."
          duration={1500}
          onComplete={handleLoadingDone}
        />
      )}

      <div className="auth-shell page-shell">
        <aside className="auth-panel-left cyber-grid">
          <div className="auth-panel-left-content">
            <div className="cyber-badge mono" style={{ marginBottom: 18 }}>
              ONBOARDING SEQUENCE
            </div>
            <div className="auth-form-title" style={{ color: 'var(--text-primary)', marginBottom: 18 }}>
              JOIN US
            </div>
            <div className="auth-points">
              <div className="auth-point">
                <FiCheck className="auth-point-icon" />
                <span>Instant file analysis with cyber-forensic scoring and audit-ready results.</span>
              </div>
              <div className="auth-point">
                <FiCheck className="auth-point-icon" />
                <span>Secure history tracking for every scan, report, and moderation action.</span>
              </div>
              <div className="auth-point">
                <FiCheck className="auth-point-icon" />
                <span>Access the dashboard, detect engine, and reporting workflow from one account.</span>
              </div>
            </div>
          </div>
          <div className="vertical-label">JOIN US</div>
        </aside>

        <main className="auth-panel-right">
          <div className="auth-form fade-in">
            <div className="auth-step">
              <div className="dashboard-tag">[ ACCOUNT INFO ]</div>
              <div className="auth-step-line" />
            </div>

            <div style={{ marginBottom: 28 }}>
              <div className="dashboard-tag" style={{ marginBottom: 10 }}>
                <FiShield /> CREATE PROFILE
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 8 }}>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Join DeepGuard today and start scanning suspicious media.</p>
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
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <FiUser className="auth-input-icon" />
                <input
                  className="custom-input auth-input-line auth-input-with-icon"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  placeholder="john@email.com"
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
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-custom"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Login
              </Link>
            </p>
          </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Register;
