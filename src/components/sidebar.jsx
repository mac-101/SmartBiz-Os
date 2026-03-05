import React, { useEffect, useState } from 'react';
import {
    LayoutGrid, ShoppingBag, Receipt, Package,
    Sparkles, User, LifeBuoy, LogOut, ExternalLink
} from "lucide-react";
import { auth, db } from "../../firebase.config";
import { ref, onValue } from "firebase/database";

const NAVIGATION = [
    {
        group: "Workspace",
        items: [
            { id: "dashboard", label: "Overview", icon: LayoutGrid, roles: ["manager", "admin"] },
            { id: "sales", label: "Sales", icon: ShoppingBag, roles: ["manager", "admin", "sales"] },
            { id: "inventory", label: "Stock & Inventory", icon: Package, roles: ["manager", "admin", "inventory"] },
            { id: "expenses", label: "Expenses", icon: Receipt, roles: ["manager", "admin", "inventory"] },
        ]
    },
    {
        group: "Intelligence",
        items: [
            { id: "assistant", label: "Smart Assistant", icon: Sparkles, roles: ["manager", "admin", "sales", "inventory"] },
            { id: "Team", label: "Team Management", icon: User, roles: ["manager", "admin"] },
        ]
    }
];

export default function Sidebar({ active, onclick, handleLogout }) {
    const [bizInfo, setBizInfo] = useState({ businessName: "", businessType: "" });

    const userRole = localStorage.getItem("user_role") || "sales";
    const bizId = localStorage.getItem("active_business_id");

    // --- FIXED: ROLE-BASED REDIRECT LOGIC ---
    useEffect(() => {
        // 1. If the user is on the profile page, don't redirect them!
        if (active === 'profile') return;

        // 2. Otherwise, carry on with the security check
        const allItems = NAVIGATION.flatMap(section => section.items);
        const currentItem = allItems.find(item => item.id === active);

        if (!currentItem || !currentItem.roles.includes(userRole)) {
            const firstAllowedItem = allItems.find(item => item.roles.includes(userRole));

            if (firstAllowedItem && active !== firstAllowedItem.id) {
                onclick(firstAllowedItem.id);
            }
        }
    }, [active, userRole, onclick]);

    useEffect(() => {
        if (!bizId) return;
        const bizRef = ref(db, `businessData/${bizId}/businessInfo`);
        const unsubscribe = onValue(bizRef, (snapshot) => {
            if (snapshot.exists()) setBizInfo(snapshot.val());
        });
        return () => unsubscribe();
    }, [bizId]);

    const businessInitial = bizInfo.businessName ? bizInfo.businessName[0].toUpperCase() : "?";

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col z-50">
            <div className="h-16 flex items-center px-6 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <span className="font-bold tracking-tight text-slate-900">SmartBiZ<span className="text-blue-600">Os</span></span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                {NAVIGATION.map((section) => {
                    const visibleItems = section.items.filter(item => item.roles.includes(userRole));
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.group} className="mb-8">
                            <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                {section.group}
                            </h2>
                            <div className="space-y-[2px]">
                                {visibleItems.map((item) => {
                                    const isActive = active === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onclick(item.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative group
                                                ${isActive
                                                    ? "bg-slate-100 text-slate-900 font-medium"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                                }`}
                                        >
                                            <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                                            {item.label}
                                            {isActive && (
                                                <div className="absolute left-0 w-1 h-4 bg-blue-600 rounded-r-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-[2px]">
                    <button
                        onClick={() => onclick('profile')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${active === 'profile'
                                ? "bg-slate-100 text-slate-900 font-medium"
                                : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <User size={18} /> Account
                    </button>
                    {/* Badge for Clarity */}
                    <div className="mx-3 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100 mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Role</p>
                        <p className="text-xs font-bold text-blue-600 capitalize">{userRole}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2 py-1 mb-4">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-inner border-2 border-white">
                        {businessInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                            {bizInfo.businessName || "Your Business"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-medium uppercase">
                            {userRole === 'manager' ? "Owner Account" : `${userRole} Portal`}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </aside>
    );
}