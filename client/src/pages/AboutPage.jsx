import React from 'react';
import { Package, CheckCircle, Database, Server, Laptop, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '56px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            About StockMate
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '10px' }}>
            Understanding the real-world operational problem and our design philosophy.
          </p>
        </div>

        {/* Section 1: The Problem */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
            The Problem: Spreadsheet & Informal Chaos
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
            Small and independent food businesses — including cafes, family restaurants, bakeries, and cloud kitchens — rely heavily on predictable daily supplies of perishables, dry goods, and packaging materials.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
            Despite this critical need, most small operators manage their raw materials using physical notebooks, manual spreadsheets, or ad-hoc phone calls and chat messages with local suppliers. This leads to three expensive problems:
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <li><strong>Unexpected Stockouts:</strong> Running out of essential ingredients during peak dinner service.</li>
            <li><strong>Food Waste & Spoilage:</strong> Over-ordering without awareness of current stock on hand.</li>
            <li><strong>Opaque Supplier Pricing:</strong> Inability to compare supplier rates or keep an accurate audit trail of purchase orders.</li>
          </ul>
        </div>

        {/* Section 2: The Solution */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
            The Solution: Inventory + Procurement Connected
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
            StockMate bridges the gap by pairing <strong>Inventory Control</strong> with <strong>Supplier Procurement</strong> in one clean, straightforward platform:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '6px' }}>1. Inventory Control</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Real-time tracking of raw items, customizable thresholds, immutable movement logs, and zero-risk stock balances.
              </p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>2. Supplier Procurement</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Direct product catalog browsing, instant pricing comparisons, point-in-time price snapshot orders, and delivery confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Architecture */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
            MERN Architecture
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <Laptop size={22} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
              <div style={{ fontWeight: 700, fontSize: '14px' }}>React 18 + Vite</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Single-page application with responsive CSS & Context API state</div>
            </div>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <Server size={22} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Node.js & Express</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>RESTful API with JWT authentication & role-based middleware</div>
            </div>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <Database size={22} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
              <div style={{ fontWeight: 700, fontSize: '14px' }}>MongoDB & Mongoose</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Document persistence, indexed lookups, and atomic balance updates</div>
            </div>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <Shield size={22} color="var(--primary-600)" style={{ marginBottom: '8px' }} />
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Role Isolation</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Tenant data segregation between businesses, suppliers, and admin</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
