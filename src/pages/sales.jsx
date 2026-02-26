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

  // Date Logic (Keeping your working logic from before)
  const getDateRange = (period) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    switch (period) {
      case 'today': return { start: formatDate(today), end: formatDate(today) };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(date - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { start: formatDate(startOfWeek), end: formatDate(endOfWeek) };
      case 'month':
        return { start: formatDate(new Date(year, month, 1)), end: formatDate(new Date(year, month + 1, 0)) };
      default: return null;
    }
  };

  const isDateInRange = (saleDate, range) => {
    if (!range) return true;
    const formattedSaleDate = saleDate.split('T')[0];
    return formattedSaleDate >= range.start && formattedSaleDate <= range.end;
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
  }, [sales, timeFilter, productFilter, selectedDate]);

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
    <div className="p-4 md:rounded-2xl md:p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen space-y-8">
      {/* Summary Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-2">Real-time transaction tracking</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <StatCard label="Total Revenue" value={`${totalRevenue.toLocaleString()}₦`} subtext={timeFilter} color="blue" />
          <StatCard label="Items Sold" value={totalItemsSold} subtext={`${filteredSales.length} items`} color="green" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-50 rounded-xl border border-gray-100">
             <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full h-full bg-transparent px-3 outline-none text-sm">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="all">All Time</option>
             </select>
          </div>
          <div className="h-10 bg-gray-50 rounded-xl border border-gray-100">
             <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="w-full h-full bg-transparent px-3 outline-none text-sm">
                {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Items</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Total</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase text-gray-400">Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-bold text-gray-800 text-sm">{sale.productName}</td>
                <td className="px-6 py-4 font-bold text-blue-700">₦{Number(sale.total).toLocaleString()}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{sale.date.split('T')[0]}</td>
                <td><button onClick={() => handleDeleteSale(sale.id)} className="text-red-500 p-4"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SKELETON COMPONENT
function SalesSkeleton() {
  return (
    <div className="p-4 md:rounded-2xl md:p-8 bg-gray-50 min-h-screen space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-24 w-40 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 w-40 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="h-28 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-10 bg-gray-100 rounded-xl"></div>
          <div className="h-10 bg-gray-100 rounded-xl"></div>
          <div className="h-10 bg-gray-100 rounded-xl"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-100"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex gap-4">
                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                <div className="h-4 w-12 bg-gray-100 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-100 rounded"></div>
            <div className="h-4 w-20 bg-gray-100 rounded"></div>
          </div>
        ))}
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