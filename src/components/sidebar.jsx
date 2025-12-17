import { Link } from "react-router-dom";
import {
    ShoppingCart,
    Receipt,
    FolderKanban,
    Bot,
    Settings,
    LayoutDashboard,
    ChevronRight,
    BarChart3,
    UserCircle,
    MessageSquare,
    Shield
} from "lucide-react";
import { businessInfo } from "./data";

export default function Sidebar({ active, onclick, handleLogout }) {
    const menuItems = [
        { path: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-50" },
        { path: "/sales", label: "Sales", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
        { path: "/expenses", label: "Expenses", icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
        { path: "/inventory", label: "Inventory", icon: FolderKanban, color: "text-purple-600", bg: "bg-purple-50" },
        // { path: "/Reports", label: "Reports", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
        { path: "/assistant", label: "AI Assistant", icon: Bot, color: "text-cyan-600", bg: "bg-cyan-50" },
        { path: "/profile", label: "Profile", icon: UserCircle, color: "text-gray-600", bg: "bg-gray-50" },
        { path: "/settings", label: "Settings", icon: Settings, color: "text-gray-600", bg: "bg-gray-50" },
    ];

    return (
        <div className="w-64 h-screen bg-linear-to-b from-white to-gray-50 fixed left-0 top-0 flex flex-col">

            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">SmartBiz OS</h1>
                        <p className="text-xs text-gray-500">Business Management</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 hide-scrollbar overflow-y-auto p-4 space-y-1">
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Main</h3>
                    <div className="space-y-1">
                        {menuItems.slice(0, 4).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group
                                    ${active === item.path
                                        ? `${item.bg} ${item.color} font-semibold shadow-sm`
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={onclick}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active === item.path ? item.bg : "bg-gray-100 group-hover:bg-gray-200"}`}>
                                        <item.icon size={18} className={active === item.path ? item.color : "text-gray-500"} />
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                                {active === item.path && (
                                    <ChevronRight size={16} className={item.color} />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Analytics</h3>
                    <div className="space-y-1">
                        {menuItems.slice(4, 6).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group
                                    ${active === item.path
                                        ? `${item.bg} ${item.color} font-semibold shadow-sm`
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={onclick}

                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active === item.path ? item.bg : "bg-gray-100 group-hover:bg-gray-200"}`}>
                                        <item.icon size={18} className={active === item.path ? item.color : "text-gray-500"} />
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                                {active === item.path && (
                                    <ChevronRight size={16} className={item.color} />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Support</h3>
                    <div className="space-y-1">
                        {menuItems.slice(6).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group
                                    ${active === item.path
                                        ? `${item.bg} ${item.color} font-semibold shadow-sm`
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={onclick}

                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active === item.path ? item.bg : "bg-gray-100 group-hover:bg-gray-200"}`}>
                                        <item.icon size={18} className={active === item.path ? item.color : "text-gray-500"} />
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                                {active === item.path && (
                                    <ChevronRight size={16} className={item.color} />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Need Help?</p>
                            <p className="text-xs text-gray-600">Contact support</p>
                        </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                        Get Assistance
                    </button>
                </div>
                <div onClick={handleLogout} className="mt-8 px-4 cursor-pointer py-2 bg-linear-to-r text-black from-red-50 to-orange-50 font-bold flex justify-center rounded-xl border border-blue-100">
                    Log Out
                </div>

            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{businessInfo.businessName.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{businessInfo.businessName}</p>
                        <p className="text-xs text-gray-500">{businessInfo.businessType}</p>
                    </div>
                </div>
                <div className="text-xs text-gray-400 text-center"
                    onClick={onclick}
                >
                    © {new Date().getFullYear()} SmartBiz. All rights reserved.
                </div>
            </div>


        </div>
    );
}