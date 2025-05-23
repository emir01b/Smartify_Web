// API İşlemleri
async function fetchAPI(endpoint, options = {}) {
    const baseURL = 'http://localhost:3000/api';
    const token = localStorage.getItem('adminToken');
    
    // Token yoksa admin paneline erişim yok, login sayfasına yönlendir
    if (!token) {
        console.error('Token bulunamadı, login sayfasına yönlendiriliyor');
        window.location.href = '/admin/login.html?expired=true';
        throw new Error('Oturum bilgisi bulunamadı');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    // FormData gönderiliyorsa Content-Type header'ı kaldır
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }

    try {
        console.log(`API isteği: ${endpoint}`);
        
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
            console.error('Yetkisiz erişim (401), token geçersiz');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('lastAuthCheck');
            window.location.href = '/admin/login.html?expired=true';
            throw new Error('Oturum süreniz doldu');
        }
        
        // Sunucu hatası
        if (response.status >= 500) {
            console.error(`Sunucu hatası (${response.status})`);
            throw new Error('Sunucu hatası, lütfen daha sonra tekrar deneyin');
        }

        // JSON yanıtını parse et
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('JSON parse hatası:', e);
            throw new Error('Sunucu yanıtı işlenemedi');
        }
        
        if (!response.ok) {
            console.error(`API hatası: ${response.status}`, data);
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

    // 4 saniye sonra toast'u kaldır
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
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

// Admin paneli ortak işlevleri

document.addEventListener('DOMContentLoaded', () => {
    // Admin oturum kontrolü
    checkAdminAuth();
    
    // Logout butonu
    const logoutButton = document.getElementById('adminLogout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login.html';
        });
    }
});

// Admin oturum kontrolü
async function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        console.error('Token bulunamadı');
        window.location.href = '/admin/login.html?expired=true';
        return;
    }
    
    // Son kontrol zamanını kontrol et
    const lastCheck = localStorage.getItem('lastAuthCheck');
    const now = Date.now();
    
    // Eğer son 30 dakika içinde kontrol edildiyse tekrar kontrol etme
    if (lastCheck && (now - parseInt(lastCheck)) < 30 * 60 * 1000) {
        console.log('Son token kontrolü 30 dakikadan yeni, tekrar kontrol edilmiyor.');
        return;
    }
    
    console.log('Token kontrolü yapılıyor...');
    
    // Token'ın geçerliliğini kontrol et
    try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error(`Token kontrol hatası: ${response.status}`);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('lastAuthCheck');
            window.location.href = '/admin/login.html?expired=true';
            return;
        }
        
        const userData = await response.json();
        
        if (!userData || !userData.isAdmin) {
            // Kullanıcı admin değil
            console.error('Kullanıcı admin değil veya geçersiz token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('lastAuthCheck');
            window.location.href = '/admin/login.html?unauthorized=true';
            return;
        }
        
        console.log('Token doğrulandı, kullanıcı:', userData.name);
        
        // Son kontrol zamanını kaydet
        localStorage.setItem('lastAuthCheck', now.toString());
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        // Token doğrulama hatası, kullanıcıyı yönlendir
        localStorage.removeItem('adminToken');
        localStorage.removeItem('lastAuthCheck');
        window.location.href = '/admin/login.html?expired=true';
    }
}

// API isteği gönder - Not: Dosyanın başında zaten bir fetchAPI fonksiyonu tanımlanmış

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

// Tarih formatla
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Para birimi formatla
function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    });
}

// ID kısaltma
function shortenId(id) {
    return id.substring(0, 8) + '...';
}

// Durum rengini belirle
function getStatusClass(status) {
    switch (status) {
        case 'Beklemede':
            return 'pending';
        case 'İşleme Alındı':
            return 'processing';
        case 'Kargoya Verildi':
            return 'shipped';
        case 'Teslim Edildi':
            return 'delivered';
        case 'İptal Edildi':
            return 'canceled';
        default:
            return '';
    }
} 