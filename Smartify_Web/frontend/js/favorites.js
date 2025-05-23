// API URL - önce localStorage kontrol et, sonra window.API_URL, yoksa varsayılan değeri kullan
const storedApiUrl = localStorage.getItem('api_url');
if (storedApiUrl) {
  console.log('API URL localStorage\'dan yükleniyor:', storedApiUrl);
  window.API_URL = storedApiUrl;
} else if (!window.API_URL) {
  console.log('API URL tanımlı değil, varsayılan değer ayarlanıyor');
  // Tam URL yapılandırması (görece URL yerine)
  window.API_URL = 'http://localhost:3000/api';
}

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Favoriler JS dosyası yüklendi');
    console.log('Kullanılan API URL:', window.API_URL);
    
    try {
        // Token kontrolü
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('Kullanıcı girişi yapılmamış, giriş sayfasına yönlendiriliyor');
            // Giriş sayfasına yönlendirme yapıyoruz, favoriler sayfasına geri dönmek için redirect parametresi eklendi
            window.location.href = 'login.html?redirect=favorites.html';
            return; // Eğer kullanıcı giriş yapmamışsa diğer işlemleri yapma
        }
        
        console.log('Token kontrolü başarılı, favorileri yüklemeye başlıyor');
        
        // Loading göstergesini göster
        document.getElementById('favoritesContainer').innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Favoriler yükleniyor...</p>
            </div>
        `;
        
        // Favorileri getir
        await loadFavorites();
        
    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        document.getElementById('favoritesContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                <button onclick="window.location.reload()" class="btn">Tekrar Dene</button>
            </div>
        `;
        showToast('Bir hata oluştu: ' + error.message, 'error');
    }
});

// API URL'si oluşturmak için yardımcı fonksiyon
function getApiUrl(endpoint) {
    // Varsayılan API temel URL'si
    const API_BASE_URL = 'http://localhost:3000';
    
    // URL nesnesi oluştur
    try {
        // Endpoint'in başında / karakteri olduğundan emin ol
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        
        // Endpoint'in başında /api olduğundan emin ol
        if (!endpoint.startsWith('/api')) {
            endpoint = '/api' + endpoint;
        }
        
        return new URL(endpoint, API_BASE_URL).href;
    } catch (error) {
        console.error('API URL oluşturma hatası:', error);
        return API_BASE_URL + endpoint;
    }
}

