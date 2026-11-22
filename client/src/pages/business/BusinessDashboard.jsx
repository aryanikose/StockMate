import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Store, 
  ShoppingCart,
  Building2,
  MapPin,
  ArrowRight,
  Loader2,
  Clock
} from 'lucide-react';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [recentMovements, setRecentMovements] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch Business profile, inventory stats, recent movements and orders in parallel
      const [bizRes, invRes, movRes, ordRes] = await Promise.all([
        api.get('/business/me').catch(() => null),
        api.get('/inventory').catch(() => null),
        api.get('/stock-movements').catch(() => null),
        api.get('/orders').catch(() => null)
      ]);

      if (bizRes?.data?.business) {
        setBusiness(bizRes.data.business);
      }

      if (invRes?.data?.stats) {
        setStats(invRes.data.stats);
      }

      if (movRes?.data?.movements) {
        setRecentMovements(movRes.data.movements.slice(0, 5));
      }

      if (ordRes?.data?.orders) {
        setRecentOrders(ordRes.data.orders.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load business dashboard:', err);
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

  return (
    <div>
      {/* Business Identity Banner */}
      {business ? (
        <div className="card" style={{ marginBottom: '28px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="stat-icon primary" style={{ width: '48px', height: '48px' }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {business.businessName}
                  </h2>
                  <span className="badge badge-category">{business.businessType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--primary-600)" />
                    {business.city}
                  </span>
                  <span>&bull;</span>
                  <span>Owner: {user?.name}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/business/profile" className="btn btn-secondary btn-sm">
                <span>Profile Settings</span>
              </Link>
              <Link to="/business/inventory" className="btn btn-primary btn-sm">
                <Boxes size={15} />
                <span>Manage Inventory</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--warning-text)" />
            <div>
              <strong>Complete Business Setup:</strong> Set up your food establishment profile to start tracking ingredients and creating purchase orders.
            </div>
          </div>
          <Link to="/business/profile" className="btn btn-primary btn-sm">
            <span>Setup Profile</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Inventory Items</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-icon primary">
            <Boxes size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Sufficient In-Stock</div>
            <div className="stat-value" style={{ color: 'var(--primary-700)' }}>{stats.inStock}</div>
          </div>
          <div className="stat-icon primary">
            <CheckCircle size={24} />
          </div>
        </div>

        <Link to="/business/low-stock" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ borderColor: stats.lowStock > 0 ? 'var(--warning-border)' : 'var(--border-light)' }}>
            <div>
              <div className="stat-label">Low-Stock Items</div>
              <div className="stat-value" style={{ color: 'var(--warning-text)' }}>{stats.lowStock}</div>
            </div>
            <div className="stat-icon warning">
              <AlertTriangle size={24} />
            </div>
          </div>
        </Link>

        <Link to="/business/low-stock" style={{ textDecoration: 'none' }}>
          <div className="stat-card" style={{ borderColor: stats.outOfStock > 0 ? 'var(--danger-border)' : 'var(--border-light)' }}>
            <div>
              <div className="stat-label">Out of Stock Items</div>
              <div className="stat-value" style={{ color: 'var(--danger-text)' }}>{stats.outOfStock}</div>
            </div>
            <div className="stat-icon danger">
              <XCircle size={24} />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Quick Actions</h3>
            <p className="card-subtitle">Frequently accessed inventory and purchasing tasks</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/business/inventory" className="btn btn-primary">
            <Plus size={16} />
            <span>Open Inventory Board</span>
          </Link>
          <Link to="/business/stock-movements" className="btn btn-secondary">
            <ArrowDownLeft size={16} />
            <span>Stock Movements Log</span>
          </Link>
          <Link to="/business/low-stock" className="btn btn-secondary">
            <AlertTriangle size={16} color="var(--warning-text)" />
            <span>Low-Stock Alerts ({stats.lowStock + stats.outOfStock})</span>
          </Link>
          <Link to="/business/marketplace" className="btn btn-secondary">
            <Store size={16} />
            <span>Browse Suppliers</span>
          </Link>
        </div>
      </div>

      {/* Recent Movements and Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recent Movements */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Stock Activity</h3>
              <p className="card-subtitle">Latest additions, deductions and audit adjustments</p>
            </div>
            <Link to="/business/stock-movements" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentMovements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentMovements.map((m) => {
                const isPositive = m.movementType === 'IN' || m.movementType === 'ADJUSTMENT_INCREASE';
                return (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>
                        {m.inventoryItem?.name || 'Item'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {m.reason} &bull; {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: isPositive ? 'var(--primary-700)' : 'var(--danger-text)' }}>
                      {isPositive ? '+' : '-'}{m.quantity} {m.inventoryItem?.unit || ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Boxes size={36} className="empty-state-icon" />
              <p>No stock activity recorded yet.</p>
              <Link to="/business/inventory" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                Go to Inventory
              </Link>
            </div>
          )}
        </div>

        {/* Purchase Orders */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Purchase Orders</h3>
              <p className="card-subtitle">Active supplier orders and delivery statuses</p>
            </div>
            <Link to="/business/orders" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((ord) => (
                <div key={ord._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <Link to={`/business/orders/${ord._id}`} style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-600)' }}>
                      {ord.orderNumber}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {ord.supplier?.businessName} &bull; {ord.items.length} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>₹{ord.totalAmount.toFixed(2)}</div>
                    <span className={`badge ${ord.status === 'delivered' ? 'badge-delivered' : ord.status === 'dispatched' ? 'badge-pending' : ord.status === 'accepted' ? 'badge-accepted' : 'badge-pending'}`} style={{ fontSize: '11px' }}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ShoppingCart size={36} className="empty-state-icon" />
              <p>No active purchase orders right now.</p>
              <Link to="/business/marketplace" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
