import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedAdminRoute;