// Favorileri getir ve görüntüle
async function loadFavorites() {
    try {
        const token = localStorage.getItem('token');
        console.log('Token durumu:', token ? 'Token var' : 'Token bulunamadı');
        
        // Eğer kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
        if (!token) {
            window.location.href = 'login.html?redirect=favorites.html';
            return;
        }
        
        // API URL'sini oluştur
        const apiEndpoint = getApiUrl('/users/favorites');
        console.log('API isteği yapılıyor:', apiEndpoint);
        
        // Favorileri getir
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('API yanıt durumu:', response.status, response.statusText);
        console.log('API yanıt başlıkları:', Object.fromEntries([...response.headers.entries()]));
        
        if (!response.ok) {
            let errorMessage = 'Favoriler getirilirken hata oluştu';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error('API yanıt hatası JSON olarak ayrıştırılamadı:', parseError);
            }
            
            // 401 veya 403 hatası ise token geçersiz olabilir, kullanıcıyı giriş sayfasına yönlendir
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token'); // Token'ı temizle
                localStorage.removeItem('user'); // Kullanıcı verilerini de temizle
                window.location.href = 'login.html?redirect=favorites.html';
                return;
            }
            
            throw new Error(errorMessage);
        }
        
        let favorites;
        try {
            // İçeriği metin olarak al
            const responseText = await response.text();
            
            // İçeriği konsola yazdır
            console.log('API yanıt içeriği (ilk 500 karakter):', 
                responseText ? responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '') : 'Boş yanıt');
            
            // İçerik boşsa boş dizi döndür
            if (!responseText || responseText.trim() === '') {
                console.log('API boş yanıt döndürdü, boş dizi kullanılacak');
                favorites = [];
            } 
            // İçerik '<' ile başlıyorsa muhtemelen bir HTML yanıtıdır
            else if (responseText.trim().startsWith('<')) {
                console.error('API HTML benzeri bir yanıt döndürdü, JSON bekleniyordu:', responseText.substring(0, 100));
                throw new Error('API geçersiz bir yanıt döndürdü (HTML alındı, JSON bekleniyordu)');
            }
            // JSON ayrıştırma dene
            else {
                favorites = JSON.parse(responseText);
                console.log('JSON başarıyla ayrıştırıldı');
            }
        } catch (parseError) {
            console.error('JSON ayrıştırma hatası:', parseError);
            const errorMsg = parseError.message || 'Bilinmeyen JSON hatası';
            // Hatayı daha açıklayıcı hale getir
            if (errorMsg.includes("Unexpected token '<'")) {
                throw new Error('API HTML yanıtı döndürdü, lütfen API URL ve endpoint kontrolü yapın');
            } else {
                throw new Error('Favori verileri ayrıştırılamadı: ' + errorMsg);
            }
        }
        
        console.log('Favoriler yüklendi, veri türü:', Array.isArray(favorites) ? 'Dizi' : typeof favorites);
        if (Array.isArray(favorites)) {
            console.log('Favori ürün sayısı:', favorites.length);
        }
        
        // Favorileri göster
        displayFavorites(Array.isArray(favorites) ? favorites : []);
    } catch (error) {
        console.error('Favorileri getirme hatası:', error);
        document.getElementById('favoritesContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Favoriler yüklenirken bir hata oluştu: ${error.message}</p>
                <p>Lütfen API ayarlarını kontrol edin ve sayfayı yenileyin.</p>
                <div class="error-actions">
                    <button onclick="checkApiConfig()" class="btn">API Ayarlarını Kontrol Et</button>
                    <button onclick="loadFavorites()" class="btn">Tekrar Dene</button>
                    <a href="products.html" class="btn">Ürünlere Dön</a>
                </div>
            </div>
        `;
    }
}

// Favorileri görüntüle
function displayFavorites(products) {
    console.log('displayFavorites çağrıldı, ürün sayısı:', products ? products.length : 0);
    
    try {
        console.log('Ürün verileri:', JSON.stringify(products));
    } catch (e) {
        console.error('Ürün verileri JSON olarak dönüştürülemedi:', e);
    }
    
    const container = document.getElementById('favoritesContainer');
    
    // Container kontrolü
    if (!container) {
        console.error('favoritesContainer elementi bulunamadı!');
        return;
    }
    
    // Favori ürün yoksa
    if (!products || !Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <i class="far fa-heart"></i>
                <h3>Henüz favorileriniz yok</h3>
                <p>Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.</p>
                <a href="products.html" class="btn">Ürünleri İncele</a>
            </div>
        `;
        return;
    }
    
    // Ürünleri benzersiz hale getir (aynı ID'li ürünleri filtrele)
    const uniqueProducts = [];
    const seenIds = new Set();
    
    products.forEach(product => {
        // Geçersiz product kontrolü
        if (!product) return;
        
        // _id kontrolleri
        const productId = product._id ? 
            (typeof product._id === 'object' ? product._id.toString() : product._id.toString()) : 
            (typeof product === 'string' ? product : null);
            
        if (productId && !seenIds.has(productId)) {
            seenIds.add(productId);
            uniqueProducts.push(product);
        }
    });
    
    console.log('Benzersiz ürün sayısı:', uniqueProducts.length);
    
    // Container'ı temizle
    container.innerHTML = '';
    
    // Favorileri HTML olarak oluştur - doğrudan grid container'a ekle
    uniqueProducts.forEach(product => {
        // Ürün kontrolleri
        if (!product || typeof product !== 'object') {
            console.error('Geçersiz ürün verisi:', product);
            return; // Bu ürünü atla
        }
        
        // Ürün adı kontrolü
        const productName = product.name || 'İsimsiz ürün';
        console.log('Ürün işleniyor:', productName, product);
        
        // Varsayılan resim yolu
        const defaultImageUrl = '/images/default-product.png';
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : (product.image || defaultImageUrl);
        
        // Kategori metni
        const categoryText = product.categoryNames ? product.categoryNames.join(' > ') : (product.category || '');
        
        // Fiyat bilgisi ve kontrolü
        let price = 0;
        let oldPrice = null;
        
        try {
            price = parseFloat(product.price) || 0;
            oldPrice = product.oldPrice ? parseFloat(product.oldPrice) : null;
        } catch (e) {
            console.error('Fiyat dönüştürme hatası:', e);
        }
            
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${productName}" 
                     onerror="this.onerror=null; this.src='${defaultImageUrl}'; console.error = (function() { return function() {}; })();">
                <div class="product-badges">
                    ${product.isNew ? '<span class="product-badge badge-new">Yeni Ürün</span>' : ''}
                    ${product.isPopular ? '<span class="product-badge badge-popular">Popüler</span>' : ''}
                    ${product.stock <= 0 ? '<span class="product-badge badge-out">Tükendi</span>' : ''}
                </div>
            </div>
            <div class="product-content">
                <div class="product-category">${categoryText}</div>
                <h3 class="product-title">
                    <a href="product-detail.html?id=${product._id}">${productName}</a>
                </h3>
                <div class="product-price">
                    <span class="current-price">${price.toLocaleString('tr-TR')} ₺</span>
                    ${oldPrice ? `<span class="old-price">${oldPrice.toLocaleString('tr-TR')} ₺</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Sepete Ekle
                    </button>
                    <button class="wishlist-btn active" data-id="${product._id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
    
    console.log('Ürünler HTML olarak eklendi, butonlar ayarlanıyor');
    
    // Butonlara event listener ekle
    setupFavoriteButtons();
}

// Favori sayfasındaki butonlar için event listener
function setupFavoriteButtons() {
    // Sepete ekle butonları
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            addToCart(productId);
        });
    });
    
    // Favorilerden çıkar butonları
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            removeFavorite(productId, e.currentTarget);
        });
    });
    
    console.log('Buton event listener\'ları eklendi');
}

// Ürünü favorilerden çıkar
async function removeFavorite(productId, button) {
    try {
        if (!productId) {
            console.error('removeFavorite: Ürün ID parametresi geçersiz');
            showToast('Geçersiz ürün ID', 'error');
            return;
        }
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = 'login.html?redirect=favorites.html';
            return;
        }
        
        console.log('Favorilerden çıkarma isteği yapılıyor:', productId);
        
        // API URL'sini oluştur
        const apiEndpoint = getApiUrl(`/users/favorites/${productId}`);
        console.log('API isteği yapılıyor:', apiEndpoint);
        
        // API çağrısı
        const response = await fetch(apiEndpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            let errorMessage = 'Ürün favorilerden çıkarılamadı';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error('API yanıt hatası JSON olarak ayrıştırılamadı:', parseError);
            }
            
            throw new Error(errorMessage);
        }
        
        // Sayfayı yeniden yükle
        loadFavorites();
        
        // Bildirimi göster
        showToast('Ürün favorilerden çıkarıldı', 'info');
    } catch (error) {
        console.error('Favorilerden çıkarma hatası:', error);
        showToast('İşlem sırasında bir hata oluştu: ' + error.message, 'error');
    }
}

// Ürünü sepete ekle
function addToCart(productId) {
    if (!productId) {
        console.error('addToCart: Ürün ID parametresi geçersiz');
        showToast('Geçersiz ürün ID', 'error');
        return;
    }
    
    console.log(`Ürün ID: ${productId} sepete ekleniyor...`);
    
    // API URL'sini oluştur
    const apiEndpoint = getApiUrl(`/products/${productId}`);
    console.log('API isteği yapılıyor:', apiEndpoint);
    
    // Ürün bilgilerini al
    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ürün bilgileri alınamadı');
            }
            return response.text().then(text => {
                if (!text || text.trim() === '') {
                    throw new Error('Ürün verisi boş');
                }
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('JSON ayrıştırma hatası:', e);
                    throw new Error('Ürün verisi ayrıştırılamadı');
                }
            });
        })
        .then(product => {
            if (!product || !product._id) {
                throw new Error('Geçersiz ürün verisi');
            }
            
            // cart nesnesi varsa onu kullan, yoksa window.cart'ı kontrol et
            if (typeof cart !== 'undefined') {
                cart.addItem(product);
            } else if (typeof window.cart !== 'undefined') {
                window.cart.addItem(product);
            } else {
                // Cart nesnesi bulunamadı, ürünü localStorage'a ekle
                let cartItems;
                try {
                    const cartData = localStorage.getItem('cart');
                    cartItems = cartData ? JSON.parse(cartData) : [];
                    
                    if (!Array.isArray(cartItems)) {
                        console.warn('Sepet verisi dizi değil, sıfırlanıyor');
                        cartItems = [];
                    }
                } catch (e) {
                    console.error('Sepet verisi ayrıştırılamadı:', e);
                    cartItems = [];
                }
                
                // Ürünün zaten sepette olup olmadığını kontrol et
                const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
                
                if (existingItemIndex !== -1) {
                    // Ürün zaten sepette, miktarını artır
                    cartItems[existingItemIndex].quantity = (cartItems[existingItemIndex].quantity || 1) + 1;
                } else {
                    // Ürünü sepete ekle
                    product.quantity = 1;
                    cartItems.push(product);
                }
                
                // Sepeti güncelle
                try {
                    localStorage.setItem('cart', JSON.stringify(cartItems));
                } catch (e) {
                    console.error('Sepet verisi kaydedilemedi:', e);
                    showToast('Sepet güncelleme hatası', 'error');
                }
                
                // Header'ı güncelle
                if (typeof updateHeader === 'function') {
                    updateHeader();
                }
                
                showToast(`${product.name || 'Ürün'} sepete eklendi`, 'success');
            }
        })
        .catch(error => {
            console.error('Sepete ekleme hatası:', error);
            showToast('Ürün sepete eklenirken bir hata oluştu: ' + error.message, 'error');
        });
}

// Giriş durumunu kontrol et
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('Token bulunamadı, kullanıcı giriş sayfasına yönlendiriliyor');
        window.location.href = 'login.html?redirect=favorites.html';
        return false;
    }
    
    return true;
}

// Bildirimi göster
function showToast(message, type = 'info') {
    console.log(`Bildirim gösteriliyor: ${message} (${type})`);
    
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // window.showToast fonksiyonu bulunamadıysa basit bir alert göster
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <p>${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        // 3 saniye sonra bildirimi kaldır
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// API yapılandırmasını kontrol et
function checkApiConfig() {
    const currentApiUrl = window.API_URL;
    console.log('Mevcut API URL:', currentApiUrl);
    
    // API URL'sini değiştirme seçenekleri - tam URL'ler
    const apiOptions = [
        { label: 'Mevcut URL', value: currentApiUrl },
        { label: 'Localhost:3000 (tam URL)', value: 'http://localhost:3000/api' },
        { label: 'Localhost:3000 (görece URL)', value: '/api' }
    ];
    
    // Modal içeriğini oluştur
    const modalContent = `
        <div class="api-config-modal">
            <h3>API Yapılandırma</h3>
            <p>Mevcut API URL: <strong>${currentApiUrl}</strong></p>
            <p>API bağlantı sorunu tespit edildi. HTML yanıtı alınıyor, JSON bekleniyordu.</p>
            <p>Sorun nedeni:</p>
            <ul>
                <li>API URL'sinin yanlış yapılandırılması</li>
                <li>API sunucusunun çalışmaması</li>
                <li>CORS politikası sorunları</li>
            </ul>
            <p>Lütfen doğru API URL'sini seçin:</p>
            <div class="api-options">
                ${apiOptions.map(option => `
                    <div class="api-option">
                        <input type="radio" name="api-url" id="api-${encodeURIComponent(option.value)}" value="${option.value}" 
                               ${option.value === currentApiUrl ? 'checked' : ''}>
                        <label for="api-${encodeURIComponent(option.value)}">${option.label} (${option.value})</label>
                    </div>
                `).join('')}
            </div>
            <div class="modal-actions">
                <button onclick="updateApiConfig()" class="btn">Kaydet</button>
                <button onclick="closeApiConfigModal()" class="btn btn-secondary">İptal</button>
            </div>
        </div>
    `;
    
    // Eğer DOM'da modal container yoksa oluştur
    let modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = modalContent;
    modalContainer.classList.add('active');
}

// API yapılandırmasını güncelle
function updateApiConfig() {
    const selectedApiUrl = document.querySelector('input[name="api-url"]:checked').value;
    console.log('Seçilen API URL:', selectedApiUrl);
    
    // API URL'sini güncelle
    window.API_URL = selectedApiUrl;
    localStorage.setItem('api_url', selectedApiUrl);
    
    // Modal'ı kapat
    closeApiConfigModal();
    
    // Sayfayı yenile
    showToast('API URL güncellendi, favoriler yeniden yükleniyor...', 'info');
    setTimeout(() => loadFavorites(), 1000);
}

// API yapılandırma modalını kapat
function closeApiConfigModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('active');
    }
}

// Sayfa yüklendikten sonra modal CSS stillerini ekle
document.addEventListener('DOMContentLoaded', () => {
  // Stil ekle
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* API Config Modal Styles */
    #modal-container {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      justify-content: center;
      align-items: center;
    }
    
    #modal-container.active {
      display: flex;
    }
    
    .api-config-modal {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .api-config-modal h3 {
      margin-top: 0;
      color: #2962ff;
    }
    
    .api-options {
      margin: 20px 0;
    }
    
    .api-option {
      margin-bottom: 10px;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .api-option:hover {
      background-color: #f5f5f5;
    }
    
    .api-option input {
      margin-right: 10px;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    
    .error-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    
    .btn-secondary {
      background-color: #757575;
    }
    
    .btn-secondary:hover {
      background-color: #616161;
    }
  `;
  document.head.appendChild(styleElement);
}); 