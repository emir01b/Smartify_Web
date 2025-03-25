# 3D DDD E-Ticaret Backend

3D baskı ve akıllı ev elektroniği ürünleri satan e-ticaret sitesinin backend kısmı.

## Teknolojiler

- Node.js
- Express
- MongoDB Atlas
- JWT Authentication
- Mongoose

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev

# Üretim modunda çalıştır
npm start
```

## Çevre Değişkenleri

`.env` dosyasında aşağıdaki değişkenleri ayarlayın:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

## API Rotaları

### Ürünler

- GET /api/products - Tüm ürünleri getir
- GET /api/products/:id - Tek ürün getir
- POST /api/products - Ürün oluştur (Admin)
- PUT /api/products/:id - Ürün güncelle (Admin)
- DELETE /api/products/:id - Ürün sil (Admin)
- POST /api/products/:id/reviews - Ürün değerlendirmesi ekle
- GET /api/products/featured - Öne çıkan ürünleri getir

### Kullanıcılar

- POST /api/users - Kullanıcı kaydı
- POST /api/users/login - Kullanıcı girişi
- GET /api/users/profile - Kullanıcı profilini getir
- PUT /api/users/profile - Kullanıcı profilini güncelle
- GET /api/users - Tüm kullanıcıları getir (Admin)
- DELETE /api/users/:id - Kullanıcı sil (Admin)

### Siparişler

- POST /api/orders - Sipariş oluştur
- GET /api/orders/myorders - Kullanıcının siparişlerini getir
- GET /api/orders/:id - Sipariş detaylarını getir
- PUT /api/orders/:id/pay - Siparişi ödenmiş olarak işaretle
- PUT /api/orders/:id/deliver - Siparişi teslim edilmiş olarak işaretle (Admin)
- GET /api/orders - Tüm siparişleri getir (Admin)