import React, { useState, useMemo, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { Trash2 } from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [timeFilter, setTimeFilter] = useState('week'); 
  const [productFilter, setProductFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredSales, setFilteredSales] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else { setUser(null); setLoading(false); }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const salesRef = ref(db, `businessData/${user.uid}/sales`);
    const unsubscribeSales = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const salesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSales(salesList);
      } else setSales([]);
      setLoading(false);
    });
    return () => unsubscribeSales();
  }, [user]);

  const getDateRange = (period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        return { start: todayStr, end: todayStr };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { 
          start: startOfWeek.toISOString().split('T')[0], 
          end: today.toISOString().split('T')[0] 
        };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { 
          start: startOfMonth.toISOString().split('T')[0], 
          end: today.toISOString().split('T')[0] 
        };
      case 'year':
        return { start: `${today.getFullYear()}-01-01`, end: `${today.getFullYear()}-12-31` };
      case 'custom':
        return selectedDate ? { start: selectedDate, end: selectedDate } : null;
      default:
        return null;
    }
  };

  const handleDeleteSale = async (saleId) => {
  if (!user) return alert("Please log in to manage sales.");

  if (window.confirm("Are you sure you want to delete this sale record?")) {
    try {
      const saleRef = ref(db, `businessData/${user.uid}/sales/${saleId}`);
      await remove(saleRef);
      // No need for setSales(filter...) if you have the onValue listener active
      alert("Sale deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting sale: " + err.message);
    }
  }
};

  const isDateInRange = (saleDate, range) => {
    if (!range) return true;
    // Extract YYYY-MM-DD from ISO string for comparison
    const formattedSaleDate = saleDate.split('T')[0];
    return formattedSaleDate >= range.start && formattedSaleDate <= range.end;
  };

  // Simplified: No more mapping through nested arrays
  const uniqueProducts = useMemo(() => {
    const products = new Set();
    sales.forEach(sale => {
      if (sale.productName) products.add(sale.productName);
    });
    return ['all', ...Array.from(products)];
  }, [sales]);

  // Simplified Filtering
  useEffect(() => {
    let result = [...sales];

    if (timeFilter !== 'all') {
      const range = getDateRange(timeFilter);
      if (range) {
        result = result.filter(sale => isDateInRange(sale.date, range));
      }
    }

    if (productFilter !== 'all') {
      result = result.filter(sale => sale.productName === productFilter);
    }

    setFilteredSales(result);
  }, [sales, timeFilter, productFilter, selectedDate]);

  const sortedSales = useMemo(() => {
    const sortedArray = [...filteredSales];
    sortedArray.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      return sortConfig.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
    return sortedArray;
  }, [filteredSales, sortConfig]);

  // Simplified Calculations
  const totalRevenue = filteredSales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0);
  const totalItemsSold = filteredSales.reduce((acc, sale) => acc + (Number(sale.quantity) || 0), 0);

  const resetFilters = () => {
    setTimeFilter('week');
    setProductFilter('all');
    setSelectedDate('');
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-600">Loading Business Records...</div>;

  return (
    <div className="p-4 md:rounded-2xl md:p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen space-y-8">
      
      {/* Summary Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-2">Real-time transaction tracking</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <StatCard label="Total Revenue" value={`${totalRevenue.toLocaleString()}₦`} subtext={timeFilter === 'custom' ? selectedDate : timeFilter} color="blue" />
          <StatCard label="Items Sold" value={totalItemsSold} subtext={`${filteredSales.length} items`} color="green" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Filter Sales</h3>
          <button onClick={resetFilters} className="text-sm text-blue-600 font-bold hover:underline">Reset</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Time Period</label>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)} 
              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>

          {timeFilter === 'custom' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Select Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Product</label>
            <select 
              value={productFilter} 
              onChange={(e) => setProductFilter(e.target.value)} 
              className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {uniqueProducts.map(p => <option key={p} value={p}>{p === 'all' ? 'All Products' : p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Id</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Items</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Qt</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Customer</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Total</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Date</th>
                <th ></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedSales.length > 0 ? sortedSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                  <td><div className="text-[10px] ml-2 text-gray-400">{sale.id.slice(-6).toUpperCase()}</div></td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800 text-sm">
                      {sale.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.customer}</td>
                  <td className="px-6 py-4 font-bold text-blue-700">₦{Number(sale.total).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                    {sale.displayDate || sale.date.split('T')[0]}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteSale(sale.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-gray-400">No transactions match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, color }) {
  const colorMap = {
    blue: "text-blue-600 border-blue-100 bg-blue-50/20",
    green: "text-green-600 border-green-100 bg-green-50/20"
  };
  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]} min-w-[180px]`}>
      <p className="text-[10px] uppercase font-black opacity-60 tracking-tighter">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase italic">{subtext}</p>
    </div>
  );
}