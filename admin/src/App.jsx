import React from 'react';
import Admin from './Pages/Admin/Admin';
import 'react-data-table-component-extensions/dist/index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="admin/*" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
