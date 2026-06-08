import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          fontSize: '1.25rem',
          color: 'hsl(220 10% 60%)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          animation: 'pulse 1.5s infinite alternate'
        }}>
          Loading Session...
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
