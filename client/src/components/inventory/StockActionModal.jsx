import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, ArrowDownLeft, ArrowUpRight, Scale, AlertCircle, Loader2 } from 'lucide-react';

export default function StockActionModal({ isOpen, onClose, item, actionType, onMovementRecorded }) {
  const [quantity, setQuantity] = useState('');
  const [newCount, setNewCount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default reasons based on action type
  useEffect(() => {
    if (actionType === 'IN') {
      setReason('Supplier Delivery Received');
    } else if (actionType === 'OUT') {
      setReason('Kitchen Consumption');
    } else if (actionType === 'ADJUSTMENT') {
      setReason('Physical Stock Audit Count');
    }
    setQuantity('');
    setNewCount(item?.currentQuantity !== undefined ? item.currentQuantity : '');
    setNote('');
    setError('');
  }, [actionType, item, isOpen]);

  if (!isOpen || !item) return null;

  const getModalTitle = () => {
    switch (actionType) {
      case 'IN':
        return `Record Stock IN: ${item.name}`;
      case 'OUT':
        return `Record Stock OUT: ${item.name}`;
      case 'ADJUSTMENT':
        return `Stock Count Adjustment: ${item.name}`;
      default:
        return 'Stock Action';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      inventoryItemId: item._id,
      actionType,
      reason,
      note
    };

    if (actionType === 'IN') {
      const qty = Number(quantity);
      if (!qty || qty <= 0) {
        setError('Please enter a positive received quantity.');
        return;
      }
      payload.quantity = qty;
    } else if (actionType === 'OUT') {
      const qty = Number(quantity);
      if (!qty || qty <= 0) {
        setError('Please enter a positive quantity removed.');
        return;
      }
      if (qty > item.currentQuantity) {
        setError(`Cannot remove ${qty} ${item.unit}. Only ${item.currentQuantity} ${item.unit} available in stock!`);
        return;
      }
      payload.quantity = qty;
    } else if (actionType === 'ADJUSTMENT') {
      const target = Number(newCount);
      if (isNaN(target) || target < 0) {
        setError('Please enter a valid, non-negative counted quantity.');
        return;
      }
      if (target === item.currentQuantity) {
        setError('The physical count matches current stock. No adjustment needed.');
        return;
      }
      payload.newQuantity = target;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/stock-movements', payload);
      onMovementRecorded(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview computed balance
  const renderPreviewBalance = () => {
    if (actionType === 'IN') {
      const add = Number(quantity) || 0;
      return (
        <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600 }}>
          New Stock Balance: {item.currentQuantity + add} {item.unit}
        </div>
      );
    }
    if (actionType === 'OUT') {
      const sub = Number(quantity) || 0;
      const remaining = item.currentQuantity - sub;
      return (
        <div style={{ marginTop: '6px', fontSize: '13px', color: remaining < 0 ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: 600 }}>
          Remaining Stock: {remaining >= 0 ? `${remaining} ${item.unit}` : 'Insufficient stock!'}
        </div>
      );
    }
    if (actionType === 'ADJUSTMENT') {
      const target = Number(newCount);
      if (!isNaN(target)) {
        const delta = target - item.currentQuantity;
        return (
          <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 600, color: delta > 0 ? 'var(--primary-600)' : delta < 0 ? 'var(--danger-text)' : 'var(--text-muted)' }}>
            Net Adjustment: {delta > 0 ? `+${delta}` : delta} {item.unit}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`stat-icon ${actionType === 'IN' ? 'primary' : actionType === 'OUT' ? 'danger' : 'info'}`} style={{ width: '36px', height: '36px' }}>
              {actionType === 'IN' ? <ArrowDownLeft size={18} /> : actionType === 'OUT' ? <ArrowUpRight size={18} /> : <Scale size={18} />}
            </div>
            <div>
              <h3 className="card-title" style={{ fontSize: '16px' }}>{getModalTitle()}</h3>
              <p className="card-subtitle">
                Current Stock: <strong>{item.currentQuantity} {item.unit}</strong> &bull; Category: {item.category}
              </p>
            </div>
          </div>
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
            {/* Quantity Input */}
            {actionType !== 'ADJUSTMENT' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="quantity">
                  {actionType === 'IN' ? `Quantity Received (${item.unit}) *` : `Quantity Consumed / Removed (${item.unit}) *`}
                </label>
                <input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0.001"
                  className="form-control"
                  placeholder={`e.g. 5 ${item.unit}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  autoFocus
                  required
                />
                {renderPreviewBalance()}
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="newCount">
                  Actual Counted Quantity ({item.unit}) *
                </label>
                <input
                  id="newCount"
                  type="number"
                  step="any"
                  min="0"
                  className="form-control"
                  placeholder={`e.g. 12 ${item.unit}`}
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  autoFocus
                  required
                />
                {renderPreviewBalance()}
              </div>
            )}

            {/* Reason Dropdown / Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="reason">
                Reason *
              </label>
              <select
                id="reason"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {actionType === 'IN' && (
                  <>
                    <option value="Supplier Delivery Received">Supplier Delivery Received</option>
                    <option value="Market Purchase">Direct Market Purchase</option>
                    <option value="Returned Item">Customer / Kitchen Return</option>
                    <option value="Other Addition">Other Stock Addition</option>
                  </>
                )}
                {actionType === 'OUT' && (
                  <>
                    <option value="Kitchen Consumption">Kitchen Consumption / Prep</option>
                    <option value="Food Spoilage">Food Spoilage / Expired</option>
                    <option value="Damaged / Dropped">Damaged / Broken Container</option>
                    <option value="Tasting & Testing">Menu Testing & Samples</option>
                    <option value="Other Deduction">Other Stock Removal</option>
                  </>
                )}
                {actionType === 'ADJUSTMENT' && (
                  <>
                    <option value="Physical Stock Audit Count">Physical Stock Audit Count</option>
                    <option value="Unit Conversion Correction">Measurement Unit Correction</option>
                    <option value="System Sync Correction">System Reconciliation</option>
                    <option value="Other Adjustment">Other Discrepancy Reconciliation</option>
                  </>
                )}
              </select>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="note">
                Optional Notes
              </label>
              <input
                id="note"
                type="text"
                className="form-control"
                placeholder="e.g. Batch #4982, dinner rush prep, or spoilage notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${actionType === 'IN' ? 'btn-primary' : actionType === 'OUT' ? 'btn-danger' : 'btn-primary'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Confirm {actionType}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
