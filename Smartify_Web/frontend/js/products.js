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
        const isNew = urlParams.get('isNew');
        const isPopular = urlParams.get('isPopular');
        const inStock = urlParams.get('inStock');

        // API endpoint oluştur
        let endpoint = '/api/products?';
        if (category) endpoint += `category=${category}&`;
        if (mainCategory) endpoint += `mainCategory=${mainCategory}&`;
        if (search) endpoint += `search=${search}&`;
        if (sort) endpoint += `sort=${sort}&`;
        if (isNew === 'true') endpoint += `isNew=true&`;
        if (isPopular === 'true') endpoint += `isPopular=true&`;
        if (inStock === 'true') endpoint += `stock_gt=0&`;

        // Aktif filtreleri göster
        displayActiveFilters();

        // Ürünleri getir
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
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

        // Ürünleri görüntüle
        let html = '';
        products.forEach(product => {
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
                            ${product.stock <= 0 ? '<span class="product-badge badge-out">Tükendi</span>' : ''}
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
                            <button class="add-to-cart" data-id="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>
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
        
        productsContainer.innerHTML = html;
        
        // Butonlara event listener ekle
        setupProductButtons();
    } catch (error) {
        console.error('Ürünleri yükleme hatası:', error);
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
    // Arama kutusu
    const searchBox = document.querySelector('#product-search');
    const searchButton = document.querySelector('.search-button');
    
    if (searchBox && searchButton) {
        // URL'den arama sorgusunu al
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            searchBox.value = searchQuery;
        }

        // Arama butonuna tıklandığında
        searchButton.addEventListener('click', () => {
            if (searchBox.value.trim()) {
                updateFilters('search', searchBox.value.trim());
            }
        });
        
        // Enter tuşuna basıldığında
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchBox.value.trim()) {
                updateFilters('search', searchBox.value.trim());
            }
        });
    }
    
    // Kategori balonları
    document.querySelectorAll('.category-pill').forEach(pill => {
        // URL'den aktif kategoriyi kontrol et
        const urlParams = new URLSearchParams(window.location.search);
        const activeCategory = urlParams.get('mainCategory');
        
        if (activeCategory === pill.dataset.category) {
            pill.classList.add('active');
        } else if (activeCategory === null && pill.dataset.category === 'all') {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }

        pill.addEventListener('click', () => {
            // Diğer balonlardan active sınıfını kaldır
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            // Tıklanan balona active sınıfını ekle
            pill.classList.add('active');

            const category = pill.dataset.category;
            if (category === 'all') {
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.delete('mainCategory');
                window.location.href = `products.html?${urlParams.toString()}`;
            } else {
                updateFilters('mainCategory', category);
            }
        });
    });
}

// Aktif filtreleri göster
function displayActiveFilters() {
    const activeFilters = document.getElementById('activeFilters');
    const urlParams = new URLSearchParams(window.location.search);
    let html = '';

    // Ana kategori filtresi
    const mainCategory = urlParams.get('mainCategory');
    if (mainCategory) {
        const categoryName = getCategoryName(mainCategory);
        html += createActiveFilterTag('mainCategory', categoryName);
    }

    // Arama filtresi
    const search = urlParams.get('search');
    if (search) {
        html += createActiveFilterTag('search', `"${search}"`);
    }

    activeFilters.innerHTML = html;

    // Filtre kaldırma butonlarına event listener ekle
    document.querySelectorAll('.active-filter button').forEach(button => {
        button.addEventListener('click', (e) => {
            const filterType = e.currentTarget.dataset.type;
            removeFilter(filterType);
        });
    });
}

// Aktif filtre etiketi oluştur
function createActiveFilterTag(type, text) {
    return `
        <div class="active-filter">
            <span>${text}</span>
            <button type="button" data-type="${type}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// Kategori adını al
function getCategoryName(categoryCode) {
    const categoryMap = {
        'SmartHome': 'Akıllı Ev',
        'Electronics': 'Elektronik',
        'HomeAutomation': 'Ev Otomasyonu',
        // Diğer kategoriler buraya eklenebilir
    };
    return categoryMap[categoryCode] || categoryCode;
}

// Filtre kaldır
function removeFilter(type) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(type);
    window.location.href = `products.html?${urlParams.toString()}`;
}

// Filtreleri güncelle
function updateFilters(key, value) {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (value === null) {
        urlParams.delete(key);
    } else {
        urlParams.set(key, value);
    }
    
    window.location.href = `products.html?${urlParams.toString()}`;
}

// Ürün butonlarına event listener ekle
function setupProductButtons() {
    // Sepete ekle butonları
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            addToCart(productId);
        });
    });
    
    // Favorilere ekle butonları
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
});