const express = require('express');
const router = express.Router();
const {
  recordStockMovement,
  getStockMovements,
  getStockMovementById
} = require('../controllers/stockMovementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('business'));

router.post('/', recordStockMovement);
router.get('/', getStockMovements);
router.get('/:id', getStockMovementById);

module.exports = router;
