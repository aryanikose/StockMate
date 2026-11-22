import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  Building2, 
  Store, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
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

  const stats = data?.stats || {
    totalUsers: 0,
    totalBusinesses: 0,
    totalSuppliers: 0,
    pendingSuppliers: 0,
    approvedSuppliers: 0
  };

  return (
    <div>
      <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={20} color="var(--success-text)" />
        <div>
          <strong>System Administrator Portal: {user?.name}</strong>. Full platform moderation access active.
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-icon info">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Registered Businesses</div>
            <div className="stat-value">{stats.totalBusinesses}</div>
          </div>
          <div className="stat-icon primary">
            <Building2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Suppliers</div>
            <div className="stat-value">{stats.totalSuppliers}</div>
          </div>
          <div className="stat-icon warning">
            <Store size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Verifications</div>
            <div className="stat-value" style={{ color: stats.pendingSuppliers > 0 ? 'var(--warning-text)' : 'inherit' }}>
              {stats.pendingSuppliers}
            </div>
          </div>
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Pending Suppliers Attention Callout */}
      {stats.pendingSuppliers > 0 && (
        <div className="card" style={{ marginBottom: '28px', backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserCheck size={24} color="var(--warning-text)" />
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--warning-text)', fontSize: '15px' }}>
                  {stats.pendingSuppliers} Supplier Application(s) Awaiting Review
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--warning-text)', opacity: 0.9 }}>
                  Suppliers cannot list products in the marketplace until verified.
                </p>
              </div>
            </div>
            <Link to="/admin/suppliers" className="btn btn-primary btn-sm">
              <span>Open Verification Queue</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recent Registrations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent User Registrations</h3>
          </div>
          {data?.recentUsers && data.recentUsers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.recentUsers.map((u) => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span className={`badge ${u.role === 'business' ? 'badge-in-stock' : u.role === 'supplier' ? 'badge-category' : 'badge-category'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No recent registrations.</div>
          )}
        </div>

        {/* Recent Suppliers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Supplier Profiles</h3>
          </div>
          {data?.recentSuppliers && data.recentSuppliers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.recentSuppliers.map((s) => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.businessName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.city} &bull; {s.contactPerson}</div>
                  </div>
                  <span className={`badge ${s.verificationStatus === 'approved' ? 'badge-approved' : s.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                    {s.verificationStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No suppliers registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
