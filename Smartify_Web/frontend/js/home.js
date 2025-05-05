// Ana sayfa için JavaScript

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Popüler ürünleri yükle
    loadPopularProducts();
});

// Popüler ürünleri yükle
async function loadPopularProducts() {
    try {
        console.log('Popüler ürünler yükleniyor...');
        const response = await fetch('/api/products?isPopular=true');
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        
        const products = await response.json();
        console.log('Yüklenen popüler ürünler:', products);
        displayPopularProducts(products);
    } catch (error) {
        console.error('Popüler ürünleri yükleme hatası:', error);
        document.getElementById('featuredProductsContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                <p>Hata detayı: ${error.message}</p>
            </div>
        `;
    }
}

// Popüler ürünleri görüntüle
function displayPopularProducts(products) {
    const container = document.getElementById('featuredProductsContainer');
    
    if (!container) {
        console.error('featuredProductsContainer elementi bulunamadı');
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <p>Henüz popüler ürün bulunmuyor.</p>
            </div>
        `;
        return;
    }
    
    // En fazla 4 ürün göster
    const displayProducts = products.slice(0, 4);
    
    let html = '';
    
    displayProducts.forEach(product => {
        // Varsayılan resim yolu
        const defaultImageUrl = '/images/default-product.png';
        
        // Resim URL'sini kontrol et - Eğer resim URL'si yoksa veya geçersizse varsayılan resmi kullan
        let imageUrl = defaultImageUrl;
        if (product.images && product.images.length > 0) {
            // Resim URL'sini kontrol et, eğer URL bir HTTP URL'si değilse, varsayılan resmi kullan
            if (product.images[0].startsWith('http') || product.images[0].startsWith('/')) {
                imageUrl = product.images[0];
            }
        }
            
        // Kategori bilgisini kontrol et
        const categoryText = product.categoryNames && product.categoryNames.length > 0 
            ? product.categoryNames.join(' > ') 
            : (product.category || 'Genel');
        
        // Fiyat bilgisini kontrol et
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