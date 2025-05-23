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
  const minusBtn = document.querySelector('.qty-btn.minus');
  const plusBtn = document.querySelector('.qty-btn.plus');
  const quantityInput = document.getElementById('quantity');
  
  if (!minusBtn || !plusBtn || !quantityInput) {
    console.log('Miktar seçici elemanları bulunamadı');
    return;
  }
  
  minusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  plusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    const maxValue = parseInt(quantityInput.max) || 10;
    if (currentValue < maxValue) {
      quantityInput.value = currentValue + 1;
    }
  });
};

// Sepete ekle
const initAddToCart = () => {
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (!addToCartBtn) {
        console.log('Sepete ekle butonu bulunamadı');
        return;
    }
    
    addToCartBtn.addEventListener('click', async () => {
        try {
            const productId = new URLSearchParams(window.location.search).get('id');
            const quantity = parseInt(document.getElementById('quantity')?.value || 1);
            
            // Sepete ekleme işlemi başladığında butonu devre dışı bırak
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ekleniyor...';
            
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Ürün bilgileri alınamadı');
            }
            
            const product = await response.json();
            
            // Sepete ekle
            if (typeof cart !== 'undefined' && cart.addItem) {
                await cart.addItem(product, quantity);
                showNotification('Ürün sepete eklendi', 'success');
            } else {
                // Local storage'a ekle
                const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    image: product.image || product.images?.[0] || '/images/default-product.png'
                });
                localStorage.setItem('cart', JSON.stringify(cartItems));
                showNotification('Ürün sepete eklendi', 'success');
            }
        } catch (error) {
            console.error('Sepete eklerken hata:', error);
            showNotification('Ürün sepete eklenirken bir hata oluştu', 'error');
        } finally {
            // İşlem bittiğinde butonu tekrar aktif et
            if (addToCartBtn) {
                addToCartBtn.disabled = false;
                addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Sepete Ekle';
            }
        }
    });
};

