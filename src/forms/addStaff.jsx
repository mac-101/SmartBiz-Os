import React, { useState } from 'react';
import { auth } from '../../firebase.config';

const ROLES = {
  sales: "Can only sell items and view their own daily sales. Cannot see purchase costs.",
  inventory: "Can add products and update stock levels. Cannot view profit reports.",
  admin: "Full access to everything except business owner settings."
};

export default function InviteStaff() {
  const [role, setRole] = useState('sales');
  const [inviteLink, setInviteLink] = useState('');

  const generateLink = () => {
    const managerId = auth.currentUser.uid;
    // In a real app, 'yourdomain.com' would be your actual URL
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/staff-signup?bid=${managerId}&role=${role}`;
    setInviteLink(link);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Invite New Staff</h2>
      
      <div className="space-y-4">
        {Object.entries(ROLES).map(([r, desc]) => (
          <div 
            key={r} 
            onClick={() => setRole(r)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${role === r ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}
          >
            <p className="font-bold uppercase text-sm">{r}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={generateLink}
        className="w-full mt-6 py-3 bg-black text-white rounded-xl font-bold"
      >
        Generate Invite Link
      </button>

      {inviteLink && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg break-all text-xs font-mono border">
          <p className="mb-2 font-bold text-blue-600">Send this link to staff:</p>
          {inviteLink}
        </div>
      )}
    </div>
  );
}