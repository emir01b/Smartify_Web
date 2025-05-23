document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    
    // Önce localStorage'ı temizle (geçersiz tokenlar için)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('expired') || urlParams.has('unauthorized') || urlParams.has('error')) {
        console.log('Hata parametresi algılandı, localStorage temizleniyor');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('lastAuthCheck');
    }
    
    // URL parametrelerini kontrol et
    if (urlParams.has('expired')) {
        errorMessage.textContent = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
        errorMessage.style.display = 'block';
    } else if (urlParams.has('unauthorized')) {
        errorMessage.textContent = 'Bu sayfaya erişim yetkiniz yok.';
        errorMessage.style.display = 'block';
    } else if (urlParams.has('error')) {
        errorMessage.textContent = 'Bir hata oluştu. Lütfen tekrar giriş yapın.';
        errorMessage.style.display = 'block';
    }

    // Şifre göster/gizle
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.querySelector('i').className = 
                `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
        });
    }

    // Giriş formu gönderimi
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Giriş butonunu devre dışı bırak
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
        
        try {
            // Önce localStorage'ı temizle
            localStorage.removeItem('adminToken');
            localStorage.removeItem('lastAuthCheck');
            
            console.log('Login isteği gönderiliyor:', email);
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('JSON parse hatası:', parseError);
                throw new Error('Sunucu yanıtı işlenemedi');
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Giriş başarısız');
            }
            
            if (!data.token) {
                console.error('Token bulunamadı!', data);
                throw new Error('Token alınamadı, lütfen tekrar deneyin');
            }
            
            console.log('Login başarılı, token alındı');
            
            // Token'ı localStorage'a kaydet
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('lastAuthCheck', Date.now().toString());
            
            // Kullanıcı admin mi kontrol et
            if (!data.user || !data.user.isAdmin) {
                throw new Error('Admin yetkiniz bulunmuyor');
            }
            
            // Başarılı giriş animasyonu
            submitButton.innerHTML = '<i class="fas fa-check"></i> Giriş başarılı!';
            submitButton.style.backgroundColor = 'var(--success-color)';
            
            // Kısa bir gecikme ile yönlendir
            setTimeout(() => {
                window.location.href = '/admin/products.html';
            }, 1000);
        } catch (error) {
            // Hata durumunda localStorage'ı temizle
            localStorage.removeItem('adminToken');
            localStorage.removeItem('lastAuthCheck');
            
            console.error('Login hatası:', error);
            
            // Hata mesajını göster
            errorMessage.textContent = error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
            errorMessage.style.display = 'block';
            
            // Butonu eski haline getir
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // Input alanlarını kırmızı yap
            document.getElementById('email').style.borderColor = 'var(--danger-color)';
            document.getElementById('password').style.borderColor = 'var(--danger-color)';
            
            // 3 saniye sonra hata stillerini kaldır
            setTimeout(() => {
                errorMessage.style.display = 'none';
                document.getElementById('email').style.borderColor = '';
                document.getElementById('password').style.borderColor = '';
            }, 3000);
        }
    });

    // Zaten token varsa geçerliliğini kontrol et
    const token = localStorage.getItem('adminToken');
    if (token) {
        console.log('Mevcut token bulundu, geçerliliği kontrol ediliyor...');
        
        // Token doğrudan test et
        fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                // Token geçersiz, temizle
                console.log('Token geçersiz, temizleniyor');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('lastAuthCheck');
                throw new Error('Invalid token');
            }
        })
        .then(data => {
            if (data && data.isAdmin) {
                console.log('Token geçerli, admin sayfasına yönlendiriliyor');
                window.location.href = '/admin/products.html';
            } else {
                console.log('Admin yetkisi yok');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('lastAuthCheck');
                errorMessage.textContent = 'Admin yetkiniz bulunmuyor.';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Token kontrol hatası:', error);
            // Hata işleme ile ilgilenmiyoruz, kullanıcı zaten login sayfasında
        });
    }
}); 