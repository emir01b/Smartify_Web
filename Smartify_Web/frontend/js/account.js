// Kullanıcı bilgilerini yükle
const loadUserData = () => {
  const user = getCurrentUser();
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    console.log("Kullanıcı giriş yapmamış veya token bulunamadı, login sayfasına yönlendiriliyor");
    window.location.href = 'login.html?redirect=account';
    return;
  }
  
  // Kullanıcı bilgilerini doldur
  document.getElementById('user-name').textContent = user.name || 'Kullanıcı';
  document.getElementById('user-email').textContent = user.email || '';
  
  // Kullanıcı avatar'ını ayarla
  const userAvatar = document.getElementById('user-avatar');
  if (user.avatar) {
    userAvatar.src = user.avatar;
  } else {
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2962ff&color=fff`;
  }
  
  // Profil formunu doldur
  document.getElementById('fullname').value = user.name || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phone').value = user.phone || '';
  document.getElementById('birthday').value = user.birthday || '';
  document.getElementById('bio').value = user.bio || '';
};

// Tab değiştirme işlemi
const initTabs = () => {
  const tabs = document.querySelectorAll('.account-nav a[data-tab]');
  const contentTabs = document.querySelectorAll('.account-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Aktif tab'ı değiştir
      document.querySelector('.account-nav li.active').classList.remove('active');
      tab.parentElement.classList.add('active');
      
      // Aktif içeriği değiştir
      const tabId = tab.getAttribute('data-tab');
      
      contentTabs.forEach(contentTab => {
        contentTab.classList.remove('active');
      });
      
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      // URL'yi güncelle
      window.history.pushState({}, '', `#${tabId}`);
    });
  });
  
  // URL'den tab kontrolü
  const checkUrlTab = () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.querySelector(`.account-nav a[data-tab="${hash}"]`)) {
      document.querySelector(`.account-nav a[data-tab="${hash}"]`).click();
    }
  };
  
  // Sayfa yüklendiğinde tab kontrolü
  checkUrlTab();
  
  // URL değiştiğinde tab kontrolü
  window.addEventListener('hashchange', checkUrlTab);
};

// Şifre göster/gizle
const initPasswordToggles = () => {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const passwordField = toggle.parentElement.querySelector('input');
      const icon = toggle.querySelector('i');
      
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
};

