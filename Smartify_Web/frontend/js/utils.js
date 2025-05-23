// Genel yardımcı fonksiyonlar

// Global fonksiyonları kontrol et ve sadece tanımlı olmayanları tanımla
if (typeof window.formatCurrency !== 'function') {
  // Format para birimi
  function formatCurrency(amount) {
    return amount.toLocaleString('tr-TR') + ' ₺';
  }
  window.formatCurrency = formatCurrency;
}

if (typeof window.showToast !== 'function') {
  // Bildirim göster
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <p>${message}</p>
    `;
    
    document.body.appendChild(toast);
    
    // Bildirim göster
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // 3 saniye sonra bildirim kaybolsun
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }
  window.showToast = showToast;
}

if (typeof window.formatDate !== 'function') {
  // Tarih formatla
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  window.formatDate = formatDate;
}

if (typeof window.fetchAPI !== 'function') {
  // API istek yardımcısı
  async function fetchAPI(endpoint, options = {}) {
    const API_URL = window.API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(options.headers || {})
        }
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error.message, 'error');
      }
      throw error;
    }
  }
  window.fetchAPI = fetchAPI;
}

if (typeof window.updateCartCounter !== 'function') {
  // Sepet sayacını güncelle
  function updateCartCounter() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }
  window.updateCartCounter = updateCartCounter;
}

if (typeof window.showModal !== 'function') {
  // Modal göster
  function showModal(content) {
    // Varsa eski modalı kaldır
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Yeni modal oluştur
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <button class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;
    
    // Modalı sayfaya ekle
    document.body.appendChild(modal);
    
    // Modal göster
    setTimeout(() => {
      modal.classList.add('show');
    }, 100);
    
    // Kapatma olayları
    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }
  window.showModal = showModal;
} 