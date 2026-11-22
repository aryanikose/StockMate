const testWorkflows = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, title) => {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ [PASS] ${title}`);
    } else {
      failedTests++;
      console.error(`  ✗ [FAIL] ${title}`);
    }
  };

  console.log('====================================================');
  console.log('       STOCKMATE AUTOMATED SYSTEM TEST SUITE         ');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('--- 1. Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200 && healthJson.success === true, 'Backend health endpoint returns 200 OK');

    // 2. Authentication: Admin
    console.log('\n--- 2. Authentication & JWT Tokens ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@stockmate.com', password: 'Admin@StockMate2026' })
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginJson.data?.token, 'Admin login returns valid JWT token');
    const adminToken = adminLoginJson.data?.token;

    // Authentication: Business Owner (Bella Italia)
    const bizLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@bellaitalia.com', password: 'Password123!' })
    });
    const bizLoginJson = await bizLoginRes.json();
    assert(bizLoginRes.status === 200 && bizLoginJson.data?.user?.role === 'business', 'Business owner login returns business role');
    const bizToken = bizLoginJson.data?.token;

    // Authentication: Supplier (Metro Farms)
    const supLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'orders@metrofarms.com', password: 'Password123!' })
    });
    const supLoginJson = await supLoginRes.json();
    assert(supLoginRes.status === 200 && supLoginJson.data?.user?.role === 'supplier', 'Supplier login returns supplier role');
    const supToken = supLoginJson.data?.token;

    // 3. Role-Based Access Control (RBAC) & Security Boundaries
    console.log('\n--- 3. Role-Based Access Control (RBAC) Enforcement ---');
    const forbiddenRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${bizToken}` }
    });
    assert(forbiddenRes.status === 403, 'Business user is blocked with 403 Forbidden from accessing Admin routes');

    const supForbiddenRes = await fetch(`${BASE_URL}/inventory`, {
      headers: { Authorization: `Bearer ${supToken}` }
    });
    assert(supForbiddenRes.status === 403, 'Supplier is blocked with 403 Forbidden from accessing Business inventory');

    // 4. Inventory Module & Atomic Calculations
    console.log('\n--- 4. Inventory Management & Atomic Calculations ---');
    const invRes = await fetch(`${BASE_URL}/inventory`, {
      headers: { Authorization: `Bearer ${bizToken}` }
    });
    const invJson = await invRes.json();
    assert(invRes.status === 200 && Array.isArray(invJson.data.items), 'Business can fetch their own inventory items');
    const items = invJson.data.items;
    assert(items.length > 0, `Inventory contains ${items.length} items`);

    const testItem = items.find(i => i.currentQuantity > 5) || items[0];
    const initialQty = testItem.currentQuantity;

    // Stock IN: Add 10 units
    const stockInRes = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bizToken}`
      },
      body: JSON.stringify({
        inventoryItemId: testItem._id,
        actionType: 'IN',
        quantity: 10,
        reason: 'Automated Test Stock IN',
        note: 'Restock verification'
      })
    });
    const stockInJson = await stockInRes.json();
    assert(stockInRes.status === 201 && stockInJson.data?.updatedItem?.currentQuantity === initialQty + 10, 'Stock IN atomically increments quantity');

    // Stock OUT: Deduct 5 units
    const stockOutRes = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bizToken}`
      },
      body: JSON.stringify({
        inventoryItemId: testItem._id,
        actionType: 'OUT',
        quantity: 5,
        reason: 'Kitchen Consumption Test',
        note: 'Deduction verification'
      })
    });
    const stockOutJson = await stockOutRes.json();
    assert(stockOutRes.status === 201 && stockOutJson.data?.updatedItem?.currentQuantity === initialQty + 5, 'Stock OUT atomically decrements quantity');

    // Negative Stock Prevention: Attempt to deduct 999999 units
    const overdrawRes = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bizToken}`
      },
      body: JSON.stringify({
        inventoryItemId: testItem._id,
        actionType: 'OUT',
        quantity: 999999,
        reason: 'Malicious Overdraw Test'
      })
    });
    assert(overdrawRes.status === 400, 'Negative stock prevented: Server rejects deduction greater than available quantity');

    // 5. Stock Movement Ledger Immutability
    console.log('\n--- 5. Stock Movement Audit Trail ---');
    const movementsRes = await fetch(`${BASE_URL}/stock-movements`, {
      headers: { Authorization: `Bearer ${bizToken}` }
    });
    const movementsJson = await movementsRes.json();
    assert(movementsRes.status === 200 && movementsJson.data.movements.length > 0, 'Audit trail records all stock movements with timestamps');

    // 6. Supplier Marketplace & Discovery
    console.log('\n--- 6. Supplier Marketplace & Product Discovery ---');
    const marketRes = await fetch(`${BASE_URL}/supplier-products/marketplace`, {
      headers: { Authorization: `Bearer ${bizToken}` }
    });
    const marketJson = await marketRes.json();
    assert(marketRes.status === 200 && marketJson.data.products.length > 0, 'Business can browse approved wholesale products');

    const products = marketJson.data.products;
    const testProduct = products[0];
    const targetSupplierId = testProduct.supplier._id;

    // 7. Purchase Order Workflow & Price Snapshots
    console.log('\n--- 7. Purchase Order Lifecycle & State Machine ---');
    // Create new order
    const createOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bizToken}`
      },
      body: JSON.stringify({
        supplierId: targetSupplierId,
        items: [{ productId: testProduct._id, quantity: 2 }],
        notes: 'End-to-End Test Purchase Order'
      })
    });
    const createOrderJson = await createOrderRes.json();
    assert(createOrderRes.status === 201 && createOrderJson.data.order.status === 'pending', 'Purchase order created in pending state with server-calculated total');
    const newOrderId = createOrderJson.data.order._id;
    const expectedTotal = Number((2 * testProduct.price).toFixed(2));
    assert(createOrderJson.data.order.totalAmount === expectedTotal, `Price snapshot verified: 2 x ₹${testProduct.price} = ₹${expectedTotal}`);

    // Supplier accepts order
    const acceptOrderRes = await fetch(`${BASE_URL}/orders/${newOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supToken}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    const acceptOrderJson = await acceptOrderRes.json();
    assert(acceptOrderRes.status === 200 && acceptOrderJson.data.order.status === 'accepted', 'Supplier transitions order from pending to accepted');

    // Supplier marks order dispatched
    const dispatchOrderRes = await fetch(`${BASE_URL}/orders/${newOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supToken}`
      },
      body: JSON.stringify({ status: 'dispatched' })
    });
    const dispatchOrderJson = await dispatchOrderRes.json();
    assert(dispatchOrderRes.status === 200 && dispatchOrderJson.data.order.status === 'dispatched', 'Supplier marks accepted order as dispatched');

    // Business confirms delivery
    const confirmDeliveryRes = await fetch(`${BASE_URL}/orders/${newOrderId}/confirm-delivery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizToken}` }
    });
    const confirmDeliveryJson = await confirmDeliveryRes.json();
    assert(confirmDeliveryRes.status === 200 && confirmDeliveryJson.data.order.status === 'delivered', 'Business successfully confirms delivery arrival');

    // State machine check: cannot re-deliver
    const redeliveryRes = await fetch(`${BASE_URL}/orders/${newOrderId}/confirm-delivery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bizToken}` }
    });
    assert(redeliveryRes.status === 400, 'State machine rejects duplicate delivery confirmation on already-delivered order');

    // 8. Admin Verification & Moderation
    console.log('\n--- 8. Admin Verification & Platform Moderation ---');
    const adminPendingRes = await fetch(`${BASE_URL}/admin/suppliers/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminPendingJson = await adminPendingRes.json();
    assert(adminPendingRes.status === 200, 'Admin can view pending supplier verification queue');

    const adminStatsRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminStatsJson = await adminStatsRes.json();
    assert(adminStatsRes.status === 200 && adminStatsJson.data.stats.totalUsers > 0, 'Admin dashboard retrieves live system statistics');

    // Summary
    console.log('\n====================================================');
    console.log(` TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    if (failedTests === 0) {
      console.log(' ALL BUSINESS WORKFLOWS & SECURITY CHECKS VERIFIED! ');
    } else {
      console.error(` ${failedTests} TEST(S) FAILED!`);
    }
    console.log('====================================================\n');

  } catch (err) {
    console.error('Fatal error during test run:', err);
  }
};

testWorkflows();
