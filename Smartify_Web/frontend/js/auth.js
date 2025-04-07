// Form değiştirme işlemleri
const initAuthTabs = () => {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      // Tab'ları güncelle
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Formları güncelle
      forms.forEach(form => {
        form.classList.remove('active');
        if (form.id === `${target}-form`) {
          form.classList.add('active');
        }
      });
    });
  });
};

// Giriş işlemi
const login = async (email, password) => {
  try {
    const data = await fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setToken(data.token);
    setCurrentUser(data);
    
    showToast('Başarıyla giriş yapıldı');
    window.location.href = 'index.html';
  } catch (error) {
    showToast(error.message, 'error');
  }
};

// Kayıt işlemi
const register = async (name, email, password) => {
  try {
    const data = await fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    setToken(data.token);
    setCurrentUser(data);
    
    showToast('Hesabınız başarıyla oluşturuldu');
    window.location.href = 'index.html';
  } catch (error) {
    showToast(error.message, 'error');
  }
};

// Form gönderme işlemleri
const initAuthForms = () => {
  const loginForm = document.getElementById('login');
  const registerForm = document.getElementById('register');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      await login(email, password);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      if (password !== confirmPassword) {
        showToast('Şifreler eşleşmiyor', 'error');
        return;
      }
      
      await register(name, email, password);
    });
  }
};

// Sosyal medya ile giriş
const initSocialLogin = () => {
  const googleButtons = document.querySelectorAll('.social-btn.google');
  const facebookButtons = document.querySelectorAll('.social-btn.facebook');

  googleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Google ile giriş işlemleri
      showToast('Google ile giriş yakında aktif olacak', 'warning');
    });
  });

  facebookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Facebook ile giriş işlemleri
      showToast('Facebook ile giriş yakında aktif olacak', 'warning');
    });
  });
};

// Şifremi unuttum işlemi
const initForgotPassword = () => {
  const forgotPasswordLink = document.querySelector('.forgot-password');
  
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Şifremi unuttum modalını göster
      showToast('Şifre sıfırlama yakında aktif olacak', 'warning');
    });
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  initAuthTabs();
  initAuthForms();
  initSocialLogin();
  initForgotPassword();
}); 