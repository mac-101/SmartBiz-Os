import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db } from '../../firebase.config';

export default function StaffSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const managerId = searchParams.get('bid');
  const assignedRole = searchParams.get('role');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!managerId || !assignedRole) {
      setError("Invalid or expired invitation link. Please contact your manager.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const staffUid = userCred.user.uid;
      const updates = {};

      updates[`staffMap/${staffUid}`] = {
        managerId: managerId,
        role: assignedRole
      };

      updates[`businessData/${managerId}/staff/${staffUid}`] = {
        uid: staffUid,
        name: form.name,
        email: form.email,
        role: assignedRole,
        joinedAt: new Date().toISOString()
      };

      await update(ref(db), updates);

      localStorage.setItem("active_business_id", managerId);
      localStorage.setItem("user_role", assignedRole);
      localStorage.setItem("user_uid", staffUid);

      navigate('/');
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-[480px]">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center shadow-xl">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
             </svg>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Registration</h2>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">You are joining as</span>
                <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {assignedRole || "Guest"}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 text-sm bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-4 focus:ring-black/5 focus:border-black outline-none"
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@business.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-4 focus:ring-black/5 focus:border-black outline-none"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-4 focus:ring-black/5 focus:border-black outline-none"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 shadow-lg shadow-black/10"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Setting up account...
                    </>
                  ) : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 leading-relaxed px-4">
              By joining, you agree to follow the business guidelines set by your manager.
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-bold text-black">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}