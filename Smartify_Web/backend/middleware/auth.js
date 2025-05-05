const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token doğrulama middleware'i
 */
exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartify-jwt-secret');
        
        // userId token içerisinden geliyor
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Geçersiz token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token süresi dolmuş' });
        }
        next(error);
    }
};

/**
 * Admin kullanıcıları için yetkilendirme middleware'i
 */
exports.isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
};

/**
 * Doğrulanmış kullanıcılar için yetkilendirme middleware'i
 */
exports.isVerified = (req, res, next) => {
    if (!req.user || !req.user.isVerified) {
        return res.status(403).json({ message: 'Lütfen önce e-posta adresinizi doğrulayın' });
    }
    next();
}; 