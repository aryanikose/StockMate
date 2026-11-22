const InventoryItem = require('../models/InventoryItem');
const StockMovement = require('../models/StockMovement');
const Business = require('../models/Business');

// Helper to get authenticated user's business
const getOwnerBusiness = async (userId) => {
  return await Business.findOne({ owner: userId });
};

// @desc    Add New Inventory Item
// @route   POST /api/inventory
// @access  Private (Role: business)
exports.createInventoryItem = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your business profile before managing inventory.'
      });
    }

    const { name, category, unit, currentQuantity = 0, minimumQuantity = 0, description } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, unit.'
      });
    }

    const qty = Number(currentQuantity) || 0;
    const minQty = Number(minimumQuantity) || 0;

    if (qty < 0 || minQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantities cannot be negative.'
      });
    }

    // Check duplicate name within this business
    const existingItem = await InventoryItem.findOne({
      business: business._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: `An inventory item named "${name}" already exists in your inventory.`
      });
    }

    const item = await InventoryItem.create({
      business: business._id,
      name: name.trim(),
      category,
      unit,
      currentQuantity: qty,
      minimumQuantity: minQty,
      description: description || '',
      isActive: true
    });

    // If initial stock was provided, log an initial StockMovement record
    if (qty > 0) {
      await StockMovement.create({
        business: business._id,
        inventoryItem: item._id,
        movementType: 'IN',
        quantity: qty,
        reason: 'Initial Stock Entry',
        note: 'Added when item was created',
        createdBy: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Inventory Items with Filtering & Statistics
// @route   GET /api/inventory
// @access  Private (Role: business)
exports.getInventoryItems = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          stats: { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 }
        }
      });
    }

    const { search, category, status, activeOnly = 'true' } = req.query;

    const filter = { business: business._id };

    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Status filter using MongoDB $expr
    if (status === 'out_of_stock') {
      filter.currentQuantity = 0;
    } else if (status === 'low_stock') {
      filter.$expr = {
        $and: [
          { $gt: ['$currentQuantity', 0] },
          { $lte: ['$currentQuantity', '$minimumQuantity'] }
        ]
      };
    } else if (status === 'in_stock') {
      filter.$expr = {
        $gt: ['$currentQuantity', '$minimumQuantity']
      };
    }

    const items = await InventoryItem.find(filter).sort({ name: 1 });

    // Aggregate statistics across all active items for this business
    const allActiveItems = await InventoryItem.find({ business: business._id, isActive: true });
    const stats = {
      total: allActiveItems.length,
      inStock: allActiveItems.filter(i => i.currentQuantity > i.minimumQuantity).length,
      lowStock: allActiveItems.filter(i => i.currentQuantity > 0 && i.currentQuantity <= i.minimumQuantity).length,
      outOfStock: allActiveItems.filter(i => i.currentQuantity === 0).length
    };

    res.status(200).json({
      success: true,
      count: items.length,
      data: {
        items,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Inventory Item Details
// @route   GET /api/inventory/:id
// @access  Private (Role: business)
exports.getInventoryItemById = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const item = await InventoryItem.findOne({
      _id: req.params.id,
      business: business._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Get recent stock movements for this item
    const recentMovements = await StockMovement.find({
      inventoryItem: item._id,
      business: business._id
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: {
        item,
        recentMovements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Inventory Item (Threshold, Name, Category)
// @route   PUT /api/inventory/:id
// @access  Private (Role: business)
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const item = await InventoryItem.findOne({
      _id: req.params.id,
      business: business._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const { name, category, minimumQuantity, description } = req.body;

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (description !== undefined) item.description = description;
    if (minimumQuantity !== undefined) {
      const minQty = Number(minimumQuantity);
      if (minQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimum threshold cannot be negative.'
        });
      }
      item.minimumQuantity = minQty;
    }

    // Notice: currentQuantity is NOT updated here directly!
    // All quantity changes MUST go through Stock IN, Stock OUT, or Stock Adjustments.

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate Inventory Item (Soft Delete)
// @route   PATCH /api/inventory/:id/deactivate
// @access  Private (Role: business)
exports.deactivateInventoryItem = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const item = await InventoryItem.findOne({
      _id: req.params.id,
      business: business._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    item.isActive = false;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Item "${item.name}" deactivated successfully`,
      data: { item }
    });
  } catch (error) {
    next(error);
  }
};
