const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require('../controller/cartController');
const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.post('/sync', syncCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
