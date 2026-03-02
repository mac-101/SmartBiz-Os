import React, { useState, useMemo, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Trash2, 
  Download, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  Filter, 
  ArrowUpRight,
  PackageCheck
} from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [timeFilter, setTimeFilter] = useState('week');
  const [productFilter, setProductFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const salesRef = ref(db, `businessData/${user.uid}/sales`);
    const unsubscribe = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      setSales(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Optimized Date Range Logic
  const filteredSales = useMemo(() => {
    let result = [...sales];
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (timeFilter !== 'all') {
      let start, end = formatDate(today);
      
      if (timeFilter === 'today') start = end;
      else if (timeFilter === 'custom') start = end = customDate;
      else if (timeFilter === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = formatDate(d);
      } else if (timeFilter === 'month') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        start = formatDate(d);
      }

      result = result.filter(s => {
        const sDate = s.date.split('T')[0];
        return sDate >= start && sDate <= end;
      });
    }

    if (productFilter !== 'all') {
      result = result.filter(s => s.productName === productFilter);
    }

    return result.sort((a, b) => {
      let aV = a[sortConfig.key]; let bV = b[sortConfig.key];
      if (sortConfig.key === 'date') { aV = new Date(aV); bV = new Date(bV); }
      return sortConfig.direction === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
    });
  }, [sales, timeFilter, productFilter, customDate, sortConfig]);

  const uniqueProducts = ['all', ...new Set(sales.map(s => s.productName).filter(Boolean))];
  const stats = {
    revenue: filteredSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0),
    units: filteredSales.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0),
    avgTicket: filteredSales.length > 0 
      ? filteredSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0) / filteredSales.length 
      : 0
  };

  const exportToCSV = () => {
    if (filteredSales.length === 0) return;
    const headers = ["Date", "Product", "Qty", "Total (₦)"];
    const csv = [headers, ...filteredSales.map(s => [s.date.split('T')[0], s.productName, s.quantity, s.total])]
      .map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.download = `Sales_${timeFilter}_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  if (loading) return <SalesSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8 bg-[#FDFDFF] min-h-screen">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor revenue flow and product performance</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SaleStat label="Gross Revenue" value={`₦${stats.revenue.toLocaleString()}`} icon={<TrendingUp size={18}/>} color="emerald" sub={`Reflecting ${timeFilter}`} />
        <SaleStat label="Units Moved" value={stats.units} icon={<PackageCheck size={18}/>} color="blue" sub="Total items sold" />
        <SaleStat label="Avg. Order Value" value={`₦${Math.round(stats.avgTicket).toLocaleString()}`} icon={<ArrowUpRight size={18}/>} color="slate" sub="Revenue per checkout" />
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sort & Filter</span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar size={14} className="text-slate-400" />
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer">
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
            <option value="custom">Custom Date</option>
            <option value="all">Lifetime</option>
          </select>
        </div>

        {timeFilter === 'custom' && (
          <input 
            type="date" 
            value={customDate} 
            onChange={(e) => setCustomDate(e.target.value)}
            className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md outline-none animate-in fade-in"
          />
        )}

        <div className="flex items-center gap-3">
          <ShoppingCart size={14} className="text-slate-400" />
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer">
            {uniqueProducts.map(p => <option key={p} value={p}>{p === 'all' ? 'All Products' : p}</option>)}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Description</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 text-xs font-mono text-slate-400">#TXN-{sale.id.slice(-6).toUpperCase()}</td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-900">{sale.productName}</div>
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Verified Sale</div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{sale.quantity} units</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-900">₦{Number(sale.total).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                    {new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => remove(ref(db, `businessData/${user.uid}/sales/${sale.id}`))}
                      className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSales.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-200 mb-4">
              <ShoppingCart size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-tight">No sales records found for this criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SaleStat({ label, value, icon, color, sub }) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  };
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${themes[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      <p className="text-[11px] font-bold text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function SalesSkeleton() {
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