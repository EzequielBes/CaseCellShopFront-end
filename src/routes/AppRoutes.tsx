import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Products from '../pages/Products';
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import AdminProducts from '../pages/admin/AdminProducts';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
      
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/products" 
        element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        } 
      />

      <Route 
        path="/" 
        element={
          !isAuthenticated ? <Navigate to="/login" /> : 
          isAdmin ? <Navigate to="/admin/products" /> : 
          <Navigate to="/products" />
        } 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;