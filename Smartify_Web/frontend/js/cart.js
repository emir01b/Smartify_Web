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
            <img src="${item.image || item.images?.[0] || 'images/products/placeholder.jpg'}" alt="${item.name}" onerror="this.src='images/products/placeholder.jpg';">
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
    
    // Sepet güncellendiğinde önerilen ürünleri yeniden yükle
    displayRecommendedProducts();
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
        <img src="${product.image || product.images?.[0] || 'images/products/placeholder.jpg'}" alt="${product.name}" onerror="this.src='images/products/placeholder.jpg';">
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
    // Sepetteki ürünlerin kategorilerini al
    const cartCategories = [...new Set(cart.items.map(item => item.category).filter(Boolean))];
    
    if (cartCategories.length === 0) {
      // Sepette kategori bilgisi olan ürün yoksa populer ürünleri göster
      const response = await fetch('/api/products?isPopular=true&limit=8');
      if (!response.ok) throw new Error('Ürünler yüklenemedi');
      const data = await response.json();
      return data.products || data;
    }
    
    // Sepetteki ürün kategorilerine göre ürün önerileri al
    // Her kategoriden belirli sayıda ürün getir
    const productsPromises = cartCategories.map(category => 
      fetch(`/api/products?category=${category}&limit=4`)
        .then(response => response.ok ? response.json() : [])
        .then(data => data.products || data)
    );
    
    const categoryProducts = await Promise.all(productsPromises);
    
    // Tüm kategori ürünlerini birleştir
    let allRecommendedProducts = categoryProducts.flat();
    
    // Sepette olmayan ürünleri filtrele
    const cartProductIds = cart.items.map(item => item._id);
    allRecommendedProducts = allRecommendedProducts.filter(product => !cartProductIds.includes(product._id));
    
    // En fazla 12 ürün göster
    return allRecommendedProducts.slice(0, 12);
    
  } catch (error) {
    console.error('Önerilen ürünler yüklenirken hata:', error);
    
    // Hata durumunda demo ürünleri göster
    return [];
  }
};

// Önerilen ürünleri göster
const displayRecommendedProducts = async () => {
  const recommendedGrid = document.getElementById('recommended-products');
  if (recommendedGrid) {
    // Yükleniyor göstergesini ekle
    recommendedGrid.innerHTML = `<div class="loading-spinner"></div>`;
    
    const products = await getRecommendedProducts();
    
    if (products.length === 0) {
      recommendedGrid.innerHTML = `<p>Bu kategorilerde önerilebilecek başka ürün bulunamadı.</p>`;
      return;
    }
    
    // Slider container oluştur
    const sliderHTML = `
      <div class="product-slider">
        <button class="slider-nav prev-btn"><i class="fas fa-chevron-left"></i></button>
        <div class="slider-container">
          ${products.map(createProductCard).join('')}
        </div>
        <button class="slider-nav next-btn"><i class="fas fa-chevron-right"></i></button>
      </div>
    `;
    
    recommendedGrid.innerHTML = sliderHTML;
    
    // Slider işlevselliğini ekle
    initProductSlider();
    
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

// Slider işlevselliği
function initProductSlider() {
  const sliderContainer = document.querySelector('.slider-container');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (!sliderContainer || !prevBtn || !nextBtn) return;
  
  // Kaydırma miktarı (kart genişliği + margin)
  const cardWidth = 280;
  let position = 0;
  const maxPosition = sliderContainer.scrollWidth - sliderContainer.clientWidth;
  
  // İlk yüklenmede prev butonunu devre dışı bırak
  prevBtn.classList.add('disabled');
  
  // İleri butonu
  nextBtn.addEventListener('click', () => {
    position = Math.min(position + cardWidth, maxPosition);
    sliderContainer.scrollTo({
      left: position,
      behavior: 'smooth'
    });
    updateButtonStates();
  });
  
  // Geri butonu
  prevBtn.addEventListener('click', () => {
    position = Math.max(position - cardWidth, 0);
    sliderContainer.scrollTo({
      left: position,
      behavior: 'smooth'
    });
    updateButtonStates();
  });
  
  // Buton durumlarını güncelle
  function updateButtonStates() {
    prevBtn.classList.toggle('disabled', position <= 0);
    nextBtn.classList.toggle('disabled', position >= maxPosition);
  }
  
  // Kaydırma event'i
  sliderContainer.addEventListener('scroll', () => {
    position = sliderContainer.scrollLeft;
    updateButtonStates();
  });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Sepeti güncelle
  cart.updateUI();
  
  // Bildirim stillerini ekle
  addToastStyles();
  
  // Slider stillerini ekle
  addSliderStyles();
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

// Slider stilleri
function addSliderStyles() {
  // Eğer stil zaten eklendiyse tekrar ekleme
  if (document.getElementById('product-slider-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'product-slider-styles';
  style.textContent = `
    .product-slider {
      position: relative;
      width: 100%;
      margin: 0 auto;
      padding: 0 25px;
    }
    
    .slider-container {
      display: flex;
      gap: 1.5rem;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;  /* Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
      padding: 10px 0;
    }
    
    .slider-container::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
    
    .product-card {
      min-width: 280px;
      max-width: 280px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      height: 100%;
      margin-bottom: 5px;
    }
    
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    
    .product-image {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .product-card:hover .product-image img {
      transform: scale(1.05);
    }
    
    .product-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    
    .product-category {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }
    
    .product-title {
      font-size: 1rem;
      font-weight: 500;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }
    
    .product-title a {
      color: var(--text-color);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 2.8rem;
    }
    
    .product-price {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .current-price {
      font-weight: 600;
      font-size: 1.125rem;
      color: var(--primary-color);
    }
    
    .old-price {
      font-size: 0.875rem;
      color: #999;
      text-decoration: line-through;
    }
    
    .product-actions {
      margin-top: auto;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.5rem;
      padding-top: 0.5rem;
    }
    
    .add-to-cart {
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background-color 0.2s;
    }
    
    .add-to-cart:hover {
      background-color: var(--secondary-color);
    }
    
    .wishlist-btn {
      background-color: #f0f0f0;
      color: #666;
      border: none;
      border-radius: 4px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .wishlist-btn:hover {
      background-color: #ffeded;
      color: #ff5252;
    }
    
    .slider-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: white;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 1;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .slider-nav.prev-btn {
      left: 0;
    }
    
    .slider-nav.next-btn {
      right: 0;
    }
    
    .slider-nav:hover {
      background-color: var(--primary-color);
      color: white;
    }
    
    .slider-nav.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease infinite;
      margin: 30px auto;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 992px) {
      .recommended-section {
        overflow: hidden;
      }
    }
    
    @media (max-width: 768px) {
      .slider-nav {
        width: 35px;
        height: 35px;
      }
      
      .product-slider {
        padding: 0 20px;
      }
    }
    
    @media (max-width: 576px) {
      .product-slider {
        padding: 0 15px;
      }
      
      .slider-nav.prev-btn {
        left: -5px;
      }
      
      .slider-nav.next-btn {
        right: -5px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Cart nesnesini global yap
window.cart = cart; 