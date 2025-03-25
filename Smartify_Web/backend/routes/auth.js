const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user || !user.isAdmin) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
        }

        // Şifreyi kontrol et
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
        }

        // Token oluştur
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 