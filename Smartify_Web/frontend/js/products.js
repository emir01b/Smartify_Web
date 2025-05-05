// Ürünleri görüntüle
async function displayProducts() {
    const productsContainer = document.getElementById('productsContainer');
    
    try {
        // URL'den parametreleri al
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const mainCategory = urlParams.get('mainCategory');
        const search = urlParams.get('search');
        const sort = urlParams.get('sort') || 'newest';

        // API endpoint oluştur
        let endpoint = 'http://localhost:3000/api/products?';
        if (category) endpoint += `category=${category}&`;
        if (mainCategory) endpoint += `mainCategory=${mainCategory}&`;
        if (search) endpoint += `search=${search}&`;
        if (sort) endpoint += `sort=${sort}`;

        // Ürünleri getir
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        
        const products = await response.json();
        
        // Ürün yoksa mesaj göster
        if (!products || products.length === 0) {
            productsContainer.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
                </div>
            `;
            return;
        }

        // Ürünleri listele
        productsContainer.innerHTML = products.map(product => {
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
            
            // Kategori adını Türkçeleştir
            let turkishCategory = categoryText;
            
            // İngilizce kategori adlarını Türkçe karşılıklarıyla değiştir
            if (turkishCategory === 'Electronics') turkishCategory = 'Elektronik';
            if (turkishCategory === 'SmartHome') turkishCategory = 'Akıllı Ev';
            if (turkishCategory === 'HomeAutomation') turkishCategory = 'Ev Otomasyonu';
            if (turkishCategory === 'General') turkishCategory = 'Genel';
            if (turkishCategory === 'Accessories') turkishCategory = 'Aksesuarlar';
            if (turkishCategory === 'Components') turkishCategory = 'Komponentler';
            if (turkishCategory === 'Sensors') turkishCategory = 'Sensörler';
            if (turkishCategory === 'Displays') turkishCategory = 'Ekranlar';
            if (turkishCategory === 'Printers') turkishCategory = '3D Yazıcılar';
            if (turkishCategory === 'Spare Parts') turkishCategory = 'Yedek Parçalar';
            
            // Fiyat bilgisini kontrol et
            const price = product.price || 0;
            const oldPrice = product.oldPrice || null;
                
            return `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${imageUrl}" alt="${product.name || 'Ürün'}" 
                             onerror="this.onerror=null; this.src='${defaultImageUrl}'; console.error = (function() { return function() {}; })();">
                        <div class="product-badges">
                            ${product.isNew ? '<span class="product-badge badge-new">Yeni</span>' : ''}
                            ${product.isPopular ? '<span class="product-badge badge-popular">Popüler</span>' : ''}
                            ${product.inStock === false ? '<span class="product-badge badge-out">Tükendi</span>' : ''}
                        </div>
                    </div>
                    <div class="product-content">
                        <div class="product-category">${turkishCategory}</div>
                        <h3 class="product-title">
                            <a href="product-detail.html?id=${product._id}">${product.name || 'İsimsiz Ürün'}</a>
                        </h3>
                        <div class="product-price">
                            <span class="current-price">${price.toLocaleString('tr-TR')} ₺</span>
                            ${oldPrice ? `<span class="old-price">${oldPrice.toLocaleString('tr-TR')} ₺</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart" data-id="${product._id}" ${product.inStock === false ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Sepete Ekle
                            </button>
                            <button class="wishlist-btn" data-id="${product._id}">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

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

    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        productsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
    }
}

// Filtre ayarları
function setupFilters() {
    // Filtre butonlarına event listener ekle
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            if (category === 'all') {
                window.location.href = 'products.html';
            } else {
                window.location.href = `products.html?mainCategory=${category}`;
            }
        });
    });
    
    // Arama kutusuna event listener ekle
    const searchBox = document.querySelector('#product-search');
    const searchIcon = document.querySelector('.search-box i');
    
    if (searchBox && searchIcon) {
        // Arama ikonuna tıklandığında
        searchIcon.addEventListener('click', () => {
            if (searchBox.value.trim()) {
                window.location.href = `products.html?search=${encodeURIComponent(searchBox.value.trim())}`;
            }
        });
        
        // Enter tuşuna basıldığında
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (searchBox.value.trim()) {
                    window.location.href = `products.html?search=${encodeURIComponent(searchBox.value.trim())}`;
                }
            }
        });
    }
    
    // Sıralama seçeneğine event listener ekle
    const sortSelect = document.querySelector('.sort-options select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('sort', sortSelect.value);
            window.location.href = `products.html?${urlParams.toString()}`;
        });
    }
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
        window.showToast('Ürün favorilerden çıkarıldı', 'info');
    } else {
        button.classList.add('active');
        button.querySelector('i').className = 'fas fa-heart';
        window.showToast('Ürün favorilere eklendi', 'success');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <p>${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    // Bildirim göster
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3 saniye sonra bildirim kaybolsun
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Ürünleri yükle
    displayProducts();
    
    // Filtre ayarlarını kur
    setupFilters();
    
    // URL'den arama sorgusunu al ve arama kutusuna yerleştir
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        const searchInput = document.querySelector('#product-search');
        if (searchInput) {
            searchInput.value = searchQuery;
        }
    }
});