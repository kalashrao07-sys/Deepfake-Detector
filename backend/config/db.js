// ============================================================
// config/db.js - MySQL Database Connection
// Uses mysql2 to connect to XAMPP MySQL
// ============================================================

const mysql = require('mysql2');
require('dotenv').config();

const databaseName = process.env.DB_NAME || 'deepfake_detection_system_v2';

const bootstrapInitialization = (async () => {
  const bootstrapConnection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  const bootstrapDb = bootstrapConnection.promise();
  await bootstrapDb.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  bootstrapConnection.end();
})();

// Create a connection pool (better than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
});

// Convert pool to use promises (async/await friendly)
const db = pool.promise();

db.initialization = bootstrapInitialization;

db.ensureSchema = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      prediction ENUM('Real', 'Fake') NOT NULL,
      authenticity_score DECIMAL(5,2) NOT NULL,
      analysis_details TEXT,
      analysis_reasons TEXT,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      upload_id INT NOT NULL,
      user_id INT NOT NULL,
      reason VARCHAR(500) NOT NULL,
      reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await db.query(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'uploads'
       AND COLUMN_NAME = 'analysis_reasons'`,
    [databaseName]
  );

  if (rows.length === 0) {
    await db.query('ALTER TABLE uploads ADD COLUMN analysis_reasons TEXT NULL AFTER analysis_details');
  }
};

bootstrapInitialization
  .then(() => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
      } else {
        console.log('✅ MySQL Database connected successfully!');
        connection.release();
      }
    });
  })
  .catch((error) => {
    console.error('❌ Database bootstrap failed:', error.message);
  });

module.exports = db;
