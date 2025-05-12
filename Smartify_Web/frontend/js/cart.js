// Sepet işlemleri
const cart = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  
  // Sepete ürün ekle
  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    
    this.saveCart();
    this.updateUI();
    showToast(`${product.name} sepete eklendi`, 'success', true);
  },
  
  // Sepetten ürün çıkar
  removeItem(productId) {
    console.log('Ürün siliniyor:', productId); // Debug için eklendi
    
    // Ürün adını alabilmek için önce ürünü bul
    const removedItem = this.items.find(item => item._id === productId);
    const itemName = removedItem ? removedItem.name : 'Ürün';
    
    // Ürünü sepetten çıkar
    this.items = this.items.filter(item => item._id !== productId);
    
    // LocalStorage'ı güncelle
    this.saveCart();
    
    // UI'ı güncelle
    this.updateUI();
    
    // Bildirim göster
    showToast(`${itemName} sepetten çıkarıldı`, 'warning');
    
    console.log('Güncel sepet:', this.items); // Debug için eklendi
  },
  
  // Ürün miktarını güncelle
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item._id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.updateUI();
    }
  },
  
  // Sepeti kaydet
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    // Header'daki sepet sayısını güncelle
    if (typeof updateHeader === 'function') {
      updateHeader();
    }
  },
  
  // Sepet arayüzünü güncelle
  updateUI() {
    // Sepet sayısını güncelle
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = this.items.length;
    }
    
    // Boş sepet ve sepet içeriği gösterim kontrolü
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    
    if (this.items.length === 0) {
      if (emptyCart) emptyCart.style.display = 'flex';
      if (cartContent) cartContent.style.display = 'none';
      return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    
    // Sepet ürünlerini listele
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    cartItems.innerHTML = this.items.map(item => `
      <tr>
        <td>
          <div class="cart-product">
            <img src="${item.image || 'images/products/placeholder.jpg'}" alt="${item.name}">
            <div>
              <h4>${item.name}</h4>
              <p>${item.category || ''}</p>
            </div>
          </div>
        </td>
        <td>₺${item.price.toFixed(2)}</td>
        <td>
          <div class="quantity-selector">
            <button class="quantity-btn minus-btn" data-id="${item._id}">-</button>
            <input type="number" value="${item.quantity}" min="1" max="10" data-id="${item._id}">
            <button class="quantity-btn plus-btn" data-id="${item._id}">+</button>
          </div>
        </td>
        <td>₺${(item.price * item.quantity).toFixed(2)}</td>
        <td>
          <button class="remove-btn" data-id="${item._id}" onclick="cart.removeItem('${item._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
    // Toplam tutarları hesapla
    const subtotalAmount = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingAmount = subtotalAmount > 500 ? 0 : 29.90;
    const discountAmount = this.getDiscount(subtotalAmount);
    const totalAmount = subtotalAmount + shippingAmount - discountAmount;
    
    // Tutarları göster
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const discount = document.getElementById('discount');
    const discountRow = document.getElementById('discount-row');
    const total = document.getElementById('total');
    
    if (subtotal) subtotal.textContent = `₺${subtotalAmount.toFixed(2)}`;
    
    if (shipping) {
      shipping.innerHTML = shippingAmount === 0 ? 
        '<span class="free-shipping">Ücretsiz</span>' : 
        `₺${shippingAmount.toFixed(2)}`;
    }
    
    if (discountAmount > 0 && discount && discountRow) {
      discount.textContent = `-₺${discountAmount.toFixed(2)}`;
      discountRow.style.display = 'flex';
    } else if (discountRow) {
      discountRow.style.display = 'none';
    }
    
    if (total) total.textContent = `₺${totalAmount.toFixed(2)}`;
    
    // Event listener'ları ekle
    this.addEventListeners();
  },
  
  // İndirim hesapla
  getDiscount(subtotal) {
    const couponCode = localStorage.getItem('couponCode');
    if (couponCode === 'ILKALIS') {
      return subtotal * 0.10; // %10 indirim
    }
    return 0;
  },
  
  // Event listener'ları ekle
  addEventListeners() {
    // Miktar güncelleme
    document.querySelectorAll('.quantity-selector input').forEach(input => {
      input.addEventListener('change', () => {
        const productId = input.dataset.id;
        const quantity = parseInt(input.value);
        if (quantity > 0 && quantity <= 10) {
          this.updateQuantity(productId, quantity);
        }
      });
    });
    
    // Miktar artırma/azaltma
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        const input = document.querySelector(`input[data-id="${productId}"]`);
        let quantity = parseInt(input.value);
        
        if (btn.classList.contains('minus-btn')) {
          quantity = Math.max(1, quantity - 1);
        } else {
          quantity = Math.min(10, quantity + 1);
        }
        
        this.updateQuantity(productId, quantity);
      });
    });
    
    // Kupon kodu uygulama
    const applyBtn = document.getElementById('apply-coupon');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const couponInput = document.getElementById('coupon-code');
        if (!couponInput) return;
        
        const code = couponInput.value.trim();
        
        if (code === 'ILKALIS') {
          localStorage.setItem('couponCode', code);
          this.updateUI();
          showToast('Kupon kodu uygulandı', 'success');
        } else {
          showToast('Geçersiz kupon kodu', 'error');
        }
      });
    }
  }
};

// Bildirim gösterme fonksiyonu
window.showToast = (message, type = 'info', withCartIcon = false) => {
  // Varsa mevcut bildirimleri temizle
  const existingToasts = document.querySelectorAll('.cart-toast');
  existingToasts.forEach(toast => {
    document.body.removeChild(toast);
  });
  
  // Yeni bildirimi oluştur
  const toast = document.createElement('div');
  toast.className = `cart-toast ${type}`;
  
  // Bildirim içeriği
  let icon = '';
  switch(type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle"></i>';
  }
  
  // Sepet ikonu eklenecekse
  if (withCartIcon) {
    icon = '<i class="fas fa-shopping-cart"></i>';
  }
  
  toast.innerHTML = `
    <div class="toast-content">
      ${icon}
      <p>${message}</p>
    </div>
    <button class="toast-close"><i class="fas fa-times"></i></button>
  `;
  
  // Bildirimi sayfaya ekle
  document.body.appendChild(toast);
  
  // Bildirimi göster (animasyon için)
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Kapat butonuna tıklandığında bildirimi kapat
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    });
  }
  
  // 4 saniye sonra otomatik kapat
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, 4000);
};

// Ürün kartı oluştur
const createProductCard = (product) => {
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image || 'images/products/placeholder.jpg'}" alt="${product.name}">
      </div>
      <div class="product-content">
        <span class="product-category">${product.category || ''}</span>
        <h3 class="product-title">
          <a href="product-detail.html?id=${product._id}">${product.name}</a>
        </h3>
        <div class="product-price">
          <span class="current-price">₺${product.price.toFixed(2)}</span>
          ${product.oldPrice ? `<span class="old-price">₺${product.oldPrice.toFixed(2)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="add-to-cart" data-id="${product._id}">
            <i class="fas fa-shopping-cart"></i>
            Sepete Ekle
          </button>
          <button class="wishlist-btn" data-id="${product._id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;
};

// Önerilen ürünleri getir
const getRecommendedProducts = async () => {
  try {
    // Demo ürünleri (gerçek API hazır olunca bu kısım değiştirilecek)
    const demoProducts = [
      {
        _id: 'prod1',
        name: 'Creality Ender 3 V3 SE 3D Yazıcı',
        category: '3D Yazıcılar',
        price: 8999.90,
        oldPrice: 10999.90,
        image: 'https://www.evofone.com/UPLOAD/URUNLER/creality-ender-3-v3-se-3d-yazici-1.jpg'
      },
      {
        _id: 'prod2',
        name: 'Raspberry Pi 4 - 4GB',
        category: 'Elektronik Komponentler',
        price: 1899.90,
        image: 'https://www.robotistan.com/raspberry-pi-4-4gb-29066-15-O.jpg'
      },
      {
        _id: 'prod3',
        name: 'Arduino Mega 2560 R3',
        category: 'Elektronik Komponentler',
        price: 799.90,
        oldPrice: 899.90,
        image: 'https://www.robotistan.com/arduino-mega-2560-r3-klon-usb-kablo-dahil-29097-14-O.jpg'
      },
      {
        _id: 'prod4',
        name: 'Akıllı Ev Başlangıç Seti',
        category: 'Akıllı Ev',
        price: 2499.90,
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      }
    ];
    return demoProducts;
    
    // Gerçek API çağrısı (API hazır olduğunda aktif edilecek)
    // const data = await fetchAPI('/products/featured');
    // return data;
  } catch (error) {
    console.error('Önerilen ürünler yüklenirken hata:', error);
    return [];
  }
};

// Önerilen ürünleri göster
const displayRecommendedProducts = async () => {
  const recommendedGrid = document.getElementById('recommended-products');
  if (recommendedGrid) {
    const products = await getRecommendedProducts();
    recommendedGrid.innerHTML = products.map(createProductCard).join('');
    
    // Ürün sepete ekleme butonlarına event listener ekle
    recommendedGrid.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        const product = products.find(p => p._id === productId);
        if (product) {
          cart.addItem(product);
        }
      });
    });
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Sepeti güncelle
  cart.updateUI();
  
  // Önerilen ürünleri göster
  displayRecommendedProducts();
  
  // Bildirim stillerini ekle
  addToastStyles();
});

