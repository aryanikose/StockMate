import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ShoppingCart, 
  Store, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Eye, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

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
      console.error('Failed to load purchase orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="badge badge-pending">
            <Clock size={12} />
            <span>Pending Supplier</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="badge badge-accepted">
            <CheckCircle size={12} />
            <span>Accepted</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="badge badge-pending" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
            <Truck size={12} />
            <span>Dispatched / In Transit</span>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            My Purchase Orders
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Track order status transitions, inspect price snapshots, and confirm delivery arrivals
          </p>
        </div>

        <Link to="/business/marketplace" className="btn btn-primary">
          <Store size={16} />
          <span>New Purchase Order</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((st) => (
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
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Purchase Orders Found</h3>
            <p style={{ marginTop: '6px', fontSize: '14px', maxWidth: '440px', margin: '6px auto 0 auto' }}>
              {selectedStatus === 'ALL'
                ? 'You have not submitted any purchase orders yet. Browse the supplier marketplace to place your first order.'
                : `No orders currently match the '${selectedStatus.toLowerCase()}' status filter.`}
            </p>
            <Link to="/business/marketplace" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
              <span>Browse Marketplace</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id}>
                  <td>
                    <Link
                      to={`/business/orders/${ord._id}`}
                      style={{ fontWeight: 700, color: 'var(--primary-600)', textDecoration: 'underline' }}
                    >
                      {ord.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {ord.supplier?.businessName || 'Supplier'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {ord.supplier?.city}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(ord.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {ord.items.length} product(s)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{ord.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td>{getStatusBadge(ord.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/business/orders/${ord._id}`} className="btn btn-secondary btn-sm">
                      <Eye size={13} />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
