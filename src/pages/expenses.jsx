import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { MinusIcon, Trash2 } from "lucide-react";

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

  // 2. Fetch Expenses from Firebase
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
      } else {
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

  if (loading) return <div className="p-10 text-center font-bold text-red-600">Loading Expenses...</div>;

  return (
    <div className="p-2 md:p-6 min-h-screen bg-linear-to-br rounded-2xl from-gray-50 to-gray-100 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all business expenditures</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto">
          <StatCard label="Total Expenses" value={totalExpenses} color="red" timeFilter={timeFilter} />
          <StatCard label="Highest Expense" value={highestExpense} color="orange" subtext="Single transaction" />
          <StatCard label="Average" value={averageExpense} color="amber" subtext={`Across ${filteredExpenses.length} items`} />
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Time Period</label>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Date</option>
            </select>
            {timeFilter === 'custom' && (
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2" />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Sort Order</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button onClick={() => { setTimeFilter('all'); setCategoryFilter('all'); setSortOrder('newest'); }} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Reset</button>
          </div>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase">Item ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {expense.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expense.description || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-red-600 font-bold">
                        <MinusIcon size={14} className="mr-1" />
                        {Number(expense.amount).toLocaleString()}₦
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {expense.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(expense.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400">No records found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper component for the Stats Cards to keep UI clean
function StatCard({ label, value, color, subtext, timeFilter }) {
  const colors = {
    red: "border-red-100 text-red-600",
    orange: "border-orange-100 text-orange-600",
    amber: "border-amber-100 text-amber-600"
  };
  
  return (
    <div className={`bg-white border p-5 rounded-2xl shadow-sm ${colors[color]}`}>
      <p className="text-[10px] uppercase font-black opacity-60 tracking-tighter">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{Number(value).toLocaleString()}₦</p>
      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase italic">
        {subtext || timeFilter || 'All Time'}
      </p>
    </div>
  );
}