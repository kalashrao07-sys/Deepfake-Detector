// ============================================================
// controllers/adminController.js
// Admin panel - view all uploads, users, and delete entries
// ============================================================

const db = require('../config/db');

// ---- GET ALL UPLOADS (Admin View) ----
const getAllUploads = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.file_name, u.file_type, u.prediction, u.authenticity_score,
              u.upload_date, us.name as user_name, us.email as user_email
       FROM uploads u
       JOIN users us ON u.user_id = us.id
       ORDER BY u.upload_date DESC`
    );

    res.json({ uploads: rows });
  } catch (error) {
    console.error('Admin uploads error:', error);
    res.status(500).json({ message: 'Error fetching uploads' });
  }
};

// ---- GET ALL USERS (Admin View) ----
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: rows });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// ---- DELETE AN UPLOAD (Admin Only) ----
const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM uploads WHERE id = ?', [id]);

    res.json({ message: 'Upload deleted successfully!' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting upload' });
  }
};

// ---- GET DASHBOARD STATS ----
const getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalUploads }]] = await db.query('SELECT COUNT(*) as totalUploads FROM uploads');
    const [[{ fakeCount }]] = await db.query("SELECT COUNT(*) as fakeCount FROM uploads WHERE prediction = 'Fake'");
    const [[{ realCount }]] = await db.query("SELECT COUNT(*) as realCount FROM uploads WHERE prediction = 'Real'");
    const [[{ totalReports }]] = await db.query('SELECT COUNT(*) as totalReports FROM reports');

    res.json({
      stats: {
        totalUsers,
        totalUploads,
        fakeCount,
        realCount,
        totalReports,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

module.exports = { getAllUploads, getAllUsers, deleteUpload, getStats };
