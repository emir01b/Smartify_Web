const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');

// MongoDB bağlantı URI'si
const MONGODB_URI = 'mongodb+srv://3delektronik01:8MERF3SJhLFZMBno@3d-elektronik-db.se3vs.mongodb.net/smartify?retryWrites=true&w=majority&appName=3d-elektronik-db&ssl=true&tlsAllowInvalidCertificates=true';

async function linkExistingOrders() {
    try {
        // Veritabanına bağlan
        console.log('MongoDB\'ye bağlanılıyor...');
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        // Tüm siparişleri getir
        const orders = await Order.find({});
        console.log(`${orders.length} sipariş bulundu`);

        // Her sipariş için
        for (const order of orders) {
            try {
                // Siparişin kullanıcısını bul
                const user = await User.findById(order.user);
                
                if (!user) {
                    console.log(`Uyarı: ${order._id} ID'li siparişin kullanıcısı bulunamadı`);
                    continue;
                }

                // Kullanıcının orders dizisini kontrol et
                user.orders = user.orders || [];

                // Sipariş zaten ekli değilse ekle
                if (!user.orders.includes(order._id)) {
                    user.orders.push(order._id);
                    await user.save();
                    console.log(`Sipariş ${order._id} kullanıcı ${user.email}'e eklendi`);
                } else {
                    console.log(`Sipariş ${order._id} zaten kullanıcı ${user.email}'de mevcut`);
                }
            } catch (error) {
                console.error(`Sipariş ${order._id} işlenirken hata oluştu:`, error);
            }
        }

        console.log('Tüm siparişler kullanıcılara bağlandı');
        
        // Veritabanı bağlantısını kapat
        await mongoose.disconnect();
        console.log('MongoDB bağlantısı kapatıldı');
        
    } catch (error) {
        console.error('Hata:', error);
    }
}

// Betiği çalıştır
linkExistingOrders(); 