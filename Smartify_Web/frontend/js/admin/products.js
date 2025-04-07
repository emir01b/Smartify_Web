// DOM Elements
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const modalClose = document.querySelector('.modal-close');
const productSearch = document.getElementById('productSearch');
const categoryFilter = document.getElementById('categoryFilter');
const productsTableBody = document.getElementById('productsTableBody');
const imagePreview = document.getElementById('imagePreview');
const productImage = document.getElementById('productImage');

// Global Variables
let editingProductId = null;
let products = [];
let categories = {};
let isLoading = true;

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Kullanıcı oturum kontrolü
    checkAdminAuth();
    
    // Kategorileri yükle
    await loadCategories();
    
    // Ürünleri yükle
    await loadProducts();
    
    // Event listener'ları ekle
    setupEventListeners();
});

function setupEventListeners() {
    // Modal events
    addProductBtn.addEventListener('click', () => openModal());
    cancelProductBtn.addEventListener('click', () => closeModal());
    modalClose.addEventListener('click', () => closeModal());
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });

    // Form events
    productForm.addEventListener('submit', handleProductSubmit);
    productImage.addEventListener('change', handleImagePreview);

    // Filter events
    productSearch.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    
    // Escape tuşu ile modalı kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Admin oturum kontrolü
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }
    
    // Çıkış butonuna event listener ekle
    document.getElementById('adminLogout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    });
}

// Kategorileri yükle
async function loadCategories() {
    try {
        showLoading('Kategoriler yükleniyor...');
        
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Kategoriler yüklenemedi');
        
        categories = await response.json();
        
        // Kategori filtresi için seçenekleri oluştur
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="">Tüm Kategoriler</option>';
        
        // Ana kategorileri ekle
        for (const mainCat in categories) {
            const option = document.createElement('option');
            option.value = mainCat;
            option.textContent = categories[mainCat].name;
            categoryFilter.appendChild(option);
        }
        
        // Ürün formundaki kategori seçeneklerini güncelle
        updateProductFormCategories();
    } catch (error) {
        console.error('Kategorileri yükleme hatası:', error);
        showNotification('Kategoriler yüklenirken bir hata oluştu', 'error');
    }
}

// Ürün formundaki kategori seçeneklerini güncelle
function updateProductFormCategories() {
    const mainCategorySelect = document.getElementById('productMainCategory');
    const categorySelect = document.getElementById('productCategory');
    
    if (!mainCategorySelect || !categorySelect) return;
    
    // Ana kategori seçeneklerini ekle
    mainCategorySelect.innerHTML = '<option value="">Ana Kategori Seçin</option>';
    for (const mainCat in categories) {
        const option = document.createElement('option');
        option.value = mainCat;
        option.textContent = categories[mainCat].name;
        mainCategorySelect.appendChild(option);
    }
    
    // Ana kategori değiştiğinde alt kategorileri güncelle
    mainCategorySelect.addEventListener('change', () => {
        const selectedMainCat = mainCategorySelect.value;
        categorySelect.innerHTML = '<option value="">Alt Kategori Seçin</option>';
        
        if (selectedMainCat && categories[selectedMainCat]) {
            const subcategories = categories[selectedMainCat].subcategories;
            for (const subCat in subcategories) {
                const option = document.createElement('option');
                option.value = subCat;
                option.textContent = subcategories[subCat];
                categorySelect.appendChild(option);
            }
        }
    });
}

// Ürünleri yükle
async function loadProducts() {
    try {
        isLoading = true;
        showLoading('Ürünler yükleniyor...');
        
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        
        products = await response.json();
        isLoading = false;
        displayProducts(products);
    } catch (error) {
        console.error('Ürünleri yükleme hatası:', error);
        showNotification('Ürünler yüklenirken bir hata oluştu', 'error');
        isLoading = false;
        displayProducts([]);
    }
}

