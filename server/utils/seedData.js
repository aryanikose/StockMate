const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Business = require('../models/Business');
const SupplierProfile = require('../models/SupplierProfile');
const InventoryItem = require('../models/InventoryItem');
const StockMovement = require('../models/StockMovement');
const SupplierProduct = require('../models/SupplierProduct');
const PurchaseOrder = require('../models/PurchaseOrder');

const seedData = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB at', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed]: Connected successfully!');

    // Clean existing business & supplier collections (preserves admin if desired)
    console.log('[Seed]: Clearing existing operational records...');
    await Business.deleteMany({});
    await SupplierProfile.deleteMany({});
    await InventoryItem.deleteMany({});
    await StockMovement.deleteMany({});
    await SupplierProduct.deleteMany({});
    await PurchaseOrder.deleteMany({});
    // Remove non-admin users
    await User.deleteMany({ role: { $ne: 'admin' } });

    console.log('[Seed]: Creating user accounts...');

    // 1. Food Business Owners
    const marco = await User.create({
      name: 'Marco Rossi',
      email: 'owner@bellaitalia.com',
      phone: '+91-98200-11223',
      password: 'Password123!',
      role: 'business'
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@dailygrind.com',
      phone: '+91-98201-99887',
      password: 'Password123!',
      role: 'business'
    });

    // 2. Wholesale Suppliers
    const vikram = await User.create({
      name: 'Vikram Patel',
      email: 'orders@metrofarms.com',
      phone: '+91-99300-44556',
      password: 'Password123!',
      role: 'supplier'
    });

    const rajesh = await User.create({
      name: 'Rajesh Mehta',
      email: 'sales@primesupplies.com',
      phone: '+91-98199-77665',
      password: 'Password123!',
      role: 'supplier'
    });

    const anita = await User.create({
      name: 'Anita Desai',
      email: 'anita@greenvalley.com',
      phone: '+91-97000-88112',
      password: 'Password123!',
      role: 'supplier'
    });

    console.log('[Seed]: Creating Business Profiles...');
    const bellaItalia = await Business.create({
      owner: marco._id,
      businessName: 'Bella Italia Trattoria',
      businessType: 'Restaurant',
      address: '12 Hill Road, Bandra West',
      city: 'Mumbai',
      phone: '+91-98200-11223'
    });

    const dailyGrind = await Business.create({
      owner: priya._id,
      businessName: 'The Daily Grind Cafe',
      businessType: 'Cafe',
      address: '45 Linking Road, Khar West',
      city: 'Mumbai',
      phone: '+91-98201-99887'
    });

    console.log('[Seed]: Creating Supplier Profiles...');
    const metroFarms = await SupplierProfile.create({
      user: vikram._id,
      businessName: 'Metro Farm Fresh & Dairy',
      contactPerson: 'Vikram Patel',
      address: 'Wholesale APMC Market, Vashi, Sector 19',
      city: 'Mumbai',
      phone: '+91-99300-44556',
      description: 'Direct-from-farm organic vegetables, fresh dairy, and artisanal cheeses for restaurants.',
      verificationStatus: 'approved'
    });

    const primeSupplies = await SupplierProfile.create({
      user: rajesh._id,
      businessName: 'Prime Baker & Kitchen Supplies',
      contactPerson: 'Rajesh Mehta',
      address: 'Gala 14, Industrial Estate, Andheri East',
      city: 'Mumbai',
      phone: '+91-98199-77665',
      description: 'Wholesale bakery flours, barista coffee beans, food-grade packaging and essential spices.',
      verificationStatus: 'approved'
    });

    const greenValley = await SupplierProfile.create({
      user: anita._id,
      businessName: 'Green Valley Agro Imports',
      contactPerson: 'Anita Desai',
      address: 'Plot 42, Food Park, MIDC, Bhosari',
      city: 'Pune',
      phone: '+91-97000-88112',
      description: 'Importer of hydroponic greens, exotic microgreens, and gourmet baking ingredients.',
      verificationStatus: 'pending' // Perfect for Admin verification queue!
    });

    console.log('[Seed]: Creating Supplier Product Catalogues...');
    // Metro Farms Products
    const prodTomatoes = await SupplierProduct.create({
      supplier: metroFarms._id,
      name: 'Roma Vine Tomatoes',
      category: 'Vegetables',
      unit: 'kg',
      price: 38.00,
      description: 'Farm-ripened firm Roma tomatoes ideal for sauces, soups, and pizza toppings.',
      isAvailable: true
    });

    const prodMozzarella = await SupplierProduct.create({
      supplier: metroFarms._id,
      name: 'Buffalo Milk Mozzarella',
      category: 'Dairy',
      unit: 'kg',
      price: 420.00,
      description: 'High moisture fresh mozzarella cheese ball vacuum-sealed for maximum freshness.',
      isAvailable: true
    });

    const prodBasil = await SupplierProduct.create({
      supplier: metroFarms._id,
      name: 'Fresh Sweet Basil',
      category: 'Vegetables',
      unit: 'g',
      price: 1.50,
      description: 'Hydroponic sweet Italian basil leaves harvested daily.',
      isAvailable: true
    });

    const prodMilk = await SupplierProduct.create({
      supplier: metroFarms._id,
      name: 'Whole Farm Fresh Milk',
      category: 'Dairy',
      unit: 'litre',
      price: 55.00,
      description: 'Pasteurized whole milk (4.5% fat) perfect for barista steaming and cooking.',
      isAvailable: true
    });

    const prodOliveOil = await SupplierProduct.create({
      supplier: metroFarms._id,
      name: 'Extra Virgin Olive Oil 5L',
      category: 'Oils',
      unit: 'litre',
      price: 650.00,
      description: 'Cold-pressed extra virgin olive oil with low acidity (< 0.3%).',
      isAvailable: true
    });

    const prodMushrooms = await SupplierProduct.create({
      supplier: metroFarms._id,
      name: 'Button Mushrooms',
      category: 'Vegetables',
      unit: 'kg',
      price: 140.00,
      description: 'Fresh white button mushrooms, unwashed and dirt-free.',
      isAvailable: false // Temporarily unavailable
    });

    // Prime Supplies Products
    const prodFlour = await SupplierProduct.create({
      supplier: primeSupplies._id,
      name: "Premium '00' Pizza Flour",
      category: 'Grains and Cereals',
      unit: 'kg',
      price: 62.00,
      description: 'High-protein Italian-style milled wheat flour (W 300) for authentic napoletana crusts.',
      isAvailable: true
    });

    const prodPizzaBoxes = await SupplierProduct.create({
      supplier: primeSupplies._id,
      name: 'Kraft Pizza Boxes 10-inch',
      category: 'Packaging',
      unit: 'pieces',
      price: 14.00,
      description: 'Eco-friendly corrugated food-safe pizza take-out boxes.',
      isAvailable: true
    });

    const prodCoffeeBeans = await SupplierProduct.create({
      supplier: primeSupplies._id,
      name: 'Espresso Roast Arabica Beans',
      category: 'Beverages',
      unit: 'kg',
      price: 850.00,
      description: '100% Arabica shade-grown Chikmagalur coffee beans with dark chocolate and nutty notes.',
      isAvailable: true
    });

    const prodCoffeeCups = await SupplierProduct.create({
      supplier: primeSupplies._id,
      name: 'Single-Wall Coffee Cups & Lids',
      category: 'Packaging',
      unit: 'pieces',
      price: 6.50,
      description: '250ml hot takeaway cups with matching travel sip lids.',
      isAvailable: true
    });

    const prodPepper = await SupplierProduct.create({
      supplier: primeSupplies._id,
      name: 'Tellicherry Black Peppercorns',
      category: 'Spices',
      unit: 'g',
      price: 1.80,
      description: 'Grade TGSEB fragrant sun-dried whole black peppercorns.',
      isAvailable: true
    });

    console.log('[Seed]: Creating Inventory Items for Bella Italia Trattoria...');
    // In Stock
    const itemFlour = await InventoryItem.create({
      business: bellaItalia._id,
      name: "Type '00' Pizza Flour",
      category: 'Grains and Cereals',
      unit: 'kg',
      currentQuantity: 45,
      minimumQuantity: 20,
      description: 'Primary dough flour'
    });

    const itemOliveOil = await InventoryItem.create({
      business: bellaItalia._id,
      name: 'Extra Virgin Olive Oil',
      category: 'Oils',
      unit: 'litre',
      currentQuantity: 14,
      minimumQuantity: 5,
      description: 'Cooking and dressing oil'
    });

    const itemBoxes = await InventoryItem.create({
      business: bellaItalia._id,
      name: '10-inch Pizza Takeout Boxes',
      category: 'Packaging',
      unit: 'pieces',
      currentQuantity: 120,
      minimumQuantity: 40,
      description: 'Packaging for deliveries'
    });

    // Low Stock (Alert Condition!)
    const itemTomatoes = await InventoryItem.create({
      business: bellaItalia._id,
      name: 'Roma Vine Tomatoes',
      category: 'Vegetables',
      unit: 'kg',
      currentQuantity: 4,
      minimumQuantity: 12,
      description: 'Essential pizza sauce tomato base'
    });

    const itemMozzarella = await InventoryItem.create({
      business: bellaItalia._id,
      name: 'Whole Milk Mozzarella',
      category: 'Dairy',
      unit: 'kg',
      currentQuantity: 3,
      minimumQuantity: 8,
      description: 'Pizza cheese shreds'
    });

    // Out of Stock (Critical Alert!)
    const itemBasil = await InventoryItem.create({
      business: bellaItalia._id,
      name: 'Fresh Italian Basil',
      category: 'Vegetables',
      unit: 'g',
      currentQuantity: 0,
      minimumQuantity: 250,
      description: 'Garnish for Margherita pizzas'
    });

    console.log('[Seed]: Creating Stock Movements (Audit Trail)...');
    await StockMovement.create({
      business: bellaItalia._id,
      inventoryItem: itemFlour._id,
      movementType: 'IN',
      quantity: 50,
      reason: 'Wholesale Supplier Delivery Received',
      note: '50kg bag unloaded from Prime Supplies truck',
      createdBy: marco._id
    });

    await StockMovement.create({
      business: bellaItalia._id,
      inventoryItem: itemFlour._id,
      movementType: 'OUT',
      quantity: 5,
      reason: 'Kitchen Consumption',
      note: 'Morning pizza dough batch prep',
      createdBy: marco._id
    });

    await StockMovement.create({
      business: bellaItalia._id,
      inventoryItem: itemTomatoes._id,
      movementType: 'OUT',
      quantity: 8,
      reason: 'Kitchen Consumption',
      note: 'Marinara sauce simmered for evening service',
      createdBy: marco._id
    });

    await StockMovement.create({
      business: bellaItalia._id,
      inventoryItem: itemTomatoes._id,
      movementType: 'OUT',
      quantity: 2,
      reason: 'Spoilage',
      note: 'Bruised and moldy produce discarded during prep',
      createdBy: marco._id
    });

    await StockMovement.create({
      business: bellaItalia._id,
      inventoryItem: itemBasil._id,
      movementType: 'ADJUSTMENT_DECREASE',
      quantity: 150,
      reason: 'Physical Inventory Count Reconciliation',
      note: 'Wilted basil leaves removed during weekly audit',
      createdBy: marco._id
    });

    console.log('[Seed]: Creating Inventory Items for The Daily Grind Cafe...');
    await InventoryItem.create({
      business: dailyGrind._id,
      name: 'Arabica Espresso Beans',
      category: 'Beverages',
      unit: 'kg',
      currentQuantity: 15,
      minimumQuantity: 5,
      description: 'House espresso blend'
    });

    await InventoryItem.create({
      business: dailyGrind._id,
      name: 'Barista Whole Milk',
      category: 'Dairy',
      unit: 'litre',
      currentQuantity: 6,
      minimumQuantity: 25, // LOW STOCK
      description: 'Steaming milk for lattes and cappuccinos'
    });

    await InventoryItem.create({
      business: dailyGrind._id,
      name: 'Oat Milk Barista Edition',
      category: 'Dairy',
      unit: 'litre',
      currentQuantity: 0,
      minimumQuantity: 10, // OUT OF STOCK
      description: 'Vegan alternative dairy'
    });

    await InventoryItem.create({
      business: dailyGrind._id,
      name: 'Takeaway Coffee Cups 250ml',
      category: 'Packaging',
      unit: 'pieces',
      currentQuantity: 350,
      minimumQuantity: 100,
      description: 'Hot drink cups'
    });

    console.log('[Seed]: Creating Realistic Purchase Orders...');
    // PO 1: Dispatched Order (Ready for Marco to click "Confirm Delivery Arrival")
    await PurchaseOrder.create({
      orderNumber: 'PO-2026-104921',
      business: bellaItalia._id,
      supplier: metroFarms._id,
      items: [
        {
          product: prodTomatoes._id,
          name: prodTomatoes.name,
          unit: prodTomatoes.unit,
          quantity: 10,
          unitPrice: prodTomatoes.price,
          lineTotal: 380.00
        },
        {
          product: prodMozzarella._id,
          name: prodMozzarella.name,
          unit: prodMozzarella.unit,
          quantity: 5,
          unitPrice: prodMozzarella.price,
          lineTotal: 2100.00
        }
      ],
      totalAmount: 2480.00,
      status: 'dispatched',
      notes: 'Please deliver at rear kitchen dock before 11:00 AM'
    });

    // PO 2: Pending Order (Awaiting Vikram at Metro Farms to Accept/Reject)
    await PurchaseOrder.create({
      orderNumber: 'PO-2026-773912',
      business: dailyGrind._id,
      supplier: metroFarms._id,
      items: [
        {
          product: prodMilk._id,
          name: prodMilk.name,
          unit: prodMilk.unit,
          quantity: 30,
          unitPrice: prodMilk.price,
          lineTotal: 1650.00
        }
      ],
      totalAmount: 1650.00,
      status: 'pending',
      notes: 'Weekly fresh dairy replenishment'
    });

    // PO 3: Accepted Order (Awaiting Rajesh at Prime Supplies to Mark Dispatched)
    await PurchaseOrder.create({
      orderNumber: 'PO-2026-552189',
      business: dailyGrind._id,
      supplier: primeSupplies._id,
      items: [
        {
          product: prodCoffeeBeans._id,
          name: prodCoffeeBeans.name,
          unit: prodCoffeeBeans.unit,
          quantity: 10,
          unitPrice: prodCoffeeBeans.price,
          lineTotal: 8500.00
        },
        {
          product: prodCoffeeCups._id,
          name: prodCoffeeCups.name,
          unit: prodCoffeeCups.unit,
          quantity: 200,
          unitPrice: prodCoffeeCups.price,
          lineTotal: 1300.00
        }
      ],
      totalAmount: 9800.00,
      status: 'accepted',
      notes: 'Fragile coffee cups - handle with care'
    });

    // PO 4: Delivered Order (Historic completed transaction)
    await PurchaseOrder.create({
      orderNumber: 'PO-2026-339011',
      business: bellaItalia._id,
      supplier: primeSupplies._id,
      items: [
        {
          product: prodFlour._id,
          name: prodFlour.name,
          unit: prodFlour.unit,
          quantity: 50,
          unitPrice: prodFlour.price,
          lineTotal: 3100.00
        },
        {
          product: prodPizzaBoxes._id,
          name: prodPizzaBoxes.name,
          unit: prodPizzaBoxes.unit,
          quantity: 100,
          unitPrice: prodPizzaBoxes.price,
          lineTotal: 1400.00
        }
      ],
      totalAmount: 4500.00,
      status: 'delivered',
      notes: 'First bulk flour order of the month',
      deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    console.log('================================================================');
    console.log(' SEED DATA GENERATED SUCCESSFULLY!');
    console.log('================================================================');
    console.log('FOOD BUSINESS ACCOUNTS:');
    console.log('1. Bella Italia Trattoria (Restaurant, Mumbai)');
    console.log('   Email: owner@bellaitalia.com  |  Password: Password123!');
    console.log('   Stats: 3 in stock, 2 low stock, 1 out of stock');
    console.log('   Orders: 1 Dispatched order (ready to confirm delivery arrival!)');
    console.log('');
    console.log('2. The Daily Grind Cafe (Cafe, Mumbai)');
    console.log('   Email: priya@dailygrind.com    |  Password: Password123!');
    console.log('   Stats: 2 in stock, 1 low stock, 1 out of stock');
    console.log('   Orders: 1 Pending order, 1 Accepted order');
    console.log('----------------------------------------------------------------');
    console.log('WHOLESALE SUPPLIER ACCOUNTS:');
    console.log('1. Metro Farm Fresh & Dairy (Approved Supplier, Mumbai)');
    console.log('   Email: orders@metrofarms.com   |  Password: Password123!');
    console.log('   Products: 6 products (Tomatoes, Mozzarella, Basil, Milk, Olive Oil, etc.)');
    console.log('   Orders: 1 Pending order (to accept/reject), 1 Dispatched');
    console.log('');
    console.log('2. Prime Baker & Kitchen Supplies (Approved Supplier, Mumbai)');
    console.log('   Email: sales@primesupplies.com  |  Password: Password123!');
    console.log('   Products: 5 products (Flour, Pizza Boxes, Coffee Beans, Cups, Pepper)');
    console.log('   Orders: 1 Accepted order (ready to mark dispatched!)');
    console.log('');
    console.log('3. Green Valley Agro Imports (Pending Verification, Pune)');
    console.log('   Email: anita@greenvalley.com   |  Password: Password123!');
    console.log('   Status: "pending" -> Appears in Admin Verification Queue!');
    console.log('----------------------------------------------------------------');
    console.log('ADMINISTRATOR ACCOUNT:');
    console.log('   Email: admin@stockmate.com     |  Password: Admin@StockMate2026');
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
