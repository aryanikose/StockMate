import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains and Cereals',
  'Pulses',
  'Spices',
  'Meat and Seafood',
  'Oils',
  'Beverages',
  'Packaging',
  'Cleaning Supplies',
  'Other'
];

const UNITS = ['kg', 'g', 'litre', 'ml', 'pieces', 'packets'];

export default function ProductModal({ isOpen, onClose, onProductSaved, editProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'kg',
    price: '',
    description: '',
    isAvailable: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        category: editProduct.category || 'Vegetables',
        unit: editProduct.unit || 'kg',
        price: editProduct.price !== undefined ? editProduct.price : '',
        description: editProduct.description || '',
        isAvailable: editProduct.isAvailable !== undefined ? editProduct.isAvailable : true
      });
    } else {
      setFormData({
        name: '',
        category: 'Vegetables',
        unit: 'kg',
        price: '',
        description: '',
        isAvailable: true
      });
    }
    setError('');
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || formData.price === '') {
      setError('Please provide product name and price.');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid non-negative number.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editProduct) {
        const res = await api.put(`/supplier-products/${editProduct._id}`, {
          ...formData,
          price: priceNum
        });
        onProductSaved(res.data.product);
      } else {
        const res = await api.post('/supplier-products', {
          ...formData,
          price: priceNum
        });
        onProductSaved(res.data.product);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">
            {editProduct ? 'Edit Catalogue Product' : 'Add New Product to Catalogue'}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0 24px', marginTop: '16px' }}>
            <div className="alert alert-danger" style={{ marginBottom: 0 }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Product Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Product Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="e.g. Bulk Roma Tomatoes, Pasteurized Whole Milk"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category and Unit in 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="unit">
                  Unit Sold *
                </label>
                <select
                  id="unit"
                  name="unit"
                  className="form-control"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label" htmlFor="price">
                Wholesale Price per {formData.unit} (₹) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder={`e.g. 25.00`}
                value={formData.price}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Existing purchase orders will retain this price as a snapshot</span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description / Grade / Origin (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                className="form-control"
                placeholder="e.g. Grade A hydroponic produce, packed in 10kg crates"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Availability Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isAvailable" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Item is actively in stock & ready for orders
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{editProduct ? 'Save Changes' : 'Add to Catalogue'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
