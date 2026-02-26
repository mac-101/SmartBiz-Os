import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from 'firebase/auth';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

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
        // We map the snapshot so the 'key' becomes 'firebaseKey'
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
        const valA = sortBy === "name" ? (a.productName || "") : Number(a[sortBy.replace('Asc', '').replace('Desc', '')]);
        const valB = sortBy === "name" ? (b.productName || "") : Number(b[sortBy.replace('Asc', '').replace('Desc', '')]);

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
      // Use the firebaseKey to point to the correct folder
      const itemRef = ref(db, `businessData/${user.uid}/inventory/${fKey}`);
      await update(itemRef, { quantity: newQty });
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update stock. Check your connection.");
    }
  };

  // 5. Updated Delete using firebaseKey
  const handleDelete = async (fKey) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const itemRef = ref(db, `businessData/${user.uid}/inventory/${fKey}`);
        await remove(itemRef);
      } catch (err) {
        console.error("Delete error:", err);
        alert("Error deleting product.");
      }
    }
  };

  if (loading) return <InventorySkeleton />;

  return (
    <div className="p-4 md:p-6 rounded-2xl space-y-6 min-h-screen bg-linear-to-br from-gray-50 to-gray-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all products in stock</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Items" val={stats.totalItems} sub="Units in stock" color="blue" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        <StatCard label="Total Value" val={`${stats.totalValue.toLocaleString()}₦`} sub="Inventory worth" color="green" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Low Stock" val={stats.lowStock} sub="Need restocking" color="amber" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        <StatCard label="Out of Stock" val={stats.outOfStock} sub="Require attention" color="red" icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product Inventory</h2>
            <p className="text-gray-600 text-sm mt-1">{filteredProducts.length} products found</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {stats.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select className="px-4 py-2 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name A-Z</option>
              <option value="quantityAsc">Quantity: Low to High</option>
              <option value="quantityDesc">Quantity: High to Low</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isLow = Number(p.quantity) < (Number(p.reorderLevel) || 5);
                const isEmpty = Number(p.quantity) === 0;
                return (
                  <tr key={p.firebaseKey} className={`hover:bg-gray-50 transition-colors ${isEmpty ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.product || p.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">{p.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[120px]">
                        <span className={`font-bold ${isEmpty ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                          {p.quantity}
                          <div className="text-xs text-gray-500">Units</div>
                        </span>
                      </div>
                      {isLow && <span className="text-[10px] font-bold uppercase text-amber-500">{isEmpty ? "🚫 Out" : "⚠️ Low"}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">₦{Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">₦{(p.quantity * p.price).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleQuantityChange(p.firebaseKey, -1)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">-</button>
                        <button onClick={() => handleQuantityChange(p.firebaseKey, 1)} className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors">+</button>
                        <button onClick={() => handleDelete(p.firebaseKey)} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
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

// Sub-components to keep UI clean
function StatCard({ label, val, sub, color, icon }) {
  const colors = {
    blue: "border-blue-100 text-blue-600",
    green: "border-green-100 text-green-600",
    amber: "border-amber-100 text-amber-600",
    red: "border-red-100 text-red-600"
  };
  return (
    <div className={`bg-white p-6 rounded-2xl border ${colors[color]} shadow-xs`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
          <h2 className="text-3xl font-black text-gray-800">{val}</h2>
          <p className="text-xs text-gray-400 mt-2 font-medium italic">{sub}</p>
        </div>
        <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl"></div>
    </div>
  );
}