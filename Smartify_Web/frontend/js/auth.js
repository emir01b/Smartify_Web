// API URL kontrolü - window'dan veya doğrudan tanımlama
let BASE_URL;

// window.API_URL varsa onu kullan, yoksa varsayılan değeri kullan
if (typeof window.API_URL !== 'undefined') {
  // window.API_URL'i kullan
  BASE_URL = window.API_URL.replace('/api', ''); // "/api" son ekini kaldır
  console.log('Base URL ayarlandı:', BASE_URL);
} else {
  // Varsayılan Base URL
  BASE_URL = 'http://localhost:3000';
  console.warn('window.API_URL bulunamadı, varsayılan değer kullanılıyor:', BASE_URL);
}

// Token ve kullanıcı saklama işlemleri - window nesnesi üzerinden çalıştırma
const setTokenFunc = (token) => {
  console.log('Token kaydediliyor:', token);  // Debug için eklendi
  
  // window.setToken fonksiyonu varsa onu kullan, yoksa doğrudan localStorage'a kaydet
  if (typeof window.setToken === 'function') {
    window.setToken(token);
  } else {
    console.warn('window.setToken bulunamadı, doğrudan localStorage kullanılıyor');
    localStorage.setItem('token', token);
  }
};

const setCurrentUserFunc = (user) => {
  console.log('Kullanıcı kaydediliyor:', user);  // Debug için eklendi
  
  // window.setCurrentUser fonksiyonu varsa onu kullan, yoksa doğrudan localStorage'a kaydet
  if (typeof window.setCurrentUser === 'function') {
    window.setCurrentUser(user);
  } else {
    console.warn('window.setCurrentUser bulunamadı, doğrudan localStorage kullanılıyor');
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Form değiştirme işlemleri
const initAuthTabs = () => {
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const verificationForm = document.getElementById('verification-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Aktif tab'ı güncelle
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Formları güncelle
      const tabType = tab.getAttribute('data-tab');
      if (tabType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        if (verificationForm) verificationForm.classList.remove('active');
      } else if (tabType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        if (verificationForm) verificationForm.classList.remove('active');
      } else if (tabType === 'verify') {
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        if (verificationForm) verificationForm.classList.add('active');
      }
    });
  });
};

// Şifre göster/gizle
const initPasswordToggles = () => {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const passwordField = toggle.parentElement.querySelector('input');
      const icon = toggle.querySelector('i');
      
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
};

// Doğrulama modal penceresini göster
const showVerificationModal = (name, email, password, userId = null) => {
  const modal = document.getElementById('verification-modal');
  
  // Modal görünür hale gelsin
  modal.classList.add('active');
  
  // İlk input'a odaklan
  setTimeout(() => {
    const firstInput = modal.querySelector('.verification-code-input input:first-child');
    if (firstInput) firstInput.focus();
  }, 300);
  
  // Geçici bilgileri hidden input'larda sakla
  document.getElementById('temp-name').value = name;
  document.getElementById('temp-email').value = email;
  document.getElementById('temp-password').value = password;
  
  // UserId varsa sakla
  if (userId) {
    document.getElementById('modal-user-id').value = userId;
  }
};

// Modal'ı kapat
const closeVerificationModal = () => {
  document.getElementById('verification-modal').classList.remove('active');
  
  // Kod inputlarını temizle
  const inputs = document.querySelectorAll('.verification-code-input input');
  inputs.forEach(input => {
    input.value = '';
  });
};

// Doğrulama kodu inputlarını başlat
const initVerificationCodeInputs = () => {
  const inputs = document.querySelectorAll('.verification-code-input input');
  
  inputs.forEach((input, index) => {
    // Her bir input için event listeners
    input.addEventListener('keydown', (e) => {
      // Backspace tuşu ile önceki input'a git
      if (e.key === 'Backspace') {
        if (index > 0 && input.value === '') {
          inputs[index - 1].focus();
        }
      }
    });
    
    input.addEventListener('input', (e) => {
      // Yalnızca sayı girişini kabul et
      const value = e.target.value;
      if (!/^[0-9]$/.test(value)) {
        input.value = '';
        return;
      }
      
      // Sonraki input'a git
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      
      // Yapıştırılan metinden yalnızca sayıları al
      const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, inputs.length);
      
      // Her bir input'a yerleştir
      for (let i = 0; i < pasteData.length; i++) {
        inputs[i].value = pasteData[i];
        if (i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
      }
    });
  });
};

