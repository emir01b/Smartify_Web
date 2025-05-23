const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads dizininin var olduğundan emin ol
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)){
    console.log('Uploads dizini oluşturuluyor...');
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Dosya yükleme ayarları
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Benzersiz isim oluştur ve dosya uzantısını ekle
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const safeName = file.originalname
            .replace(/[^a-z0-9]/gi, '-')  // Alfanümerik olmayan karakterleri tire ile değiştir
            .toLowerCase();
        cb(null, `${uniqueSuffix}-${safeName}`);
    }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Desteklenmeyen dosya formatı: ${file.mimetype}. Sadece JPEG, PNG, WebP ve GIF formatları kabul edilir.`), false);
    }
};

// Multer ayarları
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Hata yakalama middleware'i
const handleUpload = (req, res, next) => {
    const uploadMiddleware = upload.array('images', 5);
    
    uploadMiddleware(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // Multer hatası
            console.error('Multer dosya yükleme hatası:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.' });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ message: 'Çok fazla dosya yükleme girişimi. En fazla 5 dosya yükleyebilirsiniz.' });
            }
            return res.status(400).json({ message: 'Dosya yükleme hatası: ' + err.message });
        } else if (err) {
            // Diğer hatalar
            console.error('Dosya yükleme hatası:', err);
            return res.status(400).json({ message: err.message });
        }
        // Başarılı durumda sonraki middleware'e geç
        next();
    });
};

module.exports = {
    upload,
    handleUpload
}; 