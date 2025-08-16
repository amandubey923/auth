import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) return <div style={{color:'#9aa2b1'}}>Checking auth…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
