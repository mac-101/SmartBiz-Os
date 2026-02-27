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
          {/* Default to dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
          <Route path="/signUp" element={<BusinessSignup />} />
          <Route path="/landingPage" element={<LandingPage />} />
          <Route path="/login" element={<BusinessLogin />} />
          
        </Routes>
      </FirstTimeWrapper>
    </Router>
  );
}
function App(){
  return <AppContent />;
}

export default App;