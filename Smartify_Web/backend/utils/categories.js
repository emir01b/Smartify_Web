// Kategori verileri
const categories = {
    SmartHome: {
        name: "Akıllı Ev",
        subcategories: {
            SmartLighting: "Akıllı Aydınlatma",
            SmartSecurity: "Güvenlik Sistemleri",
            SmartPlugs: "Akıllı Prizler",
            SmartSensors: "Akıllı Sensörler"
        }
    },
    Electronics: {
        name: "Elektronik",
        subcategories: {
            Arduino: "Arduino",
            RaspberryPi: "Raspberry Pi",
            Sensors: "Sensörler",
            Motors: "Motorlar"
        }
    },
    HomeAutomation: {
        name: "Ev Otomasyonu",
        subcategories: {
            SmartHome: "Akıllı Ev Sistemleri",
            Climate: "İklimlendirme",
            Entertainment: "Eğlence Sistemleri",
            Energy: "Enerji Yönetimi"
        }
    }
};

// Kategorileri veritabanına ekle
const initCategories = async (db) => {
    try {
        const categoriesCollection = db.collection('categories');
        
        // Koleksiyonu kontrol et
        const existingCategories = await categoriesCollection.findOne({});
        
        if (!existingCategories) {
            // Kategorileri ekle
            await categoriesCollection.insertOne(categories);
            console.log('Kategoriler başarıyla eklendi');
        } else {
            console.log('Kategoriler zaten mevcut');
        }
    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
    }
};

module.exports = { categories, initCategories };

 