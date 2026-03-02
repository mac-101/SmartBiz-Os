import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { 
  X, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  ArrowUpDown,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { onAuthStateChanged } from 'firebase/auth';
import InventoryForm from "../forms/inventoryForm";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const inventoryRef = ref(db, `businessData/${user.uid}/inventory`);
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.keys(data).map(key => ({ firebaseKey: key, ...data[key] })));
      } else setProducts([]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const totalQty = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
    const totalVal = products.reduce((acc, p) => acc + ((Number(p.quantity) || 0) * (Number(p.cost) || 0)), 0);
    return {
      totalItems: totalQty,
      totalValue: totalVal,
      lowStock: products.filter(p => (Number(p.quantity) || 0) < (Number(p.reorderLevel) || 5) && Number(p.quantity) > 0).length,
      outOfStock: products.filter(p => (Number(p.quantity) || 0) <= 0).length,
      categories: ["All", ...new Set(products.map(p => p.category).filter(Boolean))]
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch = (p.productName || p.product || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        const valA = sortBy === "name" ? (a.productName || a.product || "") : Number(a[sortBy.replace('Asc', '').replace('Desc', '')]);
        const valB = sortBy === "name" ? (b.productName || b.product || "") : Number(b[sortBy.replace('Asc', '').replace('Desc', '')]);
        if (sortBy === "name") return valA.localeCompare(valB);
        return sortBy.includes("Asc") ? valA - valB : valB - valA;
      });
  }, [products, selectedCategory, sortBy, searchTerm]);

  const handleDelete = async (fKey) => {
    if (confirm("Permanently remove this product from inventory?")) {
      await remove(ref(db, `businessData/${user.uid}/inventory/${fKey}`));
    }
  };

  if (loading) return <InventorySkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8 bg-[#FDFDFF] min-h-screen">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Stock</h1>
          <p className="text-sm text-slate-500 font-medium">Manage SKUs, reorder levels, and valuation</p>
        </div>
        <button 
          onClick={() => setShowUpdateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricTile label="Total Units" val={stats.totalItems} icon={<Package size={18}/>} color="blue" />
        <MetricTile label="Inventory Value" val={`₦${stats.totalValue.toLocaleString()}`} icon={<DollarSign size={18}/>} color="slate" />
        <MetricTile label="Low Stock" val={stats.lowStock} icon={<AlertTriangle size={18}/>} color="amber" />
        <MetricTile label="Stockouts" val={stats.outOfStock} icon={<TrendingUp size={18}/>} color="rose" />
      </div>

      {/* 3. Toolbar */}
      <div className="bg-white  rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Filter size={14} /> Filter
          </div>
          <select 
            className="text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none"
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {stats.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by: Name</option>
            <option value="quantityDesc">Sort by: Highest Stock</option>
            <option value="priceDesc">Sort by: Highest Price</option>
          </select>
        </div>
      </div>

      {/* 4. Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Stock level</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pricing (Unit)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Asset Value</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const qty = Number(p.quantity) || 0;
                const cost = Number(p.cost) || 0;
                const price = Number(p.price) || 0;
                const reorder = Number(p.reorderLevel) || 5;
                
                const isOutOfStock = qty <= 0;
                const isLow = qty < reorder && !isOutOfStock;

                return (
                  <tr key={p.firebaseKey} className="group hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.product || p.productName}</div>
                      <div className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{p.category || "General"}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-black ${isOutOfStock ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-700'}`}>
                          {qty} <span className="text-[10px] font-medium text-slate-400 uppercase ml-0.5">Units</span>
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold mt-1">OUT</span>
                        ) : isLow ? (
                          <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold mt-1">LOW</span>
                        ) : (
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold mt-1">HEALTHY</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-400">Cost: <span className="text-slate-900">₦{cost.toLocaleString()}</span></div>
                      <div className="text-xs font-semibold text-slate-400">Sell: <span className="text-blue-600">₦{price.toLocaleString()}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">₦{(qty * cost).toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-emerald-500">POTENTIAL PROFIT: ₦{(qty * (price - cost)).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical size={16}/></button>
                        <button onClick={() => handleDelete(p.firebaseKey)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showUpdateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUpdateForm(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Add New Inventory Item</h2>
              <button onClick={() => setShowUpdateForm(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className=" overflow-y-auto custom-scrollbar">
              <InventoryForm onSuccess={() => setShowUpdateForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricTile({ label, val, icon, color }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100"
  };
  return (
    <div className={`p-6 rounded-2xl  bg-white shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${themes[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <h3 className="text-xl font-black text-slate-900">{val}</h3>
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse bg-white min-h-screen">
      <div className="h-10 w-48 bg-slate-100 rounded-lg"></div>
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-slate-100"></div>)}
      </div>
      <div className="h-96 bg-slate-50 rounded-2xl border border-slate-100"></div>
    </div>
  );
}