import React, { useState } from "react";
import { auth } from "../../firebase.config";

const ROLES = {
  sales: {
    title: "Sales",
    desc: "Sell items and view own daily sales"
  },
  inventory: {
    title: "Inventory",
    desc: "Add products and manage stock"
  },
  admin: {
    title: "Admin",
    desc: "Access reports and manage staff"
  }
};

export default function InviteStaff() {

  const [role, setRole] = useState("sales");
  const [inviteLink, setInviteLink] = useState("");

  const generateLink = () => {
    const managerId = auth.currentUser.uid;
    const baseUrl = window.location.origin;

    const token = Math.random().toString(36).substring(2, 10);

    const link =
      `${baseUrl}/staff-signup?bid=${managerId}&role=${role}&token=${token}`;

    setInviteLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-lg">

      <h2 className="text-xl font-bold mb-6">Invite Staff</h2>

      {/* 3 GRID ROLE SELECTOR */}
      <div className="grid grid-cols-3 gap-4">

        {Object.entries(ROLES).map(([key, value]) => (
          <div
            key={key}
            onClick={() => setRole(key)}
            className={`p-4 rounded-xl border cursor-pointer transition
              ${role === key
                ? "border-black bg-gray-100"
                : "border-gray-200 hover:border-gray-400"}
            `}
          >

            <p className="font-semibold text-sm">
              {value.title}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {value.desc}
            </p>

          </div>
        ))}

      </div>

      {/* GENERATE BUTTON */}
      <button
        onClick={generateLink}
        className="w-full mt-6 py-3 bg-black text-white rounded-xl font-semibold"
      >
        Generate Invite Link
      </button>

      {/* LINK DISPLAY */}
      {inviteLink && (
        <div className="mt-5 p-4 border rounded-xl bg-gray-50">

          <p className="text-sm font-semibold mb-2">
            Invite Link
          </p>

          <p className="text-xs break-all font-mono mb-3">
            {inviteLink}
          </p>

          <button
            onClick={copyLink}
            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm"
          >
            Copy Link
          </button>

        </div>
      )}

    </div>
  );
}