const StockMovement = require('../models/StockMovement');
const InventoryItem = require('../models/InventoryItem');
const Business = require('../models/Business');

// Helper to get authenticated user's business
const getOwnerBusiness = async (userId) => {
  return await Business.findOne({ owner: userId });
};

// @desc    Record a Stock Movement (IN, OUT, or ADJUSTMENT)
// @route   POST /api/stock-movements
// @access  Private (Role: business)
exports.recordStockMovement = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your business profile before managing stock.'
      });
    }

    const { inventoryItemId, actionType, quantity, newQuantity, reason, note } = req.body;

    if (!inventoryItemId || !actionType) {
      return res.status(400).json({
        success: false,
        message: 'inventoryItemId and actionType (IN, OUT, ADJUSTMENT) are required.'
      });
    }

    const item = await InventoryItem.findOne({
      _id: inventoryItemId,
      business: business._id,
      isActive: true
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found or is deactivated.'
      });
    }

    let movementType;
    let deltaQuantity;
    let movementReason = reason;

    // Handle 3 Action Types:
    if (actionType === 'IN') {
      const qty = Number(quantity);
      if (!qty || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Received quantity for Stock IN must be greater than zero.'
        });
      }
      if (!movementReason) movementReason = 'Supplier Delivery Received';

      movementType = 'IN';
      deltaQuantity = qty;

      // Atomically increment item quantity
      item.currentQuantity += qty;
      await item.save();

    } else if (actionType === 'OUT') {
      const qty = Number(quantity);
      if (!qty || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Removed quantity for Stock OUT must be greater than zero.'
        });
      }
      if (!movementReason) movementReason = 'Kitchen Consumption';

      // Concurrency-safe atomic check and decrement
      const updatedItem = await InventoryItem.findOneAndUpdate(
        {
          _id: item._id,
          business: business._id,
          currentQuantity: { $gte: qty } // Ensures non-negative stock constraint
        },
        { $inc: { currentQuantity: -qty } },
        { new: true }
      );

      if (!updatedItem) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock available. Current balance is ${item.currentQuantity} ${item.unit}, but tried to remove ${qty} ${item.unit}.`
        });
      }

      movementType = 'OUT';
      deltaQuantity = qty;
      item.currentQuantity = updatedItem.currentQuantity;

    } else if (actionType === 'ADJUSTMENT') {
      const targetQty = Number(newQuantity);
      if (isNaN(targetQty) || targetQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'New physical count cannot be negative.'
        });
      }
      if (!movementReason) movementReason = 'Physical Stock Audit';

      const difference = targetQty - item.currentQuantity;

      if (difference === 0) {
        return res.status(400).json({
          success: false,
          message: 'The entered quantity matches existing stock count. No adjustment needed.'
        });
      }

      if (difference > 0) {
        movementType = 'ADJUSTMENT_INCREASE';
        deltaQuantity = difference;
      } else {
        movementType = 'ADJUSTMENT_DECREASE';
        deltaQuantity = Math.abs(difference);
      }

      item.currentQuantity = targetQty;
      await item.save();

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid actionType. Must be IN, OUT, or ADJUSTMENT.'
      });
    }

    // Record immutable StockMovement ledger entry
    const movement = await StockMovement.create({
      business: business._id,
      inventoryItem: item._id,
      movementType,
      quantity: deltaQuantity,
      reason: movementReason,
      note: note || '',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: `Stock ${movementType} recorded successfully`,
      data: {
        movement,
        updatedItem: {
          _id: item._id,
          name: item.name,
          currentQuantity: item.currentQuantity,
          unit: item.unit,
          stockStatus: item.stockStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Movements History with Filters
// @route   GET /api/stock-movements
// @access  Private (Role: business)
exports.getStockMovements = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(200).json({ success: true, count: 0, data: { movements: [] } });
    }

    const { itemId, movementType, startDate, endDate } = req.query;

    const query = { business: business._id };

    if (itemId) {
      query.inventoryItem = itemId;
    }

    if (movementType && movementType !== 'ALL') {
      query.movementType = movementType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .populate('inventoryItem', 'name unit category')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: movements.length,
      data: { movements }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Stock Movement Details
// @route   GET /api/stock-movements/:id
// @access  Private (Role: business)
exports.getStockMovementById = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const movement = await StockMovement.findOne({
      _id: req.params.id,
      business: business._id
    })
      .populate('inventoryItem', 'name unit category')
      .populate('createdBy', 'name email');

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Stock movement record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { movement }
    });
  } catch (error) {
    next(error);
  }
};
