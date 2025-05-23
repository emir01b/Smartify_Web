// Navbar işlevleri

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
    initCartListeners();
});

// Navbar yüklendiğinde
window.addEventListener('main_js_loaded', () => {
    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
    initCartListeners();
});

// Sepet butonları için event listener
function initCartListeners() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
}

// Her 2 saniyede bir sepet sayacını kontrol et (güvenli çağrı)
setInterval(() => {
    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
}, 2000); 