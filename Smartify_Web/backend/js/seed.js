const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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
      SmartHomeSystem: "Akıllı Ev Sistemleri",
      Climate: "İklimlendirme",
      Entertainment: "Eğlence Sistemleri",
      Energy: "Enerji Yönetimi"
    }
  }
};

const products = [
  // Akıllı Ev - Akıllı Aydınlatma
  {
    name: "Akıllı LED Ampul",
    category: "SmartLighting",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartLighting"],
    categoryNames: ["Akıllı Ev", "Akıllı Aydınlatma"],
    price: 149.99,
    description: "16 milyon renk seçeneği, ses kontrolü ve akıllı telefon uyumlu LED ampul",
    stock: 50,
    images: ["smart-bulb-1.jpg"],
    features: ["Ses Kontrolü", "WiFi Bağlantı", "16M Renk", "Programlanabilir"],
    specifications: {
      power: "9W",
      voltage: "220V",
      connectivity: "WiFi",
      compatibility: "Alexa, Google Home"
    }
  },
  {
    name: "Akıllı Şerit LED",
    category: "SmartLighting",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartLighting"],
    categoryNames: ["Akıllı Ev", "Akıllı Aydınlatma"],
    price: 299.99,
    description: "5 metre uzunluğunda, müzik senkronizasyonlu RGB şerit LED",
    stock: 30,
    images: ["led-strip-1.jpg"],
    features: ["Müzik Senkronizasyonu", "Uzaktan Kontrol", "Kesilebilir Tasarım"],
    specifications: {
      length: "5m",
      power: "24W",
      voltage: "12V",
      ledCount: "300"
    }
  },

  // Akıllı Ev - Güvenlik Sistemleri
  {
    name: "Akıllı Kapı Zili",
    category: "SmartSecurity",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartSecurity"],
    categoryNames: ["Akıllı Ev", "Güvenlik Sistemleri"],
    price: 599.99,
    description: "HD kamera ve iki yönlü ses iletişimi özellikli akıllı kapı zili",
    stock: 25,
    images: ["doorbell-1.jpg"],
    features: ["HD Kamera", "Gece Görüşü", "Hareket Sensörü", "İki Yönlü Ses"],
    specifications: {
      resolution: "1080p",
      powerSource: "Kablolu/Pil",
      storage: "Cloud",
      connectivity: "WiFi"
    }
  },
  {
    name: "Güvenlik Kamerası",
    category: "SmartSecurity",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartSecurity"],
    categoryNames: ["Akıllı Ev", "Güvenlik Sistemleri"],
    price: 799.99,
    description: "360 derece dönebilen, yapay zeka destekli iç mekan güvenlik kamerası",
    stock: 20,
    images: ["camera-1.jpg"],
    features: ["360° Dönüş", "AI Hareket Algılama", "Gece Görüşü"],
    specifications: {
      resolution: "2K",
      storage: "MicroSD/Cloud",
      angle: "360°",
      nightVision: "10m"
    }
  },

  // Akıllı Ev - Akıllı Prizler
  {
    name: "WiFi Akıllı Priz",
    category: "SmartPlugs",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartPlugs"],
    categoryNames: ["Akıllı Ev", "Akıllı Prizler"],
    price: 129.99,
    description: "Enerji tüketim ölçümlü, programlanabilir akıllı priz",
    stock: 40,
    images: ["smart-plug-1.jpg"],
    features: ["Enerji Ölçümü", "Zamanlayıcı", "Uzaktan Kontrol"],
    specifications: {
      maxLoad: "3680W",
      voltage: "220V",
      current: "16A",
      connectivity: "WiFi"
    }
  },
  {
    name: "Çoklu Akıllı Priz",
    category: "SmartPlugs",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartPlugs"],
    categoryNames: ["Akıllı Ev", "Akıllı Prizler"],
    price: 249.99,
    description: "4 soketli, USB portlu, aşırı yük korumalı akıllı priz",
    stock: 35,
    images: ["multi-plug-1.jpg"],
    features: ["4 Soket", "2 USB Port", "Aşırı Yük Koruması"],
    specifications: {
      sockets: "4",
      usbPorts: "2",
      maxLoad: "2500W",
      cableLength: "2m"
    }
  },

  // Akıllı Ev - Akıllı Sensörler
  {
    name: "Sıcaklık ve Nem Sensörü",
    category: "SmartSensors",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartSensors"],
    categoryNames: ["Akıllı Ev", "Akıllı Sensörler"],
    price: 199.99,
    description: "Kablosuz, yüksek hassasiyetli sıcaklık ve nem sensörü",
    stock: 45,
    images: ["temp-sensor-1.jpg"],
    features: ["Anlık Bildirimler", "Veri Kaydı", "Uzaktan İzleme"],
    specifications: {
      accuracy: "±0.3°C",
      battery: "CR2032",
      range: "20m",
      connectivity: "Bluetooth"
    }
  },
  {
    name: "Hareket Sensörü",
    category: "SmartSensors",
    mainCategory: "SmartHome",
    categoryPath: ["SmartHome", "SmartSensors"],
    categoryNames: ["Akıllı Ev", "Akıllı Sensörler"],
    price: 179.99,
    description: "Pilli, kablosuz PIR hareket sensörü",
    stock: 30,
    images: ["motion-sensor-1.jpg"],
    features: ["Gece Görüşü", "Anlık Bildirim", "Kolay Kurulum"],
    specifications: {
      range: "7m",
      angle: "120°",
      battery: "2xAAA",
      connectivity: "ZigBee"
    }
  },

  // Elektronik - Arduino
  {
    name: "Arduino Uno R3",
    category: "Arduino",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "Arduino"],
    categoryNames: ["Elektronik", "Arduino"],
    price: 249.99,
    description: "Orijinal Arduino Uno R3 geliştirme kartı",
    stock: 50,
    images: ["arduino-uno.jpg"],
    features: ["ATmega328P", "USB Bağlantı", "14 Dijital Pin", "6 Analog Pin"],
    specifications: {
      processor: "ATmega328P",
      voltage: "5V",
      memory: "32KB",
      clock: "16MHz"
    }
  },
  {
    name: "Arduino Starter Kit",
    category: "Arduino",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "Arduino"],
    categoryNames: ["Elektronik", "Arduino"],
    price: 599.99,
    description: "Arduino başlangıç seti, 30+ parça ve proje kitabı",
    stock: 25,
    images: ["arduino-kit.jpg"],
    features: ["Arduino Uno", "Breadboard", "LED Set", "Sensör Seti"],
    specifications: {
      components: "30+",
      projects: "15",
      difficulty: "Başlangıç-Orta",
      language: "Türkçe"
    }
  },

  // Elektronik - Raspberry Pi
  {
    name: "Raspberry Pi 4 8GB",
    category: "RaspberryPi",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "RaspberryPi"],
    categoryNames: ["Elektronik", "Raspberry Pi"],
    price: 1299.99,
    description: "8GB RAM'li Raspberry Pi 4 Model B",
    stock: 20,
    images: ["raspi-4.jpg"],
    features: ["8GB RAM", "4K Çıkış", "WiFi", "Bluetooth 5.0"],
    specifications: {
      processor: "1.5GHz Quad Core",
      ram: "8GB",
      usb: "USB 3.0",
      video: "4K@60Hz"
    }
  },
  {
    name: "Raspberry Pi Zero 2 W",
    category: "RaspberryPi",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "RaspberryPi"],
    categoryNames: ["Elektronik", "Raspberry Pi"],
    price: 449.99,
    description: "Kompakt boyutlu Raspberry Pi Zero 2 W",
    stock: 30,
    images: ["raspi-zero.jpg"],
    features: ["WiFi", "Bluetooth", "1GHz İşlemci", "512MB RAM"],
    specifications: {
      processor: "1GHz Quad Core",
      ram: "512MB",
      wireless: "802.11n",
      size: "65mm x 30mm"
    }
  },

  // Elektronik - Sensörler
  {
    name: "DHT22 Sensör Modülü",
    category: "Sensors",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "Sensors"],
    categoryNames: ["Elektronik", "Sensörler"],
    price: 89.99,
    description: "Yüksek hassasiyetli sıcaklık ve nem sensörü",
    stock: 40,
    images: ["dht22.jpg"],
    features: ["0.5°C Hassasiyet", "Dijital Çıkış", "Geniş Aralık"],
    specifications: {
      range: "-40~80°C",
      accuracy: "±0.5°C",
      humidity: "0-100%",
      voltage: "3.3-6V"
    }
  },
  {
    name: "MPU6050 Gyro Sensör",
    category: "Sensors",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "Sensors"],
    categoryNames: ["Elektronik", "Sensörler"],
    price: 69.99,
    description: "6 eksenli gyro ve ivmeölçer sensörü",
    stock: 35,
    images: ["mpu6050.jpg"],
    features: ["6 Eksen", "I2C Arayüz", "DMP", "16-bit ADC"],
    specifications: {
      interface: "I2C",
      voltage: "3-5V",
      resolution: "16-bit",
      range: "±2000°/s"
    }
  },

  // Elektronik - Motorlar
  {
    name: "Nema 17 Step Motor",
    category: "Motors",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "Motors"],
    categoryNames: ["Elektronik", "Motorlar"],
    price: 159.99,
    description: "3D yazıcı ve CNC projeleri için step motor",
    stock: 25,
    images: ["nema17.jpg"],
    features: ["1.8° Adım", "Bipolar", "4 Kablo", "Yüksek Tork"],
    specifications: {
      current: "1.7A",
      voltage: "12V",
      torque: "4.2kg/cm",
      step: "200/rev"
    }
  },
  {
    name: "12V DC Motor Set",
    category: "Motors",
    mainCategory: "Electronics",
    categoryPath: ["Electronics", "Motors"],
    categoryNames: ["Elektronik", "Motorlar"],
    price: 129.99,
    description: "Redüktörlü DC motor ve sürücü seti",
    stock: 30,
    images: ["dc-motor.jpg"],
    features: ["Redüktörlü", "Çift Şaft", "PWM Kontrol"],
    specifications: {
      voltage: "12V",
      rpm: "100RPM",
      torque: "10kg/cm",
      current: "2A"
    }
  },

  // Ev Otomasyonu - Akıllı Ev Sistemleri
  {
    name: "Akıllı Ev Merkezi",
    category: "SmartHomeSystem",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "SmartHomeSystem"],
    categoryNames: ["Ev Otomasyonu", "Akıllı Ev Sistemleri"],
    price: 1499.99,
    description: "Tüm akıllı ev cihazlarınızı kontrol eden merkezi sistem",
    stock: 15,
    images: ["smart-hub.jpg"],
    features: ["Çoklu Protokol", "Sesli Kontrol", "Otomasyon", "App Kontrol"],
    specifications: {
      protocols: "Zigbee, Z-Wave, WiFi",
      power: "5V DC",
      range: "100m",
      memory: "16GB"
    }
  },
  {
    name: "Akıllı Ev Starter Kit",
    category: "SmartHomeSystem",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "SmartHomeSystem"],
    categoryNames: ["Ev Otomasyonu", "Akıllı Ev Sistemleri"],
    price: 2499.99,
    description: "Akıllı ev başlangıç seti (merkez, ampul, priz, sensör)",
    stock: 10,
    images: ["starter-kit.jpg"],
    features: ["Kolay Kurulum", "Mobil App", "Sesli Kontrol"],
    specifications: {
      includes: "4 Cihaz",
      compatibility: "Alexa, Google",
      warranty: "2 Yıl",
      support: "7/24"
    }
  },

  // Ev Otomasyonu - İklimlendirme
  {
    name: "Akıllı Termostat",
    category: "Climate",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "Climate"],
    categoryNames: ["Ev Otomasyonu", "İklimlendirme"],
    price: 899.99,
    description: "Öğrenen termostat, enerji tasarruflu ısıtma kontrolü",
    stock: 20,
    images: ["thermostat.jpg"],
    features: ["Öğrenme", "Uzaktan Kontrol", "Enerji Raporu", "Program"],
    specifications: {
      display: "HD Dokunmatik",
      power: "24V",
      sensors: "Sıcaklık, Nem, Hareket",
      connection: "WiFi"
    }
  },
  {
    name: "Akıllı Klima Kontrolcüsü",
    category: "Climate",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "Climate"],
    categoryNames: ["Ev Otomasyonu", "İklimlendirme"],
    price: 399.99,
    description: "Mevcut klimanızı akıllı hale getiren IR kontrolcü",
    stock: 25,
    images: ["ac-control.jpg"],
    features: ["IR Öğrenme", "Programlama", "Sesli Kontrol"],
    specifications: {
      compatibility: "Tüm IR Klimalar",
      range: "8m",
      power: "USB",
      app: "iOS/Android"
    }
  },

  // Ev Otomasyonu - Eğlence Sistemleri
  {
    name: "Akıllı TV Box",
    category: "Entertainment",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "Entertainment"],
    categoryNames: ["Ev Otomasyonu", "Eğlence Sistemleri"],
    price: 799.99,
    description: "4K HDR destekli, sesli kontrollü akıllı TV sistemi",
    stock: 30,
    images: ["tv-box.jpg"],
    features: ["4K HDR", "Sesli Kontrol", "Chromecast", "Gaming"],
    specifications: {
      processor: "Quad Core",
      storage: "32GB",
      ram: "4GB",
      os: "Android TV"
    }
  },
  {
    name: "Akıllı Ses Sistemi",
    category: "Entertainment",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "Entertainment"],
    categoryNames: ["Ev Otomasyonu", "Eğlence Sistemleri"],
    price: 1299.99,
    description: "Kablosuz multi-room ses sistemi",
    stock: 15,
    images: ["speaker.jpg"],
    features: ["Multi-room", "HD Ses", "WiFi/BT", "Asistan"],
    specifications: {
      power: "100W",
      channels: "2.1",
      wireless: "WiFi/BT 5.0",
      format: "24bit/96kHz"
    }
  },

  // Ev Otomasyonu - Enerji Yönetimi
  {
    name: "Akıllı Elektrik Sayacı",
    category: "Energy",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "Energy"],
    categoryNames: ["Ev Otomasyonu", "Enerji Yönetimi"],
    price: 449.99,
    description: "Gerçek zamanlı enerji tüketim takip sistemi",
    stock: 20,
    images: ["energy-meter.jpg"],
    features: ["Gerçek Zamanlı", "Raporlama", "Alarm", "Grafik"],
    specifications: {
      accuracy: "±1%",
      voltage: "220V",
      current: "100A",
      interface: "WiFi"
    }
  },
  {
    name: "Solar Panel Kontrolcüsü",
    category: "Energy",
    mainCategory: "HomeAutomation",
    categoryPath: ["HomeAutomation", "Energy"],
    categoryNames: ["Ev Otomasyonu", "Enerji Yönetimi"],
    price: 899.99,
    description: "Solar sistem için akıllı şarj ve izleme kontrolcüsü",
    stock: 10,
    images: ["solar-control.jpg"],
    features: ["MPPT", "Batarya Yönetimi", "App İzleme"],
    specifications: {
      current: "40A",
      voltage: "12/24V",
      efficiency: "98%",
      display: "LCD"
    }
  }
];

async function seedProducts() {
  try {
    await client.connect();
    console.log('MongoDB Atlas\'a bağlanıldı');

    const database = client.db('smartify');
    
    // Kategorileri ekle
    const categoryCollection = database.collection('categories');
    await categoryCollection.deleteMany({});
    await categoryCollection.insertOne(categories);
    console.log('Kategoriler eklendi');

    // Ürünleri ekle
    const productCollection = database.collection('products');
    await productCollection.deleteMany({});
    const result = await productCollection.insertMany(products);
    console.log(`${result.insertedCount} ürün başarıyla eklendi`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

seedProducts(); 