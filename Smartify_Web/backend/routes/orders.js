const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Tüm siparişleri getir - Sadece admin
router.get('/', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

// İstatistikleri getir - Sadece admin
router.get('/stats', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        // Toplam sipariş sayısı
        const totalOrders = await Order.countDocuments();
        
        // Tamamlanan siparişler
        const completedOrders = await Order.countDocuments({ 
            isDelivered: true 
        });
        
        // Bekleyen siparişler
        const pendingOrders = await Order.countDocuments({ 
            isDelivered: false 
        });
        
        // Toplam gelir (tamamlanan siparişlerden)
        const revenue = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        
        // Son 7 gündeki siparişler
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: last7Days }
        });
        
        // Son 5 siparişi getir
        const latestOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
            
        // Sipariş durumu dağılımı
        const statusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        // Ödeme yöntemi dağılımı
        const paymentMethodDistribution = await Order.aggregate([
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ]);
        
        res.json({
            totalOrders,
            completedOrders,
            pendingOrders,
            revenue: revenue.length > 0 ? revenue[0].total : 0,
            recentOrders,
            latestOrders,
            statusDistribution,
            paymentMethodDistribution
        });
    } catch (error) {
        next(error);
    }
});

// Sipariş detayını getir - Sadece admin veya sipariş sahibi
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');
            
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        // Kullanıcı admin değilse ve kendi siparişi değilse erişimi engelle
        if (!req.user.isAdmin && order.user._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Bu siparişi görüntüleme yetkiniz yok' });
        }
        
        res.json(order);
    } catch (error) {
        next(error);
    }
});

// Yeni sipariş oluştur
router.post('/', authenticateToken, async (req, res, next) => {
    try {
        const { 
            orderItems, 
            shippingAddress, 
            paymentMethod, 
            shippingPrice, 
            taxPrice, 
            totalPrice 
        } = req.body;
        
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Sipariş öğeleri bulunamadı' });
        }
        
        // Sipariş oluştur
        const order = new Order({
            orderItems,
            user: req.user.userId,
            shippingAddress,
            paymentMethod,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: paymentMethod === 'Kredi Kartı', // Kredi kartı ödemesi hemen onaylanır
            paidAt: paymentMethod === 'Kredi Kartı' ? Date.now() : null
        });
        
        const createdOrder = await order.save();
        
        res.status(201).json(createdOrder);
    } catch (error) {
        next(error);
    }
});

// Sipariş durumunu güncelle - Sadece admin
router.put('/:id/status', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Sipariş durumu belirtilmedi' });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        // Sipariş durumunu güncelle
        order.status = status;
        
        // Kargo verildi olarak işaretlendiyse
        if (status === 'Kargoya Verildi') {
            order.isDelivered = false;
        } 
        // Teslim edildi olarak işaretlendiyse
        else if (status === 'Teslim Edildi') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        const updatedOrder = await order.save();
        
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
});

// Ödeme durumunu güncelle - Sadece admin
router.put('/:id/pay', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        // Ödeme durumunu güncelle
        order.isPaid = true;
        order.paidAt = Date.now();
        
        const updatedOrder = await order.save();
        
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
});

// Sipariş notlarını güncelle - Sadece admin
router.put('/:id/notes', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const { notes } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        
        // Notları güncelle
        order.notes = notes;
        
        const updatedOrder = await order.save();
        
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 