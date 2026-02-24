import { ShoppingCart, Receipt, FolderKanban, Bot, Settings, LayoutDashboard, ChevronRight, UserCircle, MessageSquare, Shield } from "lucide-react";
import { businessInfo } from "./data";

const menuGroups = [
    { title: "Main", items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "sales", label: "Sales", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
        { id: "expenses", label: "Expenses", icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
        { id: "inventory", label: "Inventory", icon: FolderKanban, color: "text-purple-600", bg: "bg-purple-50" }]
    },
    { title: "Analytics", items: [{ id: "assistant", label: "AI Assistant", icon: Bot, color: "text-cyan-600", bg: "bg-cyan-50" }] },
    { title: "Support", items: [
        { id: "profile", label: "Profile", icon: UserCircle, color: "text-gray-600", bg: "bg-gray-50" },
        { id: "settings", label: "Settings", icon: Settings, color: "text-gray-600", bg: "bg-gray-50" }] 
    }
];

export default function Sidebar({ active, onclick, handleLogout }) {
    return (
        <div className="w-64 h-screen bg-white fixed left-0 top-0 flex flex-col ">
            <div className="px-6 py-5 border-b flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">SmartBiz OS</h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Management System</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
                {menuGroups.map(group => (
                    <div key={group.title}>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">{group.title}</h3>
                        {group.items.map(item => {
                            const isAct = active === item.id;
                            return (
                                <div key={item.id} onClick={() => onclick(item.id)} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isAct ? `${item.bg} ${item.color} shadow-sm font-semibold` : "text-gray-600 hover:bg-gray-100"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAct ? item.bg : "bg-gray-100"}`}><item.icon size={18} /></div>
                                        <span className="text-sm">{item.label}</span>
                                    </div>
                                    {isAct && <ChevronRight size={14} />}
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 text-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-900">Need Help?</p>
                    <button className="mt-2 w-full text-[11px] py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-100">Get Support</button>
                </div>

                <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors">Log Out</button>
            </nav>

            <div className="p-4 border-t bg-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{businessInfo.businessName[0]}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{businessInfo.businessName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{businessInfo.businessType}</p>
                </div>
            </div>
        </div>
    );
}