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

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {

    e.preventDefault();

    if (!managerId || !assignedRole) {
      return alert("Invalid or expired invitation link.");
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

      alert("Signup failed: " + err.message);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Staff Registration
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Joining as <span className="font-semibold uppercase">{assignedRole}</span>
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Full Name
            </label>

            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Email
            </label>

            <input
              required
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Password
            </label>

            <input
              required
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Creating account..." : "Complete Registration"}
          </button>

        </form>

      </div>

    </div>
  );
}