const Product = require('../models/Product');

const testProducts = [
    {
        name: "Akıllı LED Ampul",
        description: "Uzaktan kontrol edilebilen akıllı LED ampul. Telefonunuzdan kontrol edebilir, renk ve parlaklık ayarı yapabilirsiniz.",
        price: 149.99,
        stock: 50,
        category: "SmartLighting",
        mainCategory: "SmartHome",
        isNew: true,
        isPopular: true,
        active: true,
        categoryPath: ["SmartHome", "SmartLighting"],
        categoryNames: ["Akıllı Ev", "Akıllı Aydınlatma"],
        features: ["Uzaktan kontrol", "16 milyon renk", "Ses kontrolü", "Enerji tasarrufu"],
        images: [
            "https://m.media-amazon.com/images/I/51jBXNOQTDL._AC_SL1500_.jpg"
        ]
    },
    {
        name: "Akıllı Priz",
        description: "Cihazlarınızı uzaktan kontrol etmenizi sağlayan akıllı priz. Enerji tüketimini takip edebilir ve zamanlayıcı ayarlayabilirsiniz.",
        price: 99.99,
        stock: 30,
        category: "SmartPlugs",
        mainCategory: "SmartHome",
        isNew: false,
        isPopular: true,
        active: true,
        categoryPath: ["SmartHome", "SmartPlugs"],
        categoryNames: ["Akıllı Ev", "Akıllı Prizler"],
        features: ["Uzaktan kontrol", "Enerji izleme", "Zamanlayıcı", "Sesli asistan desteği"],
        images: [
            "https://m.media-amazon.com/images/I/51JJfZnTn+L._AC_SL1500_.jpg"
        ]
    },
    {
        name: "Raspberry Pi 4 Model B 8GB",
        description: "Güçlü ve çok yönlü mini bilgisayar. Projeleriniz için ideal çözüm.",
        price: 1299.99,
        stock: 15,
        category: "RaspberryPi",
        mainCategory: "Electronics",
        isNew: true,
        isPopular: true,
        active: true,
        categoryPath: ["Electronics", "RaspberryPi"],
        categoryNames: ["Elektronik", "Raspberry Pi"],
        features: ["8GB RAM", "1.5GHz Quad-Core CPU", "Bluetooth 5.0", "Gigabit Ethernet"],
        images: [
            "https://m.media-amazon.com/images/I/71XIwK5G8bL._AC_SL1500_.jpg"
        ]
    },
    {
        name: "Arduino Uno R4 WiFi",
        description: "Yeni nesil Arduino kartı, WiFi bağlantısı ve gelişmiş özellikleriyle projelerinizi bir üst seviyeye taşıyın.",
        price: 799.99,
        stock: 20,
        category: "Arduino",
        mainCategory: "Electronics",
        isNew: true,
        isPopular: true,
        active: true,
        categoryPath: ["Electronics", "Arduino"],
        categoryNames: ["Elektronik", "Arduino"],
        features: ["WiFi bağlantısı", "Renk ekranı", "Gelişmiş işlemci", "USB-C bağlantısı"],
        images: [
            "https://m.media-amazon.com/images/I/61I9Fx+LjDL._AC_SL1500_.jpg"
        ]
    },
    {
        name: "Akıllı Termostat",
        description: "Evinizin sıcaklığını uzaktan kontrol etmenizi sağlayan akıllı termostat. Enerji tasarrufu sağlar ve konfor sunar.",
        price: 599.99,
        stock: 10,
        category: "Climate",
        mainCategory: "HomeAutomation",
        isNew: false,
        isPopular: true,
        active: true,
        categoryPath: ["HomeAutomation", "Climate"],
        categoryNames: ["Ev Otomasyonu", "İklimlendirme"],
        features: ["Uzaktan kontrol", "Enerji tasarrufu", "Programlanabilir", "Akıllı öğrenme"],
        images: [
            "https://m.media-amazon.com/images/I/51R6iQzZJKL._AC_SL1500_.jpg"
        ]
    }
];

const addTestProducts = async () => {
    try {
        // Önce mevcut ürün sayısını kontrol et
        const productCount = await Product.countDocuments();
        
        if (productCount === 0) {
            console.log('Veritabanında ürün bulunamadı, test ürünleri ekleniyor...');
            
            // Ürünleri ekle
            await Product.insertMany(testProducts);
            
            console.log(`${testProducts.length} adet test ürünü başarıyla eklendi`);
        } else {
            console.log(`Veritabanında zaten ${productCount} adet ürün bulunuyor, test ürünleri eklenmedi`);
        }
    } catch (error) {
        console.error('Test ürünleri eklenirken hata:', error);
    }
};

module.exports = { addTestProducts }; 