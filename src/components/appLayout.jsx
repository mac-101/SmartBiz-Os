import Sidebar from "./sidebar.jsx";
import FloatingBtn from "./floatingBtn.jsx"
import { useState, useEffect } from "react";
import { LayoutDashboard, X } from "lucide-react";
import SaleForm from "../forms/saleForm.jsx"
import InventoryForm from "../forms/inventoryForm.jsx";
import ExpenseForm from "../forms/expenceForm.jsx";

export function AppLayout({ children }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("sale");

    const openSaleForm = () => {
        setFormType("sale");
        setShowForm(true);
    };

    const openInventoryForm = () => {
        setFormType("inventory");
        setShowForm(true);
    };

    const openExpenseForm = () => {
        setFormType("expense");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeForm();
        }
    };

    // Pass form opening functions to FloatingBtn
    const formOpeners = {
        openSaleForm,
        openInventoryForm,
        openExpenseForm
    };

    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showForm]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1100) setSidebarVisible(true);
            else setSidebarVisible(false);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

    // Render the correct form based on formType
    const renderForm = () => {
        switch (formType) {
            case "sale":
                return <SaleForm onClose={closeForm} />;
            case "inventory":
                return <InventoryForm onClose={closeForm} />;
            case "expense":
                return <ExpenseForm onClose={closeForm} />;
            default:
                return <SaleForm onClose={closeForm} />;
        }
    };

    return (
        <div className="w-full min-h-screen">
            {/* Sidebar */}
            {isSidebarVisible && (
                <div className="fixed md:relative z-40">
                    <Sidebar
                        active={window.location.pathname}
                        setVisibility={setSidebarVisible}
                        isVisible={isSidebarVisible}
                    />
                </div>
            )}

            {/* Main content area */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${
                isSidebarVisible ? "lg:ml-64" : ""
            }`}>
                {/* Toggle button */}
                <button
                    className={`fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors ${
                        isSidebarVisible ? "ml-50" : ""
                    }`}
                    onClick={toggleSidebar}
                >
                    <LayoutDashboard size={20} />
                </button>

                {/* Floating Button */}
                <FloatingBtn formOpeners={formOpeners} />

                {/* Form Modal */}
                {showForm && (
                    <div 
                        className="fixed inset-0 w-full h-full backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-2 md:p-4"
                        onClick={handleBackdropClick}
                    >
                        <div className="relative hide-scrollbar bg-white rounded-2xl shadow-2xl max-w-4xl w-full  h-[98vh] md:max-h-[90vh] overflow-y-auto">
                            {/* Close Button */}
                            <button
                                onClick={closeForm}
                                className="absolute top-4 right-4 z-50 p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            {/* Form Content */}
                            <div className=" p-1">
                                {renderForm()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div className="w-full">
                    <div className="w-full p-1 md:p-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}