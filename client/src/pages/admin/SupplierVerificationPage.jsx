import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Store, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function SupplierVerificationPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores id being updated
  const [notification, setNotification] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingSuppliers();
  }, []);

  const fetchPendingSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/suppliers/pending');
      setSuppliers(res.data?.suppliers || []);
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to load pending suppliers.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (supplierId, name) => {
    if (!window.confirm(`Are you sure you want to approve "${name}" for marketplace listing?`)) {
      return;
    }

    try {
      setActionLoading(supplierId);
      const res = await api.patch(`/admin/suppliers/${supplierId}/approve`);
      setNotification({ type: 'success', text: res.message || `Supplier "${name}" approved successfully.` });
      // Remove from pending list
      setSuppliers(suppliers.filter((s) => s._id !== supplierId));
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to approve supplier.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (supplierId, name) => {
    if (!window.confirm(`Are you sure you want to reject verification for "${name}"?`)) {
      return;
    }

    try {
      setActionLoading(supplierId);
      const res = await api.patch(`/admin/suppliers/${supplierId}/reject`);
      setNotification({ type: 'warning', text: res.message || `Supplier "${name}" verification rejected.` });
      // Remove from pending list
      setSuppliers(suppliers.filter((s) => s._id !== supplierId));
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to reject supplier.' });
    } finally {
      setActionLoading(null);
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
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
            Supplier Verification Queue
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Review and verify wholesale suppliers before they can sell on the StockMate marketplace
          </p>
        </div>
        <span className="badge badge-pending" style={{ fontSize: '13px', padding: '6px 12px' }}>
          {suppliers.length} Pending Applications
        </span>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          )}
          <div>{notification.text}</div>
        </div>
      )}

      {suppliers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckCircle size={44} color="var(--primary-600)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Queue is Clear!</h3>
            <p style={{ marginTop: '6px' }}>No supplier registrations currently pending verification.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {suppliers.map((sup) => (
            <div key={sup._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div className="stat-icon info" style={{ width: '36px', height: '36px' }}>
                      <Store size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {sup.businessName}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Account Owner: {sup.user?.name} ({sup.user?.email})
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '12px 0', lineHeight: 1.5 }}>
                    {sup.description || 'No company description provided.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="var(--primary-600)" />
                      <span>{sup.address}, {sup.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={15} color="var(--primary-600)" />
                      <span>{sup.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} color="var(--text-light)" />
                      <span>Applied: {new Date(sup.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleApprove(sup._id, sup.businessName)}
                    className="btn btn-primary btn-sm"
                    disabled={actionLoading === sup._id}
                  >
                    {actionLoading === sup._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle size={15} />
                    )}
                    <span>Approve Supplier</span>
                  </button>
                  <button
                    onClick={() => handleReject(sup._id, sup.businessName)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
                    disabled={actionLoading === sup._id}
                  >
                    <XCircle size={15} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