// Profil bilgilerini güncelle
const initProfileForm = () => {
  const profileForm = document.getElementById('profile-form');
  
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        birthday: document.getElementById('birthday').value,
        bio: document.getElementById('bio').value
      };
      
      try {
        const user = getCurrentUser();
        
        // API isteği (Backend hazır olmadığı için simüle ediyoruz)
        // Gerçek projede fetchAPI kullanılır
        // const updatedUser = await fetchAPI('/users/profile', {
        //   method: 'PUT',
        //   body: JSON.stringify(formData)
        // });
        
        // Kullanıcı bilgilerini güncelle (Simülasyon)
        const updatedUser = { ...user, ...formData };
        setCurrentUser(updatedUser);
        
        showToast('Profil bilgileriniz başarıyla güncellendi');
        
        // Kullanıcı adını ve avatarı güncelle
        document.getElementById('user-name').textContent = updatedUser.name;
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=2962ff&color=fff`;
        
      } catch (error) {
        showToast(error.message || 'Profil güncellenirken bir hata oluştu', 'error');
      }
    });
  }
};

// Şifre güncelleme formu
const initSecurityForm = () => {
  const securityForm = document.getElementById('security-form');
  
  if (securityForm) {
    securityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Lütfen tüm alanları doldurun', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showToast('Yeni şifreler eşleşmiyor', 'error');
        return;
      }
      
      try {
        // API isteği (Backend hazır olmadığı için simüle ediyoruz)
        // await fetchAPI('/users/password', {
        //   method: 'PUT',
        //   body: JSON.stringify({
        //     currentPassword,
        //     newPassword
        //   })
        // });
        
        showToast('Şifreniz başarıyla güncellendi');
        securityForm.reset();
      } catch (error) {
        showToast(error.message || 'Şifre güncellenirken bir hata oluştu', 'error');
      }
    });
  }
};

// Güvenlik ayarları
const initSecuritySettings = () => {
  const twoFactorToggle = document.getElementById('two-factor');
  const loginAlertsToggle = document.getElementById('login-alerts');
  
  if (twoFactorToggle) {
    twoFactorToggle.addEventListener('change', () => {
      // API isteği (Simülasyon)
      setTimeout(() => {
        showToast(twoFactorToggle.checked ? 
          'İki faktörlü doğrulama aktifleştirildi' :
          'İki faktörlü doğrulama devre dışı bırakıldı'
        );
      }, 500);
    });
  }
  
  if (loginAlertsToggle) {
    loginAlertsToggle.addEventListener('change', () => {
      // API isteği (Simülasyon)
      setTimeout(() => {
        showToast(loginAlertsToggle.checked ? 
          'Giriş bildirimleri aktifleştirildi' :
          'Giriş bildirimleri devre dışı bırakıldı'
        );
      }, 500);
    });
  }
};

// Çıkış işlemi
const initLogout = () => {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
};

// Adres ekleme butonları
const initAddressButtons = () => {
  const addAddressBtns = document.querySelectorAll('.btn-add-address');
  
  addAddressBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Adres ekleme özelliği yakında aktif olacak', 'warning');
    });
  });
};

// Siparişleri yükle
const getMyOrders = async () => {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;
  
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  if (!user || !token) {
    console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
    showToast('Lütfen önce giriş yapınız', 'error');
    window.location.href = 'login.html?redirect=account#orders';
    return;
  }
  
  try {
    console.log('Siparişler yükleniyor:', `${API_URL}/api/orders/myorders`);
    console.log('Kullanılan token:', token);
    
    // API bağlantı sorunu olup olmadığını kontrol etmek için önce basit bir istek yap
    const checkConnection = await fetch(`${API_URL}/api/auth/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(error => {
      console.error('API bağlantı kontrolü başarısız:', error);
      throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    });
    
    // Asıl sipariş yükleme işlemi
    const response = await fetch(`${API_URL}/api/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('API yanıtı:', response.status);
    
    if (response.status === 401) {
      console.log('401 hatası alındı, token geçersiz');
      // Token süresi dolmuş veya geçersiz
      localStorage.removeItem('token'); // Token'ı temizle
      localStorage.removeItem('user'); // Kullanıcıyı temizle
      showToast('Oturum süreniz dolmuş, lütfen tekrar giriş yapın.', 'error');
      window.location.href = 'login.html?expired=true';
      return;
    }
    
    if (!response.ok) {
      throw new Error('Siparişler yüklenirken bir hata oluştu');
    }
    
    const orders = await response.json();
    console.log('Yüklenen siparişler:', orders);
    
    if (orders.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-bag"></i>
          <h3>Henüz siparişiniz bulunmuyor</h3>
          <p>Ürünlerimizi keşfedin ve ilk siparişinizi oluşturun</p>
          <a href="products.html" class="btn btn-primary">Alışverişe Başla</a>
        </div>
      `;
      return;
    }
    
    ordersList.innerHTML = orders.map(order => `
      <div class="order-item">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">Sipariş #${order._id.slice(-6)}</span>
            <span class="order-date">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div class="order-status ${order.status.toLowerCase().replace(/\s+/g, '-')}">
            ${order.status}
          </div>
        </div>
        <div class="order-products">
          ${order.orderItems.map(item => `
            <div class="order-product">
              <img src="${item.image}" alt="${item.name}" onerror="this.src='images/products/placeholder.jpg'">
              <div class="product-info">
                <h4>${item.name}</h4>
                <p>Adet: ${item.quantity}</p>
                <p class="price">${item.price.toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <div class="order-total">
            <span>Toplam:</span>
            <strong>${order.totalPrice.toLocaleString('tr-TR')} ₺</strong>
          </div>
          <button class="btn btn-outline" onclick="showOrderDetails('${order._id}')">
            Detayları Görüntüle
          </button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Siparişler yüklenirken hata:', error);
    showToast(error.message || 'Siparişler yüklenirken bir hata oluştu', 'error');
    ordersList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Siparişler yüklenemedi</h3>
        <p>${error.message || 'Sunucu bağlantısında bir sorun oluştu'}</p>
        <button class="btn btn-primary" onclick="getMyOrders()">Tekrar Dene</button>
      </div>
    `;
  }
};

// Sipariş detaylarını göster
const showOrderDetails = async (orderId) => {
  const user = getCurrentUser();
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    showToast('Lütfen önce giriş yapınız', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Sipariş detayları yüklenirken bir hata oluştu');
    }
    
    const order = await response.json();
    
    // Modal içeriğini oluştur
    const modalContent = `
      <div class="order-details">
        <h3>Sipariş Detayları</h3>
        <div class="order-details-header">
          <div class="order-detail-item">
            <span class="detail-label">Sipariş No:</span>
            <span class="detail-value">#${order._id.slice(-6)}</span>
          </div>
          <div class="order-detail-item">
            <span class="detail-label">Tarih:</span>
            <span class="detail-value">${new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div class="order-detail-item">
            <span class="detail-label">Durum:</span>
            <span class="detail-value status ${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span>
          </div>
        </div>
        
        <div class="detail-sections">
          <div class="detail-section shipping-info">
            <h4><i class="fas fa-shipping-fast"></i> Teslimat Bilgileri</h4>
            <p class="detail-address">
              <strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong><br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}<br>
              <i class="fas fa-phone"></i> ${order.shippingAddress.phone}
            </p>
          </div>
          
          <div class="detail-section payment-info">
            <h4><i class="fas fa-credit-card"></i> Ödeme Bilgileri</h4>
            <div class="payment-details">
              <p><span class="detail-label">Ödeme Yöntemi:</span> ${order.paymentMethod}</p>
              <p><span class="detail-label">Ödeme Durumu:</span> 
                <span class="payment-status ${order.isPaid ? 'paid' : 'pending'}">
                  ${order.isPaid ? 'Ödendi' : 'Beklemede'}
                </span>
              </p>
              ${order.isPaid ? `<p><span class="detail-label">Ödeme Tarihi:</span> ${new Date(order.paidAt).toLocaleDateString('tr-TR')}</p>` : ''}
            </div>
          </div>
        </div>
        
        <div class="detail-section order-items-section">
          <h4><i class="fas fa-box-open"></i> Sipariş Edilen Ürünler</h4>
          <div class="detail-order-items">
            ${order.orderItems.map(item => `
              <div class="detail-order-item">
                <div class="detail-product-image">
                  <img src="${item.image}" alt="${item.name}" onerror="this.src='images/products/placeholder.jpg'">
                </div>
                <div class="detail-product-info">
                  <h5>${item.name}</h5>
                  <div class="detail-product-meta">
                    <span class="detail-quantity">Adet: ${item.quantity}</span>
                    <span class="detail-price">${item.price.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
                <div class="detail-item-total">
                  <span>${(item.price * item.quantity).toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="detail-section order-summary">
          <h4><i class="fas fa-receipt"></i> Sipariş Özeti</h4>
          <div class="summary-items">
            <div class="summary-item">
              <span>Ara Toplam:</span>
              <span>${(order.totalPrice - order.taxPrice - order.shippingPrice).toLocaleString('tr-TR')} ₺</span>
            </div>
            <div class="summary-item">
              <span>KDV:</span>
              <span>${order.taxPrice.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div class="summary-item">
              <span>Kargo:</span>
              <span>${order.shippingPrice > 0 ? order.shippingPrice.toLocaleString('tr-TR') + ' ₺' : 'Ücretsiz'}</span>
            </div>
            <div class="summary-item total">
              <strong>Toplam:</strong>
              <strong>${order.totalPrice.toLocaleString('tr-TR')} ₺</strong>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Modal göster
    showModal(modalContent);
    
  } catch (error) {
    console.error('Sipariş detayları yüklenirken hata:', error);
    showToast(error.message || 'Sipariş detayları yüklenirken bir hata oluştu', 'error');
  }
};

// Modal gösterme fonksiyonu
const showModal = (content) => {
  // Mevcut modalı temizle
  const existingModal = document.querySelector('.modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }
  
  // Yeni modal oluştur
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Modal içeriği
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="modal-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;
  
  // Modalı sayfaya ekle
  document.body.appendChild(modal);
  
  // Scroll'u kapat
  document.body.style.overflow = 'hidden';
  
  // Animasyon için biraz bekle ve görünür yap
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
  
  // Kapatma düğmesi
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal(modal);
    });
  }
  
  // Overlay'a tıklama
  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeModal(modal);
    });
  }
};

// Modal kapatma fonksiyonu
const closeModal = (modal) => {
  // Modalı kaldır
  modal.classList.remove('active');
  
  // Animasyon bittikten sonra DOM'dan kaldır
  setTimeout(() => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
      // Scroll'u etkinleştir
      document.body.style.overflow = '';
    }
  }, 300);
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Navbar yüklendikten sonra çalıştır (main.js yüklenmesi gerekir)
  const checkMainJsLoaded = setInterval(() => {
    if (typeof getCurrentUser === 'function') {
      clearInterval(checkMainJsLoaded);
      
      loadUserData();
      initTabs();
      initPasswordToggles();
      initProfileForm();
      initSecurityForm();
      initSecuritySettings();
      initLogout();
      initAddressButtons();
      
      // Siparişleri yükle
      const ordersTab = document.querySelector('.account-nav a[data-tab="orders"]');
      if (ordersTab) {
        ordersTab.addEventListener('click', getMyOrders);
      }
      
      // URL'de #orders varsa siparişleri yükle
      if (window.location.hash === '#orders') {
        getMyOrders();
      }
      
      // Favoriler tab'ına tıklandığında favorileri yükle
      const favoritesTab = document.querySelector('.account-nav a[data-tab="favorites"]');
      if (favoritesTab) {
        favoritesTab.addEventListener('click', getFavorites);
      }
      
      // URL'de #favorites varsa favorileri yükle
      if (window.location.hash === '#favorites') {
        getFavorites();
      }
    }
  }, 100);
});

// Toast notification
if (typeof window.showToast !== 'function') {
  window.showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };
}

// Siparişleri yükleme fonksiyonunu global yap
window.getMyOrders = getMyOrders;

// Favorileri yükle
const getFavorites = async () => {
  const favoritesList = document.getElementById('favorites-list');
  if (!favoritesList) return;
  
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  if (!user || !token) {
    console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
    showToast('Lütfen önce giriş yapınız', 'error');
    window.location.href = 'login.html?redirect=account#favorites';
    return;
  }
  
  try {
    favoritesList.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Favoriler yükleniyor...</p>
      </div>
    `;
    
    console.log('Favoriler yükleniyor');
    
    // API endpoint'ini oluştur - getApiUrl fonksiyonu varsa kullan, yoksa direkt URL
    const apiEndpoint = typeof getApiUrl === 'function' 
      ? getApiUrl('/users/favorites') 
      : 'http://localhost:3000/api/users/favorites';
    
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
    
    if (response.status === 401) {
      console.log('401 hatası alındı, token geçersiz');
      // Token süresi dolmuş veya geçersiz
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToast('Oturum süreniz dolmuş, lütfen tekrar giriş yapın.', 'error');
      window.location.href = 'login.html?expired=true';
      return;
    }
    
    if (!response.ok) {
      throw new Error('Favoriler yüklenirken bir hata oluştu');
    }
    
    // Yanıtı text olarak al ve sonra JSON'a dönüştür - daha güvenli
    const responseText = await response.text();
    let favorites;
    
    try {
      favorites = responseText ? JSON.parse(responseText) : [];
    } catch (error) {
      console.error('JSON ayrıştırma hatası:', error);
      throw new Error('Favori verileri ayrıştırılamadı');
    }
    
    console.log('Yüklenen favoriler:', favorites);
    
    if (!Array.isArray(favorites) || favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-heart"></i>
          <h3>Henüz favori ürününüz bulunmuyor</h3>
          <p>Beğendiğiniz ürünleri favorilerinize ekleyin</p>
          <a href="products.html" class="btn btn-primary">Ürünleri Keşfet</a>
        </div>
      `;
      return;
    }
    
    // Favorileri görüntüle
    favoritesList.innerHTML = `
      <div class="favorites-grid">
        ${favorites.map(product => `
          <div class="favorite-item">
            <div class="favorite-image">
              <img src="${product.images && product.images.length > 0 ? product.images[0] : (product.image || '/images/default-product.png')}" 
                   alt="${product.name || 'Ürün'}" 
                   onerror="this.onerror=null; this.src='/images/default-product.png';">
              <button class="remove-favorite" data-id="${product._id}">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="favorite-content">
              <h4><a href="product-detail.html?id=${product._id}">${product.name || 'İsimsiz Ürün'}</a></h4>
              <div class="favorite-price">
                ${(product.price || 0).toLocaleString('tr-TR')} ₺
              </div>
              <div class="favorite-actions">
                <button class="btn btn-sm add-to-cart" data-id="${product._id}">
                  <i class="fas fa-shopping-cart"></i> Sepete Ekle
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Favorilerden çıkarma butonlarına event listener ekle
    document.querySelectorAll('.remove-favorite').forEach(button => {
      button.addEventListener('click', async (e) => {
        const productId = e.currentTarget.dataset.id;
        try {
          const response = await fetch(`http://localhost:3000/api/users/favorites/${productId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Ürün favorilerden çıkarılamadı');
          }
          
          showToast('Ürün favorilerden çıkarıldı', 'success');
          // Favorileri yeniden yükle
          getFavorites();
        } catch (error) {
          console.error('Favorilerden çıkarma hatası:', error);
          showToast(error.message || 'Bir hata oluştu', 'error');
        }
      });
    });
    
    // Sepete ekle butonlarına event listener ekle
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.id;
        if (typeof window.addToCart === 'function') {
          window.addToCart(productId);
        } else {
          showToast('Sepete ekleme fonksiyonu bulunamadı', 'error');
        }
      });
    });
    
  } catch (error) {
    console.error('Favoriler yüklenirken hata:', error);
    showToast(error.message || 'Favoriler yüklenirken bir hata oluştu', 'error');
    favoritesList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Favoriler yüklenemedi</h3>
        <p>${error.message || 'Sunucu bağlantısında bir sorun oluştu'}</p>
        <button class="btn btn-primary" onclick="getFavorites()">Tekrar Dene</button>
      </div>
    `;
  }
};

// Favorileri yükleme fonksiyonunu global yap
window.getFavorites = getFavorites; 