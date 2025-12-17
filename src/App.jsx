import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from './components/protectedRoute'; // Import ProtectedRoute
import Dashboard from './pages/dashboard.jsx';
import { AppLayout } from './components/appLayout.jsx';
import Inventory from './pages/inventory.jsx';
import Expenses from './pages/expenses.jsx';
import Sales from './pages/sales.jsx';
import BusinessSignup from './forms/signUp.jsx';
import BusinessProfile from './pages/profile.jsx';
import BusinessLogin from './forms/login.jsx';
import Setting from './pages/setting.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<BusinessLogin />} />
        <Route path="/signup" element={<BusinessSignup />} />
        
        {/* Protected Routes - Wrap with ProtectedRoute */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
         </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="assistant" element={<Dashboard />} />
          <Route path="settings" element={<Setting />} />
          <Route path="profile" element={<BusinessProfile />} />
        </Route>
        
        {/* Redirect all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;