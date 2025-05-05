// Mevcut admin kullanıcısını güncelleyen betik
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb+srv://3delektronik01:8MERF3SJhLFZMBno@3d-elektronik-db.se3vs.mongodb.net/smartify?retryWrites=true&w=majority&appName=3d-elektronik-db&ssl=true&tlsAllowInvalidCertificates=true';

async function fixAdmin() {
  try {
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');
    
    // Admin kullanıcısını kontrol et
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@3dtech.com';
    console.log(`Admin e-postası: ${adminEmail} için kullanıcı aranıyor...`);
    
    const admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin kullanıcısı bulundu. Güncelleniyor...');
      
      // Admin kullanıcısını güncelle
      admin.isVerified = true;
      if (!admin.name) {
        admin.name = 'Admin';
      }
      
      await admin.save();
      console.log('Admin kullanıcısı başarıyla güncellendi:');
      console.log(`ID: ${admin._id}`);
      console.log(`E-posta: ${admin.email}`);
      console.log(`Admin mi: ${admin.isAdmin}`);
      console.log(`Doğrulanmış mı: ${admin.isVerified}`);
      console.log(`Name: ${admin.name}`);
    } else {
      console.log('Admin kullanıcısı bulunamadı. Yeni admin oluşturuluyor...');
      
      // Yeni admin kullanıcısı oluştur
      const newAdmin = new User({
        name: 'Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        isAdmin: true,
        isVerified: true
      });
      
      await newAdmin.save();
      
      console.log('Yeni admin kullanıcısı başarıyla oluşturuldu:');
      console.log(`ID: ${newAdmin._id}`);
      console.log(`E-posta: ${newAdmin.email}`);
      console.log(`Admin mi: ${newAdmin.isAdmin}`);
      console.log(`Doğrulanmış mı: ${newAdmin.isVerified}`);
      console.log(`Name: ${newAdmin.name}`);
    }
    
    await mongoose.disconnect();
    console.log('\nMongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Betiği çalıştır
fixAdmin(); 