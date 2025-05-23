# 💻 Smartify Web Platformu

<div align="center">
  
![Smartify Web Logo](https://via.placeholder.com/300x100?text=Smartify+Web)

</div>

## 📋 Proje Tanımı

Smartify Web, teknoloji ürünleri satan modern ve kullanıcı dostu bir e-ticaret platformudur. Akıllı ev sistemleri, elektronik komponentler ve maker ekipmanları gibi çeşitli teknolojik ürünleri sunan bu platform, hem hobi amaçlı hem de profesyonel kullanıcıların ihtiyaçlarını karşılamak için tasarlanmıştır.

## 🌟 Özellikler

- **🛍️ Kapsamlı Ürün Kataloğu**: Kategorilere ve özelliklere göre filtreleme
- **👤 Kullanıcı Hesapları**: Kayıt olma, giriş yapma ve profil yönetimi
- **🛒 Gelişmiş Sepet İşlemleri**: Ürün ekleme, çıkarma ve miktarı güncelleme
- **📦 Sipariş Takibi**: Siparişlerin durumunu anlık takip etme
- **⭐ Ürün İncelemeleri**: Kullanıcı yorumları ve puanlamaları
- **💬 AI Chatbot Asistanı**: 7/24 müşteri desteği sağlayan sanal asistan
- **🔐 Güvenli Ödeme Sistemi**: Çeşitli ödeme yöntemleri entegrasyonu
- **📊 Yönetici Paneli**: Ürün, sipariş ve kullanıcı yönetimi için kapsamlı arayüz
- **📱 Responsive Tasarım**: Her ekran boyutu için optimize edilmiş arayüz

## 🏗️ Proje Yapısı

```
Smartify_Web/
├── backend/                  # Backend kodları
│   ├── controllers/          # İş mantığı kontrolleri
│   ├── middleware/           # Express middleware'leri
│   ├── models/               # Mongoose veri modelleri
│   ├── routes/               # API rotaları
│   ├── utils/                # Yardımcı fonksiyonlar
│   └── server.js             # Ana sunucu dosyası
├── frontend/                 # Frontend kodları
│   ├── admin/                # Admin paneli sayfaları
│   ├── components/           # Yeniden kullanılabilir bileşenler
│   ├── css/                  # Stil dosyaları
│   ├── images/               # Görseller
│   ├── js/                   # JavaScript dosyaları
│   └── *.html                # HTML sayfaları
├── node_modules/             # Npm paketleri
├── .env                      # Ortam değişkenleri
├── package.json              # Proje bağımlılıkları
└── README.md                 # Bu dosya
```

## 🛠️ Teknoloji Yığını

### Backend
- **Node.js**: Sunucu tarafı JavaScript çalıştırma ortamı
- **Express.js**: Web uygulama çerçevesi
- **MongoDB**: NoSQL veritabanı
- **Mongoose**: MongoDB nesne modelleme aracı
- **JWT**: Kimlik doğrulama için JSON Web Token
- **Bcrypt.js**: Şifre hashleme
- **Multer**: Dosya yükleme işlemleri için
- **Nodemailer**: E-posta gönderme işlevleri
- **Socket.io**: Gerçek zamanlı iletişim için

### Frontend
- **HTML5, CSS3**: Yapılandırma ve stil
- **JavaScript (ES6+)**: İstemci tarafı işlevsellik
- **Bootstrap 5**: Responsive tasarım çerçevesi
- **Chart.js**: Veri görselleştirme
- **FontAwesome**: İkon kütüphanesi
- **Google Fonts**: Web fontları

## 🔧 Kurulum

### Gereksinimler
- Node.js (v14.0.0 veya üstü)
- MongoDB (v4.4 veya üstü)
- npm (v6.0.0 veya üstü)

### Kurulum Adımları

1. Repo'yu klonlayın:
```bash
git clone https://github.com/username/Smartify_Web.git
cd Smartify_Web
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smartify
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

4. Uygulamayı başlatın:
```bash
npm run dev
```

5. Tarayıcınızda `http://localhost:3000` adresini açın.

## 📱 Ekran Görüntüleri

<div align="center">
  <img src="https://via.placeholder.com/400x250?text=Ana+Sayfa" width="400" alt="Ana Sayfa">
  <img src="https://via.placeholder.com/400x250?text=Ürün+Sayfası" width="400" alt="Ürün Sayfası">
  <img src="https://via.placeholder.com/400x250?text=Admin+Paneli" width="400" alt="Admin Paneli">
  <img src="https://via.placeholder.com/400x250?text=Sepet+Sayfası" width="400" alt="Sepet Sayfası">
</div>

## 🤖 Chatbot API Kullanımı

Smartify platformu, AI destekli bir chatbot ile donatılmıştır. Bu chatbot, mobil ve diğer uygulamalarla entegrasyon için bir HTTP API'si sağlar:

```javascript
// Örnek API kullanımı
fetch('https://api.smartify.com/v1/chatbot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    query: "Akıllı ampul nasıl kurulur?",
    userId: "user123"
  })
})
.then(response => response.json())
.then(data => console.log(data.response));
```

## 🌐 API Dokümantasyonu

REST API endpoints listesi:

| Endpoint             | Metod | Açıklama                   | Yetkilendirme |
|---------------------|-------|----------------------------|--------------|
| `/api/products`      | GET   | Tüm ürünleri listeler      | Hayır        |
| `/api/products/:id`  | GET   | Ürün detaylarını getirir   | Hayır        |
| `/api/auth/register` | POST  | Yeni kullanıcı kaydeder    | Hayır        |
| `/api/auth/login`    | POST  | Kullanıcı girişi           | Hayır        |
| `/api/cart`          | GET   | Sepet içeriğini getirir    | Evet         |
| `/api/cart`          | POST  | Sepete ürün ekler          | Evet         |
| `/api/orders`        | POST  | Yeni sipariş oluşturur     | Evet         |
| `/api/orders`        | GET   | Kullanıcı siparişlerini getirir | Evet   |

## 📈 Gelecek Geliştirmeler

- **🌐 Çoklu Dil Desteği**: Uluslararası kullanıcılar için dil seçenekleri
- **🌙 Karanlık Mod**: Göz yorgunluğunu azaltan arayüz seçeneği
- **📊 Gelişmiş Analitikler**: Satış ve kullanıcı davranışlarını derinlemesine analiz
- **🔍 Görsel Arama**: Kamera ile ürün arama özelliği
- **📱 PWA Desteği**: Tarayıcıdan yüklenebilen uygulama deneyimi

## 🤝 Katkıda Bulunma

1. Bu repo'yu forklayın
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

<div align="center">
  <p>© 2023 Smartify Web. Tüm hakları saklıdır.</p>
</div>