// Yükleme durumunu göster
function showLoading(message) {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="no-data">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

// Ürünleri görüntüle
function displayProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    
    if (isLoading) {
        return;
    }
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: var(--gray-color); margin-bottom: 1rem;"></i>
                    <p>Henüz ürün bulunmuyor</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const imageUrl = product.images && product.images.length > 0 
            ? product.images[0] 
            : '/images/default-product.png';
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${imageUrl}" alt="${product.name}" class="product-thumbnail" onerror="this.onerror=null; this.src='/images/default-product.png';">
            </td>
            <td>
                <div class="product-name">${product.name}</div>
                <div class="product-id text-muted">ID: ${product._id.substring(0, 8)}...</div>
            </td>
            <td>${product.categoryNames ? product.categoryNames.join(' > ') : ''}</td>
            <td><strong>${product.price.toLocaleString('tr-TR')} ₺</strong></td>
            <td class="text-center">${product.stock}</td>
            <td>
                <span class="status-badge ${product.active ? 'active' : 'inactive'}">
                    ${product.active ? 'Aktif' : 'Pasif'}
                </span>
                ${product.isNew ? '<span class="status-badge new">Yeni</span>' : ''}
                ${product.isPopular ? '<span class="status-badge popular">Popüler</span>' : ''}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" data-id="${product._id}" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" data-id="${product._id}" title="Sil">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Düzenleme butonlarına event listener ekle
    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.id;
            openEditModal(productId);
        });
    });
    
    // Silme butonlarına event listener ekle
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.id;
            confirmDelete(productId);
        });
    });
}

// Ürünleri filtrele
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = [...products];
    
    // Arama filtresi
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Kategori filtresi
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.mainCategory === categoryFilter
        );
    }
    
    displayProducts(filteredProducts);
    
    // Filtreleme sonuçlarını göster
    const resultCount = document.createElement('div');
    resultCount.className = 'filter-results';
    resultCount.textContent = `${filteredProducts.length} ürün bulundu`;
    
    const existingResultCount = document.querySelector('.filter-results');
    if (existingResultCount) {
        existingResultCount.remove();
    }
    
    document.querySelector('.admin-filters').appendChild(resultCount);
}

// Yeni ürün ekleme modalını aç
function openModal(product = null) {
    editingProductId = product?._id || null;
    productForm.reset();
    imagePreview.innerHTML = '';
    
    if (product) {
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Ürün Düzenle';
        fillFormWithProduct(product);
    } else {
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Yeni Ürün Ekle';
    }
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Scroll'u engelle
    
    // İlk input'a odaklan
    setTimeout(() => {
        document.getElementById('productName').focus();
    }, 100);
}

// Ürün düzenleme modalını aç
function openEditModal(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Ürün Düzenle';
    
    // Form alanlarını doldur
    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productIsNew').checked = product.isNew;
    document.getElementById('productIsPopular').checked = product.isPopular;
    document.getElementById('productActive').checked = product.active;
    
    // Özellikler varsa ekle
    if (product.features && Array.isArray(product.features)) {
        document.getElementById('productFeatures').value = product.features.join('\n');
    }
    
    // Ana kategori ve alt kategori seçimini ayarla
    const mainCategorySelect = document.getElementById('productMainCategory');
    const categorySelect = document.getElementById('productCategory');
    
    mainCategorySelect.value = product.mainCategory;
    
    // Ana kategori değişikliğini tetikle
    const event = new Event('change');
    mainCategorySelect.dispatchEvent(event);
    
    // Alt kategoriyi seç
    setTimeout(() => {
        categorySelect.value = product.category;
    }, 100);
    
    // Resim önizleme
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';
    
    if (product.images && product.images.length > 0) {
        product.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.alt = product.name;
            imagePreview.appendChild(img);
        });
    }
    
    // Modalı göster
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Scroll'u engelle
}

// Modalı kapat
function closeModal() {
    productModal.classList.remove('active');
    editingProductId = null;
    productForm.reset();
    imagePreview.innerHTML = '';
    document.body.style.overflow = ''; // Scroll'u geri aç
}

function fillFormWithProduct(product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productIsNew').checked = product.isNew;
    document.getElementById('productActive').checked = product.active;
    
    if (product.image) {
        imagePreview.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
    }
}

