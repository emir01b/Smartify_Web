// API URL
const API_URL = 'http://localhost:3000/api';

// API istekleri için yardımcı fonksiyon
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast(error.message, 'error');
    } else {
      console.error(error.message);
    }
    throw error;
  }
};

// Toast bildirimi gösterme
// Eğer bu fonksiyon başka bir dosyada tanımlanmışsa, tekrar tanımlamayı önle
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

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuBtn || !navLinks) return;

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Scroll animasyonlarını aktifleştir
const initScrollAnimations = () => {
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  const elementInView = (el, offset = 0) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= 
      (window.innerHeight || document.documentElement.clientHeight) - offset
    );
  };

  const displayScrollElement = (element) => {
    element.classList.add('visible');
  };

  const hideScrollElement = (element) => {
    element.classList.remove('visible');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 100)) {
        displayScrollElement(el);
      } else {
        hideScrollElement(el);
      }
    });
  };

  // Scroll event listener
  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });

  // İlk yüklemede kontrol et
  handleScrollAnimation();
};

// Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      this.classList.toggle('active');
    });
  }
  
  // Mega Menu Toggle for Mobile
  const megaMenuItems = document.querySelectorAll('.mega-menu');
  
  megaMenuItems.forEach(item => {
    const link = item.querySelector('a');
    
    if (link && window.innerWidth <= 768) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Close other open mega menus
        megaMenuItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });
        
        item.classList.toggle('active');
      });
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
      if (mainNav && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        if (mobileMenuBtn) {
          mobileMenuBtn.classList.remove('active');
        }
      }
      
      // Close all mega menus when clicking outside
      megaMenuItems.forEach(item => {
        if (item.classList.contains('active') && !item.contains(e.target)) {
          item.classList.remove('active');
        }
      });
    }
  });
  
  // Sticky Header
  const header = document.querySelector('header');
  const mainHeader = document.querySelector('.main-header');
  const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
  
  function handleScroll() {
    if (window.scrollY > topBarHeight) {
      header.classList.add('sticky');
      document.body.style.paddingTop = mainHeader.offsetHeight + 'px';
    } else {
      header.classList.remove('sticky');
      document.body.style.paddingTop = '0';
    }
  }
  
  if (header && mainHeader) {
    window.addEventListener('scroll', handleScroll);
  }
  
  // Back to top button
  const createBackToTopButton = () => {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };
  
  createBackToTopButton();
  
  // Resize event handler for mega menu
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      // Reset mobile menu styles when resizing to desktop
      if (mainNav) {
        mainNav.classList.remove('active');
      }
      
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove('active');
      }
      
      megaMenuItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  });
  
  // Kullanıcı bilgilerini güncelle
  updateHeader();
  
  // Ana script yüklendiğini bildir
  window.dispatchEvent(new Event('main_js_loaded'));
});

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();

  // Hero section elementlerine scroll-reveal class'ı ekle
  const heroContent = document.querySelectorAll('.hero-content > *');
  if (heroContent) {
    heroContent.forEach(el => {
      el.classList.add('scroll-reveal');
    });
  }

  // Featured products elementlerine scroll-reveal class'ı ekle
  const productCards = document.querySelectorAll('.product-card');
  if (productCards) {
    productCards.forEach(el => {
      el.classList.add('scroll-reveal');
    });
  }

  // Category card'larına scroll-reveal class'ı ekle
  const categoryCards = document.querySelectorAll('.category-card');
  if (categoryCards) {
    categoryCards.forEach(el => {
      el.classList.add('scroll-reveal');
    });
  }

  // Feature card'larına scroll-reveal class'ı ekle
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards) {
    featureCards.forEach(el => {
      el.classList.add('scroll-reveal');
    });
  }

  // Newsletter section'a scroll-reveal class'ı ekle
  const newsletterContent = document.querySelector('.newsletter-content');
  if (newsletterContent) {
    newsletterContent.classList.add('scroll-reveal');
  }
});

