module.exports = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Doğrulama hatası',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'
            });
        }
        return res.status(400).json({ message: err.message });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Bu kayıt zaten mevcut'
        });
    }

    res.status(500).json({
        message: 'Sunucu hatası'
    });
}; 