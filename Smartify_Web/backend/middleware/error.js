// Hata yönetim middleware
module.exports = (err, req, res, next) => {
    // Hata detaylarını konsolda göster
    console.error('Sunucu hatası:', err.message);
    console.error('Hata ayrıntıları:', err.stack);
    
    // Mongoose validation hataları
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Doğrulama hatası',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // Dosya yükleme hataları (Multer)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'
            });
        }
        return res.status(400).json({ message: err.message });
    }
    
    // MongoDB dublicate key hatası
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Bu kayıt zaten mevcut'
        });
    }
    
    // JSON Web Token hataları
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Geçersiz kimlik doğrulama tokenı'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın'
        });
    }
    
    // MongoDB bağlantı hataları
    if (err.name === 'MongooseServerSelectionError') {
        return res.status(500).json({
            message: 'Veritabanı bağlantısı kurulamadı, lütfen daha sonra tekrar deneyin'
        });
    }
    
    // MongoDB Cast hataları (geçersiz ID formatı vs.)
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Geçersiz veri formatı'
        });
    }
    
    // Diğer tüm hatalar
    res.status(500).json({
        message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin'
    });
}; 