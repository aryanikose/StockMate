import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function BusinessProfilePage() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Cafe',
    address: '',
    city: '',
    phone: '',
    logo: ''
  });

  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const businessTypes = [
    'Cafe',
    'Restaurant',
    'Hotel',
    'Bakery',
    'Cloud Kitchen',
    'Food Stall',
    'Other'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/business/me');
      if (res.data?.business) {
        setFormData({
          businessName: res.data.business.businessName || '',
          businessType: res.data.business.businessType || 'Cafe',
          address: res.data.business.address || '',
          city: res.data.business.city || '',
          phone: res.data.business.phone || '',
          logo: res.data.business.logo || ''
        });
        setHasProfile(true);
      }
    } catch (err) {
      // 404 means no profile created yet
      if (err.status !== 404) {
        setMessage({ type: 'danger', text: err.message || 'Failed to fetch business profile' });
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

    const { businessName, businessType, address, city, phone } = formData;
    if (!businessName || !businessType || !address || !city || !phone) {
      setMessage({ type: 'danger', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (hasProfile) {
        const res = await api.put('/business/me', formData);
        setMessage({ type: 'success', text: res.message || 'Business profile updated successfully!' });
      } else {
        const res = await api.post('/business', formData);
        setHasProfile(true);
        setMessage({ type: 'success', text: res.message || 'Business profile created successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to save business profile.' });
    } finally {
      setIsSubmitting(false);
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
      <div className="card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon primary" style={{ width: '42px', height: '42px' }}>
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="card-title">
                {hasProfile ? 'Manage Business Profile' : 'Setup Your Business Profile'}
              </h2>
              <p className="card-subtitle">
                Configure your food establishment details for inventory and purchase orders
              </p>
            </div>
          </div>
          {hasProfile && <span className="badge badge-in-stock">Profile Active</span>}
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
          {/* Business Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="businessName">
              Business Name *
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className="form-control"
              placeholder="e.g. Bella Italia Bistro & Cafe"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Business Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="businessType">
              Business Type *
            </label>
            <select
              id="businessType"
              name="businessType"
              className="form-control"
              value={formData.businessType}
              onChange={handleChange}
              required
            >
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="form-hint">Choose the category that best describes your food establishment.</p>
          </div>

          {/* City and Phone in 2 Columns */}
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
                placeholder="e.g. New York, Chicago, Mumbai"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Contact Phone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="e.g. +1 (555) 234-5678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Physical Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Street / Kitchen Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-control"
              placeholder="e.g. 742 Evergreen Terrace, Suite 101"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <p className="form-hint">Suppliers will deliver purchase orders to this location.</p>
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{hasProfile ? 'Update Profile' : 'Save Profile'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
