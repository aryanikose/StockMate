import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-badge">
            <Package size={22} />
          </div>
          <div>
            <div className="brand-title">StockMate</div>
            <div className="brand-subtitle">Inventory & Procurement</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link
            to="/"
            style={{
              fontWeight: isActive('/') ? 600 : 500,
              color: isActive('/') ? 'var(--primary-600)' : 'var(--text-muted)',
              fontSize: '14px'
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            style={{
              fontWeight: isActive('/about') ? 600 : 500,
              color: isActive('/about') ? 'var(--primary-600)' : 'var(--text-muted)',
              fontSize: '14px'
            }}
          >
            About & Problem
          </Link>
        </nav>

        {/* Auth CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            <span>Get Started</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
