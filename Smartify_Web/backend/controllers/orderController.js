const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Yeni sipariş oluştur
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('Sipariş ürünü yok');
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Kullanıcının orders dizisine siparişi ekle
    const user = await User.findById(req.user._id);
    user.orders = user.orders || [];
    user.orders.push(createdOrder._id);
    await user.save();

    res.status(201).json(createdOrder);
  }
};

// @desc    Sipariş ID'sine göre sipariş getir
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }
};

// @desc    Siparişi ödenmiş olarak güncelle
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }
};

// @desc    Siparişi teslim edilmiş olarak güncelle
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }
};

// @desc    Giriş yapan kullanıcının siparişlerini getir
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    console.log('getMyOrders çağrıldı, user ID:', req.user._id);
    
    // Önce kullanıcıyı kontrol et
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('Kullanıcı bulunamadı, ID:', req.user._id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    console.log('Kullanıcı bulundu:', user.name, user.email);
    console.log('Kullanıcı orders array:', user.orders);
    
    // Eğer kullanıcının hiç siparişi yoksa boş dizi döndür
    if (!user.orders || user.orders.length === 0) {
      return res.json([]);
    }
    
    // Kullanıcının siparişlerini doğrudan Order modelinden al
    const orders = await Order.find({ _id: { $in: user.orders } });
    console.log('Bulunan siparişler:', orders.length);
    
    return res.json(orders);
  } catch (error) {
    console.error('getMyOrders hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
};

// @desc    Tüm siparişleri getir
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};

// @desc    Sipariş istatistiklerini getir
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    console.log("getOrderStats API çağrıldı");
    
    // Toplam sipariş sayısı
    const totalOrders = await Order.countDocuments();
    console.log("Toplam sipariş sayısı:", totalOrders);
    
    // Toplam gelir
    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].revenue : 0;
    console.log("Toplam gelir:", revenue);
    
    // Bekleyen siparişler
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['Beklemede', 'İşleme Alındı'] } 
    });
    console.log("Bekleyen siparişler:", pendingOrders);
    
    // Tamamlanan siparişler
    const completedOrders = await Order.countDocuments({ 
      status: 'Teslim Edildi' 
    });
    console.log("Tamamlanan siparişler:", completedOrders);
    
    // Sipariş durumu dağılımı
    const statusDistribution = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log("Durum dağılımı:", JSON.stringify(statusDistribution));
    
    // Ödeme yöntemi dağılımı
    const paymentMethodDistribution = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log("Ödeme yöntemi dağılımı:", JSON.stringify(paymentMethodDistribution));
    
    // Son 5 sipariş
    const latestOrders = await Order.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log("Son siparişler alındı");
    
    const responseData = {
      totalOrders,
      revenue,
      pendingOrders,
      completedOrders,
      statusDistribution,
      paymentMethodDistribution,
      latestOrders
    };
    
    console.log("API yanıt veriyor");
    res.json(responseData);
  } catch (error) {
    console.error('Sipariş istatistikleri hatası:', error);
    res.status(500).json({ message: 'Server hatası: ' + error.message });
  }
};

// @desc    Sipariş durumunu güncelle
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Durum bilgisi gerekli' });
  }
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    order.status = status;
    
    // Eğer durum "Teslim Edildi" ise, isDelivered ve deliveredAt alanlarını da güncelle
    if (status === 'Teslim Edildi') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    res.status(500).json({ message: 'Server hatası: ' + error.message });
  }
};

// @desc    Sipariş notlarını güncelle
// @route   PUT /api/orders/:id/notes
// @access  Private/Admin
const updateOrderNotes = async (req, res) => {
  const { notes } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
    
    order.notes = notes;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Sipariş notları güncelleme hatası:', error);
    res.status(500).json({ message: 'Server hatası: ' + error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getOrderStats,
  updateOrderStatus,
  updateOrderNotes,
}; 