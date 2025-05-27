# 📱 Smartify Mobil Uygulaması

<div align="center">

![Smartify Mobil Logo](https://via.placeholder.com/300x100?text=Smartify+Mobil)

[![Kotlin](https://img.shields.io/badge/Kotlin-1.8.0-purple.svg)](https://kotlinlang.org/)
[![Android Studio](https://img.shields.io/badge/Android%20Studio-Hedgehog-green.svg)](https://developer.android.com/studio)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-Latest-blue.svg)](https://developer.android.com/jetpack/compose)

</div>

## 📋 Uygulama Tanımı

Smartify Mobil, modern ve kullanıcı dostu bir Android e-ticaret uygulamasıdır. Jetpack Compose kullanılarak geliştirilmiş olup, kullanıcıların ürün araması, incelemesi, satın alması ve sipariş takibi yapabilmesini sağlayan kapsamlı özelliklere sahiptir.

## 🚀 Özellikler

- **🎨 Modern UI/UX**: Jetpack Compose kullanılarak oluşturulmuş, Material Design 3 uyumlu arayüz
- **🔍 Ürün Keşfi**: Kategori ve alt kategoriye göre filtreleme
- **📝 Detaylı Ürün Sayfaları**: Ürün açıklamaları, görseller, fiyat ve stok bilgileri
- **🛒 Sepet İşlemleri**: Ürün ekleme, miktar güncelleme ve kaldırma özellikleri
- **👤 Kullanıcı Hesabı**: Kayıt olma, giriş yapma ve profil yönetimi
- **❤️ Favoriler**: İstenilen ürünleri favorilere ekleme
- **📦 Sipariş Takibi**: Tamamlanan siparişleri görüntüleme ve durumunu takip etme
- **🏠 Adres Yönetimi**: Teslimat adreslerini kaydetme ve düzenleme
- **⚙️ Ayarlar**: Uygulama temalarını ve dil tercihlerini özelleştirme
- **💬 Chat Desteği**: Yardım için anlık mesajlaşma özelliği
- **🔄 Çevrimdışı Kullanım**: İnternet bağlantısı olmadığında bile temel özelliklere erişim
- **🔔 Bildirim Sistemi**: Önemli güncellemeler için anında bildirimler

## 📱 Ekran Görüntüleri

<div align="center">
  <img src="https://via.placeholder.com/180x360?text=Ana+Sayfa" width="180" alt="Ana Sayfa">
  <img src="https://via.placeholder.com/180x360?text=Ürün+Detayı" width="180" alt="Ürün Detayı">
  <img src="https://via.placeholder.com/180x360?text=Sepet" width="180" alt="Sepet">
  <img src="https://via.placeholder.com/180x360?text=Profil" width="180" alt="Profil">
</div>

## 🏗️ Mimari ve Tasarım

Uygulama, MVVM (Model-View-ViewModel) mimarisi üzerine inşa edilmiştir:

- **🧩 UI Layer (Compose)**: Kullanıcı arayüzü bileşenleri
- **📊 ViewModel Layer**: UI state yönetimi ve iş mantığı işlemleri
- **📁 Repository Layer**: Veri kaynaklarını soyutlayan ara katman
- **💾 Data Layer**: API servisleri ve yerel veritabanı

### Kullanılan Desenler

- **📱 Clean Architecture**: Bağımlılıkları minimize eden katmanlı yapı
- **🔄 Repository Pattern**: Veri kaynaklarını soyutlama
- **🧬 Factory Pattern**: Nesne yaratma süreçlerini merkezileştirme
- **🔄 Observer Pattern**: Veri değişikliklerini dinleme

## 🏗️ Proje Yapısı

```
com.example.smartify
├── api                 # API servisleri ve modellerimizi içerir
│   ├── models          # Veri modelleri (DTO'lar)
│   ├── repository      # API ile iletişim sağlayan repository'ler
│   └── services        # Retrofit API servisleri
├── data                # Veri katmanı
│   ├── local           # Room DB ve DataStore ile ilgili sınıflar
│   ├── remote          # Uzak veri kaynakları
│   └── repository      # Repository uygulamaları
├── di                  # Dependency Injection modülleri
├── ui                  # UI bileşenleri
│   ├── components      # Paylaşılan UI bileşenleri
│   ├── navigation      # Navigasyon tanımlamaları
│   ├── screens         # Uygulama ekranları
│   │   ├── home
│   │   ├── login
│   │   ├── register
│   │   ├── profile
│   │   ├── cart
│   │   ├── product_detail
│   │   ├── search
│   │   └── ...
│   ├── chat            # Chat bileşenleri
│   └── theme           # Tema ve stil tanımlamaları
└── utils               # Yardımcı sınıflar ve utility fonksiyonları
```

## 🛠️ Kullanılan Teknolojiler

- **🔧 Dil**: Kotlin
- **🎨 Kullanıcı Arayüzü**: Jetpack Compose
- **⚙️ Mimari**: MVVM (Model-View-ViewModel)
- **💉 Bağımlılık Enjeksiyonu**: Dagger Hilt
- **🌐 Ağ İletişimi**: Retrofit, OkHttp
- **🖼️ Görüntü Yükleme**: Coil
- **⏱️ Asenkron İşlemler**: Kotlin Coroutines, Flow
- **💾 Yerel Depolama**: Room Database, DataStore
- **🧭 Navigasyon**: Navigation Compose
- **🔍 Arama**: Custom Search Engine
- **📊 Analytics**: Firebase Analytics
- **🔔 Push Bildirimleri**: Firebase Cloud Messaging

## 🔄 Veri Akışı

1. ViewModel, Repository'den verileri alır
2. Repository, API Service veya lokal veri kaynağı üzerinden veriyi çeker
3. API Service, Retrofit kullanarak sunucudan veri alır
4. Veri, UI katmanına Flow veya LiveData olarak aktarılır
5. UI, veri durumuna (yükleniyor/hata/başarılı) göre ilgili içeriği gösterir

## 🌐 API Entegrasyonu

Uygulama, Smartify web platformuyla aynı backend API'sini kullanmaktadır. Bu API, RESTful servisler ile aşağıdaki işlemleri sağlar:

- Ürün listesi ve detayları
- Kullanıcı kimlik doğrulama
- Sepet işlemleri
- Sipariş yönetimi
- Kullanıcı profil bilgileri
- Chatbot AI servisi

## 🔧 Kurulum

### Gereksinimler

- Android Studio Hedgehog (2023.1.1) veya daha yeni sürüm
- Android SDK 33 veya daha yeni sürüm
- JDK 17
- Android cihaz veya emülatör (API 24 veya üzeri)

### Adımlar

1. Projeyi klonlayın:
```bash
git clone https://github.com/username/Smartify.git
cd Smartify/Smartify_Mobil
```

2. Android Studio'da açın ve gereken bağımlılıkların yüklenmesini bekleyin

3. `local.properties` dosyasına API anahtarınızı ekleyin:
```properties
api.base.url=https://api.smartify.com/v1/
api.key=YOUR_API_KEY
```

4. Uygulamayı emülatör veya fiziksel cihazda çalıştırın

## 📱 Desteklenen Cihazlar

- Android 7.0 (API level 24) ve üzeri işletim sistemine sahip cihazlar
- Tablet ve telefon ekran boyutları için optimize edilmiştir
- Hem dikey hem yatay ekran oryantasyonu desteklenmektedir

## 🧪 Test

Uygulama, kapsamlı test sistemiyle donatılmıştır:

- **🔬 Unit Testler**: ViewModel ve Repository sınıfları için
- **📱 UI Testler**: Compose bileşenlerini test etmek için
- **🤝 Entegrasyon Testleri**: Bileşenlerin birlikte çalışmasını test etmek için

```bash
./gradlew test              # Unit testleri çalıştırır
./gradlew connectedCheck    # UI testlerini çalıştırır
```

## 📈 Gelecek Geliştirmeler

- **🌐 Çoklu Dil Desteği**: Daha fazla dil seçeneği
- **🎙️ Sesli Arama**: Ses komutuyla ürün araması
- **📷 Görsel Arama**: Kamera ile ürün tanıma
- **🧩 AR Deneyimi**: Ürünleri artırılmış gerçeklik ile görüntüleme
- **🔑 Biyometrik Giriş**: Parmak izi ve yüz tanıma ile giriş yapma
- **💳 Daha Fazla Ödeme Yöntemi**: Kripto para desteği
- **🎁 Sadakat Programı**: Puan biriktirme ve ödül sistemi

## 🤝 Katkıda Bulunma

1. Bu repo'yu forklayın
2. Yeni bir dal oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Dalınıza push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

<div align="center">
  <p>© 2025 Smartify Mobil. Tüm hakları saklıdır.</p>
</div> 