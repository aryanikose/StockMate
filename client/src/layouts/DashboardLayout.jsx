import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  AlertTriangle,
  Store,
  ShoppingCart,
  UserCheck,
  Building2,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function DashboardLayout({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build role-specific navigation items
  const renderNavLinks = () => {
    if (user?.role === 'business') {
      return (
        <>
          <div className="nav-group-label">Overview</div>
          <NavLink
            to="/business/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <div className="nav-group-label">Inventory Control</div>
          <NavLink
            to="/business/inventory"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Boxes size={18} />
            <span>Inventory Items</span>
          </NavLink>
          <NavLink
            to="/business/stock-movements"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ArrowLeftRight size={18} />
            <span>Stock Movements</span>
          </NavLink>
          <NavLink
            to="/business/low-stock"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <AlertTriangle size={18} />
            <span>Low-Stock Alerts</span>
          </NavLink>

          <div className="nav-group-label">Procurement</div>
          <NavLink
            to="/business/marketplace"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Store size={18} />
            <span>Supplier Market</span>
          </NavLink>
          <NavLink
            to="/business/orders"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingCart size={18} />
            <span>Purchase Orders</span>
          </NavLink>

          <div className="nav-group-label">Settings</div>
          <NavLink
            to="/business/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Building2 size={18} />
            <span>Business Profile</span>
          </NavLink>
        </>
      );
    }

    if (user?.role === 'supplier') {
      return (
        <>
          <div className="nav-group-label">Supplier Hub</div>
          <NavLink
            to="/supplier/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/supplier/catalogue"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Boxes size={18} />
            <span>Product Catalogue</span>
          </NavLink>
          <NavLink
            to="/supplier/orders"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingCart size={18} />
            <span>Incoming Orders</span>
          </NavLink>
          <NavLink
            to="/supplier/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Store size={18} />
            <span>Supplier Profile</span>
          </NavLink>
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <div className="nav-group-label">Administration</div>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Platform Overview</span>
          </NavLink>
          <NavLink
            to="/admin/suppliers"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <UserCheck size={18} />
            <span>Supplier Verifications</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            <span>User Management</span>
          </NavLink>
        </>
      );
    }

    return null;
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'business':
        return <span className="badge badge-in-stock">Business Owner</span>;
      case 'supplier':
        return <span className="badge badge-category" style={{ color: '#2563eb' }}>Supplier</span>;
      case 'admin':
        return <span className="badge badge-category" style={{ color: '#7c3aed' }}>Administrator</span>;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-badge">
              <Package size={20} />
            </div>
            <div>
              <div className="brand-title">StockMate</div>
              <div className="brand-subtitle">{user?.role} Portal</div>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {renderNavLinks()}
        </nav>

        {/* Sidebar User Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-widget" style={{ marginBottom: '12px' }}>
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-title-block">
            <h1>{title || 'Dashboard'}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="header-actions">
            {getRoleBadge()}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
