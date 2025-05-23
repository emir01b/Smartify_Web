const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload, handleUpload } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// Tüm ürünleri getir - Herkese açık
router.get('/', async (req, res, next) => {
    try {
        console.log('Ürünler isteniyor, query:', req.query);
        const { search, category, mainCategory, isPopular, isNew, sort } = req.query;
        let query = {};

        // Arama filtresi
        if (search) {
            query.$text = { $search: search };
        }

        // Kategori filtresi
        if (category) {
            query.category = category;
        }

        // Ana kategori filtresi
        if (mainCategory) {
            query.mainCategory = mainCategory;
        }

        // Popüler ürünler filtresi
        if (isPopular === 'true') {
            query.isPopular = true;
        }
        
        // Yeni ürünler filtresi
        if (isNew === 'true') {
            query.isNew = true;
        }

        // Sıralama seçenekleri
        let sortOption = {};
        if (sort === 'price_asc' || sort === 'price-low') sortOption.price = 1;
        if (sort === 'price_desc' || sort === 'price-high') sortOption.price = -1;
        if (sort === 'newest') sortOption.createdAt = -1;
        if (sort === 'name-asc') sortOption.name = 1;
        if (sort === 'name-desc') sortOption.name = -1;
        if (Object.keys(sortOption).length === 0) sortOption.createdAt = -1; // Varsayılan sıralama

        console.log('MongoDB sorgusu:', query, 'Sıralama:', sortOption);
        
        // Veritabanı bağlantı durumunu doğrula
        if (!mongoose.connection.readyState) {
            console.error('MongoDB bağlantısı kesik durumda, yeniden bağlanmaya çalışılıyor...');
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://3delektronik01:8MERF3SJhLFZMBno@3d-elektronik-db.se3vs.mongodb.net/smartify');
        }
        
        // Kategori kontrolü yap
        let productCount = 0;
        try {
            productCount = await Product.countDocuments(query);
            console.log(`"${category || mainCategory}" sorgusu için ${productCount} ürün bulundu`);

            // Eğer hiç ürün bulunamazsa kategoriler arasında eşleşme sorununu kontrol et
            if (productCount === 0 && (category || mainCategory)) {
                console.log('Ürün bulunamadı, alternatif kategorileri deniyorum...');
                
                // SmartHomeSystem ve SmartHome tutarsızlıklarını kontrol et
                if (category === 'SmartHome') {
                    const altQuery = { ...query, category: 'SmartHomeSystem' };
                    const altCount = await Product.countDocuments(altQuery);
                    
                    if (altCount > 0) {
                        console.log(`Alternatif kategori bulundu: SmartHomeSystem (${altCount} ürün)`);
                        query.category = 'SmartHomeSystem';
                        productCount = altCount;
                    }
                } else if (category === 'SmartHomeSystem') {
                    const altQuery = { ...query, category: 'SmartHome' };
                    const altCount = await Product.countDocuments(altQuery);
                    
                    if (altCount > 0) {
                        console.log(`Alternatif kategori bulundu: SmartHome (${altCount} ürün)`);
                        query.category = 'SmartHome';
                        productCount = altCount;
                    }
                }
            }
        } catch (countError) {
            console.error('Ürün sayımında hata:', countError);
        }
        
        // Veritabanı sorgusu - zaman aşımına karşı önlem
        const products = await Promise.race([
            Product.find(query).sort(sortOption),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Veritabanı sorgusu zaman aşımına uğradı')), 15000)
            )
        ]);
        
        console.log(`${products.length} ürün bulundu`);
        
        // Ürün bulunamadıysa boş array ile yanıt ver
        if (!products || products.length === 0) {
            console.log(`'${category || mainCategory}' kategorisinde ürün bulunamadı.`);
            return res.json([]);
        }
        
        res.json(products);
    } catch (error) {
        console.error('Ürünleri getirme hatası:', error);
        // Kritik hatalar dışında 500 yerine boş dizi döndür
        if (error.name === 'MongooseServerSelectionError' || 
            error.message === 'Veritabanı sorgusu zaman aşımına uğradı') {
            console.error('Veritabanı bağlantı hatası. Boş dizi döndürülüyor.');
            return res.json([]);
        }
        next(error);
    }
});

// Ürün detayını getir - Herkese açık
router.get('/:id', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Ürün detayı getirme hatası:', error);
        next(error);
    }
});

