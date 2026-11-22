import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ShoppingCart, 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  ArrowLeft, 
  Package, 
  ArrowDownLeft, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data?.order || null);
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to load purchase order' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!window.confirm('Confirm that all items in this order have physically arrived at your business?')) {
      return;
    }

    try {
      setIsConfirming(true);
      const res = await api.post(`/orders/${orderId}/confirm-delivery`);
      setNotification({ type: 'success', text: res.message });
      fetchOrder();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to confirm delivery' });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this purchase order?')) {
      return;
    }

    try {
      setIsCancelling(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
      setNotification({ type: 'warning', text: res.message || 'Order has been cancelled.' });
      fetchOrder();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to cancel order' });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <ShoppingCart size={44} className="empty-state-icon" />
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Order Not Found</h3>
        <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
          This purchase order does not exist or you do not have permission to view it.
        </p>
        <Link to="/business/orders" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  // Visual Lifecycle Progress
  const stages = ['pending', 'accepted', 'dispatched', 'delivered'];
  const currentStageIndex = stages.indexOf(order.status);
  const isCancelledOrRejected = order.status === 'cancelled' || order.status === 'rejected';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/business/orders" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>{notification.text}</div>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                {order.orderNumber}
              </h1>
              <span className={`badge ${order.status === 'delivered' ? 'badge-delivered' : order.status === 'dispatched' ? 'badge-pending' : order.status === 'accepted' ? 'badge-accepted' : isCancelledOrRejected ? 'badge-rejected' : 'badge-pending'}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Order Placed on {new Date(order.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Total Order Value</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-700)' }}>
              ₹{order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Status Lifecycle Progress Bar */}
        {!isCancelledOrRejected ? (
          <div style={{ padding: '20px 10px 10px 10px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {stages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? 'var(--primary-600)' : '#e2e8f0',
                      color: isPassed ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      boxShadow: isCurrent ? '0 0 0 4px var(--primary-100)' : 'none',
                      transition: 'var(--transition)'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary-700)' : 'var(--text-muted)', marginTop: '8px', textTransform: 'capitalize' }}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="alert alert-danger" style={{ marginBottom: 0 }}>
            <XCircle size={18} style={{ flexShrink: 0 }} />
            <div>This purchase order has been marked as <strong>{order.status}</strong>.</div>
          </div>
        )}
      </div>

      {/* Delivery Confirmation Action Callout */}
      {order.status === 'dispatched' && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--primary-50)', borderColor: 'var(--primary-100)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="stat-icon primary">
                <Truck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary-700)' }}>
                  Supplies Dispatched & En Route!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  The supplier has prepared and dispatched your order. Confirm below when the shipment arrives at your kitchen.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmDelivery}
              className="btn btn-primary"
              disabled={isConfirming}
              style={{ minWidth: '180px' }}
            >
              {isConfirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Confirm Delivery Arrival</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delivered Shortcut to Stock IN */}
      {order.status === 'delivered' && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={22} color="var(--primary-700)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-700)' }}>
                  Delivery Confirmed on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Today'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Per food safety guidelines, log the inspected received quantities into your inventory via Stock IN.
                </div>
              </div>
            </div>

            <Link to="/business/inventory" className="btn btn-primary btn-sm">
              <ArrowDownLeft size={15} />
              <span>Record Received Stock IN</span>
            </Link>
          </div>
        </div>
      )}

      {/* Supplier & Delivery Address Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={18} color="var(--primary-600)" />
            <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Wholesale Supplier</h4>
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)' }}>
            {order.supplier?.businessName}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Contact: {order.supplier?.contactPerson}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Phone: {order.supplier?.phone}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {order.supplier?.address}, {order.supplier?.city}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MapPin size={18} color="var(--primary-600)" />
            <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Delivery Destination</h4>
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)' }}>
            {order.business?.businessName}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Kitchen Address: {order.business?.address}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            City: {order.business?.city}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Phone: {order.business?.phone}
          </div>
        </div>
      </div>

      {/* Snapshot Items Table */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="card-title">Order Items Breakdown</h3>
            <p className="card-subtitle">Frozen point-in-time pricing agreed at time of order submission</p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Agreed Unit Rate</th>
                <th style={{ textAlign: 'right' }}>Line Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{item.quantity} {item.unit}</span>
                  </td>
                  <td>
                    <span>₹{item.unitPrice.toFixed(2)} / {item.unit}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 800, fontSize: '16px', borderTop: '2px solid var(--border-light)' }}>
                  Total Invoice Amount:
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '18px', color: 'var(--primary-700)', borderTop: '2px solid var(--border-light)' }}>
                  ₹{order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {order.notes && (
          <div style={{ marginTop: '20px', padding: '14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
            <strong>Delivery Notes:</strong> {order.notes}
          </div>
        )}
      </div>

      {/* Cancellation Option */}
      {(order.status === 'pending' || order.status === 'accepted') && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            onClick={handleCancelOrder}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
            disabled={isCancelling}
          >
            <XCircle size={15} />
            <span>Cancel Purchase Order</span>
          </button>
        </div>
      )}
    </div>
  );
}
