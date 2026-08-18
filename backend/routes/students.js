const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/students/me - get logged-in student's own profile
router.get('/me', authenticate, requireRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT sp.*, u.name, u.email FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/students/me - update profile
// body: { skills: [], interests: [], cgpa, college, branch, graduation_year, resume_url }
router.put('/me', authenticate, requireRole('student'), async (req, res) => {
  const { skills, interests, cgpa, college, branch, graduation_year, resume_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE student_profiles
       SET skills = COALESCE($1, skills),
           interests = COALESCE($2, interests),
           cgpa = COALESCE($3, cgpa),
           college = COALESCE($4, college),
           branch = COALESCE($5, branch),
           graduation_year = COALESCE($6, graduation_year),
           resume_url = COALESCE($7, resume_url),
           updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [skills, interests, cgpa, college, branch, graduation_year, resume_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