// Modal form submit
const initModalVerificationForm = () => {
  const form = document.getElementById('modal-verification-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const inputs = document.querySelectorAll('.verification-code-input input');
    let code = '';
    inputs.forEach(input => {
      code += input.value;
    });
    
    if (code.length !== 6) {
      showToast('Lütfen 6 haneli doğrulama kodunu girin', 'error');
      return;
    }
    
    const userId = document.getElementById('modal-user-id').value;
    const name = document.getElementById('temp-name').value;
    const email = document.getElementById('temp-email').value;
    const password = document.getElementById('temp-password').value;
    
    if (userId) {
      // Kullanıcı zaten kaydedilmiş, sadece doğrulama yapılacak
      await verifyEmail(userId, code);
    } else {
      // Kullanıcı henüz kaydedilmemiş, önce kaydet sonra doğrula
      await register(name, email, password, code);
    }
  });
  
  // Modal iptal tuşu
  document.getElementById('modal-cancel').addEventListener('click', () => {
    closeVerificationModal();
  });
  
  // Modal kod tekrar gönder tuşu
  document.getElementById('modal-resend-code').addEventListener('click', async () => {
    const userId = document.getElementById('modal-user-id').value;
    const email = document.getElementById('temp-email').value;
    const name = document.getElementById('temp-name').value;
    const password = document.getElementById('temp-password').value;
    
    if (userId) {
      // Kullanıcı zaten kaydedilmiş, tekrar kod gönder
      await resendVerificationCode(userId);
    } else {
      // Kullanıcı henüz kaydedilmemiş, pre-register yap
      await preRegister(name, email, password);
    }
  });
};

// E-posta ve doğrulama kodu almak için ön kayıt
const preRegister = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/pre-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    // Yanıt boş mu kontrol et
    const text = await response.text();
    if (!text) {
      throw new Error('Sunucudan boş yanıt alındı');
    }
    
    let data;
    try {
      // Yanıt JSON formatında mı kontrol et
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError, 'Yanıt:', text);
      throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Ön kayıt işlemi başarısız oldu');
    }
    
    // UserId'yi hidden input'a yaz
    document.getElementById('modal-user-id').value = data.userId;
    
    showToast('Yeni doğrulama kodu e-posta adresinize gönderildi');
  } catch (error) {
    console.error('Ön kayıt hatası:', error);
    showToast(error.message || 'İşlem sırasında bir hata oluştu', 'error');
  }
};

// Giriş işlemi
const login = async (email, password) => {
  try {
    console.log('Giriş denemesi:', email);
    
    // Doğru API URL'yi oluştur
    const loginUrl = `${BASE_URL}/api/auth/login`;
    console.log('API URL:', loginUrl);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .catch(fetchError => {
      console.error('Fetch hatası (ağ hatası):', fetchError);
      throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    });
    
    console.log('Login yanıtı:', response.status);
    
    // Yanıt boş mu kontrol et
    const text = await response.text();
    console.log('Yanıt boyutu:', text.length, 'karakter');
    
    if (!text || text.trim() === '') {
      console.error('Boş yanıt alındı, status:', response.status);
      throw new Error('Sunucudan boş yanıt alındı. Lütfen daha sonra tekrar deneyin.');
    }
    
    let data;
    try {
      // Yanıt JSON formatında mı kontrol et
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError, 'Yanıt:', text.substring(0, 100) + '...');
      throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
    }
    
    console.log('Login veri:', data);
    
    if (!response.ok) {
      // Hesap doğrulanmamışsa doğrulama modalini göster
      if (data.needVerification) {
        showVerificationModal('', email, password, data.userId);
        showToast('Hesabınız doğrulanmamış. Lütfen e-posta adresinize gönderilen kodu girin.', 'warning');
      } else {
        throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
      }
      return;
    }
    
    // Token ve kullanıcıyı kaydet
    console.log('Login başarılı, token kaydediliyor:', data.token);
    setTokenFunc(data.token);
    
    const user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      isAdmin: data.user.isAdmin,
      isVerified: data.user.isVerified
    };
    
    console.log('Kullanıcı verisi kaydediliyor:', user);
    setCurrentUserFunc(user);
    
    // Header'ı güncelle
    if (typeof window.updateHeader === 'function') {
      console.log('Header güncelleniyor');
      window.updateHeader();
    } else {
      console.warn('updateHeader fonksiyonu bulunamadı');
    }
    
    showToast('Başarıyla giriş yapıldı');
    
    // URL'den yönlendirme parametresini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    
    setTimeout(() => {
      if (redirectParam) {
        // Eğer bir yönlendirme parametresi varsa, belirtilen sayfaya git
        if (redirectParam === 'account') {
          const hash = urlParams.get('hash') || '';
          window.location.href = `account.html${hash ? '#' + hash : ''}`;
        } else {
          window.location.href = redirectParam + '.html';
        }
      } else {
        // Yoksa ana sayfaya git
        window.location.href = 'index.html';
      }
    }, 1000);
  } catch (error) {
    console.error('Login hatası:', error);
    showToast(error.message || 'Giriş yapılırken bir hata oluştu', 'error');
  }
};

