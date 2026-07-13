// ============================================================
// src/components/Navbar.js
// Navigation bar with mobile hamburger menu
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShield, FiUser, FiMenu, FiX } from 'react-icons/fi';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Track user from localStorage so we can update on logout/login
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    const handleStorage = () => setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    navigate('/login');
  };

  // Check if a link is active
  const isActive = (path) => location.pathname === path;

  // Close menu on link click
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="navbar-custom">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand-custom" onClick={handleLinkClick}>
          <FiShield style={{ marginRight: 8, color: 'var(--primary)' }} />
          <span>DEEP</span>
          <span className="navbar-brand-accent" style={{ marginLeft: 4 }}>GUARD</span>
        </Link>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <Link
            to="/"
            className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Home
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard"
                className={`nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <Link
                to="/detect"
                className={`nav-link-custom ${isActive('/detect') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                Detect
              </Link>
              <Link
                to="/reports"
                className={`nav-link-custom ${isActive('/reports') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                Reports
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`nav-link-custom ${isActive('/admin') ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  Admin
                </Link>
              )}
            </>
          )}

          {!user && (
            <>
              <Link to="/register" className="nav-link-custom" onClick={handleLinkClick}>
                Register
              </Link>
              <Link to="/login" className="nav-link-custom" onClick={handleLinkClick}>
                Login
              </Link>
            </>
          )}

          {user && (
            <>
              <span className="nav-user-badge">
                <span className="nav-user-dot" />
                <FiUser size={13} />
                {user.name}
              </span>
              <button
                className="nav-link-custom"
                onClick={handleLogout}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      <div className="navbar-cyan-line" />
    </nav>
  );
}

export default Navbar;
