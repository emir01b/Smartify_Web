const express = require('express');
const router = express.Router();

// Config bilgilerini getir
router.get('/', (req, res) => {
  res.json({});
});

module.exports = router; 