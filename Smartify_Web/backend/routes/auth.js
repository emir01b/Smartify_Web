const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyUser,
  getProfile
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyUser);
router.get('/me', authenticateToken, getProfile);

// API bağlantı kontrolü için endpoint
router.get('/check', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'API bağlantı kontrolü başarılı' });
});

module.exports = router;