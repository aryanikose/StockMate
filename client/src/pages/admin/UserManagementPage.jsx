import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Building2, 
  Store, 
  Mail, 
  Phone, 
  Calendar,
  Loader2 
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="badge badge-category" style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
            <ShieldCheck size={12} />
            <span>Administrator</span>
          </span>
        );
      case 'business':
        return (
          <span className="badge badge-in-stock">
            <Building2 size={12} />
            <span>Business Owner</span>
          </span>
        );
      case 'supplier':
        return (
          <span className="badge badge-category" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
            <Store size={12} />
            <span>Wholesale Supplier</span>
          </span>
        );
      default:
        return <span className="badge badge-category">{role}</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
          User & Account Moderation
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Inspect all registered platform accounts across business owners, wholesale distributors, and system administrators
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '13px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'BUSINESS', 'SUPPLIER', 'ADMIN'].map((rf) => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`btn btn-sm ${roleFilter === rf ? 'btn-primary' : 'btn-secondary'}`}
              >
                {rf === 'ALL' ? 'All Roles' : rf.charAt(0) + rf.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-600)" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users size={44} className="empty-state-icon" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Users Found</h3>
            <p style={{ marginTop: '4px', fontSize: '14px' }}>
              No accounts match your current search or role filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Assigned Role</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Mail size={13} color="var(--primary-600)" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Phone size={13} color="var(--primary-600)" />
                      <span>{u.phone}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{new Date(u.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
