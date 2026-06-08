import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        PRIME.TASK
      </div>

      <div className="navbar-user-info">
        <div className="user-avatar-tag">
          <div className="avatar-circle">
            {initial}
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{user.name}</span>
          
          {user.role === 'admin' ? (
            <span className="badge badge-done" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={10} /> ADMIN
            </span>
          ) : (
            <span className="badge badge-in_progress" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <User size={10} /> USER
            </span>
          )}
        </div>

        <button onClick={logout} className="btn btn-secondary btn-icon" title="Logout" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
