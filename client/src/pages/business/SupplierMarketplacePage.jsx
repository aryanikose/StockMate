import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  Store, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  CheckCircle, 
  ShoppingCart, 
  ArrowRight, 
  Boxes, 
  Loader2 
} from 'lucide-react';

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

export default function SupplierMarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'suppliers'
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'products') {
      fetchMarketplaceProducts();
    } else {
      fetchSuppliers();
    }
  }, [activeTab, selectedCategory]);

  const fetchMarketplaceProducts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (cityFilter.trim()) params.city = cityFilter.trim();

      const res = await api.get('/supplier-products/marketplace', { params });
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (cityFilter.trim()) params.city = cityFilter.trim();

      const res = await api.get('/suppliers', { params });
      setSuppliers(res.data?.suppliers || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'products') {
      fetchMarketplaceProducts();
    } else {
      fetchSuppliers();
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          Wholesale Supplier Marketplace
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Compare wholesale prices from verified suppliers and order fresh ingredients
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Boxes size={16} />
          <span>Browse Wholesale Products</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`btn ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Store size={16} />
          <span>Browse Verified Suppliers</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-control"
              placeholder={activeTab === 'products' ? 'Search products by name...' : 'Search suppliers by name or description...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* City Filter */}
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <MapPin size={15} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Category Dropdown (for products tab) */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="var(--text-muted)" />
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
        </div>
      ) : activeTab === 'products' ? (
        /* Products Grid */
        products.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Boxes size={48} className="empty-state-icon" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Products Found</h3>
              <p style={{ marginTop: '6px', fontSize: '14px' }}>
                Try adjusting your search keyword, category, or city filter.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {products.map((p) => (
              <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge badge-category">{p.category}</span>
                    <span className="badge badge-approved" style={{ fontSize: '11px' }}>
                      <CheckCircle size={11} />
                      <span>Verified</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {p.name}
                  </h3>

                  {p.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                      {p.description}
                    </p>
                  )}

                  <div style={{ margin: '14px 0', padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Wholesale Price
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ₹{p.price.toFixed(2)}{' '}
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ {p.unit}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                    <Store size={14} color="var(--primary-600)" />
                    <span>{p.supplier?.businessName} ({p.supplier?.city})</span>
                  </div>
                </div>

                <Link
                  to={`/business/marketplace/suppliers/${p.supplier?._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ShoppingCart size={14} />
                  <span>View Supplier & Catalogue</span>
                </Link>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Suppliers Grid */
        suppliers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Store size={48} className="empty-state-icon" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Suppliers Found</h3>
              <p style={{ marginTop: '6px', fontSize: '14px' }}>
                No verified suppliers currently match your search criteria.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {suppliers.map((s) => (
              <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge badge-approved">
                      <CheckCircle size={12} />
                      <span>Verified Supplier</span>
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--primary-600)" />
                      {s.city}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {s.businessName}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {s.description || 'Verified wholesale distributor for food businesses.'}
                  </p>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                    <div>Contact: <strong>{s.contactPerson}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="var(--primary-600)" />
                      <span>{s.phone}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/business/marketplace/suppliers/${s._id}`}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>View Product Catalogue</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
