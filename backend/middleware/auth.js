const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifies JWT token, attaches decoded user to req.user
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // { id, role, email }
    next();
  });
}

// Restricts a route to a specific role (student / recruiter)
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access restricted to ${role}s` });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
