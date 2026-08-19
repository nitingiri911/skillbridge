const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
require('dotenv').config();

// Store the uploaded file in memory temporarily, then push it to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// POST /api/resume/upload - student uploads their resume PDF
router.post('/upload', authenticate, requireRole('student'), upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const key = `resumes/user-${req.user.id}-${Date.now()}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: 'application/pdf',
      })
    );

    // Store the S3 key (not a public URL, since the bucket is private)
    // in the student's profile so it can be retrieved later via a signed URL
    await pool.query(
      'UPDATE student_profiles SET resume_url = $1, updated_at = NOW() WHERE user_id = $2',
      [key, req.user.id]
    );

    res.json({ message: 'Resume uploaded successfully', key });
  } catch (err) {
    console.error('S3 upload error:', err);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// GET /api/resume/:key/url - generate a temporary signed link to view a resume
// (works for both the student themselves and recruiters viewing candidates,
// since the bucket stays private)
router.get('/:key/url', authenticate, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
    res.json({ url: signedUrl });
  } catch (err) {
    console.error('Signed URL error:', err);
    res.status(500).json({ error: 'Failed to generate resume link' });
  }
});

module.exports = router;
