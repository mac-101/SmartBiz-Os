import { Link } from "react-router-dom";
import {
    ShoppingCart,
    Receipt,
    FolderKanban,
    Bot,
    Settings,
    LayoutDashboard
} from "lucide-react";

export default function Sidebar({ active }) {
    return (
        <div className="w-64 h-screen bg-white fixed left-0 top-0 flex flex-col">

            {/* Logo */}
            <div className="px-6 py-5 ">
                <h1 className="text-xl font-bold text-gray-800">SmartBiz OS</h1>
                
                 
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">

                <Link
                    to="/"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
            ${active === "/"
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </Link>

                <Link
                    to="/sales"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
            ${active === "/sales"
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <ShoppingCart size={18} />
                    Sales
                </Link>

                <Link
                    to="/expenses"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
            ${active === "/expenses"
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Receipt size={18} />
                    Expenses
                </Link>

                <Link
                    to="/inventory"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
            ${active === "/inventory"
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FolderKanban size={18} />
                    Inventory
                </Link>

                <Link
                    to="/assistant"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
            ${active === "/assistant"
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Bot size={18} />
                    AI Assistant
                </Link>

                <Link
                    to="/settings"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
            ${active === "/settings"
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Settings size={18} />
                    Settings
                </Link>

            </nav>

            {/* Footer */}
            <div className="p-4 text-xs text-gray-400 border-t">
                © {new Date().getFullYear()} SmartBiz
            </div>
        </div>
    );
}
