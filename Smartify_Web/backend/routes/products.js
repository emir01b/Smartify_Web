const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// Tüm ürünleri getir - Herkese açık
router.get('/', async (req, res, next) => {
    try {
        console.log('Ürünler isteniyor, query:', req.query);
        const { search, category, mainCategory, isPopular, sort } = req.query;
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

        // Sıralama seçenekleri
        let sortOption = {};
        if (sort === 'price_asc' || sort === 'price-low') sortOption.price = 1;
        if (sort === 'price_desc' || sort === 'price-high') sortOption.price = -1;
        if (sort === 'newest') sortOption.createdAt = -1;
        if (sort === 'name-asc') sortOption.name = 1;
        if (sort === 'name-desc') sortOption.name = -1;
        if (Object.keys(sortOption).length === 0) sortOption.createdAt = -1; // Varsayılan sıralama

        console.log('MongoDB sorgusu:', query, 'Sıralama:', sortOption);
        const products = await Product.find(query).sort(sortOption);
        console.log(`${products.length} ürün bulundu`);
        
        res.json(products);
    } catch (error) {
        console.error('Ürünleri getirme hatası:', error);
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
router.post('/', authenticateToken, upload.array('images', 5), async (req, res, next) => {
    try {
        console.log('Yeni ürün ekleniyor:', req.body);
        
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
            const featuresText = req.body.features.trim();
            if (featuresText) {
                productData.features = featuresText.split('\n').filter(f => f.trim());
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
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res, next) => {
    try {
        console.log('Ürün güncelleniyor:', req.params.id, req.body);
        
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
            const featuresText = req.body.features.trim();
            if (featuresText) {
                productData.features = featuresText.split('\n').filter(f => f.trim());
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