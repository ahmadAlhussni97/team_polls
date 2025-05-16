const express = require('express');
const router = express.Router();
const { generateAnonToken } = require('../utils/jwt');

router.post('/anon', (req, res) => {
  const token = generateAnonToken();
  res.json({ token });
});

module.exports = router;
