// API İşlemleri
async function fetchAPI(endpoint, options = {}) {
    const baseURL = 'http://localhost:3000/api';
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            // Token'ı localStorage'dan al
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    };

    // FormData gönderiliyorsa Content-Type header'ı kaldır
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }

    try {
        const response = await fetch(`${baseURL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        // Token geçersizse login sayfasına yönlendir
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login.html';
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Bir hata oluştu');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Toast Bildirimleri
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.querySelector('.toast-container') || createToastContainer();
    container.appendChild(toast);

    // 3 saniye sonra toast'u kaldır
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Yetkilendirme Kontrolleri
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

// Sayfa Yüklendiğinde Yetkilendirme Kontrolü
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Mobil menü toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (menuToggle && adminSidebar) {
        menuToggle.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');
        });
    }

    // Çıkış yap butonu
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login.html';
        });
    }
});

// Form Yardımcıları
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Bu alan zorunludur');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });

    return isValid;
}

function showFieldError(field, message) {
    const errorDiv = field.nextElementSibling?.classList.contains('field-error') 
        ? field.nextElementSibling 
        : createErrorDiv();
    
    errorDiv.textContent = message;
    if (!field.nextElementSibling?.classList.contains('field-error')) {
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    field.classList.add('error');
}

function clearFieldError(field) {
    const errorDiv = field.nextElementSibling;
    if (errorDiv?.classList.contains('field-error')) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

function createErrorDiv() {
    const div = document.createElement('div');
    div.className = 'field-error';
    return div;
}

// Yardımcı Fonksiyonlar
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
}

// Dosya Yükleme Yardımcıları
function validateImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Sadece JPEG, PNG ve WEBP formatları desteklenmektedir');
    }

    if (file.size > maxSize) {
        throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır');
    }

    return true;
}

async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Maksimum boyutlar
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                
                let width = img.width;
                let height = img.height;
                
                // En-boy oranını koru
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(blob => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', 0.8);
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
} 