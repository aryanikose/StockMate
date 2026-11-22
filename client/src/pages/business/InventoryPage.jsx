import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import InventoryItemModal from '../../components/inventory/InventoryItemModal';
import StockActionModal from '../../components/inventory/StockActionModal';

const CATEGORIES = [
  'All',
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

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, in_stock, low_stock, out_of_stock

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState(null);
  const [stockActionType, setStockActionType] = useState('IN'); // IN, OUT, ADJUSTMENT

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, selectedStatus]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await api.get('/inventory', { params });
      setItems(res.data?.items || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to load inventory' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  // Open Add Item Modal
  const handleOpenAdd = () => {
    setEditItem(null);
    setIsItemModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setIsItemModalOpen(true);
  };

  // Open Stock Action Modal (IN, OUT, ADJUSTMENT)
  const handleOpenStockAction = (item, action) => {
    setSelectedActionItem(item);
    setStockActionType(action);
    setIsStockModalOpen(true);
  };

  // Item saved callback
  const handleItemSaved = (savedItem) => {
    setNotification({
      type: 'success',
      text: editItem ? `Item "${savedItem.name}" updated successfully.` : `New item "${savedItem.name}" added to inventory.`
    });
    fetchInventory();
  };

  // Movement recorded callback
  const handleMovementRecorded = (data) => {
    setNotification({
      type: 'success',
      text: `${data.message}. Updated balance: ${data.data?.updatedItem?.currentQuantity} ${data.data?.updatedItem?.unit}.`
    });
    fetchInventory();
  };

  // Deactivate Item
  const handleDeactivate = async (item) => {
    if (!window.confirm(`Are you sure you want to deactivate "${item.name}" from your active inventory?`)) {
      return;
    }

    try {
      await api.patch(`/inventory/${item._id}/deactivate`);
      setNotification({ type: 'warning', text: `Item "${item.name}" was deactivated.` });
      fetchInventory();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to deactivate item' });
    }
  };

  const getStatusBadge = (item) => {
    if (item.currentQuantity === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (item.currentQuantity <= item.minimumQuantity) {
      return <span className="badge badge-low-stock">Low Stock</span>;
    }
    return <span className="badge badge-in-stock">In Stock</span>;
  };

  return (
    <div>
      {/* Top Header & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Inventory Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Monitor real-time ingredients, record consumption, and log deliveries
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Inventory Item</span>
        </button>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification({ type: '', text: '' })} className="btn-icon">
            <X size={15} />
          </button>
        </div>
      )}

      {/* KPI Count Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedStatus('all')}
          className={`btn btn-sm ${selectedStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Items ({stats.total})
        </button>
        <button
          onClick={() => setSelectedStatus('in_stock')}
          className={`btn btn-sm ${selectedStatus === 'in_stock' ? 'btn-primary' : 'btn-secondary'}`}
        >
          In Stock ({stats.inStock})
        </button>
        <button
          onClick={() => setSelectedStatus('low_stock')}
          className={`btn btn-sm ${selectedStatus === 'low_stock' ? 'btn-primary' : 'btn-secondary'}`}
          style={selectedStatus === 'low_stock' ? { backgroundColor: '#ea580c', borderColor: '#ea580c' } : {}}
        >
          Low Stock ({stats.lowStock})
        </button>
        <button
          onClick={() => setSelectedStatus('out_of_stock')}
          className={`btn btn-sm ${selectedStatus === 'out_of_stock' ? 'btn-primary' : 'btn-secondary'}`}
          style={selectedStatus === 'out_of_stock' ? { backgroundColor: '#dc2626', borderColor: '#dc2626' } : {}}
        >
          Out of Stock ({stats.outOfStock})
        </button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Apply Search
          </button>
        </form>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Boxes size={48} className="empty-state-icon" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Items Found</h3>
            <p style={{ marginTop: '6px', fontSize: '14px' }}>
              {search || selectedCategory !== 'All' || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or category filter.'
                : 'Your inventory is currently empty. Click "Add Inventory Item" above to get started.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min. Threshold</th>
                <th>Status</th>
                <th>Quick Actions</th>
                <th style={{ textAlign: 'right' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-category">{item.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.currentQuantity}
                    </span>{' '}
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {item.unit}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      {item.minimumQuantity} {item.unit}
                    </span>
                  </td>
                  <td>{getStatusBadge(item)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenStockAction(item, 'IN')}
                        className="btn btn-sm"
                        style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)', padding: '4px 10px', fontSize: '12px' }}
                        title="Record Stock IN"
                      >
                        <ArrowDownLeft size={13} />
                        <span>IN</span>
                      </button>

                      <button
                        onClick={() => handleOpenStockAction(item, 'OUT')}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#fff1f2', color: '#be123c', padding: '4px 10px', fontSize: '12px' }}
                        title="Record Stock OUT"
                        disabled={item.currentQuantity === 0}
                      >
                        <ArrowUpRight size={13} />
                        <span>OUT</span>
                      </button>

                      <button
                        onClick={() => handleOpenStockAction(item, 'ADJUSTMENT')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        title="Audit / Reconcile Stock"
                      >
                        <Scale size={13} />
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn-icon"
                        title="Edit Item"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item)}
                        className="btn-icon"
                        style={{ color: 'var(--danger-text)' }}
                        title="Deactivate Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <InventoryItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onItemSaved={handleItemSaved}
        editItem={editItem}
      />

      {/* Stock Action Modal (IN / OUT / ADJUSTMENT) */}
      <StockActionModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        item={selectedActionItem}
        actionType={stockActionType}
        onMovementRecorded={handleMovementRecorded}
      />
    </div>
  );
}
