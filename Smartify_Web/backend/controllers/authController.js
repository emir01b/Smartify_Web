const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailSender');
const { generateVerificationCode, generateExpiryTime } = require('../utils/verificationUtils');

// JWT token oluşturma
const generateToken = (user) => {
    // Admin kullanıcılar için daha uzun süreli token (7 gün), normal kullanıcılar için 24 saat
    const expiresIn = user.isAdmin ? '7d' : '24h';
    
    return jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin, isVerified: user.isVerified },
        process.env.JWT_SECRET || 'smartify-jwt-secret',
        { expiresIn }
    );
};

/**
 * Yeni kullanıcı ön kaydı - Doğrulama kodu gönderir
 * @route POST /api/auth/pre-register
 */
const preRegister = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Email formatını kontrol et
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Geçerli bir e-posta adresi girin' });
        }

        // Şifre uzunluğunu kontrol et
        if (password.length < 6) {
            return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
        }

        // Kullanıcı var mı diye kontrol et
        const existingUser = await User.findOne({ email });
        
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
        }
        
        // Kullanıcı var ama doğrulanmamış, doğrulama koduyla güncelle
        if (existingUser && !existingUser.isVerified) {
            // Doğrulama kodu oluştur
            const verificationCode = generateVerificationCode();
            const verificationCodeExpires = generateExpiryTime(15); // 15 dakika geçerli
            
            // Kullanıcıyı güncelle
            existingUser.verificationCode = verificationCode;
            existingUser.verificationCodeExpires = verificationCodeExpires;
            existingUser.name = name; // İsmi güncelle
            
            // Şifreyi güncelle (şifre model tarafında hashlenecek)
            existingUser.password = password;
            
            await existingUser.save();
            
            // Doğrulama e-postası gönder
            const emailSent = await sendVerificationEmail(email, verificationCode, name);
            
            if (!emailSent) {
                return res.status(500).json({
                    message: 'Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.',
                    userId: existingUser._id
                });
            }
            
            return res.status(200).json({
                message: 'Doğrulama kodu e-posta adresinize gönderildi.',
                userId: existingUser._id
            });
        }

        // Yeni kullanıcı oluştur
        // Doğrulama kodu oluştur
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = generateExpiryTime(15); // 15 dakika geçerli

        // Kullanıcıyı kaydet
        const user = new User({
            name,
            email,
            password,
            verificationCode,
            verificationCodeExpires,
            isVerified: false
        });

        await user.save();

        // Doğrulama e-postası gönder
        const emailSent = await sendVerificationEmail(email, verificationCode, name);

        if (!emailSent) {
            return res.status(500).json({
                message: 'Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.',
                userId: user._id
            });
        }

        // Başarılı ön kayıt
        res.status(201).json({
            message: 'Doğrulama kodu e-posta adresinize gönderildi.',
            userId: user._id
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Kullanıcı kaydını tamamla ve doğrula
 * @route POST /api/auth/complete-register
 */
const completeRegister = async (req, res, next) => {
    try {
        const { userId, verificationCode, name, email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcı zaten doğrulanmış mı kontrol et
        if (user.isVerified) {
            return res.status(400).json({ message: 'Bu hesap zaten doğrulanmış' });
        }

        // E-posta adresi değişmiş mi kontrol et
        if (user.email !== email) {
            return res.status(400).json({ message: 'E-posta adresi değiştirilemez' });
        }
        
        // Doğrulama kodunun süresi dolmuş mu kontrol et
        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod talep edin.' });
        }

        // Doğrulama kodunu kontrol et
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Geçersiz doğrulama kodu' });
        }

        // Kullanıcıyı doğrulanmış olarak işaretle ve bilgilerini güncelle
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        user.name = name;
        
        // Şifreyi güncelle (isteğe bağlı)
        if (password) {
            user.password = password;
        }
        
        await user.save();

        // Token oluştur ve gönder
        const token = generateToken(user);

        // Kullanıcı bilgilerini gönder
        res.json({
            message: 'Kayıt ve e-posta doğrulama başarılı',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Yeni kullanıcı kaydı - Doğrulama kodu gönderir
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Email formatını kontrol et
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Geçerli bir e-posta adresi girin' });
        }

        // Şifre uzunluğunu kontrol et
        if (password.length < 6) {
            return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
        }

        // Kullanıcı var mı diye kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
        }

        // Doğrulama kodu oluştur
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = generateExpiryTime(15); // 15 dakika geçerli

        // Kullanıcıyı kaydet
        const user = new User({
            name,
            email,
            password,
            verificationCode,
            verificationCodeExpires,
            isVerified: false
        });

        await user.save();

        // Doğrulama e-postası gönder
        const emailSent = await sendVerificationEmail(email, verificationCode, name);

        if (!emailSent) {
            // E-posta gönderilemedi, ancak kullanıcı oluşturuldu
            return res.status(201).json({
                message: 'Kullanıcı kaydedildi ancak doğrulama e-postası gönderilemedi. Lütfen yönetici ile iletişime geçin.',
                userId: user._id,
                needVerification: true
            });
        }

        // Başarılı kayıt
        res.status(201).json({
            message: 'Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama kodunu girin.',
            userId: user._id,
            needVerification: true
        });
    } catch (error) {
        next(error);
    }
};

/**
 * E-posta doğrulama
 * @route POST /api/auth/verify
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { userId, verificationCode } = req.body;

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcı zaten doğrulanmış mı kontrol et
        if (user.isVerified) {
            return res.status(400).json({ message: 'Bu hesap zaten doğrulanmış' });
        }

        // Doğrulama kodunun süresi dolmuş mu kontrol et
        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: 'Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olun.' });
        }

        // Doğrulama kodunu kontrol et
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Geçersiz doğrulama kodu' });
        }

        // Kullanıcıyı doğrulanmış olarak işaretle
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        // Token oluştur ve gönder
        const token = generateToken(user);

        // Kullanıcı bilgilerini gönder
        res.json({
            message: 'E-posta doğrulama başarılı',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Tekrar doğrulama kodu gönderme
 * @route POST /api/auth/resend-verification
 */
const resendVerificationCode = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcı zaten doğrulanmış mı kontrol et
        if (user.isVerified) {
            return res.status(400).json({ message: 'Bu hesap zaten doğrulanmış' });
        }

        // Yeni doğrulama kodu oluştur
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = generateExpiryTime(15); // 15 dakika geçerli

        // Kullanıcıyı güncelle
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        // Doğrulama e-postası gönder
        const emailSent = await sendVerificationEmail(user.email, verificationCode, user.name);

        if (!emailSent) {
            return res.status(500).json({ message: 'Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
        }

        res.json({
            message: 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta adresinizi kontrol edin.',
            userId: user._id
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Kullanıcı girişi
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
        }

        // Şifreyi kontrol et
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
        }

        // Kullanıcı doğrulanmış mı kontrol et
        if (!user.isVerified) {
            // Yeni doğrulama kodu oluştur
            const verificationCode = generateVerificationCode();
            const verificationCodeExpires = generateExpiryTime(15);

            // Kullanıcıyı güncelle
            user.verificationCode = verificationCode;
            user.verificationCodeExpires = verificationCodeExpires;
            await user.save();

            // Doğrulama e-postası gönder
            await sendVerificationEmail(user.email, verificationCode, user.name);

            return res.status(401).json({
                message: 'Hesabınız henüz doğrulanmamış. Yeni bir doğrulama kodu e-posta adresinize gönderildi.',
                needVerification: true,
                userId: user._id
            });
        }

        // Token oluştur
        const token = generateToken(user);

        // Kullanıcı bilgilerini gönder
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Kullanıcı profili bilgilerini getir
 * @route GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -verificationCode -verificationCodeExpires');
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    preRegister,
    completeRegister,
    register,
    verifyEmail,
    resendVerificationCode,
    login,
    getProfile
}; 