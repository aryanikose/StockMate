import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  Filter, 
  Calendar, 
  Loader2 
} from 'lucide-react';

export default function StockMovementsPage() {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchItemsList();
    fetchMovements();
  }, [selectedType, selectedItem, startDate, endDate]);

  const fetchItemsList = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data?.items || []);
    } catch (err) {
      console.error('Failed to load items dropdown:', err);
    }
  };

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedType !== 'ALL') params.movementType = selectedType;
      if (selectedItem) params.itemId = selectedItem;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/stock-movements', { params });
      setMovements(res.data?.movements || []);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMovementBadge = (type) => {
    switch (type) {
      case 'IN':
        return (
          <span className="badge badge-in-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDownLeft size={13} />
            <span>Stock IN</span>
          </span>
        );
      case 'OUT':
        return (
          <span className="badge badge-out-of-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={13} />
            <span>Stock OUT</span>
          </span>
        );
      case 'ADJUSTMENT_INCREASE':
        return (
          <span className="badge badge-in-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={13} />
            <span>Audit +</span>
          </span>
        );
      case 'ADJUSTMENT_DECREASE':
        return (
          <span className="badge badge-low-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={13} />
            <span>Audit -</span>
          </span>
        );
      default:
        return <span className="badge badge-category">{type}</span>;
    }
  };

  const formatQuantity = (mov) => {
    const isPositive = mov.movementType === 'IN' || mov.movementType === 'ADJUSTMENT_INCREASE';
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? 'var(--primary-700)' : 'var(--danger-text)';

    return (
      <span style={{ fontWeight: 700, fontSize: '15px', color }}>
        {sign}{mov.quantity} {mov.inventoryItem?.unit || ''}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          Stock Movement History
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Immutable ledger recording every delivery, kitchen consumption, and recount adjustment
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* Movement Type Dropdown */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Movement Type</label>
            <select
              className="form-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Movements</option>
              <option value="IN">Stock IN (Additions)</option>
              <option value="OUT">Stock OUT (Deductions)</option>
              <option value="ADJUSTMENT_INCREASE">Audit Increase (+)</option>
              <option value="ADJUSTMENT_DECREASE">Audit Decrease (-)</option>
            </select>
          </div>

          {/* Item Filter Dropdown */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Item</label>
            <select
              className="form-control"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">All Inventory Items</option>
              {items.map((it) => (
                <option key={it._id} value={it._id}>
                  {it.name} ({it.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>From Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>To Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
        </div>
      ) : movements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ArrowLeftRight size={48} className="empty-state-icon" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Movements Recorded</h3>
            <p style={{ marginTop: '6px', fontSize: '14px' }}>
              Stock changes will appear here automatically whenever you record Stock IN, Stock OUT, or count adjustments.
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Inventory Item</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Notes</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov._id}>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(mov.createdAt).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {mov.inventoryItem?.name || 'Deleted Item'}
                    </div>
                    {mov.inventoryItem?.category && (
                      <span className="badge badge-category" style={{ fontSize: '11px', marginTop: '2px' }}>
                        {mov.inventoryItem.category}
                      </span>
                    )}
                  </td>
                  <td>{getMovementBadge(mov.movementType)}</td>
                  <td>{formatQuantity(mov)}</td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{mov.reason}</span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {mov.note || '—'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {mov.createdBy?.name || 'User'}
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
