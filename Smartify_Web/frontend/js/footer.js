// Footer işlevleri

document.addEventListener('DOMContentLoaded', function() {
  initFooter();
});

// Footer bileşeni yüklendiğinde çalışacak
window.addEventListener('main_js_loaded', function() {
  initFooter();
});

// Footer başlat
function initFooter() {
  // Bülten aboneliği
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
  
  // Yıl bilgisini otomatik güncelle
  const yearElement = document.querySelector('.footer-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Sayfanın en üstüne çık butonu
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Scroll durumuna göre butonu göster/gizle
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
  }
}

// Bülten aboneliği gönderme
function handleNewsletterSubmit(e) {
  e.preventDefault();
  
  const emailInput = e.target.querySelector('input[type="email"]');
  const email = emailInput.value.trim();
  
  if (!email) {
    showToast('Lütfen e-posta adresinizi girin', 'error');
    return;
  }
  
  // E-posta formatını doğrula
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Lütfen geçerli bir e-posta adresi girin', 'error');
    return;
  }
  
  // Bu kısımda normalde API'ye istek yapılır
  // Burada sadece başarılı olduğunu varsayıyoruz
  
  // Input'u temizle
  emailInput.value = '';
  
  // Başarılı mesajı göster
  showToast('Bülten aboneliğiniz başarıyla kaydedildi', 'success');
} 