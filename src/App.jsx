import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from './components/protectedRoute'; 
import { AppLayout } from './components/appLayout.jsx';
import BusinessSignup from './forms/signUp.jsx';
import BusinessLogin from './forms/login.jsx';
import LandingPage from './pages/LandingPage.jsx';
import FirstTimeWrapper from './firstTimeWrapper.jsx';

function AppContent() {
  return (
    <Router>
      <FirstTimeWrapper>
        <Routes>
          {/* Default Route: Redirects to the dashboard immediately */}
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

          {/* Public Landing Page */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signUp" element={<BusinessSignup />} />
          <Route path="/login" element={<BusinessLogin />} />

          {/* Protected Dashboard Area */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </FirstTimeWrapper>
    </Router>
  );
}
function App(){
  return <AppContent />;
}

export default App;