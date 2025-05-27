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
const axios = require('axios');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

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

// MongoDB bağlantı seçenekleri
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000, // 15 saniye (arttırıldı)
    socketTimeoutMS: 60000, // 60 saniye (arttırıldı)
    family: 4, // IPv4 kullan
    connectTimeoutMS: 30000, // Bağlantı zaman aşımı
    retryWrites: true, // Yeniden yazma işlemleri için yeniden dene
    maxPoolSize: 10, // Maksimum bağlantı havuzu
    minPoolSize: 5, // Minimum bağlantı havuzu
    heartbeatFrequencyMS: 10000 // Sunucu durumunu kontrol etmek için sıklık
};

// Bağlantıyı yeniden deneme fonksiyonu
const connectWithRetry = async (retryCount = 5, delay = 5000) => {
    let currentRetry = 0;
    
    while (currentRetry < retryCount) {
        try {
            console.log(`MongoDB bağlantısı deneniyor... Deneme: ${currentRetry + 1}`);
            const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);
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
            
            return;
        } catch (err) {
            console.error(`MongoDB bağlantı hatası (Deneme ${currentRetry + 1}/${retryCount}):`, err);
            
            // Daha detaylı hata bilgisi
            if (err.name === 'MongooseServerSelectionError') {
                console.error('MongoDB sunucusuna bağlanılamadı. Lütfen bağlantı bilgilerini kontrol edin.');
                console.error('Bağlantı URI:', MONGODB_URI);
                console.error('Hata detayları:', err.reason);
            }
            
            currentRetry++;
            if (currentRetry < retryCount) {
                console.log(`${delay/1000} saniye sonra tekrar denenecek...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`${retryCount} deneme sonunda MongoDB'ye bağlanılamadı.`);
    process.exit(1);
};

// Bağlantıyı başlat
connectWithRetry();

// API Routes - Önce API rotalarını tanımla
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Chatbot endpoint
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mesaj parametresi gerekli' });
    }

    // OpenRouter API anahtarı
    const apiKey = process.env.OPENROUTER_API_KEY || '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';
    
    // Model adı
    const modelName = 'google/gemma-3n-e4b-it:free';

    // İstek parametreleri
    const requestPayload = {
      model: modelName,
      messages: [
        {
          role: 'user',
          content: `Sen Smartify teknoloji mağazasının yardımcı asistanısın. Aşağıdaki bilgileri kullanarak müşterilere yardımcı ol. Yanıtların kısa, öz ve Türkçe olmalı.

MAĞAZA BİLGİSİ:
- Smartify, 2020 yılından beri hizmet veren bir teknoloji mağazasıdır
- Akıllı Ev Sistemleri, elektronik komponentler ve maker ekipmanları satıyoruz
- Deneyimli ekibimiz ve geniş ürün yelpazemizle hem hobi amaçlı hem de profesyonel kullanıcılara hitap ediyoruz
- 7/24 teknik destek sunuyoruz

ÜRÜN KATEGORİLERİ:
1. Akıllı Ev Sistemleri: Smart Home, IoT cihazları, zil sistemleri, kamera sistemleri
2. Elektronik Komponentler: Arduino, Raspberry Pi, sensörler, motorlar, LED'ler
3. Maker Ekipmanları: Lehimleme istasyonları, el aletleri, ölçüm cihazları

TESLİMAT VE ÖDEME:
- Siparişler aynı gün kargoya verilir
- Tüm ödeme işlemleri SSL sertifikası ile güvence altındadır
- Kapıda ödeme, kredi kartı ve havale/EFT seçenekleri mevcuttur

İADE POLİTİKASI:
- 14 gün içerisinde koşulsuz iade garantisi
- Ürünün kullanılmamış ve orijinal paketinde olması gerekir
- İade kargo ücreti müşteriye aittir (üretim hatası hariç)

İLETİŞİM BİLGİLERİ:
- E-posta: info@smartify.com
- Telefon: 0212 555 1234
- Adres: Teknoloji Caddesi No:42, İstanbul

Kullanıcı mesajı: ${message}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };
    
    // API'ye istek gönder
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', requestPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || 'https://smartify.com',
        'X-Title': 'Smartify Asistan'
      }
    });

    // Yanıtı işle ve döndür
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const botResponse = response.data.choices[0].message.content;
      return res.json({ response: botResponse });
    } else {
      return res.status(500).json({ error: 'API yanıtı işlenemedi' });
    }
    
  } catch (error) {
    console.error('Chatbot Error:', error);
    
    // Hata yanıtını döndür
    res.status(500).json({ 
      error: 'Chatbot yanıtı alınamadı',
      message: error.message,
      details: error.response?.data || 'Detay yok'
    });
  }
});

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