const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Kullanıcı ön kaydı - E-posta doğrulama kodu gönderir
router.post('/pre-register', authController.preRegister);

// Kullanıcı kaydı tamamlama ve doğrulama
router.post('/complete-register', authController.completeRegister);

// Kullanıcı kaydı - Geleneksel yöntem
router.post('/register', authController.register);

// E-posta doğrulama
router.post('/verify', authController.verifyEmail);

// Doğrulama kodunu tekrar gönder
router.post('/resend-verification', authController.resendVerificationCode);

// Kullanıcı girişi
router.post('/login', authController.login);

// Kullanıcı profili bilgilerini getir
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router; 