// Yeni ürün ekle - Sadece admin
router.post('/', authenticateToken, handleUpload, async (req, res, next) => {
    try {
        console.log('Yeni ürün ekleniyor...');
        console.log('Form verileri:', req.body);
        console.log('Yüklenen dosya sayısı:', req.files ? req.files.length : 0);
        
        const { name, description, price, stock, category, mainCategory } = req.body;
        
        // Aynı isme sahip ürün var mı kontrol et
        const existingProduct = await Product.findOne({ name: name });
        if (existingProduct) {
            console.log('UYARI: Aynı isimle ürün zaten mevcut:', existingProduct._id);
            
            // Son 10 saniye içinde oluşturulmuş mu? (çift gönderim kontrolü)
            const now = new Date();
            const createdAt = new Date(existingProduct.createdAt);
            const timeDiff = (now - createdAt) / 1000; // saniye cinsinden
            
            if (timeDiff < 10) {
                console.log('Çift gönderim tespit edildi! Geçen süre:', timeDiff, 'saniye');
                return res.status(409).json({ 
                    message: 'Bu ürün zaten eklenmiş. Lütfen sayfayı yenileyip tekrar deneyin.',
                    existingProductId: existingProduct._id
                });
            }
        }
        
        // Form verilerini işle
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            stock: parseInt(req.body.stock),
            category: req.body.category,
            mainCategory: req.body.mainCategory,
            isNew: req.body.isNew === 'true',
            isPopular: req.body.isPopular === 'true',
            active: req.body.active === 'true'
        };

        // Kategori yolu ve isimleri
        if (req.body.categoryPath) {
            try {
                productData.categoryPath = JSON.parse(req.body.categoryPath);
            } catch (e) {
                console.error('categoryPath parse hatası:', e);
            }
        }

        if (req.body.categoryNames) {
            try {
                productData.categoryNames = JSON.parse(req.body.categoryNames);
            } catch (e) {
                console.error('categoryNames parse hatası:', e);
            }
        }

        // Özellikler
        if (req.body.features) {
            try {
                productData.features = JSON.parse(req.body.features);
            } catch (e) {
                console.error('features parse hatası:', e);
                // Metin olarak gelmiş olabilir, satırlara ayır
                const featuresText = req.body.features.trim();
                if (featuresText) {
                    productData.features = featuresText.split('\n').filter(f => f.trim());
                }
            }
        }

        // Resimler
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => `/uploads/${file.filename}`);
            console.log('Yüklenen resimler:', productData.images);
        } else {
            // Eğer resim yüklenmemişse varsayılan resmi kullan
            productData.images = ['/images/default-product.png'];
            console.log('Varsayılan resim kullanılıyor');
        }

        const product = new Product(productData);
        await product.save();
        console.log('Ürün başarıyla eklendi:', product._id);
        
        res.status(201).json(product);
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        next(error);
    }
});

// Ürün güncelle - Sadece admin
router.put('/:id', authenticateToken, handleUpload, async (req, res, next) => {
    try {
        console.log('Ürün güncelleniyor...');
        console.log('Ürün ID:', req.params.id);
        console.log('Form verileri:', req.body);
        console.log('Yüklenen dosya sayısı:', req.files ? req.files.length : 0);
        
        // Ürünün var olup olmadığını kontrol et
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Güncellenecek ürün bulunamadı' });
        }
        
        // Form verilerini işle
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            stock: parseInt(req.body.stock),
            category: req.body.category,
            mainCategory: req.body.mainCategory,
            isNew: req.body.isNew === 'true',
            isPopular: req.body.isPopular === 'true',
            active: req.body.active === 'true'
        };

        // Kategori yolu ve isimleri
        if (req.body.categoryPath) {
            try {
                productData.categoryPath = JSON.parse(req.body.categoryPath);
            } catch (e) {
                console.error('categoryPath parse hatası:', e);
            }
        }

        if (req.body.categoryNames) {
            try {
                productData.categoryNames = JSON.parse(req.body.categoryNames);
            } catch (e) {
                console.error('categoryNames parse hatası:', e);
            }
        }

        // Özellikler
        if (req.body.features) {
            try {
                productData.features = JSON.parse(req.body.features);
            } catch (e) {
                console.error('features parse hatası:', e);
                // Metin olarak gelmiş olabilir, satırlara ayır
                const featuresText = req.body.features.trim();
                if (featuresText) {
                    productData.features = featuresText.split('\n').filter(f => f.trim());
                }
            }
        }

        // Resimler
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => `/uploads/${file.filename}`);
            console.log('Yüklenen resimler:', productData.images);
        } else {
            // Eğer yeni resim yüklenmemişse, mevcut resimleri koru
            if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
                productData.images = existingProduct.images;
                console.log('Mevcut resimler korunuyor:', productData.images);
            } else {
                // Eğer mevcut ürünün resmi yoksa varsayılan resmi kullan
                productData.images = ['/images/default-product.png'];
                console.log('Varsayılan resim kullanılıyor');
            }
        }

        console.log('Güncellenecek ürün verileri:', productData);

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }

        console.log('Ürün başarıyla güncellendi:', product._id);
        res.json(product);
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        next(error);
    }
});

// Ürün sil - Sadece admin
router.delete('/:id', authenticateToken, async (req, res, next) => {
    try {
        console.log('Ürün siliniyor:', req.params.id);
        
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }

        console.log('Ürün başarıyla silindi:', req.params.id);
        res.json({ message: 'Ürün başarıyla silindi' });
    } catch (error) {
        console.error('Ürün silme hatası:', error);
        next(error);
    }
});

module.exports = router; 