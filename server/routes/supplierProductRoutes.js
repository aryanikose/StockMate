const express = require('express');
const router = express.Router();
const {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  toggleAvailability,
  getMarketplaceProducts
} = require('../controllers/supplierProductController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Marketplace product search (business & admin)
router.get('/marketplace', authorize('business', 'admin'), getMarketplaceProducts);

// Supplier catalogue management (supplier only)
router.post('/', authorize('supplier'), createProduct);
router.get('/', authorize('supplier'), getMyProducts);
router.get('/:id', getProductById);
router.put('/:id', authorize('supplier'), updateProduct);
router.patch('/:id/availability', authorize('supplier'), toggleAvailability);

module.exports = router;
