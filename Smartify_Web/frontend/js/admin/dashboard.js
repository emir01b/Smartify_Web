// Dashboard sayfası JS
let orderStatusChart = null;
let paymentMethodChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Dashboard verileri yükle
    await loadDashboardData();
});

// Dashboard verilerini yükle
async function loadDashboardData() {
    try {
        const stats = await fetchAPI('/orders/stats');
        
        if (!stats) return;
        
        // Özet kart verilerini güncelle
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.revenue);
        document.getElementById('pendingOrders').textContent = stats.pendingOrders;
        document.getElementById('completedOrders').textContent = stats.completedOrders;
        
        // Grafikleri çiz
        renderOrderStatusChart(stats.statusDistribution);
        renderPaymentMethodChart(stats.paymentMethodDistribution);
        
        // Son siparişleri göster
        displayRecentOrders(stats.latestOrders);
        
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
        showNotification('Dashboard verileri yüklenirken bir hata oluştu', 'error');
    }
}

// Sipariş durumu grafiği
function renderOrderStatusChart(statusData) {
    const ctx = document.getElementById('orderStatusChart').getContext('2d');
    
    // Önceki grafik varsa temizle
    if (orderStatusChart) {
        orderStatusChart.destroy();
    }
    
    // Grafik verilerini hazırla
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    // Renk haritası
    const colorMap = {
        'Beklemede': '#ffc107',      // Sarı
        'İşleme Alındı': '#17a2b8',  // Mavi
        'Kargoya Verildi': '#fd7e14', // Turuncu
        'Teslim Edildi': '#28a745',  // Yeşil
        'İptal Edildi': '#dc3545'    // Kırmızı
    };
    
    statusData.forEach(item => {
        labels.push(item._id);
        data.push(item.count);
        backgroundColors.push(colorMap[item._id] || '#6c757d');
    });
    
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

// Ödeme yöntemi grafiği
function renderPaymentMethodChart(paymentData) {
    const ctx = document.getElementById('paymentMethodChart').getContext('2d');
    
    // Önceki grafik varsa temizle
    if (paymentMethodChart) {
        paymentMethodChart.destroy();
    }
    
    // Grafik verilerini hazırla
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    // Renk haritası
    const colorMap = {
        'Havale/EFT': '#6f42c1',     // Mor
        'Kapıda Ödeme': '#20c997',   // Turkuaz
        'Kredi Kartı': '#0d6efd'     // Mavi
    };
    
    paymentData.forEach(item => {
        labels.push(item._id);
        data.push(item.count);
        backgroundColors.push(colorMap[item._id] || '#6c757d');
    });
    
    paymentMethodChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

// Son siparişleri göster
function displayRecentOrders(orders) {
    const tableBody = document.getElementById('recentOrdersTable');
    
    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">Henüz sipariş bulunmuyor</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
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
                <a href="/admin/orders.html?id=${order._id}" class="btn-icon" title="Detay">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
} 