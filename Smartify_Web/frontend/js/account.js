// Kullanıcı bilgilerini yükle
const loadUserData = () => {
  const user = getCurrentUser();
  
  if (!user) {
    // Eğer kullanıcı girişi yapılmamışsa ana sayfaya yönlendir
    window.location.href = 'login.html';
    return;
  }
  
  // Kullanıcı bilgilerini doldur
  document.getElementById('user-name').textContent = user.name || 'Kullanıcı';
  document.getElementById('user-email').textContent = user.email || '';
  
  // Kullanıcı avatar'ını ayarla
  const userAvatar = document.getElementById('user-avatar');
  if (user.avatar) {
    userAvatar.src = user.avatar;
  } else {
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2962ff&color=fff`;
  }
  
  // Profil formunu doldur
  document.getElementById('fullname').value = user.name || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phone').value = user.phone || '';
  document.getElementById('birthday').value = user.birthday || '';
  document.getElementById('bio').value = user.bio || '';
};

// Tab değiştirme işlemi
const initTabs = () => {
  const tabs = document.querySelectorAll('.account-nav a[data-tab]');
  const contentTabs = document.querySelectorAll('.account-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Aktif tab'ı değiştir
      document.querySelector('.account-nav li.active').classList.remove('active');
      tab.parentElement.classList.add('active');
      
      // Aktif içeriği değiştir
      const tabId = tab.getAttribute('data-tab');
      
      contentTabs.forEach(contentTab => {
        contentTab.classList.remove('active');
      });
      
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      // URL'yi güncelle
      window.history.pushState({}, '', `#${tabId}`);
    });
  });
  
  // URL'den tab kontrolü
  const checkUrlTab = () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.querySelector(`.account-nav a[data-tab="${hash}"]`)) {
      document.querySelector(`.account-nav a[data-tab="${hash}"]`).click();
    }
  };
  
  // Sayfa yüklendiğinde tab kontrolü
  checkUrlTab();
  
  // URL değiştiğinde tab kontrolü
  window.addEventListener('hashchange', checkUrlTab);
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

// Profil bilgilerini güncelle
const initProfileForm = () => {
  const profileForm = document.getElementById('profile-form');
  
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        birthday: document.getElementById('birthday').value,
        bio: document.getElementById('bio').value
      };
      
      try {
        const user = getCurrentUser();
        
        // API isteği (Backend hazır olmadığı için simüle ediyoruz)
        // Gerçek projede fetchAPI kullanılır
        // const updatedUser = await fetchAPI('/users/profile', {
        //   method: 'PUT',
        //   body: JSON.stringify(formData)
        // });
        
        // Kullanıcı bilgilerini güncelle (Simülasyon)
        const updatedUser = { ...user, ...formData };
        setCurrentUser(updatedUser);
        
        showToast('Profil bilgileriniz başarıyla güncellendi');
        
        // Kullanıcı adını ve avatarı güncelle
        document.getElementById('user-name').textContent = updatedUser.name;
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=2962ff&color=fff`;
        
      } catch (error) {
        showToast(error.message || 'Profil güncellenirken bir hata oluştu', 'error');
      }
    });
  }
};

// Şifre güncelleme formu
const initSecurityForm = () => {
  const securityForm = document.getElementById('security-form');
  
  if (securityForm) {
    securityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Lütfen tüm alanları doldurun', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showToast('Yeni şifreler eşleşmiyor', 'error');
        return;
      }
      
      try {
        // API isteği (Backend hazır olmadığı için simüle ediyoruz)
        // await fetchAPI('/users/password', {
        //   method: 'PUT',
        //   body: JSON.stringify({
        //     currentPassword,
        //     newPassword
        //   })
        // });
        
        showToast('Şifreniz başarıyla güncellendi');
        securityForm.reset();
      } catch (error) {
        showToast(error.message || 'Şifre güncellenirken bir hata oluştu', 'error');
      }
    });
  }
};

// Güvenlik ayarları
const initSecuritySettings = () => {
  const twoFactorToggle = document.getElementById('two-factor');
  const loginAlertsToggle = document.getElementById('login-alerts');
  
  if (twoFactorToggle) {
    twoFactorToggle.addEventListener('change', () => {
      // API isteği (Simülasyon)
      setTimeout(() => {
        showToast(twoFactorToggle.checked ? 
          'İki faktörlü doğrulama aktifleştirildi' :
          'İki faktörlü doğrulama devre dışı bırakıldı'
        );
      }, 500);
    });
  }
  
  if (loginAlertsToggle) {
    loginAlertsToggle.addEventListener('change', () => {
      // API isteği (Simülasyon)
      setTimeout(() => {
        showToast(loginAlertsToggle.checked ? 
          'Giriş bildirimleri aktifleştirildi' :
          'Giriş bildirimleri devre dışı bırakıldı'
        );
      }, 500);
    });
  }
};

// Çıkış işlemi
const initLogout = () => {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
};

// Adres ekleme butonları
const initAddressButtons = () => {
  const addAddressBtns = document.querySelectorAll('.btn-add-address');
  
  addAddressBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Adres ekleme özelliği yakında aktif olacak', 'warning');
    });
  });
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Navbar yüklendikten sonra çalıştır (main.js yüklenmesi gerekir)
  const checkMainJsLoaded = setInterval(() => {
    if (typeof getCurrentUser === 'function') {
      clearInterval(checkMainJsLoaded);
      
      loadUserData();
      initTabs();
      initPasswordToggles();
      initProfileForm();
      initSecurityForm();
      initSecuritySettings();
      initLogout();
      initAddressButtons();
    }
  }, 100);
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