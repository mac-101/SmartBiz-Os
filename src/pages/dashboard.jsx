import React, { useEffect, useState, useMemo } from "react";
import FinancialChart from "../components/chart";
import { ref, onValue } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import {
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    AlertCircle,
    Calendar,
    ChevronDown
} from "lucide-react";

export default function Dashboard() {
    const [timeFilter, setTimeFilter] = useState('today');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [inventoryItems, setInventoryItems] = useState(0);
    const [lowStockAlerts, setLowStockAlerts] = useState(0);

    // --- Date Helpers ---
    const getDateRange = (period) => {
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        switch (period) {
            case 'today': return { start: formatDate(today), end: formatDate(today) };
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                return { start: formatDate(startOfWeek), end: formatDate(today) };
            case 'month':
                return {
                    start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
                    end: formatDate(new Date(currentYear, currentMonth + 1, 0))
                };
            case 'year': return { start: `${currentYear}-01-01`, end: `${currentYear}-12-31` };
            default: return { start: '1970-01-01', end: '2099-12-31' };
        }
    };

    const isDateInRange = (dateStr, range) => {
    if (!dateStr) return false;
    // Extract YYYY-MM-DD from the ISO string or displayDate
    const d = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    return d >= range.start && d <= range.end;
};

   const filteredData = useMemo(() => {
    const range = getDateRange(timeFilter);
    
    // Filter sales based on the date
    const filteredSales = sales.filter(s => isDateInRange(s.date, range));
    
    // Filter expenses based on the date
    const filteredExpenses = expenses.filter(e => isDateInRange(e.date, range));

    return {
        sales: filteredSales,
        expenses: filteredExpenses,
        // FIX: Use grandTotal because that is what your handleSubmit saves
        totalSales: filteredSales.reduce((a, c) => a + (Number(c.grandTotal) || 0), 0),
        // FIX: Ensure expenses use 'amount'
        totalExpenses: filteredExpenses.reduce((a, c) => a + (Number(c.amount) || 0), 0),
    };
}, [timeFilter, sales, expenses]);

    // --- Export Logic ---
    const handleExportReport = () => {
        const netProfit = filteredData.totalSales - filteredData.totalExpenses;
        const headers = ["Category", "Description", "Amount (₦)", "Date"];
        const saleRows = filteredData.sales.map(s => ["Income", s.productName, s.total, s.date.split('T')[0]]);
        const expenseRows = filteredData.expenses.map(e => ["Expense", e.category, e.amount, e.date]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers, ...saleRows, ...expenseRows].map(e => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `SmartBiz_Report_${timeFilter}.csv`);
        link.click();
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
    // 1. Get the Store Key from storage
    const bizId = localStorage.getItem("active_business_id");

    // 2. Stop if no user or no bizId
    if (!user || !bizId) return;

    // 3. Set up the paths using bizId
    const salesRef = ref(db, `businessData/${bizId}/sales`);
    const expensesRef = ref(db, `businessData/${bizId}/expenses`);
    const inventoryRef = ref(db, `businessData/${bizId}/inventory`);

    // FETCH SALES (Using the Flat Logic from your Sales Page)
    const unsubS = onValue(salesRef, (snap) => {
        const data = snap.val();
        // If data exists, map it; otherwise, empty array
        const allSales = data ? Object.keys(data).map(key => ({ 
            id: key, 
            ...data[key] 
        })) : [];

        // Sort by date (Newest first)
        allSales.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSales(allSales);
    });

    // FETCH EXPENSES
    const unsubE = onValue(expensesRef, (snap) => {
        const data = snap.val();
        const allExpenses = data ? Object.keys(data).map(key => ({ 
            id: key, 
            ...data[key] 
        })) : [];
        setExpenses(allExpenses);
    });

    // FETCH INVENTORY
    const unsubI = onValue(inventoryRef, (snap) => {
        const val = snap.val() || {};
        const list = Object.values(val);
        setInventoryItems(list.length);
        setLowStockAlerts(list.filter(i => (Number(i.quantity) || 0) < 5).length);
        setLoading(false);
    });

    return () => {
        unsubS();
        unsubE();
        unsubI();
    };
}, [user]); // user is the only dependency needed

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="max-w-[1600px] mx-auto p-2 lg:p-6 min-h-screen bg-[#F9FAFB] space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitoring business performance for {timeFilter}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {['today', 'week', 'month', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setTimeFilter(p)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${timeFilter === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExportReport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <Download size={14} />
                        Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Revenue"
                    value={filteredData.totalSales}
                    trend="+12.5%"
                    trendUp={true}
                    icon={<ArrowUpRight size={16} className="text-emerald-500" />}
                />
                <MetricCard
                    title="Expenses"
                    value={filteredData.totalExpenses}
                    trend="-2.1%"
                    trendUp={false}
                    icon={<ArrowDownRight size={16} className="text-rose-500" />}
                />
                <MetricCard
                    title="Net Profit"
                    value={filteredData.totalSales - filteredData.totalExpenses}
                    isProfit={true}
                />
                <MetricCard
                    title="Inventory"
                    value={inventoryItems}
                    isCurrency={false}
                    subtitle={`${lowStockAlerts} low stock alerts`}
                    icon={<Layers size={16} className="text-slate-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analytics Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Financial Performance</h3>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> REVENUE
                            <span className="w-2 h-2 rounded-full bg-slate-300 ml-2"></span> EXPENSES
                        </div>
                    </div>
                    <div className="p-6 h-[400px]">
                        <FinancialChart
                            timeFilter={timeFilter}
                            salesData={filteredData.sales}
                            expensesData={filteredData.expenses}
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                            <h2 className="text-3xl font-bold mb-6">
                                ₦{(filteredData.totalSales - filteredData.totalExpenses).toLocaleString()}
                            </h2>
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <div className="text-xs">
                                    <p className="text-slate-400">Monthly Target</p>
                                    <p className="font-bold">₦2.5M / ₦5.0M</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slow"></div>
                            </div>
                        </div>
                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" />
                            Inventory Health
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total SKUs Tracked</span>
                                <span className="font-bold text-slate-900">{inventoryItems}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full w-[75%] rounded-full"></div>
                            </div>
                            <p className="text-[11px] text-slate-400 italic text-center">
                                All warehouse data synced at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Cleaner Metric Cards
function MetricCard({ title, value, trend, trendUp, icon, isCurrency = true, isProfit = false, subtitle }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                <div className="p-2 bg-slate-50 rounded-lg">{icon || <Calendar size={16} className="text-slate-400" />}</div>
            </div>
            <div className="flex items-baseline gap-2 truncate">
                <h2 className={`text-2xl font-bold tracking-tight ${isProfit && value < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {isCurrency ? `₦${value.toLocaleString()}` : value}
                </h2>
                {trend && (
                    <span className={`text-[11px] font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend}
                    </span>
                )}
            </div>
            {subtitle && <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-8 animate-pulse bg-[#F9FAFB] min-h-screen">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-32 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-[400px] bg-white rounded-2xl border border-slate-100"></div>
                <div className="h-[400px] bg-white rounded-2xl border border-slate-100"></div>
            </div>
        </div>
    );
}