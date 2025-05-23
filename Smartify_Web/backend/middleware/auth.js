const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token doğrulama middleware'i
 */
exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('Authorization header bulunamadı');
            return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
        }
        
        const token = authHeader.split(' ')[1];

        if (!token) {
            console.log('Token boş veya geçersiz format');
            return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
        }

        console.log('Token doğrulanıyor...');
        
        // Token'ı doğrula
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartify-jwt-secret');
            console.log('Token başarıyla doğrulandı. Kullanıcı ID:', decoded.userId);
        } catch (jwtError) {
            console.error('JWT doğrulama hatası:', jwtError.name, jwtError.message);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Oturum süreniz doldu, lütfen tekrar giriş yapın',
                    expired: true
                });
            }
            
            return res.status(401).json({ 
                message: 'Geçersiz token, lütfen tekrar giriş yapın',
                invalid: true
            });
        }
        
        // Kullanıcının veritabanında varlığını kontrol et
        const userExists = await User.findById(decoded.userId).select('_id name email isAdmin isVerified');
        
        if (!userExists) {
            console.error('Token doğrulandı fakat kullanıcı veritabanında bulunamadı. ID:', decoded.userId);
            return res.status(401).json({ message: 'Geçersiz kullanıcı' });
        }
        
        console.log('Kullanıcı bulundu:', userExists.name, '(Admin:', userExists.isAdmin, ')');
        
        // Kullanıcı bilgilerini req nesnesi üzerine ekle
        req.user = {
            _id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            isAdmin: userExists.isAdmin,
            isVerified: userExists.isVerified
        };
        
        next();
    } catch (error) {
        console.error('Token doğrulama hatası (kritik):', error);
        next(error);
    }
};

/**
 * Admin kullanıcıları için yetkilendirme middleware'i
 */
exports.isAdmin = (req, res, next) => {
    if (!req.user) {
        console.error('isAdmin middleware: req.user tanımlı değil');
        return res.status(401).json({ message: 'Yetkilendirme başarısız' });
    }
    
    if (!req.user.isAdmin) {
        console.error('Admin yetkisi reddedildi. Kullanıcı:', req.user.name, req.user.email);
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    console.log('Admin yetkisi doğrulandı. Kullanıcı:', req.user.name);
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