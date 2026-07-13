-- ============================================================
-- Deepfake Detection and Fake Media Verification System
-- Database Setup SQL File
-- Run this in phpMyAdmin or MySQL terminal
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS deepfake_detection_system_v2;

-- Step 2: Use the database
USE deepfake_detection_system_v2;

-- Step 3: Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  prediction ENUM('Real', 'Fake') NOT NULL,
  authenticity_score DECIMAL(5,2) NOT NULL,
  analysis_details TEXT,
  analysis_reasons TEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 5: Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  upload_id INT NOT NULL,
  user_id INT NOT NULL,
  reason VARCHAR(500) NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 6: Insert a default admin user
-- Password is: admin123 (plain text for demo; in production, use bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@deepfake.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- ============================================================
-- Done! Database is ready.
-- ============================================================
