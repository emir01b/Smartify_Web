 

// Sayfa yüklendiğinde ve navbar güncellendiğinde
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    initCartListeners();
});

// Navbar yüklendiğinde
window.addEventListener('main_js_loaded', () => {
    updateCartCounter();
    initCartListeners();
});

// Her 2 saniyede bir sepet sayacını kontrol et
setInterval(updateCartCounter, 2000); 