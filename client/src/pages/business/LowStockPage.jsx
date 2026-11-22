import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  AlertTriangle, 
  Store, 
  ShoppingCart, 
  CheckCircle, 
  ArrowRight, 
  Boxes, 
  Loader2 
} from 'lucide-react';

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      setIsLoading(true);
      // Fetch both low_stock and out_of_stock items
      const [resLow, resOut] = await Promise.all([
        api.get('/inventory', { params: { status: 'low_stock' } }),
        api.get('/inventory', { params: { status: 'out_of_stock' } })
      ]);

      const combined = [
        ...(resOut.data?.items || []),
        ...(resLow.data?.items || [])
      ];

      setLowStockItems(combined);
    } catch (err) {
      console.error('Failed to load low-stock items:', err);
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

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            Low-Stock Alerts & Replenishment
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Items at or below minimum threshold requiring re-ordering to prevent kitchen stockouts
          </p>
        </div>

        <Link to="/business/marketplace" className="btn btn-primary">
          <Store size={16} />
          <span>Browse Supplier Marketplace</span>
        </Link>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckCircle size={48} color="var(--primary-600)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Stock Levels are Healthy!</h3>
            <p style={{ marginTop: '6px', fontSize: '14px', maxWidth: '420px', margin: '6px auto 0 auto' }}>
              All inventory items currently exceed their designated minimum safety thresholds.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Warning Banner */}
          <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} color="var(--warning-text)" />
              <div>
                <strong>Action Needed:</strong> {lowStockItems.length} ingredient(s) have reached critical minimum thresholds. Restock soon to prevent kitchen disruptions.
              </div>
            </div>
            <Link to="/business/marketplace" className="btn btn-primary btn-sm">
              <span>Find Suppliers</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {lowStockItems.map((item) => {
              const isOut = item.currentQuantity === 0;
              const deficit = Math.max(0, item.minimumQuantity - item.currentQuantity);

              return (
                <div key={item._id} className="card" style={{ padding: '24px', borderColor: isOut ? 'var(--danger-border)' : 'var(--warning-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.name}
                      </h3>
                      <span className="badge badge-category" style={{ marginTop: '4px' }}>
                        {item.category}
                      </span>
                    </div>
                    {isOut ? (
                      <span className="badge badge-out-of-stock">Out of Stock</span>
                    ) : (
                      <span className="badge badge-low-stock">Low Stock</span>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '14px', margin: '16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Quantity</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: isOut ? 'var(--danger-text)' : 'var(--warning-text)' }}>
                        {item.currentQuantity} <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.unit}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum Threshold</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.minimumQuantity} <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.unit}</span>
                      </div>
                    </div>
                  </div>

                  {deficit > 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Recommended order quantity: <strong>+{deficit} {item.unit}</strong> to reach threshold.
                    </div>
                  )}

                  <Link
                    to={`/business/marketplace?search=${encodeURIComponent(item.name)}`}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ShoppingCart size={14} />
                    <span>Search Suppliers for {item.name}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
