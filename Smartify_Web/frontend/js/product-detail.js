// Ürün detaylarını getir
const getProductDetails = async (productId) => {
  try {
    const data = await fetchAPI(`/products/${productId}`);
    return data;
  } catch (error) {
    console.error('Ürün detayları yüklenirken hata:', error);
    showToast('Ürün bulunamadı', 'error');
    window.location.href = 'products.html';
  }
};

// Ürün detaylarını göster
const displayProductDetails = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    window.location.href = 'products.html';
    return;
  }
  
  const product = await getProductDetails(productId);
  
  // Başlık ve breadcrumb güncelle
  document.title = `${product.name} - 3D DDD`;
  document.getElementById('product-name').textContent = product.name;
  
  // Ürün bilgilerini güncelle
  const defaultImageUrl = '/images/default-product.png';
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : defaultImageUrl;
  
  document.getElementById('product-image').src = imageUrl;
  document.getElementById('product-image').onerror = function() {
    this.onerror = null;
    this.src = defaultImageUrl;
  };
  
  document.getElementById('product-title').textContent = product.name;
  document.getElementById('product-price').textContent = `₺${product.price.toFixed(2)}`;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-category').textContent = product.category;
  document.getElementById('product-brand').textContent = product.brand;
  document.getElementById('product-stock').textContent = product.countInStock > 0 ? 'Stokta' : 'Stokta Yok';
  
  // Değerlendirme bilgilerini güncelle
  document.getElementById('product-rating').textContent = product.rating.toFixed(1);
  document.getElementById('product-reviews').textContent = `(${product.numReviews} değerlendirme)`;
  document.querySelector('.stars').innerHTML = createStars(product.rating);
  
  // Stok durumuna göre butonları güncelle
  const addToCartBtn = document.getElementById('add-to-cart');
  const quantityInput = document.getElementById('quantity');
  
  if (product.countInStock > 0) {
    addToCartBtn.disabled = false;
    quantityInput.max = Math.min(10, product.countInStock);
  } else {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = 'Stokta Yok';
    quantityInput.disabled = true;
  }
};

// Tab işlemleri
const initTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
};

// Miktar seçici işlemleri
const initQuantitySelector = () => {
  const minusBtn = document.querySelector('.minus-btn');
  const plusBtn = document.querySelector('.plus-btn');
  const quantityInput = document.getElementById('quantity');
  
  minusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  plusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    const maxValue = parseInt(quantityInput.max);
    if (currentValue < maxValue) {
      quantityInput.value = currentValue + 1;
    }
  });
};

// Sepete ekle
const initAddToCart = () => {
  const addToCartBtn = document.getElementById('add-to-cart');
  
  addToCartBtn.addEventListener('click', async () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    const quantity = parseInt(document.getElementById('quantity').value);
    
    try {
      const product = await getProductDetails(productId);
      cart.addItem(product, quantity);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  displayProductDetails();
  initTabs();
  initQuantitySelector();
  initAddToCart();
});