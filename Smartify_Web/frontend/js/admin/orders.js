// Siparişler sayfası JS
let orders = [];
let currentOrder = null;
let filteredOrders = [];
let itemsPerPage = 10;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
    // Siparişleri yükle
    await loadOrders();
    
    // Olay dinleyicileri ekle
    setupEventListeners();
    
    // URL'deki sipariş ID'sini kontrol et
    checkOrderIdInURL();
});

// Olay dinleyicileri ekle
function setupEventListeners() {
    // Arama ve filtreleme
    document.getElementById('orderSearch').addEventListener('input', filterOrders);
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('paymentFilter').addEventListener('change', filterOrders);
    
    // Modal kapatma
    document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);
    
    // Durum güncelleme
    document.getElementById('updateStatusBtn').addEventListener('click', updateOrderStatus);
    
    // Ödeme durumu güncelleme
    document.getElementById('markAsPaidBtn').addEventListener('click', markOrderAsPaid);
    
    // Not kaydetme
    document.getElementById('saveNotesBtn').addEventListener('click', saveOrderNotes);
}

// Siparişleri yükle
async function loadOrders() {
    try {
        const result = await fetchAPI('/api/orders');
        
        if (!result) return;
        
        orders = result;
        filteredOrders = [...orders];
        
        // Siparişleri göster
        displayOrders();
    } catch (error) {
        console.error('Siparişleri yükleme hatası:', error);
        showNotification('Siparişler yüklenirken bir hata oluştu', 'error');
    }
}

// URL'deki sipariş ID'sini kontrol et
function checkOrderIdInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (orderId) {
        openOrderDetail(orderId);
    }
}

