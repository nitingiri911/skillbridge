const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/matching');

// POST /api/applications - student applies to a job
// body: { job_id }
router.post('/', authenticate, requireRole('student'), async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ error: 'job_id is required' });

  try {
    const profileResult = await pool.query('SELECT id, skills FROM student_profiles WHERE user_id = $1', [req.user.id]);
    const student = profileResult.rows[0];
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const jobResult = await pool.query('SELECT required_skills FROM jobs WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) return res.status(404).json({ error: 'Job not found' });

    const matchScore = calculateMatchScore(student.skills, jobResult.rows[0].required_skills);

    const result = await pool.query(
      `INSERT INTO applications (student_id, job_id, match_score, status)
       VALUES ($1, $2, $3, 'applied') RETURNING *`,
      [student.id, job_id, matchScore]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already applied to this job' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// GET /api/applications/me - student's own application history
router.get('/me', authenticate, requireRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, j.title, c.company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       JOIN student_profiles sp ON sp.id = a.student_id
       WHERE sp.user_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PATCH /api/applications/:id/status - recruiter updates application status
// body: { status: 'shortlisted' | 'rejected' | 'selected' }
router.patch('/:id/status', authenticate, requireRole('recruiter'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['applied', 'shortlisted', 'rejected', 'selected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