// Bildirim stilleri
function addToastStyles() {
  // Eğer stil zaten eklendiyse tekrar ekleme
  if (document.getElementById('cart-toast-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'cart-toast-styles';
  style.textContent = `
    .cart-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transform: translateX(120%);
      transition: transform 0.3s ease-out;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .cart-toast.show {
      transform: translateX(0);
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .toast-content i {
      font-size: 20px;
    }
    
    .toast-content p {
      margin: 0;
      font-size: 14px;
      color: #333;
    }
    
    .toast-close {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      margin-left: 10px;
    }
    
    .toast-close:hover {
      color: #333;
    }
    
    .cart-toast.success {
      border-left: 4px solid #28a745;
    }
    
    .cart-toast.success i {
      color: #28a745;
    }
    
    .cart-toast.error {
      border-left: 4px solid #dc3545;
    }
    
    .cart-toast.error i {
      color: #dc3545;
    }
    
    .cart-toast.warning {
      border-left: 4px solid #ffc107;
    }
    
    .cart-toast.warning i {
      color: #ffc107;
    }
    
    .cart-toast.info {
      border-left: 4px solid #17a2b8;
    }
    
    .cart-toast.info i {
      color: #17a2b8;
    }
    
    @media (max-width: 768px) {
      .cart-toast {
        min-width: auto;
        width: calc(100% - 40px);
        max-width: none;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Cart nesnesini global yap
window.cart = cart; 