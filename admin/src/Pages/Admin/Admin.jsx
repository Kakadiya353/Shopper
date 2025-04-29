import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './Admin.css';

import Sidebar from '../../Components/Sidebar/Sidebar';
import AddProduct from '../../Components/AddProduct/AddProduct';
import CartProduct from '../../Components/CartProduct/CartProduct';
import ManageUsers from '../../Components/ManageUser/ManageUsers';
import ManageOffers from '../../Components/ManageOffers/ManageOffers';
import Dashboard from '../../Components/DashBoard/DashBoard';
import OrderProducts from '../../Components/OrderProduct/OrderProduct';
import ContactAdmin from '../../Components/Manges/contact';
import ViewDetails from '../../Components/ViewDetails/ViewDetails';
import AboutAdmin from '../../Components/Manges/AboutAdmin';
import InventoryManagement from '../../Components/Inventory/InventoryManagement';
import Expense from '../../Components/Expense/Expense';
import Reply from '../../Components/Reply/Reply';
import Profile from '../../Components/Profile/Profile';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from '../../Components/ProtectedRoute';

// 🧩 Admin layout with sidebar and nested content
const AdminLayout = () => {
  return (
    <div className="admin">
      <Sidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

// 🌐 Main admin routes
const Admin = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="addproduct" element={<AddProduct />} />
        <Route path="cartproduct" element={<CartProduct />} />
        <Route path="manageusers" element={<ManageUsers />} />
        <Route path="manageoffers" element={<ManageOffers />} />
        <Route path="manageorders" element={<OrderProducts />} />
        <Route path="about" element={<AboutAdmin />} />
        <Route path="contact" element={<ContactAdmin />} />
        <Route path="view-details" element={<ViewDetails />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="expense" element={<Expense />} />
        <Route path="reply" element={<Reply />} />
        <Route path="profile" element={<Profile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default Admin;
