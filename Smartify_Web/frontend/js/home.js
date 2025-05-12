// Ana sayfa için JavaScript

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Popüler ürünleri yükle
    loadPopularProducts();
    // Yeni ürünleri yükle
    loadNewProducts();
});

// Popüler ürünleri yükle
async function loadPopularProducts() {
    try {
        const response = await fetch('/api/products?isPopular=true');
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        
        const products = await response.json();
        displayPopularProducts(products);
    } catch (error) {
        console.error('Popüler ürünler yüklenirken hata:', error);
    }
}

// Yeni ürünleri yükle
async function loadNewProducts() {
    try {
        const response = await fetch('/api/products?isNew=true');
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        
        const products = await response.json();
        displayNewProducts(products);
    } catch (error) {
        console.error('Yeni ürünler yüklenirken hata:', error);
    }
}

// Popüler ürünleri görüntüle
function displayPopularProducts(products) {
    const container = document.getElementById('featuredProductsContainer');
    if (!container) return;

    let html = '';
    const displayProducts = products.slice(0, 4); // Sadece ilk 4 ürünü göster

    displayProducts.forEach(product => {
        // Varsayılan resim yolu
        const defaultImageUrl = '/images/default-product.png';
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : defaultImageUrl;
        
        // Kategori metni
        const categoryText = product.categoryNames ? product.categoryNames.join(' > ') : '';
        
        // Fiyat bilgisi
        const price = product.price || 0;
        const oldPrice = product.oldPrice || null;
            
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name || 'Ürün'}" 
                         onerror="this.onerror=null; this.src='${defaultImageUrl}'; console.error = (function() { return function() {}; })();">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="product-badge badge-new">Yeni Ürün</span>' : ''}
                        ${product.isPopular ? '<span class="product-badge badge-popular">Popüler</span>' : ''}
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-category">${categoryText}</div>
                    <h3 class="product-title">
                        <a href="product-detail.html?id=${product._id}">${product.name || 'İsimsiz Ürün'}</a>
                    </h3>
                    <div class="product-price">
                        <span class="current-price">${price.toLocaleString('tr-TR')} ₺</span>
                        ${oldPrice ? `<span class="old-price">${oldPrice.toLocaleString('tr-TR')} ₺</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product._id}">
                            <i class="fas fa-shopping-cart"></i> Sepete Ekle
                        </button>
                        <button class="wishlist-btn" data-id="${product._id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Sepete ekle butonlarına event listener ekle
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            addToCart(productId);
        });
    });
    
    // Favorilere ekle butonlarına event listener ekle
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            toggleWishlist(productId, e.currentTarget);
        });
    });
}

// Yeni ürünleri görüntüle
function displayNewProducts(products) {
    const container = document.getElementById('newProductsContainer');
    if (!container) return;

    let html = '';
    const displayProducts = products.slice(0, 4); // Sadece ilk 4 ürünü göster

    displayProducts.forEach(product => {
        // Varsayılan resim yolu
        const defaultImageUrl = '/images/default-product.png';
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : defaultImageUrl;
        
        // Kategori metni
        const categoryText = product.categoryNames ? product.categoryNames.join(' > ') : '';
        
        // Fiyat bilgisi
        const price = product.price || 0;
        const oldPrice = product.oldPrice || null;
            
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name || 'Ürün'}" 
                         onerror="this.onerror=null; this.src='${defaultImageUrl}'; console.error = (function() { return function() {}; })();">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="product-badge badge-new">Yeni Ürün</span>' : ''}
                        ${product.isPopular ? '<span class="product-badge badge-popular">Popüler</span>' : ''}
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-category">${categoryText}</div>
                    <h3 class="product-title">
                        <a href="product-detail.html?id=${product._id}">${product.name || 'İsimsiz Ürün'}</a>
                    </h3>
                    <div class="product-price">
                        <span class="current-price">${price.toLocaleString('tr-TR')} ₺</span>
                        ${oldPrice ? `<span class="old-price">${oldPrice.toLocaleString('tr-TR')} ₺</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product._id}">
                            <i class="fas fa-shopping-cart"></i> Sepete Ekle
                        </button>
                        <button class="wishlist-btn" data-id="${product._id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Sepete ekle butonlarına event listener ekle
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            addToCart(productId);
        });
    });
    
    // Favorilere ekle butonlarına event listener ekle
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            toggleWishlist(productId, e.currentTarget);
        });
    });
}

// Sepete ürün ekle
function addToCart(productId) {
    console.log(`Ürün ID: ${productId} sepete ekleniyor...`);
    
    // Ürün bilgilerini al
    fetch(`http://localhost:3000/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ürün bilgileri alınamadı');
            }
            return response.json();
        })
        .then(product => {
            // cart nesnesi varsa onu kullan, yoksa window.cart'ı kontrol et
            if (typeof cart !== 'undefined') {
                cart.addItem(product);
            } else if (typeof window.cart !== 'undefined') {
                window.cart.addItem(product);
            } else {
                // Cart nesnesi bulunamadı, ürünü localStorage'a ekle
                const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Ürünün zaten sepette olup olmadığını kontrol et
                const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
                
                if (existingItemIndex !== -1) {
                    // Ürün zaten sepette, miktarını artır
                    cartItems[existingItemIndex].quantity += 1;
                } else {
                    // Ürünü sepete ekle
                    product.quantity = 1;
                    cartItems.push(product);
                }
                
                // Sepeti güncelle
                localStorage.setItem('cart', JSON.stringify(cartItems));
                
                // Header'ı güncelle
                if (typeof updateHeader === 'function') {
                    updateHeader();
                }
                
                window.showToast(`${product.name} sepete eklendi`, 'success', true);
            }
        })
        .catch(error => {
            console.error('Sepete ekleme hatası:', error);
            window.showToast('Ürün sepete eklenirken bir hata oluştu', 'error');
        });
}

// Favorilere ekle/çıkar
function toggleWishlist(productId, button) {
    const isInWishlist = button.classList.contains('active');
    
    if (isInWishlist) {
        button.classList.remove('active');
        button.querySelector('i').className = 'far fa-heart';
        showNotification('Ürün favorilerden çıkarıldı', 'info');
    } else {
        button.classList.add('active');
        button.querySelector('i').className = 'fas fa-heart';
        showNotification('Ürün favorilere eklendi', 'success');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <p>${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra bildirim kaybolsun
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
} 