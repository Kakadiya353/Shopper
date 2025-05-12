import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Check if admin is logged in
    if (!isAuthenticated()) {
      toast.error('Please login to access this page');
    }
  }, []);

  // Check if admin is logged in
  if (!isAuthenticated()) {
    // Redirect to login page with the return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Admin is logged in, render the protected component
  return children;
};

export default ProtectedRoute;

