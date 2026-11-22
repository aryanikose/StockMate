import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ArrowRight, 
  AlertTriangle, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Utensils
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{
          backgroundColor: '#ffffff',
          padding: '72px 24px 80px 24px',
          borderBottom: '1px solid var(--border-light)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              border: '1px solid var(--primary-100)'
            }}>
              <Utensils size={15} />
              <span>Tailored for Cafes, Restaurants, Bakeries & Cloud Kitchens</span>
            </div>

            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-1px',
              marginBottom: '20px'
            }}>
              Eliminate notebook chaos. <br />
              <span style={{ color: 'var(--primary-600)' }}>Keep kitchen ingredients stocked.</span>
            </h1>

            <p style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 36px auto'
            }}>
              StockMate is the unified inventory tracking and supplier procurement platform. Track daily raw materials, prevent sudden stockouts, discover verified suppliers, and place purchase orders seamlessly.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
                <span>Get Started as a Business or Supplier</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }}>
                <span>Sign In to Dashboard</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div style={{
              marginTop: '56px',
              paddingTop: '32px',
              borderTop: '1px solid var(--border-light)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>Zero Guesswork</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Automated low-stock threshold alerts</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>100% Immutable</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Complete audit log of every stock movement</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>Price Snapshots</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Purchase orders preserve exact agreed prices</div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Roles Section */}
        <section style={{ padding: '72px 24px', backgroundColor: 'var(--bg-main)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-main)' }}>
                Two Powerful Workflows, One Integrated Platform
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '15px' }}>
                Connecting food businesses that need supplies with the local vendors who supply them.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Card 1: Business Owners */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Package size={26} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>For Food Businesses</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Manage kitchen ingredients, spices, dairy, produce, and packaging without bloated ERP complexity.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="var(--primary-600)" />
                    <span>Real-time stock quantities & category tracking</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="var(--primary-600)" />
                    <span>Instant alerts for items approaching low thresholds</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="var(--primary-600)" />
                    <span>Audit history for consumption, waste, and adjustments</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="var(--primary-600)" />
                    <span>Marketplace to discover local verified suppliers</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Suppliers */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Store size={26} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>For Wholesale Suppliers</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Publish your product catalogue, update live market prices, and receive direct purchase orders from food establishments.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span>Digital product catalogue with categories & pricing</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span>One-click product availability status toggles</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span>Structured incoming purchase orders queue</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#2563eb" />
                    <span>Admin verification badge for business credibility</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ padding: '72px 24px', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
                Built to Solve Food Business Pain Points
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '15px' }}>
                Practical, dependable tools tailored to real kitchen workflows.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
              <div style={{ padding: '20px' }}>
                <div className="stat-icon warning" style={{ marginBottom: '16px' }}>
                  <AlertTriangle size={24} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>No Sudden Stockouts</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  Set custom minimum thresholds for milk, tomatoes, cooking oil, or flour. StockMate alerts you the moment items run low.
                </p>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="stat-icon primary" style={{ marginBottom: '16px' }}>
                  <ShoppingCart size={24} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Direct Procurement</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  Compare supplier prices in your city. Add items to an order and send official purchase orders directly to suppliers.
                </p>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="stat-icon info" style={{ marginBottom: '16px' }}>
                  <TrendingUp size={24} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Accurate Stock Movements</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  Distinguish between deliveries received (Stock IN), kitchen consumption (Stock OUT), and wastage or recount adjustments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section style={{
          backgroundColor: 'var(--primary-50)',
          borderTop: '1px solid var(--primary-100)',
          borderBottom: '1px solid var(--primary-100)',
          padding: '64px 24px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
              Ready to streamline your kitchen operations?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
              Join cafes, restaurants, and cloud kitchens already eliminating spreadsheet errors with StockMate.
            </p>
            <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <span>Create Your Account</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
