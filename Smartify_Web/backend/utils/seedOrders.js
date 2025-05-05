const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// MongoDB bağlantı URI'si
const MONGODB_URI = 'mongodb+srv://3delektronik01:8MERF3SJhLFZMBno@3d-elektronik-db.se3vs.mongodb.net/smartify?retryWrites=true&w=majority&appName=3d-elektronik-db&ssl=true&tlsAllowInvalidCertificates=true';

// Yardımcı fonksiyonlar
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Örnek adresler
const addresses = [
    {
        firstName: 'Ali',
        lastName: 'Yılmaz',
        address: 'Atatürk Caddesi No: 123',
        city: 'İstanbul',
        postalCode: '34000',
        phone: '05551234567',
        email: 'ali.yilmaz@example.com'
    },
    {
        firstName: 'Ayşe',
        lastName: 'Demir',
        address: 'Cumhuriyet Mahallesi Lale Sokak No: 45',
        city: 'Ankara',
        postalCode: '06000',
        phone: '05557654321',
        email: 'ayse.demir@example.com'
    },
    {
        firstName: 'Mehmet',
        lastName: 'Kaya',
        address: 'Bahçelievler 7. Cadde No: 18',
        city: 'İzmir',
        postalCode: '35000',
        phone: '05559876543',
        email: 'mehmet.kaya@example.com'
    },
    {
        firstName: 'Zeynep',
        lastName: 'Çelik',
        address: 'Karşıyaka Mahallesi Deniz Caddesi No: 56',
        city: 'Antalya',
        postalCode: '07000',
        phone: '05553456789',
        email: 'zeynep.celik@example.com'
    }
];

// Ödeme yöntemleri
const paymentMethods = ['Havale/EFT', 'Kapıda Ödeme', 'Kredi Kartı'];

// Sipariş durumları
const orderStatuses = ['Beklemede', 'İşleme Alındı', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'];

// Örnek notlar
const orderNotes = [
    'Müşteri hediye paketi istedi.',
    'Müşteri kapıda iletişim kurulmasını istedi.',
    'İş yerinde 09:00-18:00 arası teslimat yapılmalı.',
    'Müşteri ürünlerin kontrol edilerek kargoya verilmesini istedi.',
    null
];

// Veritabanı bağlantısı ve örnek sipariş oluşturma
async function seedOrders() {
    try {
        // Veritabanına bağlan
        console.log('MongoDB\'ye bağlanılıyor...');
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        // Kullanıcıları getir
        const users = await User.find({});
        
        if (users.length === 0) {
            console.log('Veritabanında kullanıcı bulunamadı!');
            return;
        }
        
        // Ürünleri getir
        const products = await Product.find({});
        
        if (products.length === 0) {
            console.log('Veritabanında ürün bulunamadı!');
            return;
        }
        
        console.log(`${users.length} kullanıcı ve ${products.length} ürün bulundu`);
        
        // Örnek siparişler oluştur
        const orderCount = 15; // Oluşturulacak sipariş sayısı
        const orders = [];
        
        for (let i = 0; i < orderCount; i++) {
            // Rastgele bir kullanıcı seç
            const user = randomItem(users);
            
            // Rastgele 1-5 arası ürün seç
            const orderItemsCount = randomInt(1, 5);
            const orderItems = [];
            let subtotal = 0;
            
            // Siparişe ürünler ekle
            const usedProductIndexes = new Set();
            for (let j = 0; j < orderItemsCount; j++) {
                // Her üründen sadece bir kez ekleyelim
                let productIndex;
                do {
                    productIndex = randomInt(0, products.length - 1);
                } while (usedProductIndexes.has(productIndex) && usedProductIndexes.size < products.length);
                
                if (usedProductIndexes.size >= products.length) break;
                usedProductIndexes.add(productIndex);
                
                const product = products[productIndex];
                const quantity = randomInt(1, 3);
                const price = product.price;
                
                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: price,
                    quantity: quantity,
                    image: product.images && product.images.length > 0 ? product.images[0] : null
                });
                
                subtotal += price * quantity;
            }
            
            // Rastgele kargo ve vergi ücreti
            const shippingPrice = subtotal >= 1000 ? 0 : 49.99;
            const taxPrice = parseFloat((subtotal * 0.18).toFixed(2));
            const totalPrice = subtotal + shippingPrice + taxPrice;
            
            // Ödeme yöntemi
            const paymentMethod = randomItem(paymentMethods);
            
            // Sipariş oluşturma tarihi (son 30 gün içinde)
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - randomInt(0, 30));
            
            // Sipariş durumu
            const status = randomItem(orderStatuses);
            
            // Ödemeli mi?
            const isPaid = paymentMethod === 'Kredi Kartı' ? true : randomInt(0, 1) === 1;
            
            // Ödeme tarihi
            let paidAt = null;
            if (isPaid) {
                paidAt = new Date(createdAt);
                paidAt.setDate(paidAt.getDate() + randomInt(0, 2));
            }
            
            // Teslim edildi mi?
            const isDelivered = status === 'Teslim Edildi';
            
            // Teslim tarihi
            let deliveredAt = null;
            if (isDelivered) {
                deliveredAt = new Date(createdAt);
                deliveredAt.setDate(deliveredAt.getDate() + randomInt(1, 5));
            }
            
            // Sipariş notu
            const notes = randomItem(orderNotes);
            
            // Teslimat adresi
            const shippingAddress = randomItem(addresses);
            
            // Sipariş oluştur
            const order = new Order({
                user: user._id,
                orderItems,
                shippingAddress,
                paymentMethod,
                shippingPrice,
                taxPrice,
                totalPrice,
                isPaid,
                paidAt,
                isDelivered,
                deliveredAt,
                status,
                notes,
                createdAt
            });
            
            orders.push(order);
        }
        
        // Siparişleri veritabanına kaydet
        await Order.insertMany(orders);
        console.log(`${orders.length} örnek sipariş başarıyla oluşturuldu`);
        
        // Veritabanı bağlantısını kapat
        await mongoose.disconnect();
        console.log('MongoDB bağlantısı kapatıldı');
        
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Betiği çalıştır
seedOrders(); 