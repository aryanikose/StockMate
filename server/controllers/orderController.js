const PurchaseOrder = require('../models/PurchaseOrder');
const SupplierProduct = require('../models/SupplierProduct');
const SupplierProfile = require('../models/SupplierProfile');
const Business = require('../models/Business');

// Helper to generate a unique readable Order Number (e.g. PO-2026-849201)
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `PO-${year}-${randomSuffix}`;
};

// @desc    Create a Purchase Order (Point-in-Time Snapshot)
// @route   POST /api/orders
// @access  Private (Role: business)
exports.createOrder = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your business profile before placing purchase orders.'
      });
    }

    const { supplierId, items, notes } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must specify a supplier and include at least one item.'
      });
    }

    // Verify supplier exists and is approved
    const supplier = await SupplierProfile.findById(supplierId);
    if (!supplier || supplier.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Supplier is currently not available for marketplace orders.'
      });
    }

    // Process each item and build frozen snapshot
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, quantity } = item;
      const numQty = Number(quantity);

      if (!productId || isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid product ID and a positive quantity.'
        });
      }

      // Fetch live product from DB
      const product = await SupplierProduct.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }

      // Enforce product belongs to this supplier
      if (product.supplier.toString() !== supplier._id.toString()) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" does not belong to the selected supplier.`
        });
      }

      // Enforce product availability
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is currently marked as unavailable by the supplier.`
        });
      }

      const unitPrice = product.price;
      const lineTotal = Number((numQty * unitPrice).toFixed(2));
      totalAmount += lineTotal;

      // Frozen snapshot entry
      orderItems.push({
        product: product._id,
        name: product.name,
        unit: product.unit,
        quantity: numQty,
        unitPrice,
        lineTotal
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));

    let orderNumber = generateOrderNumber();
    // Ensure uniqueness
    let existing = await PurchaseOrder.findOne({ orderNumber });
    while (existing) {
      orderNumber = generateOrderNumber();
      existing = await PurchaseOrder.findOne({ orderNumber });
    }

    const order = await PurchaseOrder.create({
      orderNumber,
      business: business._id,
      supplier: supplier._id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: `Purchase Order ${order.orderNumber} placed successfully`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get List of Purchase Orders (Role-Isolated)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const query = {};
    const { status } = req.query;

    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Role Isolation:
    if (req.user.role === 'business') {
      const business = await Business.findOne({ owner: req.user._id });
      if (!business) {
        return res.status(200).json({ success: true, count: 0, data: { orders: [] } });
      }
      query.business = business._id;
    } else if (req.user.role === 'supplier') {
      const supplier = await SupplierProfile.findOne({ user: req.user._id });
      if (!supplier) {
        return res.status(200).json({ success: true, count: 0, data: { orders: [] } });
      }
      query.supplier = supplier._id;
    }
    // Admin sees all orders

    const orders = await PurchaseOrder.find(query)
      .sort({ createdAt: -1 })
      .populate('business', 'businessName businessType city phone address')
      .populate('supplier', 'businessName contactPerson city phone address');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Purchase Order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('business', 'businessName businessType city phone address')
      .populate('supplier', 'businessName contactPerson city phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Ownership Verification
    if (req.user.role === 'business') {
      const business = await Business.findOne({ owner: req.user._id });
      if (!business || order.business._id.toString() !== business._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this purchase order.'
        });
      }
    } else if (req.user.role === 'supplier') {
      const supplier = await SupplierProfile.findOne({ user: req.user._id });
      if (!supplier || order.supplier._id.toString() !== supplier._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This purchase order is not assigned to your supplier account.'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Purchase Order Status (Strict State Machine)
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status: targetStatus } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const currentStatus = order.status;

    // Supplier Transitions
    if (req.user.role === 'supplier') {
      const supplier = await SupplierProfile.findOne({ user: req.user._id });
      if (!supplier || order.supplier.toString() !== supplier._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden. Not your order.' });
      }

      if (currentStatus === 'pending') {
        if (targetStatus === 'accepted' || targetStatus === 'rejected') {
          order.status = targetStatus;
        } else {
          return res.status(400).json({
            success: false,
            message: `A pending order can only be 'accepted' or 'rejected'. Cannot jump to '${targetStatus}'.`
          });
        }
      } else if (currentStatus === 'accepted') {
        if (targetStatus === 'dispatched') {
          order.status = 'dispatched';
        } else {
          return res.status(400).json({
            success: false,
            message: `An accepted order can only be marked as 'dispatched'. Cannot change to '${targetStatus}'.`
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Cannot modify an order that is currently '${currentStatus}'.`
        });
      }

    // Business Transitions
    } else if (req.user.role === 'business') {
      const business = await Business.findOne({ owner: req.user._id });
      if (!business || order.business.toString() !== business._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden. Not your order.' });
      }

      if ((currentStatus === 'pending' || currentStatus === 'accepted') && targetStatus === 'cancelled') {
        order.status = 'cancelled';
      } else {
        return res.status(400).json({
          success: false,
          message: `Business owners can only cancel orders in pending or accepted status. Deliveries must be confirmed via the confirm-delivery action.`
        });
      }
    } else if (req.user.role === 'admin') {
      order.status = targetStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} status updated to '${order.status}'`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm Receipt of Delivered Supplies
// @route   POST /api/orders/:id/confirm-delivery
// @access  Private (Role: business)
exports.confirmDelivery = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(403).json({ success: false, message: 'Business profile required' });
    }

    const order = await PurchaseOrder.findOne({
      _id: req.params.id,
      business: business._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found or does not belong to your business.'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivery has already been confirmed for this purchase order.'
      });
    }

    if (order.status !== 'dispatched') {
      return res.status(400).json({
        success: false,
        message: `Order must be marked as 'dispatched' by the supplier before you can confirm delivery. Current status is '${order.status}'.`
      });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: `Delivery confirmed for Order ${order.orderNumber}. You can now record received quantities into inventory using Stock IN.`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
