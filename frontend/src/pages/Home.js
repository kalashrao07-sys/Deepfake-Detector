// ============================================================
// src/pages/Home.js - Landing Page
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const features = [
    {
      number: '01',
      title: 'Forensic Scanning',
      desc: 'Run deep media checks against neural signatures, metadata traces, and artifact patterns in real time.',
    },
    {
      number: '02',
      title: 'Truth Confidence',
      desc: 'See an authenticity score that surfaces the strongest indicators of manipulation at a glance.',
    },
    {
      number: '03',
      title: 'Evidence Trail',
      desc: 'Review scan history, reports, and admin controls in a single audited workflow.',
    },
  ];

  const stats = [
    { value: '99.2%', label: 'Detection Coverage' },
    { value: '3s', label: 'Average Scan Time' },
    { value: '24/7', label: 'Monitoring' },
  ];

  return (
    <div className="page-shell cyber-grid">
      <section className="container hero-layout">
        <div className="hero-copy fade-in">
          <div className="cyber-badge mono" style={{ marginBottom: 18 }}>
            AI-POWERED · REAL-TIME · FORENSIC ANALYSIS
          </div>

          <h1>
            Expose the <span className="gradient-text">Fake.</span>
            <br />
            Protect the <span className="gradient-text">Truth.</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 30 }}>
            DeepGuard inspects media with a cyber-forensics workflow that surfaces tampering signals,
            authenticity scores, and evidence you can act on immediately.
          </p>

          <div className="hero-buttons">
            <Link to="/detect" className="btn-primary-custom" style={{ textDecoration: 'none' }}>
              Start Scanning
            </Link>
          </div>
        </div>

        <div className="custom-card hero-panel float-soft">
          <div className="terminal-window mono">
            <div className="terminal-bar">
              <span className="terminal-dot primary" />
              <span className="terminal-dot success" />
              <span className="terminal-dot" />
              <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 12, letterSpacing: '0.14em' }}>
                ANALYSIS RUNNING...
              </span>
            </div>

            <div style={{ display: 'grid', gap: 12, fontSize: 13, color: '#d9e4f2', lineHeight: 1.8 }}>
              <span className="terminal-line delayed-1">&gt; Scanning file: sample_video.mp4</span>
              <span className="terminal-line delayed-2">&gt; Running ELA analysis...</span>
              <span className="terminal-line delayed-3">&gt; Checking metadata integrity...</span>
              <span className="terminal-line delayed-4">&gt; Cross-referencing neural signatures...</span>
              <span className="terminal-line delayed-5">&gt; RESULT: MANIPULATED [87.3% confidence]</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="page-section">
        <div className="container">
          <div className="feature-grid">
            {features.map((feature) => (
              <div key={feature.number} className="custom-card feature-number-card">
                <div className="feature-number">{feature.number}</div>
                <h4 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{feature.title}</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-banner">
        <div className="container stats-banner-grid">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="stat-value">{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-simple">
        <p>© 2026 DeepGuard. Expose manipulation. Protect trust.</p>
      </footer>
    </div>
  );
}

export default Home;
