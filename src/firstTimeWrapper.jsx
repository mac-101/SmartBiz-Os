import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FirstTimeWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');

    if (!hasVisited) {
      // 1. Mark as visited so they don't get stuck in a loop
      localStorage.setItem('hasVisitedBefore', 'true');
      
      // 2. Redirect to landing page
      navigate('/landingPage');
    } else {
      // 3. If they have visited, allow the child components to render
      setShouldRender(true);
    }
  }, [navigate]);

  // Prevent flicker while checking storage
  return shouldRender ? <>{children}</> : null;
};

export default FirstTimeWrapper;