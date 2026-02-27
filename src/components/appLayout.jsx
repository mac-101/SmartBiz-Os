import Sidebar from "./sidebar.jsx";
import FloatingBtn from "./floatingBtn.jsx";
import { useState, useEffect } from "react";
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
// import Setting from '../pages/setting.jsx';
import Profile from '../pages/profile.jsx';
import Dashboard from '../pages/dashboard.jsx';

export function AppLayout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("sale");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. RENDER CONTENT FUNCTION
    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <Dashboard />;
            case "sales": return <Sales />;
            case "expenses": return <Expenses />;
            case "inventory": return <Inventory />;
            case "assistant": return <div className="p-4">AI Assistant Content Goes Here</div>;
            case "profile": return <Profile />;
            // case "settings": return <Setting />;
            default: return <div className="p-4"><Dashboard /></div>;
        }
    };

    const handleSidebarItemClick = (tabId) => {
        setActiveTab(tabId);
        // On mobile, close sidebar after clicking
        if (window.innerWidth < 1100) {
            setSidebarVisible(false);
        }
    };

    const formOpeners = {
        openSaleForm: () => { setFormType("sale"); setShowForm(true); },
        openInventoryForm: () => { setFormType("inventory"); setShowForm(true); },
        openExpenseForm: () => { setFormType("expense"); setShowForm(true); }
    };

    const closeForm = () => setShowForm(false);
    const handleBackdropClick = (e) => e.target === e.currentTarget && closeForm();
    const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

    useEffect(() => {
        document.body.style.overflow = showForm ? "hidden" : "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showForm]);

    useEffect(() => {
        const handleResize = () => {
            const isLarge = window.innerWidth >= 1100;
            setSidebarVisible(isLarge);
        };

        // Initial check
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);



    const handleLogout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        const forms = {
            sale: <SaleForm onClose={closeForm} />,
            inventory: <UpdateStock close={closeForm} />,
            expense: <ExpenseForm onClose={closeForm} />
        };
        return forms[formType] || forms.sale;
    };

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row bg-white">
            {/* Sidebar */}
            {/* MOBILE OVERLAY: Closes sidebar when clicking outside on mobile */}
            {isSidebarVisible && window.innerWidth < 1100 && (
                <div
                    className="fixed inset-0 z-40 transition-opacity"
                    onClick={() => setSidebarVisible(false)}
                />
            )}

            {/* Sidebar */}
            {isSidebarVisible && (
                <div className="fixed md:relative z-50 h-screen"> {/* Increased z-index to 50 */}
                    <Sidebar
                        active={activeTab}
                        handleLogout={handleLogout}
                        onclick={handleSidebarItemClick}
                    />
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 min-h-screen w-full transition-all duration-300 ${isSidebarVisible ? "md:ml-64" : ""}`}>

                <header className="sticky top-0 z-30 w-full bg-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            onClick={toggleSidebar}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-800 capitalize">
                            {activeTab}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right block">
                            <p className="text-xs font-bold text-gray-900 leading-none">SmartBiz OS</p>
                            <p className="text-[10px] text-blue-600 font-medium tracking-tight">Enterprise</p>
                        </div>
                    </div>
                </header>

                <FloatingBtn formOpeners={formOpeners} />

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 w-full h-full backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-2 md:p-4"
                        onClick={handleBackdropClick}>
                        <div className="relative hide-scrollbar bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[98vh] md:max-h-[90vh] overflow-y-auto">
                            <button onClick={closeForm} className="absolute top-4 right-4 z-50 p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                            <div className="p-1">{renderForm()}</div>
                        </div>
                    </div>
                )}

                {/* Rendered View Area */}
                <div className="w-full min-h-screen ">
                    <div className="w-full min-h-screen ">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppLayout;