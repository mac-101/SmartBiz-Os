import React, { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../../firebase.config";
import { useNavigate, Link } from "react-router-dom";

function BusinessLogin() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Set persistence based on "Stay logged in"
      await setPersistence(
        auth, 
        loginData.rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      const user = userCredential.user;
      const staffMapRef = ref(db, `staffMap/${user.uid}`);
      const staffMapSnap = await get(staffMapRef);

      let activeBusinessId;
      let userType;

      if (staffMapSnap.exists()) {
        const staffData = staffMapSnap.val();
        activeBusinessId = staffData.managerId;
        userType = staffData.role || "staff";
      } else {
        activeBusinessId = user.uid;
        userType = "manager";
      }

      localStorage.setItem("active_business_id", activeBusinessId);
      localStorage.setItem("user_role", userType);
      localStorage.setItem("user_uid", user.uid);

      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-[1000px] flex bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Branding/Visual (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 bg-gray-900 p-12 flex-col justify-between text-white">
          <div>
            <div className="h-10 w-10 bg-white rounded-xl mb-8 flex items-center justify-center">
               <div className="h-5 w-5 bg-black rounded-sm" />
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Manage your <br /> business inventory <br /> with ease.
            </h1>
          </div>
          
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16">
          <div className="max-w-sm mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-sm bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Work Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-black/5 focus:border-black outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-black/5 focus:border-black outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Stay logged in</span>
                </label>
                <button type="button" className="font-medium text-black hover:underline underline-offset-4">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing in...
                  </>
                ) : "Sign In to Dashboard"}
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Don't have an account yet?{" "}
              <Link to="/signup" className="font-bold text-black hover:underline underline-offset-4">
                Get started for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessLogin;