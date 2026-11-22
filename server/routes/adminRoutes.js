const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingSuppliers,
  approveSupplier,
  rejectSupplier,
  getAllUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes strictly require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/suppliers/pending', getPendingSuppliers);
router.patch('/suppliers/:id/approve', approveSupplier);
router.patch('/suppliers/:id/reject', rejectSupplier);

module.exports = router;
