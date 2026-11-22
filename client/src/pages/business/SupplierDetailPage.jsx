import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Store, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  ArrowLeft, 
  ShoppingCart, 
  Boxes, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart state: { [productId]: quantity }
  const [cart, setCart] = useState({});
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    fetchSupplierDetails();
  }, [supplierId]);

  const fetchSupplierDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/suppliers/${supplierId}`);
      setSupplier(res.data?.supplier || null);
      setProducts(res.data?.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load supplier details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (productId, qty) => {
    const val = Math.max(0, Number(qty) || 0);
    if (val === 0) {
      const updated = { ...cart };
      delete updated[productId];
      setCart(updated);
    } else {
      setCart({ ...cart, [productId]: val });
    }
    if (orderError) setOrderError('');
  };

  // Calculate cart line items and total amount
  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const prod = products.find(p => p._id === productId);
      if (!prod) return null;
      return {
        product: prod,
        quantity,
        lineTotal: Number((quantity * prod.price).toFixed(2))
      };
    })
    .filter(Boolean);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (cartItems.length === 0) {
      setOrderError('Your order cart is empty. Please select quantities for at least one product.');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const payload = {
        supplierId,
        items: cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        notes: orderNotes.trim()
      };

      const res = await api.post('/orders', payload);
      const createdOrder = res.data.order;
      // Navigate to the order details / invoice page
      navigate(`/business/orders/${createdOrder._id}`);
    } catch (err) {
      setOrderError(err.message || 'Failed to submit purchase order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Store size={44} className="empty-state-icon" />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Supplier Not Found</h3>
        <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {error || 'This supplier is not currently active or available in the marketplace.'}
        </p>
        <Link to="/business/marketplace" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/business/marketplace" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Supplier Profile Header Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div className="stat-icon primary" style={{ width: '54px', height: '54px' }}>
              <Store size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {supplier.businessName}
                </h1>
                <span className="badge badge-approved">
                  <CheckCircle size={13} />
                  <span>Verified Merchant</span>
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', maxWidth: '640px', lineHeight: 1.5 }}>
                {supplier.description || 'Verified wholesale distributor providing food ingredients.'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="var(--primary-600)" />
                  <span>{supplier.address}, {supplier.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="var(--primary-600)" />
                  <span>Contact: {supplier.contactPerson}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="var(--primary-600)" />
                  <span>{supplier.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Creation Layout (Products Table on Left, Order Cart on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px', alignItems: 'start' }}>
        {/* Products Catalogue */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              Select Products to Order
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Enter quantities for the items you wish to purchase
            </p>
          </div>

          {products.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Boxes size={44} className="empty-state-icon" />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Active Products</h3>
                <p style={{ marginTop: '4px', fontSize: '14px' }}>
                  This supplier does not have any active products available for purchase right now.
                </p>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th style={{ width: '150px' }}>Order Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => {
                    const currentQty = cart[prod._id] || '';
                    return (
                      <tr key={prod._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{prod.name}</div>
                          {prod.description && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {prod.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-category">{prod.category}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-700)' }}>
                            ₹{prod.price.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}> / {prod.unit}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={`0 ${prod.unit}`}
                              className="form-control"
                              style={{ width: '90px', padding: '6px 10px', fontSize: '13px' }}
                              value={currentQty}
                              onChange={(e) => handleQuantityChange(prod._id, e.target.value)}
                            />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prod.unit}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Floating Order Cart Summary Card */}
        <div className="card" style={{ position: 'sticky', top: '88px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <ShoppingCart size={20} color="var(--primary-600)" />
            <h3 className="card-title" style={{ fontSize: '17px' }}>Purchase Order Cart</h3>
          </div>

          {orderError && (
            <div className="alert alert-danger" style={{ marginBottom: '16px', padding: '10px 14px', fontSize: '13px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <div>{orderError}</div>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <ShoppingCart size={32} color="var(--text-light)" style={{ margin: '0 auto 8px auto' }} />
              <div>No items selected yet.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Enter quantities in the table to build your order.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                {cartItems.map((item) => (
                  <div key={item.product._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.product.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.quantity} {item.product.unit} &times; ₹{item.product.price}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                        ₹{item.lineTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.product._id, 0)}
                        className="btn-icon"
                        style={{ padding: '4px' }}
                        title="Remove"
                      >
                        <Trash2 size={13} color="var(--danger-text)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Notes / Instructions */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>
                  Delivery Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  className="form-control"
                  style={{ fontSize: '13px' }}
                  placeholder="e.g. Please deliver before 10 AM, unload at back dock"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              {/* Order Total Breakdown */}
              <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Items Count:</span>
                  <span>{cartItems.length} items</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>Total Amount:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-700)' }}>
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '14px' }}
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Purchase Order</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
