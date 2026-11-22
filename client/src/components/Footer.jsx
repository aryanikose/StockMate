import React from 'react';
import { Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border-light)',
      padding: '48px 24px 24px 24px',
      color: 'var(--text-muted)',
      fontSize: '14px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div className="logo-badge" style={{ width: '32px', height: '32px' }}>
              <Package size={18} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '18px' }}>StockMate</span>
          </div>
          <p style={{ lineHeight: '1.6', fontSize: '13px' }}>
            The dedicated inventory and procurement platform built specifically for cafes, restaurants, bakeries, and cloud kitchens.
          </p>
        </div>

        {/* For Businesses */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>For Food Businesses</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <li>Real-time Stock Tracking</li>
            <li>Low-Stock Threshold Alerts</li>
            <li>Stock IN / OUT / Adjustments</li>
            <li>Supplier Discovery Marketplace</li>
            <li>Purchase Order Management</li>
          </ul>
        </div>

        {/* For Suppliers */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>For Suppliers</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <li>Digital Product Catalogue</li>
            <li>Live Price Management</li>
            <li>Incoming Orders Queue</li>
            <li>Order Dispatch Tracking</li>
            <li>Verified Merchant Badging</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <li><Link to="/about" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>About & Architecture</Link></li>
            <li><Link to="/login">Sign In to Dashboard</Link></li>
            <li><Link to="/register">Create an Account</Link></li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '13px'
      }}>
        <div>&copy; {new Date().getFullYear()} StockMate Platform. Built with the MERN Stack.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Designed with simplicity & precision</span>
        </div>
      </div>
    </footer>
  );
}