// Kayıt işlemi
const register = async (name, email, password, verificationCode = null) => {
  try {
    // Eğer doğrulama kodu yoksa, pre-register yaparak kodu al
    if (!verificationCode) {
      await preRegister(name, email, password);
      showVerificationModal(name, email, password);
      return;
    }
    
    // Doğrulama kodu varsa kayıt ve doğrulama işlemi birlikte yapılıyor
    const userId = document.getElementById('modal-user-id').value;
    if (!userId) {
      throw new Error('Kullanıcı ID bulunamadı');
    }
    
    // Önce kullanıcıyı tam kaydettir
    const responseRegister = await fetch(`${BASE_URL}/api/auth/complete-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        userId, 
        verificationCode,
        name,
        email,
        password
      })
    });
    
    // Yanıt boş mu kontrol et
    const text = await responseRegister.text();
    if (!text) {
      throw new Error('Sunucudan boş yanıt alındı');
    }
    
    let dataRegister;
    try {
      // Yanıt JSON formatında mı kontrol et
      dataRegister = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError, 'Yanıt:', text);
      throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
    }
    
    if (!responseRegister.ok) {
      throw new Error(dataRegister.message || 'Kayıt işlemi başarısız oldu');
    }
    
    // Modali kapat
    closeVerificationModal();
    
    // Token ve kullanıcıyı kaydet
    setTokenFunc(dataRegister.token);
    setCurrentUserFunc({
      id: dataRegister.user.id,
      name: dataRegister.user.name,
      email: dataRegister.user.email,
      isAdmin: dataRegister.user.isAdmin,
      isVerified: dataRegister.user.isVerified
    });
    
    showToast('Kayıt işleminiz başarıyla tamamlandı!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    console.error('Kayıt hatası:', error);
    showToast(error.message || 'Kayıt olurken bir hata oluştu', 'error');
  }
};

// E-posta doğrulama
const verifyEmail = async (userId, verificationCode) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, verificationCode })
    });
    
    // Yanıt boş mu kontrol et
    const text = await response.text();
    if (!text) {
      throw new Error('Sunucudan boş yanıt alındı');
    }
    
    let data;
    try {
      // Yanıt JSON formatında mı kontrol et
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError, 'Yanıt:', text);
      throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Doğrulama işlemi başarısız');
    }
    
    // Modali kapat
    closeVerificationModal();
    
    // Token ve kullanıcıyı kaydet
    setTokenFunc(data.token);
    setCurrentUserFunc({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      isAdmin: data.user.isAdmin,
      isVerified: data.user.isVerified
    });
    
    showToast('E-posta adresiniz başarıyla doğrulandı!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    console.error('Doğrulama hatası:', error);
    showToast(error.message || 'Doğrulama kodunu kontrol edin', 'error');
  }
};

// Doğrulama kodunu tekrar gönder
const resendVerificationCode = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    // Yanıt boş mu kontrol et
    const text = await response.text();
    if (!text) {
      throw new Error('Sunucudan boş yanıt alındı');
    }
    
    let data;
    try {
      // Yanıt JSON formatında mı kontrol et
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError, 'Yanıt:', text);
      throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen daha sonra tekrar deneyin.');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Kod gönderilirken bir hata oluştu');
    }
    
    showToast('Yeni doğrulama kodu e-posta adresinize gönderildi');
  } catch (error) {
    console.error('Kod gönderme hatası:', error);
    showToast(error.message || 'Kod gönderilirken bir hata oluştu', 'error');
  }
};

// Form gönderme işlemleri
const initAuthForms = () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      if (!email || !password) {
        showToast('Lütfen tüm alanları doldurun', 'error');
        return;
      }
      
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
      const terms = registerForm.querySelector('input[name="terms"]').checked;
      
      if (!name || !email || !password || !confirmPassword) {
        showToast('Lütfen tüm alanları doldurun', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showToast('Şifreler eşleşmiyor', 'error');
        return;
      }
      
      if (!terms) {
        showToast('Kullanım şartlarını kabul etmelisiniz', 'error');
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
  console.log('Auth.js DOMContentLoaded çalıştı');
  
  // API_URL'i kontrol et
  if (typeof window.API_URL !== 'undefined') {
    BASE_URL = window.API_URL.replace('/api', '');
    console.log('API_URL window nesnesinden alındı, BASE_URL ayarlandı:', BASE_URL);
  }
  
  initAuthTabs();
  initPasswordToggles();
  initAuthForms();
  initSocialLogin();
  initForgotPassword();
  initVerificationCodeInputs();
  initModalVerificationForm();
  
  // URL parametrelerine göre doğrulama ekranını göster
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const verify = urlParams.get('verify');
  const email = urlParams.get('email');
  
  if (userId && verify === 'true' && email) {
    showVerificationModal('', email, '', userId);
  }
});

// Toast notification
if (typeof window.showToast !== 'function') {
  window.showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };
} 