// Ana sayfa için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
  // Öne çıkan ürünleri yükleme işlemini kaldırıyoruz
  // loadFeaturedProducts();
  
  // Newsletter form gönderimi
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
});

// Öne çıkan ürünleri göster
const displayFeaturedProducts = () => {
  const productsContainer = document.getElementById('featuredProducts');
  if (!productsContainer) return;

  productsContainer.innerHTML = featuredProducts.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn" title="Favorilere Ekle">
            <i class="fas fa-heart"></i>
          </button>
          <button class="product-action-btn" title="Hızlı Görüntüle">
            <i class="fas fa-eye"></i>
          </button>
          <button class="product-action-btn" title="Karşılaştır">
            <i class="fas fa-exchange-alt"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">
          <span class="current-price">${product.price.toLocaleString('tr-TR')} ₺</span>
          ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString('tr-TR')} ₺</span>` : ''}
        </div>
        <button class="add-to-cart">Sepete Ekle</button>
      </div>
    </div>
  `).join('');
};

// Newsletter form gönderimi
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  
  // Burada e-posta gönderimi için gerekli API çağrısı yapılacak
  console.log('Newsletter kaydı:', email);
  
  // Başarılı kayıt mesajı
  alert('Bülten kaydınız başarıyla tamamlandı!');
  e.target.reset();
}

// Navbar işlevselliği
function setupNavbar() {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      this.classList.toggle('active');
    });
  }
  
  // Arama formu işlevselliği
  const searchForm = document.querySelector('.search-bar form');
  const searchInput = document.querySelector('.search-bar input[name="q"]');
  
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const searchQuery = searchInput.value.trim();
      
      if (searchQuery) {
        // Ürünler sayfasına yönlendir ve arama sorgusunu ekle
        window.location.href = `products.html?search=${encodeURIComponent(searchQuery)}`;
      }
    });
  }
  
  // Mega Menu Toggle for Mobile
  const megaMenuItems = document.querySelectorAll('.mega-menu');
  
  megaMenuItems.forEach(item => {
    const link = item.querySelector('a');
    
    // Mega menü ana bağlantısını tıklanabilir yap
    if (link) {
      link.style.pointerEvents = 'auto';
      link.style.cursor = 'pointer';
      
      // Mobil görünümde mega menü açma/kapama
      if (window.innerWidth <= 768) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Close other open mega menus
          megaMenuItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
              otherItem.classList.remove('active');
            }
          });
          
          item.classList.toggle('active');
        });
      }
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
      if (mainNav && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        if (mobileMenuBtn) {
          mobileMenuBtn.classList.remove('active');
        }
      }
    }
  });
  
  // Sticky Header
  const header = document.querySelector('header');
  const mainHeader = document.querySelector('.main-header');
  const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
  
  function handleScroll() {
    if (window.scrollY > topBarHeight) {
      header.classList.add('sticky');
      document.body.style.paddingTop = mainHeader.offsetHeight + 'px';
    } else {
      header.classList.remove('sticky');
      document.body.style.paddingTop = '0';
    }
  }
  
  if (header && mainHeader) {
    window.addEventListener('scroll', handleScroll);
  }
  
  // Resize event handler for mega menu
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      // Reset mobile menu styles when resizing to desktop
      if (mainNav) {
        mainNav.classList.remove('active');
      }
      
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove('active');
      }
      
      megaMenuItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  });
}

// Elemanları seç
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mainNav = document.querySelector('.main-nav');
const megaMenuItems = document.querySelectorAll('.mega-menu');
const userAccountSection = document.getElementById('user-account-section');

// Mobil menü için toggle fonksiyonu
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    // Menü açıldığında tüm mega menü dropdown'larını kapat
    megaMenuItems.forEach(item => {
      item.classList.remove('active');
    });
  });
}

// Mobil görünümde mega menülerin tıklanabilir olması
if (window.innerWidth <= 768) {
  megaMenuItems.forEach(item => {
    const link = item.querySelector('a');
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('active');
        
        // Diğer mega menü dropdown'larını kapat
        megaMenuItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
      }
    });
  });
}

