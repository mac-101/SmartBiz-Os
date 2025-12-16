import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase.config"; // Your firebase config path
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error("Auth error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Authentication error. Please refresh.</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, save the location they tried to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}