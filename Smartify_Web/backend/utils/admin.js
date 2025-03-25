const User = require('../models/User');

exports.createAdminUser = async () => {
    try {
        // Varsayılan admin bilgileri
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@3dtech.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        console.log('Admin kullanıcısı oluşturma kontrolü yapılıyor...');
        
        // Admin kullanıcısı var mı kontrol et
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            console.log('Admin kullanıcısı bulunamadı, yeni admin oluşturuluyor...');
            
            // Admin kullanıcısını oluştur
            const admin = new User({
                email: adminEmail,
                password: adminPassword,
                isAdmin: true
            });

            await admin.save();
            console.log('Admin kullanıcısı başarıyla oluşturuldu');
        } else {
            console.log('Admin kullanıcısı zaten mevcut');
        }
    } catch (error) {
        console.error('Admin kullanıcısı oluşturulurken hata:', error.message);
    }
}; 