const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'tourist_secret_key_2024';

// --- In-memory "tourist" database ---
const tourists = [
  { id: 1, username: 'tourist1', password: 'pass123', name: 'Alice', destination: 'Paris' },
  { id: 2, username: 'tourist2', password: 'pass456', name: 'Bob',   destination: 'Tokyo' },
];

// ============================================================
// 1. LOGIN — POST /api/login
//    Body: { "username": "tourist1", "password": "pass123" }
//    Returns: JWT token
// ============================================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Find tourist
  const tourist = tourists.find(
    t => t.username === username && t.password === password
  );

  if (!tourist) {
    return res.status(401).json({ status: 401, message: 'Invalid credentials' });
  }

  // Generate JWT token (expires in 1 hour)
  const token = jwt.sign(
    { id: tourist.id, username: tourist.username, name: tourist.name },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    status: 200,
    message: 'Login successful',
    token: token,
    tourist: { id: tourist.id, name: tourist.name, destination: tourist.destination }
  });
});

// ============================================================
// 2. MIDDLEWARE — Verify JWT Token
// ============================================================
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expects: Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ status: 403, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 401, message: 'Invalid or expired token' });
    }
    req.tourist = decoded; // attach decoded tourist data
    next();
  });
}

// ============================================================
// 3. VALIDATE TOKEN — GET /api/validate
//    Header: Authorization: Bearer <token>
//    Returns: 200 OK with tourist info if valid
// ============================================================
app.get('/api/validate', verifyToken, (req, res) => {
  return res.status(200).json({
    status: 200,
    message: 'Token is valid ✅',
    tourist: {
      id: req.tourist.id,
      username: req.tourist.username,
      name: req.tourist.name
    }
  });
});

// ============================================================
// 4. UPDATE TOKEN — POST /api/update-token
//    Header: Authorization: Bearer <old_token>
//    Returns: New refreshed JWT token
// ============================================================
app.post('/api/update-token', verifyToken, (req, res) => {
  // Issue a fresh token with new expiry
  const newToken = jwt.sign(
    { id: req.tourist.id, username: req.tourist.username, name: req.tourist.name },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    status: 200,
    message: 'Token updated successfully ✅',
    token: newToken
  });
});

// ============================================================
// 5. PROTECTED ROUTE — GET /api/profile
//    Header: Authorization: Bearer <token>
// ============================================================
app.get('/api/profile', verifyToken, (req, res) => {
  const tourist = tourists.find(t => t.id === req.tourist.id);
  return res.status(200).json({
    status: 200,
    message: '200 OK',
    profile: tourist
  });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 JWT Tourist Auth Server running at http://localhost:${PORT}`);
  console.log('='.repeat(55));
  console.log('  POST /api/login          → Get JWT token');
  console.log('  GET  /api/validate       → Validate token (200 OK)');
  console.log('  POST /api/update-token   → Refresh/Update token');
  console.log('  GET  /api/profile        → Protected tourist profile');
  console.log('='.repeat(55));
});
