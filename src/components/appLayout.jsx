import Sidebar from "./sidebar.jsx";
import FloatingBtn from "./floatingBtn.jsx";
import { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import SaleForm from "../forms/saleForm.jsx";
import UpdateStock from "../forms/updateStock.jsx";
import ExpenseForm from "../forms/expenceForm.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";
import { useNavigate } from "react-router-dom";

import Inventory from '../pages/inventory.jsx';
import Expenses from '../pages/expenses.jsx';
import Sales from '../pages/sales.jsx';
import Profile from '../pages/profile.jsx';
import Dashboard from '../pages/dashboard.jsx';

export function AppLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    // Start true only if screen is wide
    const [isSidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1100);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("sale");
    const navigate = useNavigate();

    const views = {
        dashboard: <Dashboard />,
        sales: <Sales />,
        expenses: <Expenses />,
        inventory: <Inventory />,
        assistant: <div className="p-8 font-bold text-gray-400 text-center">AI Assistant arriving soon...</div>,
        profile: <Profile />,
    };

    const handleSidebarItemClick = (tabId) => {
        setActiveTab(tabId);
        // Auto-close only on mobile
        if (window.innerWidth < 1100) setSidebarVisible(false);
    };

    const closeForm = () => setShowForm(false);
    const formOpeners = useMemo(() => ({
        openSaleForm: () => { setFormType("sale"); setShowForm(true); },
        openInventoryForm: () => { setFormType("inventory"); setShowForm(true); },
        openExpenseForm: () => { setFormType("expense"); setShowForm(true); }
    }), []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) { console.error(error); }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            
            {/* 1. SIDEBAR: Fixed on mobile, static on desktop */}
            <div className={`
                fixed inset-y-0 left-0 z-[100] w-64 transform transition-transform duration-300 ease-in-out bg-white shadow-xl
                lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-100
                ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}
                ${!isSidebarVisible && "lg:hidden"} 
            `}>
                <Sidebar 
                    active={activeTab} 
                    handleLogout={handleLogout} 
                    onclick={handleSidebarItemClick} 
                />
            </div>

            {/* 2. MOBILE OVERLAY: Only shows when sidebar is open on small screens */}
            {isSidebarVisible && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
                    onClick={() => setSidebarVisible(false)}
                />
            )}

            {/* 3. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                
                {/* Header */}
                <header className="h-16 flex-none bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarVisible(!isSidebarVisible)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
                            {activeTab}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-900 leading-none">SmartBiZ Os</p>
                            <p className="text-[9px] text-blue-600 font-bold uppercase mt-0.5 tracking-tighter">Enterprise Edition</p>
                        </div>
                    </div>
                </header>

                {/* Page Content: This scrolls independently */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        {views[activeTab] || views.dashboard}
                    </div>
                </main>

                <FloatingBtn formOpeners={formOpeners} />
            </div>

            {/* 4. FORM MODAL */}
            {showForm && (
                <div 
                    className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 bg-slate-900/50 backdrop-blur-md"
                    onClick={(e) => e.target === e.currentTarget && closeForm()}
                >
                    <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl relative">
                        <button 
                            onClick={closeForm}
                            className="fixed md:absolute top-4 right-4 z-[210] p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
                        >
                            <X size={20} />
                        </button>
                        <div className="p-1">
                            {formType === "sale" && <SaleForm onClose={closeForm} />}
                            {formType === "inventory" && <UpdateStock close={closeForm} />}
                            {formType === "expense" && <ExpenseForm onClose={closeForm} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppLayout;