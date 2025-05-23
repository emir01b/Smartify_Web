const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kullanıcı kimlik doğrulama
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartify-jwt-secret');
      
      // Decoded token içindeki id veya userId'yi kullan
      const userId = decoded.userId || decoded.id;
      
      if (!userId) {
        throw new Error('Token içerisinde kullanıcı kimliği bulunamadı');
      }

      req.user = await User.findById(userId).select('-password');
      
      if (!req.user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error.message);
      res.status(401).json({ message: 'Yetkilendirme başarısız, token geçersiz' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı' });
  }
};

// Admin kullanıcı kontrolü
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Yetkilendirme başarısız, admin değilsiniz' });
  }
};

module.exports = { protect, admin }; 