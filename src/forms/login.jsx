import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database"; // Import database methods
import { auth, db } from "../../firebase.config"; // Import db
import { useNavigate } from 'react-router-dom';

function BusinessLogin() {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData({
            ...loginData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Login to Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
            const user = userCredential.user;

            // 2. Look for this user in the staff list
            const staffMapRef = ref(db, `staffMap/${user.uid}`);
            const staffMapSnap = await get(staffMapRef);

            let activeBusinessId;
            let userType;

            if (staffMapSnap.exists()) {
                // --- IT IS A STAFF ---
                activeBusinessId = staffMapSnap.val().managerId;
                userType = "staff";
            } else {
                // --- IT IS THE MANAGER ---
                activeBusinessId = user.uid;
                userType = "manager";
            }

            // 3. Save BOTH to the browser memory
            localStorage.setItem("active_business_id", activeBusinessId);
            localStorage.setItem("user_role", userType);

            // 4. Send them to the dashboard
            navigate('/');

        } catch (error) {
            setError("Login failed. Check your email/password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-10 border border-gray-100">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 font-medium mt-1">Login to your business portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={loginData.email}
                            onChange={handleChange}
                            placeholder="admin@business.com"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={loginData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={loginData.rememberMe}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 border-gray-200 rounded-lg focus:ring-blue-500"
                            />
                            Stay logged in
                        </label>
                        <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all transform active:scale-[0.98] flex justify-center items-center"
                    >
                        {loading ? (
                            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Sign In"}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-gray-500 text-sm font-medium">
                        New here? <a href="/signup" className="text-blue-600 font-black hover:underline ml-1">Create Business</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BusinessLogin;