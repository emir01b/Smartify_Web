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
    showToast('Ürün sepete eklendi');
  },
  
  // Sepetten ürün çıkar
  removeItem(productId) {
    this.items = this.items.filter(item => item._id !== productId);
    this.saveCart();
    this.updateUI();
    showToast('Ürün sepetten çıkarıldı');
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
    updateHeader(); // Header'daki sepet sayısını güncelle
  },
  
  // Sepet arayüzünü güncelle
  updateUI() {
    const cartContainer = document.getElementById('cart-container');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const cartItems = document.getElementById('cart-items');
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const discount = document.getElementById('discount');
    const total = document.getElementById('total');
    const discountRow = document.getElementById('discount-row');
    
    if (this.items.length === 0) {
      emptyCart.style.display = 'block';
      cartContent.style.display = 'none';
      return;
    }
    
    emptyCart.style.display = 'none';
    cartContent.style.display = 'block';
    
    // Sepet ürünlerini listele
    cartItems.innerHTML = this.items.map(item => `
      <tr>
        <td>
          <div class="cart-product">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <h4>${item.name}</h4>
              <p class="text-sm text-gray-500">${item.category}</p>
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
          <button class="remove-btn" data-id="${item._id}">
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
    subtotal.textContent = `₺${subtotalAmount.toFixed(2)}`;
    shipping.textContent = shippingAmount === 0 ? 'Ücretsiz' : `₺${shippingAmount.toFixed(2)}`;
    
    if (discountAmount > 0) {
      discount.textContent = `-₺${discountAmount.toFixed(2)}`;
      discountRow.style.display = 'flex';
    } else {
      discountRow.style.display = 'none';
    }
    
    total.textContent = `₺${totalAmount.toFixed(2)}`;
    
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
    // Ürün silme
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        this.removeItem(productId);
      });
    });
    
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
        const code = couponInput.value.trim();
        
        if (code === 'ILKALIS') {
          localStorage.setItem('couponCode', code);
          this.updateUI();
          showToast('Kupon kodu uygulandı');
        } else {
          showToast('Geçersiz kupon kodu', 'error');
        }
      });
    }
  }
};

// Önerilen ürünleri getir
const getRecommendedProducts = async () => {
  try {
    const data = await fetchAPI('/products/featured');
    return data;
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
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  cart.updateUI();
  displayRecommendedProducts();
}); 