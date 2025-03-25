const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Kullanıcı kimlik doğrulama
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Yetkilendirme başarısız, token geçersiz');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkilendirme başarısız, token bulunamadı');
  }
};

// Admin kullanıcı kontrolü
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Yetkilendirme başarısız, admin değilsiniz');
  }
};

module.exports = { protect, admin }; 