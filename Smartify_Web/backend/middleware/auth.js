const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Geçersiz token' });
        }
        next(error);
    }
}; 