// Local storage ve kullanıcı işlemleri
const getToken = () => {
  return localStorage.getItem('token');
};

const setToken = (token) => {
  localStorage.setItem('token', token);
};

const removeToken = () => {
  localStorage.removeItem('token');
};

const getCurrentUser = () => {
  const userJSON = localStorage.getItem('user');
  return userJSON ? JSON.parse(userJSON) : null;
};

const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const removeCurrentUser = () => {
  localStorage.removeItem('user');
};

// Kullanıcı oturum durumuna göre header'ı güncelle
const updateHeader = () => {
  const user = getCurrentUser();
  const cartCount = document.querySelector('.cart-count');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Kullanıcı hesap bölümünü güncelle
  const userAccountSection = document.getElementById('user-account-section');
  if (userAccountSection) {
    if (user) {
      console.log("Kullanıcı giriş yapmış:", user); // Debug için eklendi
      // Kullanıcı giriş yapmışsa, kullanıcı menüsünü göster
      userAccountSection.innerHTML = `
        <div class="user-menu">
          <button type="button" class="user-menu-button">
            <i class="fas fa-user-circle"></i>
            <span class="username">${user.name}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="user-menu-dropdown">
            <a href="account.html"><i class="fas fa-user"></i> Hesabım</a>
            <a href="account.html#orders"><i class="fas fa-box"></i> Siparişlerim</a>
            <a href="account.html#address"><i class="fas fa-map-marker-alt"></i> Adreslerim</a>
            <a href="wishlist.html"><i class="fas fa-heart"></i> Favorilerim</a>
            <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a>
          </div>
        </div>
      `;
      
      // Kullanıcı menüsü aç/kapa
      const userMenuButton = userAccountSection.querySelector('.user-menu-button');
      const userMenu = userAccountSection.querySelector('.user-menu');
      
      userMenuButton.addEventListener('click', () => {
        userMenu.classList.toggle('active');
      });
      
      // Menü dışına tıklandığında menüyü kapat
      document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
          userMenu.classList.remove('active');
        }
      });
      
      // Çıkış butonuna tıklama
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    } else {
      console.log("Kullanıcı giriş yapmamış"); // Debug için eklendi
      // Kullanıcı giriş yapmamışsa, sadece giriş butonunu göster
      userAccountSection.innerHTML = `
        <div class="auth-buttons">
          <a href="login.html" class="login-btn">
            <i class="fas fa-sign-in-alt"></i> Giriş Yap
          </a>
        </div>
      `;
    }
  }
};

// Çıkış yapma
const logout = () => {
  removeToken();
  removeCurrentUser();
  window.location.href = 'index.html';
};

// API isteği yapma (GET)
const fetchData = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {})
      }
    });
    
    const data = await response.json();
    
    // Token süresi dolduysa otomatik çıkış yap
    if (response.status === 401 && data.message === 'Token süresi doldu') {
      logout();
      window.location.href = 'login.html?expired=true';
      return null;
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Bir hata oluştu');
    }
    
    return data;
  } catch (error) {
    console.error('API Hatası:', error);
    throw error;
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  console.log('Main.js DOMContentLoaded çalıştı');
  // Token ve kullanıcı kontrolü
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  console.log('Token:', token);
  console.log('User:', user);
  
  // Header'ı güncelle
  updateHeader();
  
  // Ana script yüklendiğini bildir
  window.dispatchEvent(new Event('main_js_loaded'));
  
  // API URL'i window nesnesine aktar
  window.API_URL = API_URL;
});

// Window nesnesi üzerinde fonksiyonları tanımla
window.getToken = getToken;
window.setToken = setToken;
window.removeToken = removeToken;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.removeCurrentUser = removeCurrentUser;
window.updateHeader = updateHeader;
window.logout = logout;
window.fetchData = fetchData;

// Sayfa cart.js'yi içeriyorsa cart nesnesini global yap
if (typeof cart !== 'undefined') {
  window.cart = cart;
} 