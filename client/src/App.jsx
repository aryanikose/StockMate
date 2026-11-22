import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Role Dashboards
import BusinessDashboard from './pages/business/BusinessDashboard';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Profile & Admin Pages
import BusinessProfilePage from './pages/business/BusinessProfilePage';
import SupplierProfilePage from './pages/supplier/SupplierProfilePage';
import SupplierVerificationPage from './pages/admin/SupplierVerificationPage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Inventory & Movement Pages (Phase 4)
import InventoryPage from './pages/business/InventoryPage';
import StockMovementsPage from './pages/business/StockMovementsPage';
import LowStockPage from './pages/business/LowStockPage';

// Marketplace & Catalogue Pages (Phase 5)
import SupplierCataloguePage from './pages/supplier/SupplierCataloguePage';
import SupplierMarketplacePage from './pages/business/SupplierMarketplacePage';
import SupplierDetailPage from './pages/business/SupplierDetailPage';

// Purchase Orders Pages (Phase 6)
import BusinessOrdersPage from './pages/business/BusinessOrdersPage';
import OrderDetailPage from './pages/business/OrderDetailPage';
import SupplierOrdersPage from './pages/supplier/SupplierOrdersPage';

// Placeholder view for forthcoming phases
const ModulePlaceholder = ({ name, phase }) => (
  <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{name}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
      This module is scheduled for implementation in <strong>{phase}</strong>. Authentication and role-based routing are actively securing this screen.
    </p>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Business Owner Routes (Role: 'business') */}
          <Route
            path="/business"
            element={
              <ProtectedRoute allowedRoles={['business']}>
                <DashboardLayout title="Business Dashboard" subtitle="Manage your food inventory and procure supplies" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/business/dashboard" replace />} />
            <Route path="dashboard" element={<BusinessDashboard />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="stock-movements" element={<StockMovementsPage />} />
            <Route path="low-stock" element={<LowStockPage />} />
            <Route path="marketplace" element={<SupplierMarketplacePage />} />
            <Route path="marketplace/suppliers/:supplierId" element={<SupplierDetailPage />} />
            <Route path="orders" element={<BusinessOrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="profile" element={<BusinessProfilePage />} />
          </Route>

          {/* Supplier Routes (Role: 'supplier') */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <DashboardLayout title="Supplier Portal" subtitle="Manage your product catalogue and incoming wholesale orders" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/supplier/dashboard" replace />} />
            <Route path="dashboard" element={<SupplierDashboard />} />
            <Route path="catalogue" element={<SupplierCataloguePage />} />
            <Route path="orders" element={<SupplierOrdersPage />} />
            <Route path="profile" element={<SupplierProfilePage />} />
          </Route>

          {/* Admin Routes (Role: 'admin') */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout title="Platform Administration" subtitle="Review supplier verifications and monitor platform activity" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="suppliers" element={<SupplierVerificationPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
