const express = require('express');
const router = express.Router();
const {
  createBusiness,
  getMyBusiness,
  updateMyBusiness
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/auth');

// All business routes require user authentication and 'business' role
router.use(protect);
router.use(authorize('business'));

router.post('/', createBusiness);
router.get('/me', getMyBusiness);
router.put('/me', updateMyBusiness);

module.exports = router;
