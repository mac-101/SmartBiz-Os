import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../../firebase.config";
import { useNavigate } from "react-router-dom";

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

    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError("");

    try {

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

      setError("Login failed. Check email or password.");

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Business Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage your business
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              required
              value={loginData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              required
              value={loginData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleChange}
              />
              Stay logged in
            </label>

            <a href="#" className="text-gray-500 hover:text-black">
              Forgot password
            </a>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="mt-8 text-center text-sm text-gray-500">

          New business?{" "}
          <a href="/signup" className="font-semibold text-black">
            Create account
          </a>

        </div>

      </div>

    </div>
  );
}

export default BusinessLogin;