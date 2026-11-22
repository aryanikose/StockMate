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

export default function InventoryItemModal({ isOpen, onClose, onItemSaved, editItem }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'kg',
    currentQuantity: 0,
    minimumQuantity: 5,
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        category: editItem.category || 'Vegetables',
        unit: editItem.unit || 'kg',
        currentQuantity: editItem.currentQuantity || 0,
        minimumQuantity: editItem.minimumQuantity || 0,
        description: editItem.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Vegetables',
        unit: 'kg',
        currentQuantity: 0,
        minimumQuantity: 5,
        description: ''
      });
    }
    setError('');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Item name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editItem) {
        // Update existing item
        const res = await api.put(`/inventory/${editItem._id}`, {
          name: formData.name,
          category: formData.category,
          minimumQuantity: Number(formData.minimumQuantity),
          description: formData.description
        });
        onItemSaved(res.data.item);
      } else {
        // Create new item
        const res = await api.post('/inventory', {
          ...formData,
          currentQuantity: Number(formData.currentQuantity),
          minimumQuantity: Number(formData.minimumQuantity)
        });
        onItemSaved(res.data.item);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">
            {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
            {/* Item Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Item Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="e.g. Fresh Tomatoes, Whole Milk, Basmati Rice"
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
                  Unit of Measure *
                </label>
                <select
                  id="unit"
                  name="unit"
                  className="form-control"
                  value={formData.unit}
                  onChange={handleChange}
                  disabled={!!editItem} // Unit cannot change once movements exist
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {editItem && <span className="form-hint">Unit locked for existing items</span>}
              </div>
            </div>

            {/* Current Quantity and Min Threshold */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {!editItem && (
                <div className="form-group">
                  <label className="form-label" htmlFor="currentQuantity">
                    Initial Quantity
                  </label>
                  <input
                    id="currentQuantity"
                    name="currentQuantity"
                    type="number"
                    step="any"
                    min="0"
                    className="form-control"
                    value={formData.currentQuantity}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Quantity currently in storage</span>
                </div>
              )}

              <div className="form-group" style={{ gridColumn: editItem ? '1 / -1' : 'auto' }}>
                <label className="form-label" htmlFor="minimumQuantity">
                  Low-Stock Threshold *
                </label>
                <input
                  id="minimumQuantity"
                  name="minimumQuantity"
                  type="number"
                  step="any"
                  min="0"
                  className="form-control"
                  value={formData.minimumQuantity}
                  onChange={handleChange}
                  required
                />
                <span className="form-hint">Alerts trigger when stock falls below this amount</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="description">
                Notes / Storage Instructions (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                className="form-control"
                placeholder="e.g. Keep refrigerated at 4°C, walk-in cooler shelf B"
                value={formData.description}
                onChange={handleChange}
              />
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
                  <span>{editItem ? 'Save Changes' : 'Create Item'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
