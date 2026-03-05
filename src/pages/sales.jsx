import React, { useState, useMemo, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Trash2, Download, ShoppingCart, TrendingUp, Calendar, 
  Filter, ArrowUpRight, PackageCheck, User, ChevronDown, ChevronUp, Box
} from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [user, setUser] = useState(null);

  const [timeFilter, setTimeFilter] = useState('week');
  const [productFilter, setProductFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // 1. Get the "Store Key" we saved during Login
    const bizId = localStorage.getItem("active_business_id");
    
    // 2. If no user or no bizId, don't try to fetch
    if (!user || !bizId) return;

    // 3. Use bizId instead of user.uid
    const salesRef = ref(db, `businessData/${bizId}/sales`);
    
    const unsubscribe = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      setSales(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]); // Keep 'user' here so it triggers when they log in

  // 1. FILTERED SALES (Must come first)
  const filteredSales = useMemo(() => {
    let result = [...sales];
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (timeFilter !== 'all') {
      let start, end = formatDate(today);
      if (timeFilter === 'today') start = end;
      else if (timeFilter === 'custom') start = end = customDate;
      else if (timeFilter === 'week') {
        const d = new Date(); d.setDate(d.getDate() - 7);
        start = formatDate(d);
      } else if (timeFilter === 'month') {
        const d = new Date(); d.setMonth(d.getMonth() - 1);
        start = formatDate(d);
      }
      result = result.filter(s => {
        const sDate = s.date ? s.date.split('T')[0] : "";
        return sDate >= start && sDate <= end;
      });
    }

    if (productFilter !== 'all') {
      result = result.filter(s => s.items?.some(item => item.productName === productFilter));
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, timeFilter, productFilter, customDate]);

  // 2. STATS (Depends on filteredSales)
  const stats = useMemo(() => {
    return filteredSales.reduce((acc, s) => {
      acc.revenue += (Number(s.grandTotal) || 0);
      const itemsCount = s.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) || 0;
      acc.units += itemsCount;
      return acc;
    }, { revenue: 0, units: 0 });
  }, [filteredSales]);

  const avgTicket = filteredSales.length > 0 ? stats.revenue / filteredSales.length : 0;

  const uniqueProducts = useMemo(() => {
    const allNames = sales.flatMap(s => s.items?.map(i => i.productName) || []);
    return ['all', ...new Set(allNames.filter(Boolean))];
  }, [sales]);

  if (loading) return <SalesSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto p-2 lg:p-6 space-y-8 bg-[#FDFDFF] min-h-screen">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SaleStat label="Gross Revenue" value={`₦${stats.revenue.toLocaleString()}`} icon={<TrendingUp size={18}/>} color="emerald" sub={`Total from ${filteredSales.length} sales`} />
        <SaleStat label="Units Moved" value={stats.units} icon={<PackageCheck size={18}/>} color="blue" sub="Items across all receipts" />
        <SaleStat label="Avg. Order Value" value={`₦${Math.round(avgTicket).toLocaleString()}`} icon={<ArrowUpRight size={18}/>} color="slate" sub="Revenue per customer" />
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Calendar size={14} className="text-slate-400" />
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer">
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
            <option value="all">Lifetime</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <ShoppingCart size={14} className="text-slate-400" />
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer">
            {uniqueProducts.map(p => <option key={p} value={p}>{p === 'all' ? 'All Products' : p}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
       <div className="overflow-x-auto">
       <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredSales.map((sale) => (
              <React.Fragment key={sale.id}>
                <tr 
                  onClick={() => toggleRow(sale.id)}
                  className={`cursor-pointer transition-all ${expandedRow === sale.id ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {expandedRow === sale.id ? <ChevronUp size={16} className="text-blue-600"/> : <ChevronDown size={16} className="text-slate-400"/>}
                      <span className="text-xs font-mono font-bold text-slate-500">#{sale.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-800">{sale.customer || 'Walk-in'}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">
                      {sale.items?.length || 0} PRODUCTS
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-slate-900">₦{Number(sale.grandTotal).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400">
                    {sale.displayDate || (sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A')}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm("Delete this sale?")) remove(ref(db, `businessData/${user.uid}/sales/${sale.id}`)); }} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>

                {expandedRow === sale.id && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 bg-slate-50/50">
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner mx-4">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase text-left">Product Name</th>
                              <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase text-center">Quantity</th>
                              <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase text-right">Unit Price</th>
                              <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sale.items?.map((item, idx) => (
                              <tr key={idx} className="hover:bg-blue-50/20">
                                <td className="px-4 py-3 text-sm font-bold text-slate-700">
                                  <div className="flex items-center gap-2">
                                    <Box size={12} className="text-blue-400"/>
                                    {item.productName}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-black text-slate-600">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-slate-500">
                                  ₦{Number(item.price).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-black text-blue-600">
                                  ₦{Number(item.total).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table> 
       </div>
      </div>
    </div>
  );
}

// ... SaleStat and SalesSkeleton remain the same
      
// Re-using your components for styling consistency
function SaleStat({ label, value, icon, color, sub }) {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  };
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 md:flex-col md:items-start">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${themes[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      <p className="text-[11px] font-bold text-slate-400 mt-1">{sub}</p>
      </div>
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