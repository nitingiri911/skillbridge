const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/matching');

// POST /api/jobs - recruiter posts a new job
// body: { title, description, required_skills: [], stipend, location, deadline }
router.post('/', authenticate, requireRole('recruiter'), async (req, res) => {
  const { title, description, required_skills, stipend, location, deadline } = req.body;
  if (!title || !required_skills?.length) {
    return res.status(400).json({ error: 'title and required_skills are required' });
  }

  try {
    const companyResult = await pool.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    const companyId = companyResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO jobs (company_id, title, description, required_skills, stipend, location, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [companyId, title, description, required_skills, stipend, location, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// GET /api/jobs/mine - recruiter's own posted jobs with application counts
router.get('/mine', authenticate, requireRole('recruiter'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(a.id) AS application_count
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE c.user_id = $1
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your jobs' });
  }
});

// GET /api/jobs - list all jobs, matched + sorted for the logged-in student
router.get('/', authenticate, requireRole('student'), async (req, res) => {
  try {
    const profileResult = await pool.query('SELECT skills FROM student_profiles WHERE user_id = $1', [req.user.id]);
    const studentSkills = profileResult.rows[0]?.skills || [];

    const jobsResult = await pool.query(
      `SELECT j.*, c.company_name FROM jobs j JOIN companies c ON c.id = j.company_id
       WHERE j.deadline >= CURRENT_DATE OR j.deadline IS NULL
       ORDER BY j.created_at DESC`
    );

    const jobsWithScores = jobsResult.rows.map((job) => ({
      ...job,
      match_score: calculateMatchScore(studentSkills, job.required_skills),
    }));

    jobsWithScores.sort((a, b) => b.match_score - a.match_score);

    res.json(jobsWithScores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id/candidates - recruiter sees ranked applicants for their job
router.get('/:id/candidates', authenticate, requireRole('recruiter'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, sp.skills, sp.cgpa, sp.resume_url, u.name, u.email
       FROM applications a
       JOIN student_profiles sp ON sp.id = a.student_id
       JOIN users u ON u.id = sp.user_id
       WHERE a.job_id = $1
       ORDER BY a.match_score DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

module.exports = router;