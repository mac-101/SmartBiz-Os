import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase.config";
import InviteStaff from "../forms/addStaff";

export default function ViewStaff() {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("");

  // Get stored role and business ID
  const userRole = localStorage.getItem("user_role");
  const bizId = localStorage.getItem("active_business_id");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !bizId) {
        setLoading(false);
        return;
      }

      // We now point to the shared Business ID, not the user.uid
      const staffRef = ref(db, `businessData/${bizId}/staff`);
      const planRef = ref(db, `businessData/${bizId}/businessInfo/subscription`);
      onValue(planRef, (snapshot) => {
        if (snapshot.exists()) {
          setPlan(snapshot.val().plan);
        }
      });
      const unsubscribeData = onValue(staffRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data);
          setStaffList(list);
          setFilteredStaff(list);
        } else {
          setStaffList([]);
          setFilteredStaff([]);
        }
        setLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, [bizId]);

  useEffect(() => {
    const result = staffList.filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStaff(result);
  }, [search, staffList]);

  const roleColor = (role) => {
    if (role === "admin" || role === "manager") return "bg-purple-100 text-purple-600";
    if (role === "inventory") return "bg-green-100 text-green-600";
    return "bg-blue-100 text-blue-600";
  };

  const initials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts[0][0] + (parts[1] ? parts[1][0] : "");
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 font-medium">
        Loading Team...
      </div>
    );

  return (
    <div className="p-6">
      {!addStaffOpen ? (
        <>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Your Team
              </h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {staffList.length} team members
              </p>
            </div>

            {/* Only show Invite button if user is Manager */}
            {userRole === "manager" && (
              <button
                onClick={() => {
                  if (plan === 'Free Trial' && !(staffList.length >= 1)) {
                    setAddStaffOpen(true);
                  } else {
                    alert("Your current plan only allows 2 staff members. Please upgrade to add more.")
                  }
                }}
                className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-gray-200 transition-all"
              >
                + Invite Staff
              </button>
            )}
          </div>

          {/* SEARCH */}
          {staffList.length > 0 && (
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-100 bg-gray-50 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
              />
            </div>
          )}

          {/* STAFF LIST */}
          {filteredStaff.length > 0 ? (
            <div className="space-y-3">
              {filteredStaff.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 text-sm font-black border border-slate-200">
                      {initials(s.name)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 leading-none mb-1">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {s.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-[10px] rounded-lg font-black uppercase tracking-tighter ${roleColor(s.role)}`}
                    >
                      {s.role}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-tighter">
                      Joined {new Date(s.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-50">
                <span className="text-2xl text-gray-300">👥</span>
              </div>
              <p className="text-gray-400 text-sm font-bold mb-4">
                No staff members found
              </p>
              {userRole === "manager" && (
                <button
                  onClick={() => setAddStaffOpen(true)}
                  className="text-blue-600 text-sm font-black hover:text-blue-700 underline underline-offset-4"
                >
                  Invite your first staff member →
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => setAddStaffOpen(false)}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
          >
            ← Back to Team
          </button>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
             <InviteStaff />
          </div>
        </div>
      )}
    </div>
  );
}