// .env dosyasını yükle
require('dotenv').config();

// Çevre değişkenlerini kontrol et
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI çevre değişkeni bulunamadı!');
    console.log('Doğrudan URI kullanılacak.');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');

// Middleware
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/error');

// Utils
const { createAdminUser } = require('./utils/admin');
const { initCategories } = require('./utils/categories');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
// Doğrudan URI belirt
const MONGODB_URI = 'mongodb+srv://3delektronik01:8MERF3SJhLFZMBno@3d-elektronik-db.se3vs.mongodb.net/smartify?retryWrites=true&w=majority&appName=3d-elektronik-db&ssl=true&tlsAllowInvalidCertificates=true';
console.log('MongoDB URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(async (connection) => {
        console.log('MongoDB bağlantısı başarılı');
        
        // MongoDB bağlantısını app.locals üzerinden paylaş
        app.locals.db = connection.connection.db;
        
        // Admin kullanıcısını oluştur
        await createAdminUser();
        
        // Kategorileri başlat
        await initCategories(connection.connection.db);
        
        // Sunucuyu başlat
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Sunucu ${PORT} portunda çalışıyor`);
        });
    })
    .catch(err => {
        console.error('MongoDB bağlantı hatası:', err);
        process.exit(1);
    });

// API Routes - Önce API rotalarını tanımla
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Statik dosyaları sun - API rotalarından sonra statik dosyaları sun
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin sayfalarını doğrudan sun
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', req.path));
});

// SPA için yönlendirme - En son SPA yönlendirmesini yap
// Sadece kök dizin ve dosya uzantısı olmayan istekler için
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('*', (req, res, next) => {
    // Eğer istek bir API endpoint'ine veya belirli bir dosyaya ise (örn: .html, .css, .js)
    // bir sonraki middleware'e geç
    if (req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
    }
    
    // Aksi takdirde index.html'e yönlendir (SPA için)
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use(errorHandler); 