import React, { useState, useMemo, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { Trash2, Download } from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [timeFilter, setTimeFilter] = useState('week');
  const [productFilter, setProductFilter] = useState('all');
  const [customDate, setCustomDate] = useState(''); // New State for Custom Date
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

  // Date Logic
  const getDateRange = (period) => {
    const today = new Date();
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (period === 'custom' && customDate) {
        return { start: customDate, end: customDate };
    }

    switch (period) {
      case 'today': return { start: formatDate(today), end: formatDate(today) };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { start: formatDate(startOfWeek), end: formatDate(endOfWeek) };
      case 'month':
        return { 
            start: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), 
            end: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)) 
        };
      default: return null;
    }
  };

  const isDateInRange = (saleDate, range) => {
    if (!range) return true;
    const formattedSaleDate = saleDate.split('T')[0];
    return formattedSaleDate >= range.start && formattedSaleDate <= range.end;
  };

  // Export Logic
  const exportToCSV = () => {
    if (filteredSales.length === 0) return alert("No data to export");
    const headers = ["Date", "Product", "Quantity", "Total (₦)"];
    const rows = filteredSales.map(s => [
      s.date.split('T')[0],
      s.productName,
      s.quantity,
      s.total
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSale = async (saleId) => {
    if (!user) return alert("Please log in.");
    if (window.confirm("Delete this record?")) {
      try {
        await remove(ref(db, `businessData/${user.uid}/sales/${saleId}`));
      } catch (err) { alert("Error: " + err.message); }
    }
  };

  const uniqueProducts = useMemo(() => {
    const products = new Set();
    sales.forEach(sale => { if (sale.productName) products.add(sale.productName); });
    return ['all', ...Array.from(products)];
  }, [sales]);

  useEffect(() => {
    let result = [...sales];
    if (timeFilter !== 'all') {
      const range = getDateRange(timeFilter);
      if (range) result = result.filter(sale => isDateInRange(sale.date, range));
    }
    if (productFilter !== 'all') {
      result = result.filter(sale => sale.productName === productFilter);
    }
    setFilteredSales(result);
  }, [sales, timeFilter, productFilter, customDate]);

  const sortedSales = useMemo(() => {
    const sortedArray = [...filteredSales];
    sortedArray.sort((a, b) => {
      let aV = a[sortConfig.key]; let bV = b[sortConfig.key];
      if (sortConfig.key === 'date') { aV = new Date(aV); bV = new Date(bV); }
      return sortConfig.direction === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
    });
    return sortedArray;
  }, [filteredSales, sortConfig]);

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0);
  const totalItemsSold = filteredSales.reduce((acc, sale) => acc + (Number(sale.quantity) || 0), 0);

  if (loading) return <SalesSkeleton />;

  return (
    <div className="p-4 md:rounded-2xl md:p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Management</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time transaction tracking</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} subtext={timeFilter} color="blue" />
        <StatCard label="Items Sold" value={totalItemsSold} subtext={`${filteredSales.length} Transactions`} color="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Time Period</label>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-blue-500">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Pick Specific Date</option>
                <option value="all">All Time</option>
            </select>
          </div>

          {timeFilter === 'custom' && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Select Date</label>
                <input 
                    type="date" 
                    value={customDate} 
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Filter Product</label>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 outline-none text-sm focus:ring-2 focus:ring-blue-500">
                {uniqueProducts.map(p => <option key={p} value={p}>{p === 'all' ? 'All Products' : p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-gray-400 tracking-wider">Product Item</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-gray-400 tracking-wider">Qty Sold</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-gray-400 tracking-wider">Total Sale</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase text-gray-400 tracking-wider">Date</th>
                <th className="px-6 py-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {sortedSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{sale.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.quantity} units</td>
                    <td className="px-6 py-4 font-bold text-blue-600 text-sm">₦{Number(sale.total).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">{sale.date.split('T')[0]}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteSale(sale.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                            <Trash2 size={16}/>
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {sortedSales.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm">No sales found for this period.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, color }) {
  const colorMap = {
    blue: "text-blue-600 border-blue-50 bg-blue-50/30",
    green: "text-green-600 border-green-50 bg-green-50/30"
  };
  return (
    <div className={`p-5 rounded-xl border ${colorMap[color]} shadow-sm`}>
      <p className="text-[11px] uppercase font-bold opacity-70 tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase italic">Filtering: {subtext}</p>
    </div>
  );
}

function SalesSkeleton() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-white rounded-xl border border-gray-100"></div>
        <div className="h-28 bg-white rounded-xl border border-gray-100"></div>
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-100"></div>
    </div>
  );
}