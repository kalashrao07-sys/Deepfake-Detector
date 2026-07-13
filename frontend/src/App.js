// ============================================================
// src/App.js - Main App with startup loading screen
// ============================================================

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Detect from './pages/Detect';
import Reports from './pages/Reports';
import Admin from './pages/Admin';

function App() {
  // Show loading screen on first open for 2.5 seconds
  const [appLoading, setAppLoading] = useState(true);

  return (
    <Router>
      {/* Startup loading screen */}
      {appLoading && (
        <LoadingScreen
          message="Verifying Media Integrity..."
          duration={2500}
          onComplete={() => setAppLoading(false)}
        />
      )}

      {/* Main app — only shown after loading */}
      {!appLoading && (
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
