const express = require('express');
const router = express.Router();
const {
  createOrUpdateProfile,
  getMyProfile,
  getApprovedSuppliers,
  getSupplierById
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Supplier self-profile routes
router.post('/profile', authorize('supplier'), createOrUpdateProfile);
router.put('/profile', authorize('supplier'), createOrUpdateProfile);
router.get('/profile/me', authorize('supplier'), getMyProfile);

// Business marketplace browsing
router.get('/', authorize('business', 'admin'), getApprovedSuppliers);
router.get('/:id', getSupplierById);

module.exports = router;
