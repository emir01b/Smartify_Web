const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getOrderStats,
  updateOrderStatus,
  updateOrderNotes,
} = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.route('/').post(authenticateToken, addOrderItems).get(authenticateToken, isAdmin, getOrders);
router.route('/myorders').get(authenticateToken, getMyOrders);
router.route('/stats').get(authenticateToken, isAdmin, getOrderStats);
router.route('/:id').get(authenticateToken, getOrderById);
router.route('/:id/pay').put(authenticateToken, updateOrderToPaid);
router.route('/:id/deliver').put(authenticateToken, isAdmin, updateOrderToDelivered);
router.route('/:id/status').put(authenticateToken, isAdmin, updateOrderStatus);
router.route('/:id/notes').put(authenticateToken, isAdmin, updateOrderNotes);

module.exports = router; 