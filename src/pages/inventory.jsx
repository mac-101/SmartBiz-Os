import React, { useState, useEffect } from "react";
import FloatingBtn from "../components/floatingBtn.jsx";
import { inventory } from "../components/data.jsx";

export default function Inventory() {
  const [products, setProducts] = useState(inventory);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Calculate statistics
  const totalItems = products.reduce((acc, product) => acc + product.quantity, 0);
  const totalValue = products.reduce((acc, product) => acc + (product.quantity * product.price), 0);
  const lowStockItems = products.filter(product => product.quantity < (product.reorderLevel || 10)).length;
  const outOfStockItems = products.filter(product => product.quantity === 0).length;

  // Get unique categories
  const categories = ["All", ...new Set(products.map(product => product.category))];

  // Filter and sort products
  const filteredProducts = products
  
    .filter(product => selectedCategory === "All" || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.product.localeCompare(b.product);
        case "quantityAsc": return a.quantity - b.quantity;
        case "quantityDesc": return b.quantity - a.quantity;
        case "priceAsc": return a.price - b.price;
        case "priceDesc": return b.price - a.price;
        default: return 0;
      }
    });

  const handleQuantityChange = (id, delta) => {
    setProducts(prev => prev.map(product =>
      product.id === id
        ? { ...product, quantity: Math.max(0, product.quantity + delta) }
        : product
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-linear-to-br from-gray-50 to-gray-100">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all products in stock</p>
        </div>

        <FloatingBtn action="inventory" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-r from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Items</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalItems}</h2>
              <p className="text-xs text-gray-500 mt-2">Units in stock</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-green-50 to-white p-6 rounded-2xl shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Value</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalValue.toLocaleString()}₦</h2>
              <p className="text-xs text-gray-500 mt-2">Inventory worth</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-amber-50 to-white p-6 rounded-2xl shadow-lg border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Low Stock</p>
              <h2 className="text-3xl font-bold text-gray-800">{lowStockItems}</h2>
              <p className="text-xs text-gray-500 mt-2">Need restocking</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-red-50 to-white p-6 rounded-2xl shadow-lg border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Out of Stock</p>
              <h2 className="text-3xl font-bold text-gray-800">{outOfStockItems}</h2>
              <p className="text-xs text-gray-500 mt-2">Require attention</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product Inventory</h2>
            <p className="text-gray-600 text-sm mt-1">{filteredProducts.length} products found</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Category:</label>
              <select
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name A-Z</option>
                <option value="quantityAsc">Quantity: Low to High</option>
                <option value="quantityDesc">Quantity: High to Low</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const itemValue = product.quantity * product.price;
                const isLowStock = product.quantity < (product.reorderLevel || 10);
                const isOutOfStock = product.quantity === 0;

                return (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isOutOfStock ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${product.category === 'Electronics' ? 'bg-blue-100 text-blue-600' :
                          product.category === 'Accessories' ? 'bg-green-100 text-green-600' :
                            product.category === 'Audio' ? 'bg-purple-100 text-purple-600' :
                              product.category === 'Gaming' ? 'bg-amber-100 text-amber-600' :
                                'bg-gray-100 text-gray-600'
                          }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.product}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.category === 'Electronics' ? 'bg-blue-100 text-blue-700' :
                        product.category === 'Accessories' ? 'bg-green-100 text-green-700' :
                          product.category === 'Audio' ? 'bg-purple-100 text-purple-700' :
                            product.category === 'Gaming' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                        }`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-amber-600' :
                              'text-gray-900'
                            }`}>
                            {product.quantity} units
                          </span>
                          <span className="text-xs text-gray-500">
                            Min: {product.reorderLevel || 10}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isOutOfStock ? 'bg-red-500' :
                              isLowStock ? 'bg-amber-500' :
                                product.quantity > 50 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            style={{
                              width: `${Math.min(100, (product.quantity / (product.reorderLevel || 10) * 50))}%`
                            }}
                          ></div>
                        </div>
                        {isLowStock && !isOutOfStock && (
                          <span className="text-xs text-amber-600 font-medium">⚠️ Low Stock</span>
                        )}
                        {isOutOfStock && (
                          <span className="text-xs text-red-600 font-medium">🚫 Out of Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">
                      {product.price.toLocaleString()}₦
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{itemValue.toLocaleString()}₦</div>
                      <div className="text-xs text-gray-500">Inventory value</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={product.quantity === 0}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                          </svg>
                        </button>

                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium">
                          {product.quantity}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Total Value: <span className="font-bold text-green-600">{totalValue.toLocaleString()}₦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}