import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { X } from "lucide-react";
import { onAuthStateChanged } from 'firebase/auth';
import InventoryForm from "../forms/inventoryForm";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else { setUser(null); setLoading(false); }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firebase Sync
  useEffect(() => {
    if (!user) return;
    const inventoryRef = ref(db, `businessData/${user.uid}/inventory`);
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setProducts(list);
      } else setProducts([]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Logic & Calculations
  const stats = useMemo(() => {
    return {
      totalItems: products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0),
      totalValue: products.reduce((acc, p) => acc + ((Number(p.quantity) || 0) * (Number(p.price) || 0)), 0),
      lowStock: products.filter(p => (Number(p.quantity) || 0) < (Number(p.reorderLevel) || 5)).length,
      outOfStock: products.filter(p => (Number(p.quantity) || 0) === 0).length,
      categories: ["All", ...new Set(products.map(p => p.category).filter(Boolean))]
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === "All" || p.category === selectedCategory)
      .sort((a, b) => {
        const valA = sortBy === "name" ? (a.productName || a.product || "") : Number(a[sortBy.replace('Asc', '').replace('Desc', '')]);
        const valB = sortBy === "name" ? (b.productName || b.product || "") : Number(b[sortBy.replace('Asc', '').replace('Desc', '')]);

        if (sortBy === "name") return valA.localeCompare(valB);
        if (sortBy.includes("Asc")) return valA - valB;
        return valB - valA;
      });
  }, [products, selectedCategory, sortBy]);

  // 4. Actions
  const handleQuantityChange = async (fKey, delta) => {
    const item = products.find(p => p.firebaseKey === fKey);
    if (!item) return;
    const newQty = Math.max(0, (Number(item.quantity) || 0) + delta);
    try {
      await update(ref(db, `businessData/${user.uid}/inventory/${fKey}`), { quantity: newQty });
    } catch (err) { alert("Update failed."); }
  };

  const handleDelete = async (fKey) => {
    if (window.confirm("Delete this product?")) {
      try {
        await remove(ref(db, `businessData/${user.uid}/inventory/${fKey}`));
      } catch (err) { alert("Delete failed."); }
    }
  };

  const handleBackdropClick = (e) => setShowUpdateForm(false);


  if (loading) return <InventorySkeleton />;

  return (
    <div className="p-4 md:p-6 rounded-2xl space-y-6 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all products in stock</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" val={stats.totalItems} sub="Units in stock" color="blue" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        <StatCard label="Total Value" val={`₦${stats.totalValue.toLocaleString()}`} sub="Inventory worth" color="green" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <div className="grid lg:col-span-2 grid-cols-2 gap-4">
          <StatCard label="Low Stock" val={stats.lowStock} sub="Need restocking" color="amber" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <StatCard label="Out of Stock" val={stats.outOfStock} sub="Require attention" color="red" icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </div>
      </div>

      {showUpdateForm && (
        <div
          className="fixed inset-0 w-full h-full backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-2 md:p-4"
          onClick={handleBackdropClick} // 1. Clicking here closes
        >
          <div
            className="relative hide-scrollbar bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[98vh] md:max-h-[90vh] overflow-y-auto"
            // 2. ADD THIS LINE:
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUpdateForm(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            <InventoryForm />
          </div>
        </div>
      )}


      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Product Inventory</h2>
            <p className="text-gray-500 text-xs mt-0.5">{filteredProducts.length} products found</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {stats.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name A-Z</option>
              <option value="quantityAsc">Quantity: Low to High</option>
              <option value="quantityDesc">Quantity: High to Low</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" onClick={() => setShowUpdateForm(true)}>Add New Product</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inventory Value</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sales Value</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estimated Profit</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isLow = Number(p.quantity) < (Number(p.reorderLevel) || 5);
                const isEmpty = Number(p.quantity) === 0;
                const inventoryValue = Number(p.quantity) * Number(p.cost);
                const salesValue = Number(p.quantity) * Number(p.price);
                const profit = salesValue - inventoryValue;
                return (
                  <tr key={p.firebaseKey} className={`hover:bg-gray-50 transition-colors ${isEmpty ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{p.product || p.productName || p.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{p.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${isEmpty ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-700'}`}>
                          {p.quantity} <br /> <span className="text-xs font-normal text-gray-400">units</span>
                        </span>
                        {isLow && <span className="text-[10px] font-bold uppercase tracking-tight text-amber-500">{isEmpty ? "Out of Stock" : "Low Stock"}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">₦{Number(p.cost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">₦{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₦{(p.quantity * p.cost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₦{(p.quantity * p.price).toLocaleString()}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {profit >= 0 ? '+' : '-'}₦{Math.abs(profit).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* <button onClick={() => handleQuantityChange(p.firebaseKey, -1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors">-</button>
                        <button onClick={() => handleQuantityChange(p.firebaseKey, 1)} className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-lg transition-colors">+</button> */}
                        <button onClick={() => handleDelete(p.firebaseKey)} className="ml-2 p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, sub, color, icon }) {
  const colors = {
    blue: "border-blue-100 text-blue-600",
    green: "border-green-100 text-green-600",
    amber: "border-amber-100 text-amber-600",
    red: "border-red-100 text-red-600"
  };
  return (
    <div className={`bg-white p-5 rounded-xl border ${colors[color]} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
          <h2 className="text-2xl font-semibold text-gray-800">{val}</h2>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">{sub}</p>
        </div>
        <svg className="w-6 h-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse bg-gray-50 min-h-screen">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
        <div className="h-3 w-48 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-white rounded-xl border border-gray-100 p-5"></div>
        ))}
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-100"></div>
    </div>
  );
}