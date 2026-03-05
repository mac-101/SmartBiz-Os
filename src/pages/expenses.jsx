import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Trash2, 
  Download, 
  RotateCcw, 
  Receipt, 
  TrendingDown, 
  Filter,
  Calendar as CalendarIcon,
  ChevronRight
} from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [timeFilter, setTimeFilter] = useState('month'); 
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
        const bizId = localStorage.getItem("active_business_id");

    const expenseRef = ref(db, `businessData/${bizId}/expenses`);
    const unsubscribe = onValue(expenseRef, (snapshot) => {
      const data = snapshot.val();
      setExpenses(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    const todayStr = new Date().toISOString().split('T')[0];

    // Time Filtering
    if (timeFilter !== 'all') {
      const now = new Date();
      if (timeFilter === 'today') {
        result = result.filter(exp => exp.date === todayStr);
      } else if (timeFilter === 'custom' && selectedDate) {
        result = result.filter(exp => exp.date === selectedDate);
      } else {
        const cutoff = new Date();
        if (timeFilter === 'week') cutoff.setDate(now.getDate() - 7);
        if (timeFilter === 'month') cutoff.setMonth(now.getMonth() - 1);
        if (timeFilter === 'year') cutoff.setFullYear(now.getFullYear() - 1);
        result = result.filter(exp => new Date(exp.date) >= cutoff);
      }
    }

    // Category Filtering
    if (categoryFilter !== 'all') {
      result = result.filter(exp => exp.category === categoryFilter);
    }

    // Sorting
    return result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'highest') return Number(b.amount) - Number(a.amount);
      return Number(a.amount) - Number(b.amount);
    });
  }, [expenses, sortOrder, timeFilter, categoryFilter, selectedDate]);

  const handleDelete = async (id) => {
    if (confirm("Delete this expense record? This cannot be undone.")) {
      await remove(ref(db, `businessData/${user.uid}/expenses/${id}`));
    }
  };

  const handleExport = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ["Date", "Category", "Description", "Amount (₦)"];
    const csv = [headers, ...filteredExpenses.map(e => [e.date, e.category, e.description || "", e.amount])]
      .map(row => row.join(",")).join("\n");
    
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.download = `Expenses_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const categories = ['all', ...new Set(expenses.map(e => e.category))];
  const stats = {
    total: filteredExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0),
    count: filteredExpenses.length,
    highest: filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0
  };

  if (loading) return <ExpensesSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto p-2 lg:p-6 space-y-8 bg-[#FDFDFF] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense Ledger</h1>
          <p className="text-sm text-slate-500 font-medium">Internal expenditure and overhead tracking</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Analytics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExpenseStat 
           label="Total Spend" 
           value={stats.total} 
           icon={<TrendingDown size={18}/>} 
           subtext={`Across ${stats.count} transactions`} 
           color="rose"
        />
        <ExpenseStat 
           label="Largest Outflow" 
           value={stats.highest} 
           icon={<Receipt size={18}/>} 
           subtext="Single highest entry" 
           color="slate"
        />
        <ExpenseStat 
           label="Daily Average" 
           value={stats.total / (timeFilter === 'week' ? 7 : 30)} 
           icon={<CalendarIcon size={18}/>} 
           subtext="Estimated burn rate" 
           color="blue"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white  rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-slate-400">
          <Filter size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
        </div>

        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)} 
          className="bg-transparent text-sm font-bold text-slate-600 outline-none border-r border-slate-100 pr-4"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Past 7 Days</option>
          <option value="month">Past 30 Days</option>
          <option value="custom">Custom Date</option>
        </select>

        {timeFilter === 'custom' && (
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md outline-none"
          />
        )}

        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)} 
          className="bg-transparent text-sm font-bold text-slate-600 outline-none border-r border-slate-100 pr-4"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat.toUpperCase()}</option>)}
        </select>

        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)} 
          className="bg-transparent text-sm font-bold text-slate-600 outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>

        <button 
          onClick={() => { setTimeFilter('month'); setCategoryFilter('all'); setSortOrder('newest'); }}
          className="ml-auto p-2 text-slate-400 hover:text-slate-600 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Transaction ID</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Category</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Description</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Amount</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Date</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono text-slate-300">#{exp.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-tight">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-700">
                    {exp.description || <span className="text-slate-300 italic">No description</span>}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-rose-600">₦{Number(exp.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                    {new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(exp.id)} 
                      className="p-2 text-slate-300 "
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-24 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Receipt size={48} />
                    <p className="text-sm font-bold">No expenditures found for this period</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function ExpenseStat({ label, value, icon, subtext, color }) {
  const themes = {
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };

  return (
    <div className="flex md:flex-col bg-white border border-slate-200 p-6 rounded-3xl shadow-sm transition-transform hover:scale-[1.01]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${themes[color]}`}>{icon}</div>
        <ChevronRight size={16} className="text-slate-200" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">₦{Number(value || 0).toLocaleString()}</h3>
      <p className="text-[11px] font-bold text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function ExpensesSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse bg-white min-h-screen">
      <div className="h-10 w-48 bg-slate-50 rounded-xl"></div>
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-36 bg-slate-50 rounded-3xl border border-slate-100"></div>)}
      </div>
      <div className="h-96 bg-slate-50 rounded-3xl border border-slate-100"></div>
    </div>
  );
}