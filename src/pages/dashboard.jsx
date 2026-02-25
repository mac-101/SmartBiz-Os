import { expense as staticExpense, sales as staticSales, inventory as staticInventory } from "../components/data";
import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import FinancialChart from "../components/chart";
import { ref, onValue } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const [timeFilter, setTimeFilter] = useState('today');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Live Data States
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [inventoryItems, setInventoryItems] = useState(0);
    const [lowStockAlerts, setLowStockAlerts] = useState(0);

    // Financial Totals
    const [totalSales, setTotalSales] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [weeklySales, setWeeklySales] = useState(0);
    const [monthlySales, setMonthlySales] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [monthlyProfit, setMonthlyProfit] = useState(0);

    // --- Helper Functions ---
    const getDateRange = (period) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        switch (period) {
            case 'today':
                const todayStr = today.toISOString().split('T')[0];
                return { start: todayStr, end: todayStr };
            case 'week':
                const startOfWeek = new Date(today);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                return {
                    start: startOfWeek.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0]
                };
            case 'month':
                return {
                    start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
                    end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
                };
            case 'year':
                return { start: `${currentYear}-01-01`, end: `${currentYear}-12-31` };
            default:
                return { start: '1970-01-01', end: '2099-12-31' };
        }
    };

    const isDateInRange = (dateStr, range) => {
        if (!dateStr) return false;
        const d = new Date(dateStr).setHours(0, 0, 0, 0);
        const s = new Date(range.start).setHours(0, 0, 0, 0);
        const e = new Date(range.end).setHours(0, 0, 0, 0);
        return d >= s && d <= e;
    };

    // --- Core Logic: Memoized Filtered Data ---
    // This is what makes the chart work for all filters
    const filteredData = useMemo(() => {
        const range = getDateRange(timeFilter);
        return {
            sales: sales.filter(s => isDateInRange(s.date, range)),
            expenses: expenses.filter(e => isDateInRange(e.date, range))
        };
    }, [timeFilter, sales, expenses]);

    // 1. Auth Listener
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. Real-time Firebase Subscriptions
    useEffect(() => {
        if (!user) return;

        const salesRef = ref(db, `businessData/${user.uid}/sales`);
        const expensesRef = ref(db, `businessData/${user.uid}/expenses`);
        const inventoryRef = ref(db, `businessData/${user.uid}/inventory`);

        const unsubscribeSales = onValue(salesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setSales(list);
            } else setSales([]);
        });

        const unsubscribeExpenses = onValue(expensesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setExpenses(list);
            } else setExpenses([]);
        });

        const unsubscribeInventory = onValue(inventoryRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setInventoryItems(list.length);
                setLowStockAlerts(list.filter(item => item.quantity < 5).length);
            } else {
                setInventoryItems(0);
                setLowStockAlerts(0);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeSales();
            unsubscribeExpenses();
            unsubscribeInventory();
        };
    }, [user]);

    // 3. Calculations Effect
    useEffect(() => {
        // Active view totals
        const sTotal = filteredData.sales.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        const eTotal = filteredData.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setTotalSales(sTotal);
        setTotalExpenses(eTotal);

        // Weekly (Last 7 Days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const wSales = sales.filter(s => new Date(s.date) >= weekAgo)
            .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        setWeeklySales(wSales);

        // Monthly Stats (This Month)
        const mRange = getDateRange('month');
        const mSales = sales.filter(s => isDateInRange(s.date, mRange))
            .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        const mExp = expenses.filter(e => isDateInRange(e.date, mRange))
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setMonthlySales(mSales);
        setMonthlyExpenses(mExp);
        setMonthlyProfit(mSales - mExp);

    }, [filteredData, sales, expenses]);

    const getTimeFilterLabel = () => {
        const labels = { today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year', all: 'All Time' };
        return labels[timeFilter] || 'Today';
    };

    const getDateRangeDisplay = () => {
        const range = getDateRange(timeFilter);
        if (timeFilter === 'today') return new Date().toLocaleDateString('en-US', { dateStyle: 'long' });
        return `${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()}`;
    };

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="p-2 md:p-6 md:rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 min-h-screen space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <div className="text-sm text-gray-500 mt-1">{getDateRangeDisplay()}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['today', 'week', 'month', 'year', 'all'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${timeFilter === period
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                    <p className="text-sm font-medium text-blue-600">Sales</p>
                    <h2 className="text-2xl font-bold text-gray-800">₦{totalSales.toLocaleString()}</h2>
                    <p className="text-xs text-gray-500 mt-2">{getTimeFilterLabel()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                    <p className="text-sm font-medium text-red-600">Expenses</p>
                    <h2 className="text-2xl font-bold text-gray-800">₦{totalExpenses.toLocaleString()}</h2>
                    <p className="text-xs text-gray-500 mt-2">{getTimeFilterLabel()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                    <p className="text-sm font-medium text-green-600">Inventory</p>
                    <h2 className="text-2xl font-bold text-gray-800">{inventoryItems}</h2>
                    <p className="text-xs text-gray-500 mt-2">Total Items</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
                    <p className="text-sm font-medium text-amber-600">Low Stock</p>
                    <h2 className="text-2xl font-bold text-gray-800">{lowStockAlerts}</h2>
                    <p className="text-xs text-gray-500 mt-2">Needs Restock</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4">
                    <div className="h-[350px]">
                        {/* CHART NOW USES FILTERED DATA */}
                        <FinancialChart
                            timeFilter={timeFilter}
                            salesData={filteredData.sales}
                            expensesData={filteredData.expenses}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Net Profit ({getTimeFilterLabel()})</span>
                            <span className={`font-bold ${totalSales - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₦{(totalSales - totalExpenses).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Monthly Sales</span>
                            <span className="font-bold">₦{monthlySales.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-4">
                {filteredData.sales
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3)
                    .map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Sale: {sale.product}</p>
                                    <p className="text-sm text-gray-500">{sale.customer} • {sale.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">+{Number(sale.total).toLocaleString()}₦</p>
                                <p className="text-sm text-gray-500">{sale.quantity} units</p>
                            </div>
                        </div>
                    ))}

                {filteredData.expenses
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 2)
                    .map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Expense: {exp.category}</p>
                                    <p className="text-sm text-gray-500">{exp.vendor} • {exp.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-600">-{Number(exp.amount).toLocaleString()}₦</p>
                                <p className="text-sm text-gray-500">{exp.description}</p>
                            </div>
                        </div>
                    ))}

                {filteredData.sales.length === 0 && filteredData.expenses.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
                            <h4 className="text-gray-600 font-medium mb-2">No Activity for {getTimeFilterLabel()}</h4>
                        </div>
                    )}
            </div>
        </div>
    );
}