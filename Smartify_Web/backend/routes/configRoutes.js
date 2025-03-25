const express = require('express');
const router = express.Router();

// Config bilgilerini getir
router.get('/', (req, res) => {
  res.json({
    geminiApiKey: process.env.GEMINI_API_KEY
  });
});

module.exports = router; 