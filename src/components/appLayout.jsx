import Sidebar from "./sidebar.jsx";
import FloatingBtn from "./floatingBtn.jsx";
import { useState, useEffect } from "react";
import { LayoutDashboard, X } from "lucide-react";
import SaleForm from "../forms/saleForm.jsx";
import InventoryForm from "../forms/inventoryForm.jsx";
import ExpenseForm from "../forms/expenceForm.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";

export function AppLayout() {
    const location = useLocation();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("sale");
    const [click, setClick] = useState(true);
    const [loading, setLoading] = useState(false);

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
            setClick(!isLarge);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            console.log("User signed out");
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
  };

    const renderForm = () => {
        const forms = {
            sale: <SaleForm onClose={closeForm} />,
            inventory: <InventoryForm onClose={closeForm} />,
            expense: <ExpenseForm onClose={closeForm} />
        };
        return forms[formType] || forms.sale;
    };

    const sideBar = ["/signup", "/login"].includes(location.pathname);

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row">
            {/* Sidebar */}
            {!sideBar && isSidebarVisible && (
                <div className="fixed md:relative z-40 h-screen">
                    <Sidebar active={location.pathname} handleLogout={handleLogout} onclick={click && toggleSidebar} />
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 min-h-screen w-full transition-all duration-300 ${!sideBar && isSidebarVisible ? "md:ml-64" : ""}`}>
                {!sideBar && (
                    <button
                        className={`fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors ${isSidebarVisible ? "ml-50" : ""}`}
                        onClick={toggleSidebar}
                    >
                        <LayoutDashboard size={20} />
                    </button>
                )}

                <FloatingBtn formOpeners={formOpeners} />

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

                {/* THIS IS THE KEY FIX - Proper Outlet container with your exact working structure */}
                <div className="w-full min-h-screen">
                    <div className={`w-full min-h-screen p-1 ${!sideBar && "md:p-6"}`}>
                        <div className="w-full min-h-full">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppLayout;