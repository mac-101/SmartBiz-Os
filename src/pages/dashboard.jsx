import React, { useEffect, useState, useMemo } from "react";
import FinancialChart from "../components/chart";
import { ref, onValue } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { Download, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
    const [timeFilter, setTimeFilter] = useState('today');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [inventoryItems, setInventoryItems] = useState(0);
    const [lowStockAlerts, setLowStockAlerts] = useState(0);

    const [totalSales, setTotalSales] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [monthlySales, setMonthlySales] = useState(0);

    // --- Date Helpers ---
    const getDateRange = (period) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const formatDate = (d) => d.toISOString().split('T')[0];

        switch (period) {
            case 'today': return { start: formatDate(today), end: formatDate(today) };
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
                return { start: formatDate(startOfWeek), end: formatDate(today) };
            case 'month':
                return { start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, end: formatDate(new Date(currentYear, currentMonth + 1, 0)) };
            case 'year': return { start: `${currentYear}-01-01`, end: `${currentYear}-12-31` };
            default: return { start: '1970-01-01', end: '2099-12-31' };
        }
    };

    const isDateInRange = (dateStr, range) => {
        if (!dateStr) return false;
        const d = dateStr.split('T')[0];
        return d >= range.start && d <= range.end;
    };

    const filteredData = useMemo(() => {
        const range = getDateRange(timeFilter);
        return {
            sales: sales.filter(s => isDateInRange(s.date, range)),
            expenses: expenses.filter(e => isDateInRange(e.date, range))
        };
    }, [timeFilter, sales, expenses]);

    // --- Export Logic ---
    const handleExportReport = () => {
        const netProfit = totalSales - totalExpenses;
        const headers = ["Category", "Product/Description", "Amount (₦)", "Date"];
        
        const saleRows = filteredData.sales.map(s => ["Income", s.productName, s.total, s.date.split('T')[0]]);
        const expenseRows = filteredData.expenses.map(e => ["Expense", e.category, e.amount, e.date]);

        const summaryRows = [
            ["FINANCIAL SUMMARY", "", "", ""],
            ["Period", timeFilter.toUpperCase(), "", ""],
            ["Total Revenue", totalSales, "", ""],
            ["Total Expenses", totalExpenses, "", ""],
            ["Net Profit", netProfit, "", ""],
            ["", "", "", ""],
            ["TRANSACTION LOG", "", "", ""]
        ];

        const csvContent = "data:text/csv;charset=utf-8," 
            + [...summaryRows, headers, ...saleRows, ...expenseRows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Business_Report_${timeFilter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 1. Auth
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            if (u) setUser(u);
            else { setUser(null); setLoading(false); }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. Real-time Subscriptions
    useEffect(() => {
        if (!user) return;
        const sRef = ref(db, `businessData/${user.uid}/sales`);
        const eRef = ref(db, `businessData/${user.uid}/expenses`);
        const iRef = ref(db, `businessData/${user.uid}/inventory`);

        const unsubS = onValue(sRef, (snap) => setSales(snap.val() ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })) : []));
        const unsubE = onValue(eRef, (snap) => setExpenses(snap.val() ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })) : []));
        const unsubI = onValue(iRef, (snap) => {
            const data = snap.val() || {};
            const list = Object.values(data);
            setInventoryItems(list.length);
            setLowStockAlerts(list.filter(i => (Number(i.quantity) || 0) < 5).length);
            setLoading(false);
        });

        return () => { unsubS(); unsubE(); unsubI(); };
    }, [user]);

    // 3. Totals
    useEffect(() => {
        setTotalSales(filteredData.sales.reduce((a, c) => a + (Number(c.total) || 0), 0));
        setTotalExpenses(filteredData.expenses.reduce((a, c) => a + (Number(c.amount) || 0), 0));
        
        const mRange = getDateRange('month');
        setMonthlySales(sales.filter(s => isDateInRange(s.date, mRange)).reduce((a, c) => a + (Number(c.total) || 0), 0));
    }, [filteredData, sales, expenses]);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="p-4 md:p-6 md:rounded-2xl bg-gray-50 min-h-screen space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-sm text-gray-500 mt-1 uppercase font-semibold tracking-wider">Performance Tracking: {timeFilter}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        {['today', 'week', 'month', 'year'].map((p) => (
                            <button 
                                key={p} 
                                onClick={() => setTimeFilter(p)} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeFilter === p ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleExportReport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox label="Sales Revenue" value={totalSales} color="blue" icon={<TrendingUp size={14}/>} />
                <StatBox label="Total Expenses" value={totalExpenses} color="red" />
                <StatBox label="Profit / Loss" value={totalSales - totalExpenses} color={totalSales - totalExpenses >= 0 ? "green" : "red"} />
                <StatBox label="Low Stock Items" value={lowStockAlerts} isCurrency={false} color="amber" icon={lowStockAlerts > 0 && <AlertCircle size={14}/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Financial Trends</h3>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">Real-time data</span>
                    </div>
                    <div className="h-[320px]">
                        <FinancialChart timeFilter={timeFilter} salesData={filteredData.sales} expensesData={filteredData.expenses} />
                    </div>
                </div>

                {/* Quick Summary Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 space-y-5">
                        <h3 className="text-lg font-bold text-gray-800">Quick Summary</h3>
                        
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Monthly Rev</span>
                                <span className="font-bold text-blue-700 text-lg">₦{monthlySales.toLocaleString()}</span>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Total Items</span>
                                <span className="font-bold text-gray-800 text-lg">{inventoryItems} SKUs</span>
                            </div>

                            <div className={`p-4 rounded-xl border flex justify-between items-center ${totalSales - totalExpenses >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <span className="text-xs font-bold text-gray-500 uppercase">Net Balance</span>
                                <span className={`font-bold text-lg ${totalSales - totalExpenses >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    ₦{(totalSales - totalExpenses).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                             <div className="text-[10px] text-gray-400 font-medium italic text-center">
                                Last updated: {new Date().toLocaleTimeString()}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, isCurrency = true, color, icon }) {
    const theme = {
        blue: "border-blue-50 text-blue-600 bg-blue-50/30",
        red: "border-red-50 text-red-600 bg-red-50/30",
        green: "border-green-50 text-green-600 bg-green-50/30",
        amber: "border-amber-50 text-amber-600 bg-amber-50/30"
    };
    return (
        <div className={`p-5 rounded-2xl border ${theme[color]} shadow-sm`}>
            <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{label}</p>
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
                {isCurrency ? `₦${value.toLocaleString()}` : value}
            </h2>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-6 space-y-6 animate-pulse bg-gray-50 min-h-screen">
            <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[400px] bg-white rounded-2xl border border-gray-200"></div>
                <div className="h-[400px] bg-white rounded-2xl border border-gray-100"></div>
            </div>
        </div>
    );
}