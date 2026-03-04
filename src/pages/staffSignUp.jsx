import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db } from '../../firebase.config';

export default function StaffSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const managerId = searchParams.get('bid');
  const assignedRole = searchParams.get('role');

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!managerId || !assignedRole) {
      return alert("Invalid or expired invitation link. Please contact your manager.");
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const staffUid = userCred.user.uid;

      const updates = {};
      updates[`staffMap/${staffUid}`] = { managerId: managerId };
      updates[`businessData/${managerId}/staff/${staffUid}`] = {
        uid: staffUid,
        name: form.name,
        email: form.email,
        role: assignedRole, 
        joinedAt: new Date().toISOString()
      };

      await update(ref(db), updates);
      
      alert("Registration successful! Welcome to the team.");
      // Navigate to the dashboard or staff view
      navigate('/'); 
      
    } catch (err) {
      alert("Signup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-blue-100/50 p-8 md:p-10 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Staff Account</h2>
          <p className="text-gray-500 mt-2">
            Joining as <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg uppercase text-xs">{assignedRole}</span>
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-wider">Full Name</label>
            <input 
              required
              type="text"
              placeholder="e.g. Ebuka Obi" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 font-medium" 
              onChange={e => setForm({...form, name: e.target.value})} 
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-wider">Work Email</label>
            <input 
              required
              type="email" 
              placeholder="name@business.com" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 font-medium" 
              onChange={e => setForm({...form, email: e.target.value})} 
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-wider">Create Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 font-medium" 
              onChange={e => setForm({...form, password: e.target.value})} 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-95 shadow-xl flex justify-center items-center ${
              loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Complete Registration"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-8 px-4">
          By joining, you agree to the business inventory guidelines set by your manager.
        </p>
      </div>
    </div>
  );
}