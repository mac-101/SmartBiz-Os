import React, { useEffect, useState } from 'react';
import { 
    LayoutGrid, 
    ShoppingBag, 
    Receipt, 
    Package, 
    Sparkles, 
    User, 
    LifeBuoy,
    LogOut,
    ExternalLink
} from "lucide-react";
import { auth, db } from "../../firebase.config";
import { ref, onValue } from "firebase/database";

const NAVIGATION = [
    {
        group: "Workspace",
        items: [
            { id: "dashboard", label: "Overview", icon: LayoutGrid, roles: ["manager", "staff"] },
            { id: "sales", label: "Sales", icon: ShoppingBag, roles: ["manager", "staff"] },
            { id: "inventory", label: "Stock & Inventory", icon: Package, roles: ["manager", "staff"] },
            { id: "expenses", label: "Expenses", icon: Receipt, roles: ["manager"] }, // Only Manager
        ]
    },
    {
        group: "Intelligence",
        items: [
            { id: "assistant", label: "Smart Assistant", icon: Sparkles, roles: ["manager", "staff"] },
            { id: "Team", label: "Team Management", icon: User, roles: ["manager"] }, // Only Manager
        ]
    }
];

export default function Sidebar({ active, onclick, handleLogout }) {
    const [bizInfo, setBizInfo] = useState({ businessName: "", businessType: "" });
    
    // Get stored role and business ID
    const userRole = localStorage.getItem("user_role") || "staff";
    const bizId = localStorage.getItem("active_business_id");

    useEffect(() => {
        if (!bizId) return;

        // Fetch business info using the shared bizId (so staff see the store name)
        const bizRef = ref(db, `businessData/${bizId}/businessInfo`);
        const unsubscribe = onValue(bizRef, (snapshot) => {
            if (snapshot.exists()) setBizInfo(snapshot.val());
        });
        return () => unsubscribe();
    }, [bizId]);

    const businessInitial = bizInfo.businessName ? bizInfo.businessName[0].toUpperCase() : "?";

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col z-50">
            {/* Branding - Clean & Minimal */}
            <div className="h-16 flex items-center px-6 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <span className="font-bold tracking-tight text-slate-900">SmartBiZ<span className="text-blue-600">Os</span></span>
                </div>
            </div>

            {/* Nav Scroll Area */}
            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                {NAVIGATION.map((section) => {
                    // Filter items based on user role
                    const visibleItems = section.items.filter(item => item.roles.includes(userRole));
                    
                    // If no items are visible in this section for this role, hide the section
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

                {/* Secondary Links */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-[2px]">
                    <button onClick={() => onclick('profile')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                        <User size={18} /> Account
                    </button>
                    <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3"><LifeBuoy size={18} /> Support</div>
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                    </a>
                </div>
            </div>

            {/* User Profile / Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2 py-1 mb-4">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-inner border-2 border-white">
                        {businessInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                            {bizInfo.businessName || "Your Business"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tighter">
                            {userRole === 'manager' ? (bizInfo.businessType || "Owner") : "Staff Account"}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                >
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </aside>
    );
}