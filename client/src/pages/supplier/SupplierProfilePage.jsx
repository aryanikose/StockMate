import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Store, Save, AlertCircle, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

export default function SupplierProfilePage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    address: '',
    city: '',
    description: ''
  });

  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSupplierProfile();
  }, []);

  const fetchSupplierProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/suppliers/profile/me');
      if (res.data?.profile) {
        const p = res.data.profile;
        setFormData({
          businessName: p.businessName || '',
          contactPerson: p.contactPerson || '',
          phone: p.phone || '',
          address: p.address || '',
          city: p.city || '',
          description: p.description || ''
        });
        setVerificationStatus(p.verificationStatus || 'pending');
        setHasProfile(true);
      }
    } catch (err) {
      if (err.status !== 404) {
        setMessage({ type: 'danger', text: err.message || 'Failed to fetch supplier profile' });
      }
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const { businessName, contactPerson, phone, address, city } = formData;
    if (!businessName || !contactPerson || !phone || !address || !city) {
      setMessage({ type: 'danger', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/suppliers/profile', formData);
      setHasProfile(true);
      setVerificationStatus(res.data.profile.verificationStatus);
      setMessage({ type: 'success', text: res.message || 'Profile saved successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to save supplier profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = () => {
    switch (verificationStatus) {
      case 'approved':
        return (
          <span className="badge badge-approved" style={{ fontSize: '13px', padding: '6px 14px' }}>
            <CheckCircle size={15} />
            <span>Verified Supplier</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-rejected" style={{ fontSize: '13px', padding: '6px 14px' }}>
            <XCircle size={15} />
            <span>Verification Rejected</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="badge badge-pending" style={{ fontSize: '13px', padding: '6px 14px' }}>
            <Clock size={15} />
            <span>Pending Admin Review</span>
          </span>
        );
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Verification Notice Banner */}
      {hasProfile && verificationStatus === 'pending' && (
        <div className="alert alert-warning">
          <Clock size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Verification In Progress:</strong> Your profile is currently under review by our administration team. You can continue managing your products in the catalogue, but your business will appear in the marketplace once approved.
          </div>
        </div>
      )}

      {hasProfile && verificationStatus === 'approved' && (
        <div className="alert alert-success">
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Verified & Active!</strong> Your supplier profile is verified. Local cafes and restaurants can find you and place purchase orders directly.
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon info" style={{ width: '42px', height: '42px' }}>
              <Store size={22} />
            </div>
            <div>
              <h2 className="card-title">
                {hasProfile ? 'Supplier Business Profile' : 'Setup Your Supplier Profile'}
              </h2>
              <p className="card-subtitle">
                Provide accurate business information to get verified by administrators
              </p>
            </div>
          </div>
          {hasProfile && renderStatusBadge()}
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
            )}
            <div>{message.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Supplier Company Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="businessName">
              Supplier / Company Name *
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className="form-control"
              placeholder="e.g. Metro Produce Wholesale Ltd."
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contact Person and Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="contactPerson">
                Primary Contact Person *
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                type="text"
                className="form-control"
                placeholder="e.g. Robert Smith (Sales Rep)"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Contact Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="e.g. +1 (555) 987-6543"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Operating City and Physical Address */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="city">
                Operating City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="form-control"
                placeholder="e.g. New York"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <p className="form-hint">Used by food businesses when searching local suppliers.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Warehouse / Office Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="form-control"
                placeholder="e.g. 100 Industrial Parkway, Dock 4"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Company Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Company Description & Specialties
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="form-control"
              placeholder="e.g. Direct farm-to-table distributor of fresh organic fruits, dairy items, and bulk cooking oils with same-day dispatch."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '160px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{hasProfile ? 'Update Profile' : 'Submit for Verification'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
