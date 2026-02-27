import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { MinusIcon, Trash2, Download, RotateCcw } from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [timeFilter, setTimeFilter] = useState('month'); 
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch Expenses
  useEffect(() => {
    if (!user) return;
    const expenseRef = ref(db, `businessData/${user.uid}/expenses`);
    const unsubscribeExpenses = onValue(expenseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setExpenses(list);
      } else {
        setExpenses([]);
      }
      setLoading(false);
    });
    return () => unsubscribeExpenses();
  }, [user]);

  // Handle Deletion
  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense record?")) {
      try {
        await remove(ref(db, `businessData/${user.uid}/expenses/${id}`));
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (filteredExpenses.length === 0) return alert("No data to export");
    const headers = ["Date", "Category", "Description", "Amount (₦)"];
    const rows = filteredExpenses.map(exp => [
      exp.date,
      exp.category,
      exp.description || "N/A",
      exp.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expenses_${timeFilter}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  // 3. Filtering & Sorting Logic
  useEffect(() => {
    let result = [...expenses];
    if (timeFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (timeFilter === 'today') {
        result = result.filter(exp => exp.date === getCurrentDate());
      } else if (timeFilter === 'custom' && selectedDate) {
        result = result.filter(exp => exp.date === selectedDate);
      } else if (timeFilter !== 'custom') {
        const rangeDate = new Date();
        if (timeFilter === 'week') rangeDate.setDate(today.getDate() - 7);
        if (timeFilter === 'month') rangeDate.setMonth(today.getMonth() - 1);
        if (timeFilter === 'year') rangeDate.setFullYear(today.getFullYear() - 1);
        const compareStr = rangeDate.toISOString().split('T')[0];
        result = result.filter(exp => exp.date >= compareStr);
      }
    }
    if (categoryFilter !== 'all') {
      result = result.filter(exp => exp.category === categoryFilter);
    }
    switch (sortOrder) {
      case 'newest': result.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'oldest': result.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'highest': result.sort((a, b) => b.amount - a.amount); break;
      case 'lowest': result.sort((a, b) => a.amount - b.amount); break;
      default: break;
    }
    setFilteredExpenses(result);
  }, [expenses, sortOrder, timeFilter, categoryFilter, selectedDate]);

  const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
  const highestExpense = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0;
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
  const categories = ['all', ...new Set(expenses.map(e => e.category))];

  if (loading) return <ExpensesSkeleton />;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 rounded-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expenses Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all business expenditures</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Expenses" value={totalExpenses} color="red" subtext={timeFilter === 'all' ? 'Lifetime' : timeFilter} />
        <StatCard label="Highest Expense" value={highestExpense} color="orange" subtext="Peak Transaction" />
        <StatCard label="Average" value={averageExpense} color="amber" subtext={`Per ${filteredExpenses.length} entries`} />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Time Period</label>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-red-500">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Pick Specific Date</option>
            </select>
          </div>

          {timeFilter === 'custom' && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Select Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-red-500">
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sort By</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-red-500">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <div className="lg:col-span-1 flex items-end">
            <button 
              onClick={() => { setTimeFilter('month'); setCategoryFilter('all'); setSortOrder('newest'); setSelectedDate(''); }} 
              className="flex items-center justify-center gap-2 w-full h-10 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ref ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount(₦)</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{expense.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-tight">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{expense.description || "—"}</td>
                    <td className="px-6 py-4 font-bold text-red-600 text-sm">
                      <div className="flex items-center">
                        {Number(expense.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">{expense.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(expense.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 text-sm font-medium">No expense records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, subtext }) {
  const colors = {
    red: "border-red-50 text-red-600 bg-red-50/30",
    orange: "border-orange-50 text-orange-600 bg-orange-50/30",
    amber: "border-amber-50 text-amber-600 bg-amber-50/30"
  };
  return (
    <div className={`border p-5 rounded-xl shadow-sm ${colors[color]}`}>
      <p className="text-[11px] uppercase font-bold opacity-70 tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">₦{Number(value).toLocaleString()}</p>
      <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase italic">{subtext}</p>
    </div>
  );
}

function ExpensesSkeleton() {
  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 rounded-2xl space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-white rounded-xl border border-gray-100"></div>
        ))}
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-100"></div>
    </div>
  );
}