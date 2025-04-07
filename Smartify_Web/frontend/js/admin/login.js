document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

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
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Token'ı localStorage'a kaydet (adminToken olarak değiştirdik)
                localStorage.setItem('adminToken', data.token);
                
                // Başarılı giriş animasyonu
                submitButton.innerHTML = '<i class="fas fa-check"></i> Giriş başarılı!';
                submitButton.style.backgroundColor = 'var(--success-color)';
                
                // Kısa bir gecikme ile yönlendir
                setTimeout(() => {
                    window.location.href = '/admin/products.html';
                }, 1000);
            } else {
                throw new Error(data.message || 'Giriş başarısız');
            }
        } catch (error) {
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

    // Zaten giriş yapılmışsa yönlendir (adminToken olarak değiştirdik)
    const token = localStorage.getItem('adminToken');
    if (token) {
        window.location.href = '/admin/products.html';
    }
}); 