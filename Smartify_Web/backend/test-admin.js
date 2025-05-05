// Admin kullanıcısını kontrol etmek için basit bir betik
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb+srv://3delektronik01:8MERF3SJhLFZMBno@3d-elektronik-db.se3vs.mongodb.net/smartify?retryWrites=true&w=majority&appName=3d-elektronik-db&ssl=true&tlsAllowInvalidCertificates=true';

async function checkAdmin() {
  try {
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');
    
    // Admin kullanıcısını kontrol et
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@3dtech.com';
    console.log(`Admin e-postası: ${adminEmail} için kullanıcı aranıyor...`);
    
    const admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin kullanıcısı bulundu:');
      console.log(`ID: ${admin._id}`);
      console.log(`E-posta: ${admin.email}`);
      console.log(`Admin mi: ${admin.isAdmin}`);
      console.log(`Doğrulanmış mı: ${admin.isVerified}`);
      console.log(`Name: ${admin.name || 'Belirtilmemiş'}`);
    } else {
      console.log('Admin kullanıcısı bulunamadı');
    }
    
    // Tüm admin kullanıcılarını listele
    console.log('\nTüm admin kullanıcıları:');
    const admins = await User.find({ isAdmin: true });
    
    if (admins.length === 0) {
      console.log('Hiç admin kullanıcısı bulunamadı');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\nAdmin #${index + 1}:`);
        console.log(`ID: ${admin._id}`);
        console.log(`E-posta: ${admin.email}`);
        console.log(`Admin mi: ${admin.isAdmin}`);
        console.log(`Doğrulanmış mı: ${admin.isVerified}`);
        console.log(`Name: ${admin.name || 'Belirtilmemiş'}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\nMongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Betiği çalıştır
checkAdmin(); 