// Siparişleri göster
function displayOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">Kriterlere uygun sipariş bulunamadı</td>
            </tr>
        `;
        document.getElementById('ordersPagination').innerHTML = '';
        return;
    }
    
    // Sayfalama hesapla
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = 1;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredOrders.length);
    const paginatedOrders = filteredOrders.slice(start, end);
    
    tableBody.innerHTML = '';
    
    paginatedOrders.forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${shortenId(order._id)}</td>
            <td>${order.user ? order.user.name : 'Misafir'}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>${formatCurrency(order.totalPrice)}</td>
            <td>
                <span class="status-badge ${order.isPaid ? 'success' : 'warning'}">
                    ${order.isPaid ? 'Ödendi' : 'Bekliyor'}
                </span>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td>
                <button class="btn-icon view-order" data-id="${order._id}" title="Detay">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Detay butonlarına tıklama olayı ekle
    document.querySelectorAll('.view-order').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            openOrderDetail(orderId);
        });
    });
    
    // Sayfalamayı oluştur
    renderPagination(totalPages);
}

// Sayfalama oluştur
function renderPagination(totalPages) {
    const pagination = document.getElementById('ordersPagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Önceki sayfa butonu
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
            ${currentPage === 1 ? 'disabled' : 'data-page="prev"'}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Sayfa numaraları
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="pagination-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    // Sonraki sayfa butonu
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
            ${currentPage === totalPages ? 'disabled' : 'data-page="next"'}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Sayfa butonlarına tıklama olayı ekle
    document.querySelectorAll('.pagination-btn:not(.disabled)').forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('data-page');
            
            if (page === 'prev') {
                currentPage--;
            } else if (page === 'next') {
                currentPage++;
            } else {
                currentPage = parseInt(page);
            }
            
            displayOrders();
        });
    });
}

// Siparişleri filtrele
function filterOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const paymentFilter = document.getElementById('paymentFilter').value;
    
    filteredOrders = orders.filter(order => {
        // Arama filtresi
        const searchMatch = 
            order._id.toLowerCase().includes(searchTerm) || 
            (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm)) ||
            (order.user && order.user.email && order.user.email.toLowerCase().includes(searchTerm));
        
        // Durum filtresi
        const statusMatch = !statusFilter || order.status === statusFilter;
        
        // Ödeme filtresi
        let paymentMatch = true;
        if (paymentFilter === 'paid') {
            paymentMatch = order.isPaid;
        } else if (paymentFilter === 'unpaid') {
            paymentMatch = !order.isPaid;
        }
        
        return searchMatch && statusMatch && paymentMatch;
    });
    
    // Sayfa numarasını sıfırla
    currentPage = 1;
    
    // Siparişleri göster
    displayOrders();
}

// Sipariş detayını aç
async function openOrderDetail(orderId) {
    try {
        // Sipariş verilerini getir
        const order = await fetchAPI(`/api/orders/${orderId}`);
        
        if (!order) return;
        
        currentOrder = order;
        
        // Modal içeriğini doldur
        document.getElementById('orderIdDetail').textContent = shortenId(order._id);
        document.getElementById('orderDateDetail').textContent = formatDate(order.createdAt);
        
        // Durum badge'i
        const statusBadge = document.getElementById('orderStatusBadge');
        statusBadge.textContent = order.status;
        statusBadge.className = `status-badge ${getStatusClass(order.status)}`;
        
        // Müşteri bilgileri
        document.getElementById('customerNameDetail').textContent = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
        document.getElementById('customerEmailDetail').textContent = order.shippingAddress.email;
        document.getElementById('customerPhoneDetail').textContent = order.shippingAddress.phone;
        
        // Teslimat adresi
        document.getElementById('shippingAddressDetail').textContent = 
            `${order.shippingAddress.address}, ${order.shippingAddress.postalCode} ${order.shippingAddress.city}`;
        
        // Ödeme bilgileri
        document.getElementById('paymentMethodDetail').textContent = order.paymentMethod;
        document.getElementById('paymentStatusDetail').textContent = order.isPaid ? 'Ödendi' : 'Ödenmedi';
        document.getElementById('paidAtDetail').textContent = order.isPaid ? `Ödeme Tarihi: ${formatDate(order.paidAt)}` : '';
        
        // Sipariş notları
        document.getElementById('orderNotesDetail').value = order.notes || '';
        
        // Sipariş öğeleri
        const orderItemsTable = document.getElementById('orderItemsDetail');
        orderItemsTable.innerHTML = '';
        
        order.orderItems.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <div class="product-cell">
                        <img src="${item.image || '/images/default-product.png'}" alt="${item.name}" class="product-thumbnail">
                        <div class="product-name">${item.name}</div>
                    </div>
                </td>
                <td>${formatCurrency(item.price)}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
            `;
            
            orderItemsTable.appendChild(row);
        });
        
        // Toplamlar
        const subtotal = order.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.getElementById('subtotalDetail').textContent = formatCurrency(subtotal);
        document.getElementById('taxDetail').textContent = formatCurrency(order.taxPrice);
        document.getElementById('shippingDetail').textContent = formatCurrency(order.shippingPrice);
        document.getElementById('totalDetail').textContent = formatCurrency(order.totalPrice);
        
        // Durum seçimini güncelle
        document.getElementById('orderStatusUpdate').value = order.status;
        
        // Ödendi işaretle butonunu göster/gizle
        document.getElementById('markAsPaidBtn').style.display = order.isPaid ? 'none' : 'inline-block';
        
        // Modalı aç
        document.getElementById('orderModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // URL'i güncelle (sayfa yenilenmeden)
        const url = new URL(window.location);
        url.searchParams.set('id', orderId);
        window.history.pushState({}, '', url);
    } catch (error) {
        console.error('Sipariş detay hatası:', error);
        showNotification('Sipariş detayları yüklenirken bir hata oluştu', 'error');
    }
}

// Modalı kapat
function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    document.body.style.overflow = '';
    
    // URL'i temizle
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
}

