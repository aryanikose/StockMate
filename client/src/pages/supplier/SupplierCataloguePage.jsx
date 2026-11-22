import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Boxes, 
  Plus, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  DollarSign, 
  Tag 
} from 'lucide-react';
import ProductModal from '../../components/supplier/ProductModal';

export default function SupplierCataloguePage() {
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [notification, setNotification] = useState({ type: '', text: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const fetchCatalogue = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/supplier-products');
      setProducts(res.data?.products || []);
      setProfile(res.data?.profile || null);
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to load catalogue' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditProduct(prod);
    setIsModalOpen(true);
  };

  const handleProductSaved = (savedProduct) => {
    setNotification({
      type: 'success',
      text: editProduct
        ? `Product "${savedProduct.name}" updated successfully.`
        : `Product "${savedProduct.name}" added to catalogue.`
    });
    fetchCatalogue();
  };

  const handleToggleAvailability = async (prod) => {
    try {
      setTogglingId(prod._id);
      const res = await api.patch(`/supplier-products/${prod._id}/availability`);
      setNotification({ type: 'success', text: res.message });
      // Optimistic local update
      setProducts(products.map(p => p._id === prod._id ? { ...p, isAvailable: !p.isAvailable } : p));
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Failed to update availability' });
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
      </div>
    );
  }

  const activeCount = products.filter(p => p.isAvailable).length;

  return (
    <div>
      {/* Header and Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Product Catalogue
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            List wholesale items, set prices, and toggle in-stock availability
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Catalogue Product</span>
        </button>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification({ type: '', text: '' })} className="btn-icon">
            &times;
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Listed Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-icon info">
            <Boxes size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active for Ordering</div>
            <div className="stat-value" style={{ color: 'var(--primary-700)' }}>{activeCount}</div>
          </div>
          <div className="stat-icon primary">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Temporarily Unavailable</div>
            <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{products.length - activeCount}</div>
          </div>
          <div className="stat-icon danger">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Catalogue Table */}
      {products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Boxes size={48} className="empty-state-icon" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Products in Catalogue</h3>
            <p style={{ marginTop: '6px', fontSize: '14px', maxWidth: '440px', margin: '6px auto 0 auto' }}>
              Your product catalogue is currently empty. Add products so local food businesses can place purchase orders.
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} />
              <span>Add Your First Product</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Wholesale Price</th>
                <th>Availability</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{prod.name}</div>
                    {prod.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {prod.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-category">{prod.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>1 {prod.unit}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ₹{prod.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}> / {prod.unit}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailability(prod)}
                      className={`btn btn-sm ${prod.isAvailable ? 'badge-in-stock' : 'badge-out-of-stock'}`}
                      style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                      disabled={togglingId === prod._id}
                    >
                      {togglingId === prod._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : prod.isAvailable ? (
                        <CheckCircle size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      <span>{prod.isAvailable ? 'In Stock (Active)' : 'Unavailable'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="btn-icon"
                      title="Edit Product Details & Price"
                    >
                      <Edit3 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductSaved={handleProductSaved}
        editProduct={editProduct}
      />
    </div>
  );
}