// Ürün detaylarını yükle
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = '/products.html';
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        // Sayfa başlığını güncelle
        document.title = `${product.name} - Smartify`;
        
        // Kategori yolunu oluştur ve göster
        const categoryPath = document.getElementById('categoryPath');
        if (product.categoryPath && product.categoryPath.length > 0) {
            const pathHtml = product.categoryPath.map((category, index) => {
                const isLast = index === product.categoryPath.length - 1;
                if (isLast) {
                    return `<span>${category}</span>`;
                }
                return `<a href="/products.html?category=${encodeURIComponent(category)}">${category}</a>`;
            }).join('<span class="separator">/</span>');
            
            categoryPath.innerHTML = `
                <a href="/products.html">Tüm Ürünler</a>
                <span class="separator">/</span>
                ${pathHtml}
            `;
        }
        
        // Ana başlık ve diğer detayları güncelle
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productPrice').textContent = `${product.price.toFixed(2)} ₺`;
        
        // Stok durumunu güncelle
        const stockStatus = document.getElementById('stockStatus');
        if (product.stock > 0) {
            stockStatus.classList.add('in-stock');
            stockStatus.querySelector('span').textContent = 'Stokta';
            document.getElementById('quantity').max = Math.min(product.stock, 10);
            document.getElementById('addToCartBtn').disabled = false;
        } else {
            stockStatus.classList.add('out-of-stock');
            stockStatus.querySelector('span').textContent = 'Stokta Yok';
            document.getElementById('addToCartBtn').disabled = true;
        }
        
        // Özellikleri listele
        const featuresList = document.getElementById('productFeatures');
        featuresList.innerHTML = '';
        if (product.features && product.features.length > 0) {
            product.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
                featuresList.appendChild(li);
            });
        }
        
        // Teknik özellikleri listele
        const specificationsDiv = document.getElementById('productSpecifications');
        specificationsDiv.innerHTML = '';
        if (product.specifications) {
            const table = document.createElement('table');
            table.className = 'specs-table';
            
            for (const [key, value] of Object.entries(product.specifications)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${key}</td>
                    <td>${value}</td>
                `;
                table.appendChild(row);
            }
            
            specificationsDiv.appendChild(table);
        }
        
        // Resimleri yükle
        const mainImage = document.getElementById('mainImage');
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        
        // Varsayılan resmi ayarla
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
            
            // Küçük resimleri oluştur
            thumbnailContainer.innerHTML = '';
            product.images.forEach((image, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = image;
                thumbnail.alt = `${product.name} Thumbnail ${index + 1}`;
                thumbnail.className = index === 0 ? 'active' : '';
                
                thumbnail.addEventListener('click', () => {
                    // Tüm thumbnail'ların active sınıfını kaldır
                    thumbnailContainer.querySelectorAll('img').forEach(img => img.classList.remove('active'));
                    // Tıklanan thumbnail'a active sınıfı ekle
                    thumbnail.classList.add('active');
                    // Ana resmi güncelle
                    mainImage.src = image;
                });
                
                thumbnailContainer.appendChild(thumbnail);
            });
        } else {
            // Varsayılan resim
            mainImage.src = '/images/default-product.png';
            mainImage.alt = product.name;
        }
        
    } catch (error) {
        console.error('Ürün detayları yüklenirken hata:', error);
        showNotification('Ürün detayları yüklenirken bir hata oluştu', 'error');
        // Hata durumunda ana sayfaya yönlendir
        window.location.href = '/products.html';
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
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

// Benzer ürünleri yükle
async function loadSimilarProducts(categoryId, currentProductId) {
    try {
        console.log('Benzer ürünler yükleniyor:', { categoryId, currentProductId });
        
        // API çağrısını düzelt
        const response = await fetch(`/api/products?category=${categoryId}`);
        if (!response.ok) {
            throw new Error(`API yanıt hatası: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('API yanıtı:', products);
        
        const similarProductsContainer = document.getElementById('similarProducts');
        similarProductsContainer.innerHTML = '';
        
        // Mevcut ürünü filtrele ve 4 ürün al
        const similarProducts = products
            .filter(product => product.id !== currentProductId)
            .slice(0, 4);
        
        if (similarProducts.length === 0) {
            console.log('Ürün bulunamadı');
            similarProductsContainer.innerHTML = '<p class="no-similar">Bu kategoride başka ürün bulunmuyor</p>';
            return;
        }
        
        similarProducts.forEach(product => {
            if (!product) return; // Null kontrolü
            
            const productElement = document.createElement('div');
            productElement.className = 'similar-product-item';
            
            // Resim URL'si kontrolü ve varsayılan değer
            let imageUrl = '/images/default-product.png';
            if (product.image) {
                imageUrl = product.image;
            } else if (product.images && product.images.length > 0) {
                imageUrl = product.images[0];
            }
            
            productElement.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" 
                     onerror="this.src='/images/default-product.png'">
                <h4>${product.name}</h4>
                <span class="price">${formatPrice(product.price)}</span>
            `;
            
            // Ürüne tıklandığında detay sayfasına yönlendir
            productElement.addEventListener('click', () => {
                window.location.href = `/product-detail.html?id=${product.id}`;
            });
            
            similarProductsContainer.appendChild(productElement);
        });
    } catch (error) {
        console.error('Benzer ürünler yüklenirken hata oluştu:', error);
        document.getElementById('similarProducts').innerHTML = 
            '<p class="error-message">Benzer ürünler yüklenirken bir hata oluştu</p>';
    }
}

// Fiyat formatla
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// Favorilere ekle butonu
const initAddToFavorites = () => {
    const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
    
    if (!addToFavoritesBtn) {
        console.log('Favorilere ekle butonu bulunamadı');
        return;
    }
    
    const productId = new URLSearchParams(window.location.search).get('id');
    
    // Kullanıcı giriş yapmış mı ve bu ürün favorilerde mi kontrol et
    checkFavoriteStatus(productId, addToFavoritesBtn);
    
    addToFavoritesBtn.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Eğer kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
            if (!token) {
                window.location.href = `login.html?redirect=product-detail.html?id=${productId}`;
                return;
            }
            
            const isInFavorites = addToFavoritesBtn.classList.contains('active');
            let response;
            
            if (isInFavorites) {
                // Favorilerden çıkar
                response = await fetch(`http://localhost:3000/api/users/favorites/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    addToFavoritesBtn.classList.remove('active');
                    addToFavoritesBtn.querySelector('i').className = 'far fa-heart';
                    addToFavoritesBtn.querySelector('i').nextSibling.textContent = ' Favorilere Ekle';
                    showNotification('Ürün favorilerden çıkarıldı', 'info');
                }
            } else {
                // Favorilere ekle
                response = await fetch(`http://localhost:3000/api/users/favorites/${productId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    addToFavoritesBtn.classList.add('active');
                    addToFavoritesBtn.querySelector('i').className = 'fas fa-heart';
                    addToFavoritesBtn.querySelector('i').nextSibling.textContent = ' Favorilerden Çıkar';
                    showNotification('Ürün favorilere eklendi', 'success');
                }
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'İşlem sırasında bir hata oluştu');
            }
        } catch (error) {
            console.error('Favorilere ekleme hatası:', error);
            showNotification(error.message || 'İşlem sırasında bir hata oluştu', 'error');
        }
    });
};

// Ürünün favori durumunu kontrol et
const checkFavoriteStatus = async (productId, button) => {
    try {
        const token = localStorage.getItem('token');
        
        // Kullanıcı giriş yapmamışsa favori durumunu kontrol etmeye gerek yok
        if (!token) {
            return;
        }
        
        // Favorileri getir
        const response = await fetch('http://localhost:3000/api/users/favorites', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Favori durumu kontrol edilemedi');
        }
        
        const favorites = await response.json();
        
        // Bu ürün favorilerde mi kontrol et
        const isInFavorites = favorites.some(fav => fav._id === productId);
        
        if (isInFavorites) {
            button.classList.add('active');
            button.querySelector('i').className = 'fas fa-heart';
            button.querySelector('i').nextSibling.textContent = ' Favorilerden Çıkar';
        }
    } catch (error) {
        console.error('Favori durumu kontrol hatası:', error);
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            window.location.href = '/products.html';
            return;
        }
        
        // Önce ürün detaylarını yükle
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
            throw new Error('Ürün detayları yüklenemedi');
        }
        
        const product = await productResponse.json();
        console.log('Ürün detayları:', product);
        
        // Ürün detaylarını göster
        await loadProductDetails();
        
        // Benzer ürünleri yükle (eğer kategori ID'si varsa)
        if (product.categoryId || product.category) {
            await loadSimilarProducts(product.categoryId || product.category, productId);
        }
        
        // Diğer başlangıç işlemleri
        initQuantitySelector();
        initAddToCart();
        initAddToFavorites();
        
    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        showNotification('Ürün detayları yüklenirken bir hata oluştu', 'error');
    }
});