// Sipariş durumunu güncelle
async function updateOrderStatus() {
    if (!currentOrder) return;
    
    const newStatus = document.getElementById('orderStatusUpdate').value;
    
    try {
        const result = await fetchAPI(`/api/orders/${currentOrder._id}/status`, 'PUT', { status: newStatus });
        
        if (!result) return;
        
        // Başarı mesajı göster
        showNotification('Sipariş durumu güncellendi', 'success');
        
        // Sipariş listesini güncelle
        const orderIndex = orders.findIndex(o => o._id === currentOrder._id);
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].isDelivered = newStatus === 'Teslim Edildi';
            orders[orderIndex].deliveredAt = newStatus === 'Teslim Edildi' ? new Date() : null;
        }
        
        // Filtrelenmiş listeyi de güncelle
        const filteredIndex = filteredOrders.findIndex(o => o._id === currentOrder._id);
        if (filteredIndex !== -1) {
            filteredOrders[filteredIndex].status = newStatus;
            filteredOrders[filteredIndex].isDelivered = newStatus === 'Teslim Edildi';
            filteredOrders[filteredIndex].deliveredAt = newStatus === 'Teslim Edildi' ? new Date() : null;
        }
        
        // Tabloyu yeniden göster
        displayOrders();
        
        // Detay modalını güncelle
        document.getElementById('orderStatusBadge').textContent = newStatus;
        document.getElementById('orderStatusBadge').className = `status-badge ${getStatusClass(newStatus)}`;
        
        // Güncel siparişi kaydet
        currentOrder.status = newStatus;
    } catch (error) {
        console.error('Sipariş durumu güncelleme hatası:', error);
        showNotification('Sipariş durumu güncellenirken bir hata oluştu', 'error');
    }
}

// Siparişi ödendi olarak işaretle
async function markOrderAsPaid() {
    if (!currentOrder) return;
    
    try {
        const result = await fetchAPI(`/api/orders/${currentOrder._id}/pay`, 'PUT');
        
        if (!result) return;
        
        // Başarı mesajı göster
        showNotification('Sipariş ödendi olarak işaretlendi', 'success');
        
        // Sipariş listesini güncelle
        const orderIndex = orders.findIndex(o => o._id === currentOrder._id);
        if (orderIndex !== -1) {
            orders[orderIndex].isPaid = true;
            orders[orderIndex].paidAt = new Date();
        }
        
        // Filtrelenmiş listeyi de güncelle
        const filteredIndex = filteredOrders.findIndex(o => o._id === currentOrder._id);
        if (filteredIndex !== -1) {
            filteredOrders[filteredIndex].isPaid = true;
            filteredOrders[filteredIndex].paidAt = new Date();
        }
        
        // Tabloyu yeniden göster
        displayOrders();
        
        // Detay modalını güncelle
        document.getElementById('paymentStatusDetail').textContent = 'Ödendi';
        document.getElementById('paidAtDetail').textContent = `Ödeme Tarihi: ${formatDate(new Date())}`;
        document.getElementById('markAsPaidBtn').style.display = 'none';
        
        // Güncel siparişi kaydet
        currentOrder.isPaid = true;
        currentOrder.paidAt = new Date();
    } catch (error) {
        console.error('Ödeme durumu güncelleme hatası:', error);
        showNotification('Ödeme durumu güncellenirken bir hata oluştu', 'error');
    }
}

// Sipariş notlarını kaydet
async function saveOrderNotes() {
    if (!currentOrder) return;
    
    const notes = document.getElementById('orderNotesDetail').value;
    
    try {
        const result = await fetchAPI(`/api/orders/${currentOrder._id}/notes`, 'PUT', { notes });
        
        if (!result) return;
        
        // Başarı mesajı göster
        showNotification('Sipariş notları kaydedildi', 'success');
        
        // Güncel siparişi kaydet
        currentOrder.notes = notes;
    } catch (error) {
        console.error('Not kaydetme hatası:', error);
        showNotification('Notlar kaydedilirken bir hata oluştu', 'error');
    }
} 