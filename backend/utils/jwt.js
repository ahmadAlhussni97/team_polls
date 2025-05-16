const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev_secret';
const EXPIRY = '10m'; // 10 minutes

function generateAnonToken() {
  const payload = {
    sub: `anon_${Date.now()}`, // unique per session
    type: 'anon',
  };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateAnonToken, verifyToken };