// Form Operations
async function handleProductSubmit(e) {
    e.preventDefault();
    
    try {
        // Kaydet butonunu devre dışı bırak
        const submitButton = productForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
        
        // saveProduct fonksiyonunu çağır
        await saveProduct();
        
        // Butonu eski haline getir
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    } catch (error) {
        console.error('Form gönderme hatası:', error);
        showNotification('İşlem sırasında bir hata oluştu', 'error');
        
        // Butonu eski haline getir
        const submitButton = productForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Kaydet';
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
        e.target.value = '';
        return;
    }
    
    // Dosya türü kontrolü
    if (!file.type.match('image.*')) {
        showNotification('Lütfen geçerli bir resim dosyası seçin', 'error');
        e.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        imagePreview.innerHTML = `<img src="${event.target.result}" alt="Önizleme">`;
    };
    reader.readAsDataURL(file);
}

// Ürün kaydet
async function saveProduct() {
    try {
        const productId = document.getElementById('productId').value;
        const isEdit = !!productId;
        
        // Form verilerini al
        const formData = new FormData(document.getElementById('productForm'));
        
        // Ana kategori ve alt kategori bilgilerini ekle
        const mainCategory = formData.get('mainCategory');
        const category = formData.get('category');
        
        if (!mainCategory || !category) {
            showNotification('Lütfen ana kategori ve alt kategori seçin', 'error');
            return;
        }
        
        // Kategori yolunu ve isimlerini ekle
        formData.append('categoryPath', JSON.stringify([mainCategory, category]));
        formData.append('categoryNames', JSON.stringify([
            categories[mainCategory].name,
            categories[mainCategory].subcategories[category]
        ]));
        
        // Boolean değerleri düzelt
        formData.set('isNew', formData.get('isNew') === 'on');
        formData.set('isPopular', formData.get('isPopular') === 'on');
        formData.set('active', formData.get('active') === 'on');
        
        // Özellikleri diziye dönüştür
        const featuresText = formData.get('features');
        if (featuresText) {
            const featuresArray = featuresText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            formData.set('features', JSON.stringify(featuresArray));
        }
        
        // API endpoint ve method
        const url = isEdit ? `/api/products/${productId}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';
        
        // API isteği
        const response = await fetch(url, {
            method,
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ürün kaydedilirken bir hata oluştu');
        }
        
        // Başarılı mesajı göster
        showNotification(`Ürün başarıyla ${isEdit ? 'güncellendi' : 'eklendi'}`, 'success');
        
        // Modalı kapat ve ürünleri yeniden yükle
        closeModal();
        await loadProducts();
    } catch (error) {
        console.error('Ürün kaydetme hatası:', error);
        showNotification(error.message, 'error');
    }
}

// Ürün silme onayı
function confirmDelete(productId) {
    // Ürün bilgilerini al
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    // Onay modalı oluştur
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal confirm-modal active';
    confirmModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle" style="color: var(--danger-color);"></i> Ürün Silme Onayı</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p><strong>${product.name}</strong> ürününü silmek istediğinize emin misiniz?</p>
                <p>Bu işlem geri alınamaz.</p>
                
                <div class="form-actions" style="margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" id="cancelDeleteBtn">İptal</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                        <i class="fas fa-trash-alt"></i> Evet, Sil
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    document.body.style.overflow = 'hidden';
    
    // Event listener'ları ekle
    confirmModal.querySelector('.modal-close').addEventListener('click', () => {
        confirmModal.remove();
        document.body.style.overflow = '';
    });
    
    confirmModal.querySelector('#cancelDeleteBtn').addEventListener('click', () => {
        confirmModal.remove();
        document.body.style.overflow = '';
    });
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.remove();
            document.body.style.overflow = '';
        }
    });
    
    confirmModal.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
        // Silme butonunu devre dışı bırak
        const deleteBtn = confirmModal.querySelector('#confirmDeleteBtn');
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Siliniyor...';
        
        // Ürünü sil
        await deleteProduct(productId);
        
        // Modalı kapat
        confirmModal.remove();
        document.body.style.overflow = '';
    });
}

// Ürün sil
async function deleteProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ürün silinirken bir hata oluştu');
        }
        
        // Başarılı mesajı göster
        showNotification('Ürün başarıyla silindi', 'success');
        
        // Ürünleri yeniden yükle
        await loadProducts();
    } catch (error) {
        console.error('Ürün silme hatası:', error);
        showNotification(error.message, 'error');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    // Önceki bildirimleri kaldır
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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