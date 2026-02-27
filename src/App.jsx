import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from './components/protectedRoute'; 
import { AppLayout } from './components/appLayout.jsx';
import BusinessSignup from './forms/signUp.jsx';
import BusinessLogin from './forms/login.jsx';
import LandingPage from './pages/LandingPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<BusinessLogin />} />
        <Route path="/signup" element={<BusinessSignup />} />
        <Route path="/landing" element={<LandingPage />} />
        
        {/* LANDING PAGE REDIRECT: 
            This makes / act as a shortcut to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* The Actual Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all for 404s */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;