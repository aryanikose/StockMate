import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ShoppingCart, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Clock, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null); // id of order being updated
  const [notification, setNotification] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus.toLowerCase();

      const res = await api.get('/orders', { params });
      setOrders(res.data?.orders || []);
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to load supplier orders' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, orderNum, newStatus) => {
    try {
      setActionLoading(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setNotification({ type: 'success', text: `Order ${orderNum} status updated to '${newStatus}'.` });
      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to update order status' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge badge-pending">
            <Clock size={12} />
            <span>Awaiting Action</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="badge badge-accepted">
            <CheckCircle size={12} />
            <span>Accepted / In Prep</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="badge badge-pending" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
            <Truck size={12} />
            <span>Dispatched</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="badge badge-delivered">
            <CheckCircle size={12} />
            <span>Delivered</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="badge badge-rejected">
            <XCircle size={12} />
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </span>
        );
      default:
        return <span className="badge badge-category">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          Incoming Purchase Orders
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Review wholesale order requests, accept or reject jobs, and mark shipments as dispatched
        </p>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification({ type: '', text: '' })} className="btn-icon">
            &times;
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`btn btn-sm ${selectedStatus === st ? 'btn-primary' : 'btn-secondary'}`}
          >
            {st === 'ALL' ? 'All Orders' : st.charAt(0) + st.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-state-icon" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Orders Found</h3>
            <p style={{ marginTop: '6px', fontSize: '14px', maxWidth: '440px', margin: '6px auto 0 auto' }}>
              {selectedStatus === 'ALL'
                ? 'No purchase orders have been submitted to your supplier account yet.'
                : `No orders currently match the '${selectedStatus.toLowerCase()}' status filter.`}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((ord) => (
            <div key={ord._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {ord.orderNumber}
                    </span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Received on {new Date(ord.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Total Order Value</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-700)' }}>
                    ₹{ord.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Business Info Banner */}
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Buyer: </span>
                  <strong>{ord.business?.businessName}</strong> ({ord.business?.businessType})
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery City: </span>
                  <strong>{ord.business?.city}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Address: </span>
                  <span>{ord.business?.address}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contact: </span>
                  <span>{ord.business?.phone}</span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Requested Items:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {ord.items.map((it, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{it.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {it.quantity} {it.unit} &bull; ₹{it.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {ord.notes && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <strong>Notes from Buyer:</strong> {ord.notes}
                </div>
              )}

              {/* Action Controls for Supplier */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                {ord.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(ord._id, ord.orderNumber, 'accepted')}
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === ord._id}
                    >
                      {actionLoading === ord._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={14} />}
                      <span>Accept Order</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(ord._id, ord.orderNumber, 'rejected')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
                      disabled={actionLoading === ord._id}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {ord.status === 'accepted' && (
                  <button
                    onClick={() => handleStatusUpdate(ord._id, ord.orderNumber, 'dispatched')}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' }}
                    disabled={actionLoading === ord._id}
                  >
                    {actionLoading === ord._id ? <Loader2 size={13} className="animate-spin" /> : <Truck size={14} />}
                    <span>Mark as Dispatched</span>
                  </button>
                )}

                {ord.status === 'dispatched' && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={15} color="#1d4ed8" />
                    <span>Dispatched & en route &bull; Awaiting delivery confirmation by buyer</span>
                  </span>
                )}

                {ord.status === 'delivered' && (
                  <span style={{ fontSize: '13px', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} />
                    <span>Delivery Confirmed by Buyer</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
