import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Store, 
  Boxes, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2 
} from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [profRes, prodRes, ordRes] = await Promise.all([
        api.get('/suppliers/profile/me').catch(() => null),
        api.get('/supplier-products').catch(() => null),
        api.get('/orders').catch(() => null)
      ]);

      if (profRes?.data?.profile) {
        setProfile(profRes.data.profile);
      }
      if (prodRes?.data?.products) {
        setProducts(prodRes.data.products);
      }
      if (ordRes?.data?.orders) {
        setOrders(ordRes.data.orders);
      }
    } catch (err) {
      console.error('Failed to load supplier dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
      </div>
    );
  }

  const activeProducts = products.filter(p => p.isAvailable).length;
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched');

  return (
    <div>
      {/* Verification Status Banner */}
      {!profile ? (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={20} color="var(--warning-text)" />
            <div>
              <strong>Complete Profile:</strong> Set up your supplier business information to submit for administrator verification.
            </div>
          </div>
          <Link to="/supplier/profile" className="btn btn-primary btn-sm">
            <span>Setup Profile</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : profile.verificationStatus === 'pending' ? (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--warning-text)" />
            <div>
              <strong>Verification Pending:</strong> Your company "{profile.businessName}" is awaiting admin verification. You can add products to your catalogue; they will become discoverable in the marketplace once approved.
            </div>
          </div>
          <span className="badge badge-pending">Pending Review</span>
        </div>
      ) : profile.verificationStatus === 'approved' ? (
        <div className="card" style={{ marginBottom: '28px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="stat-icon primary" style={{ width: '48px', height: '48px' }}>
                <Store size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {profile.businessName}
                  </h2>
                  <span className="badge badge-approved">Verified Merchant</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Operating City: {profile.city} &bull; Contact: {profile.contactPerson} ({profile.phone})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/supplier/catalogue" className="btn btn-primary btn-sm">
                <Boxes size={15} />
                <span>Manage Catalogue</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-danger" style={{ marginBottom: '28px' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Verification Notice:</strong> Your verification request was rejected. Please review your company profile or contact support.
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Listed Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-icon info">
            <Boxes size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active in Marketplace</div>
            <div className="stat-value" style={{ color: 'var(--primary-700)' }}>{activeProducts}</div>
          </div>
          <div className="stat-icon primary">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Incoming Orders</div>
            <div className="stat-value" style={{ color: pendingOrders.length > 0 ? 'var(--warning-text)' : 'inherit' }}>
              {pendingOrders.length}
            </div>
          </div>
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Dispatched Orders</div>
            <div className="stat-value">{dispatchedOrders.length}</div>
          </div>
          <div className="stat-icon info">
            <Truck size={24} />
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/supplier/orders" className="btn btn-primary">
            <ShoppingCart size={16} />
            <span>Manage Orders ({orders.length})</span>
          </Link>
          <Link to="/supplier/catalogue" className="btn btn-secondary">
            <Plus size={16} />
            <span>Add / Edit Products</span>
          </Link>
          <Link to="/supplier/profile" className="btn btn-secondary">
            <Store size={16} />
            <span>Update Supplier Profile</span>
          </Link>
        </div>
      </div>

      {/* Orders Queue Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Incoming Purchase Orders</h3>
            <p className="card-subtitle">Orders from local restaurants and food businesses</p>
          </div>
          <Link to="/supplier/orders" className="btn btn-secondary btn-sm">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {pendingOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingOrders.slice(0, 5).map((ord) => (
              <div key={ord._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                    {ord.orderNumber}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {ord.business?.businessName} &bull; {ord.items.length} item(s) &bull; {new Date(ord.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary-700)' }}>
                    ₹{ord.totalAmount.toFixed(2)}
                  </span>
                  <Link to="/supplier/orders" className="btn btn-primary btn-sm">
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingCart size={36} className="empty-state-icon" />
            <p>No pending purchase orders right now.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
              When businesses submit orders from your catalogue, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
