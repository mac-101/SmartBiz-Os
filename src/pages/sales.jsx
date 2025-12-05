import React, { useState, useMemo, useEffect } from "react";
import FloatingBtn from "../components/floatingBtn.jsx";
import { Plus } from "lucide-react";
import { sales as salesData } from "../components/data.jsx";

export default function Sales() {
  // Static sales data
  const [sales, setSales] = useState(salesData);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'date', // Default sort by date
    direction: 'desc' // Default: newest first
  });

  // Time period filter state
  const [timeFilter, setTimeFilter] = useState('week'); // 'all', 'today', 'week', 'month', 'year'
  const [filteredSales, setFilteredSales] = useState(salesData);
  const [productFilter, setProductFilter] = useState('all'); // Filter by product
  const [selectedDate, setSelectedDate] = useState('');

  // Helper function to get date ranges
  const getDateRange = (period) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    switch (period) {
      case 'today':
        const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
        return { start: todayStr, end: todayStr };

      case 'week':
        // Get start of week (Monday)
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
          start: `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`,
          end: `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`
        };

      case 'month':
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        return {
          start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
          end: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`
        };

      case 'year':
        return {
          start: `${currentYear}-01-01`,
          end: `${currentYear}-12-31`
        };

      case 'custom':
        if (!selectedDate) return null;
        return {
          start: selectedDate,
          end: selectedDate
        };

      default:
        return null;
    }
  };

  // Helper function to check if date is within range
  const isDateInRange = (dateStr, range) => {
    if (!range) return true; // For 'all' filter
    const date = new Date(dateStr);
    const start = new Date(range.start);
    const end = new Date(range.end);
    return date >= start && date <= end;
  };

  // Get unique products for filter
  const uniqueProducts = ['all', ...new Set(sales.map(s => s.product))];


  useEffect(() => {
    let result = [...sales];

    console.log('Current filters:', { timeFilter, selectedDate, productFilter });

    // Apply time filter
    if (timeFilter !== 'all') {
      const range = getDateRange(timeFilter);
      console.log('Date range:', range);

      if (range) {
        const beforeFilter = result.length;
        result = result.filter(sale => isDateInRange(sale.date, range));
        console.log(`Filtered from ${beforeFilter} to ${result.length} sales`);
      }
    }

    // Apply product filter
    if (productFilter !== 'all') {
      const beforeProductFilter = result.length;
      result = result.filter(sale => sale.product === productFilter);
      console.log(`Product filter: ${beforeProductFilter} to ${result.length}`);
    }

    setFilteredSales(result);
    console.log('Final result:', result.length, 'sales');
  }, [sales, timeFilter, productFilter, selectedDate]);

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = 'asc';

    // If already sorting by this key, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Sort the filtered sales data based on configuration
  const sortedSales = useMemo(() => {
    const sortedArray = [...filteredSales];

    sortedArray.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedArray;
  }, [filteredSales, sortConfig]);

  // Calculate totals for summary based on filtered sales
  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalItemsSold = filteredSales.reduce((acc, sale) => acc + sale.quantity, 0);

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = filteredSales.filter(sale => sale.date === today).length;

  // Get highest sale amount from filtered sales
  const highestSale = filteredSales.length > 0 ? Math.max(...filteredSales.map(s => s.total)) : 0;
  const averageSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Get time period label
  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'custom':
        return selectedDate
          ? `${selectedDate}`
          : 'Custom Date';
      default: return 'This Week'; // Change 'All Time' to 'This Week'
    }
  };

  // Reset filters
  const resetFilters = () => {
    setTimeFilter('all');
    setProductFilter('all');
    setSelectedDate(''); // Add this
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  return (
    <div className="p-4 md:rounded-2xl md:p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all sales transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4">
          {/* Total Revenue Card */}
          <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-lg flex-1 min-w-40 sm:min-w-[210px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm opacity-90 truncate">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{totalRevenue.toLocaleString()}₦</p>
                <p className="text-[10px] sm:text-xs opacity-80 mt-1 truncate">{getTimeFilterLabel()}</p>
              </div>
            </div>
          </div>

          {/* Items Sold Card */}
          <div className="bg-linear-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-lg flex-1 min-w-40 sm:min-w-[180px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm opacity-90 truncate">Items Sold</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{totalItemsSold}</p>
                <p className="text-[10px] sm:text-xs opacity-80 mt-1 truncate">{filteredSales.length} transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Filter Sales</h3>
            <p className="text-gray-600 text-sm">Customize your view based on time period and products</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Reset Filters Button */}
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Reset Filters
            </button>

            {/* Export Button */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Grid - Only Time and Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                // Clear selected date when switching away from custom
                if (e.target.value !== 'custom') {
                  setSelectedDate('');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">This Week</option>
              <option value="today">Today</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date</option>
            </select>

            {/* Custom Date Picker */}
            {timeFilter === 'custom' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Can't select future dates
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {selectedDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing sales for: {selectedDate}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {uniqueProducts.map(product => (
                <option key={product} value={product}>
                  {product === 'all' ? 'All Products' : product}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-700 font-medium">Filtered Results</div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Transactions:</span>
                <span className="font-bold text-gray-900">{filteredSales.length}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-700">Total Revenue:</span>
                <span className="font-bold text-blue-600">{totalRevenue.toLocaleString()}₦</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="text-sm text-green-700 font-medium">Current Filters</div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Time Period:</span>
                <span className="font-medium text-gray-900">{getTimeFilterLabel()}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-700">Product:</span>
                <span className="font-medium text-gray-900">
                  {productFilter === 'all' ? 'All Products' : productFilter}
                </span>
              </div>
            </div>
          </div>

          {/* <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="text-sm text-purple-700 font-medium">Sorting</div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Sorted by:</span>
                <span className="font-medium text-gray-900 capitalize">{sortConfig.key}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-700">Order:</span>
                <span className="font-medium text-gray-900">
                  {sortConfig.direction === 'desc' ? 'Descending' : 'Ascending'}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <FloatingBtn action="sale" />

      {/* Sales Table Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sales History</h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredSales.length} transactions found • {getTimeFilterLabel()}
                {productFilter !== 'all' && ` • ${productFilter}`}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('product')}
                >
                  <div className="flex items-center gap-2">
                    Product
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'product' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'product' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-2">
                    Customer
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'customer' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'customer' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center gap-2">
                    Quantity
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'quantity' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'quantity' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Unit Price
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'price' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-2">
                    Total Amount
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'total' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'total' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <div className="flex flex-col">
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'date' && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={`w-3 h-3 ${sortConfig.key === 'date' && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedSales.length > 0 ? (
                sortedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${sale.product.includes('Laptop') ? 'bg-blue-100' :
                          sale.product.includes('Monitor') ? 'bg-green-100' :
                            sale.product.includes('Keyboard') ? 'bg-purple-100' :
                              sale.product.includes('Mouse') ? 'bg-amber-100' :
                                sale.product.includes('Headphones') ? 'bg-pink-100' :
                                  'bg-gray-100'
                          }`}>
                          <svg className={`w-5 h-5 ${sale.product.includes('Laptop') ? 'text-blue-600' :
                            sale.product.includes('Monitor') ? 'text-green-600' :
                              sale.product.includes('Keyboard') ? 'text-purple-600' :
                                sale.product.includes('Mouse') ? 'text-amber-600' :
                                  sale.product.includes('Headphones') ? 'text-pink-600' :
                                    'text-gray-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{sale.product}</div>
                          <div className="text-sm text-gray-500">ID: #{sale.id.toString().padStart(3, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                        {sale.customer || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-gray-900 font-medium">{sale.quantity}</div>
                        <div className="text-xs text-gray-500">units</div>
                      </div>

                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      <div className="font-medium">{sale.price?.toLocaleString()}₦</div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="rounded-lg text-green-800 font-extrabold flex items-center justify-center mr-1">
                          <Plus size={15} />
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold text-lg">{sale.total.toLocaleString()}₦</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{sale.date}</span>
                        {sale.date === today ? (
                          <span className="text-xs text-green-600 font-medium">Today</span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {new Date(sale.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">No sales found</p>
                      <p className="text-gray-400 mt-1">Try changing your filters or add new sales</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredSales.length} of {sales.length} transactions • {getTimeFilterLabel()}
              {productFilter !== 'all' && ` • Filtered by: ${productFilter}`}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Filtered Total: <span className="font-bold text-blue-600">{totalRevenue.toLocaleString()}₦</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Sale Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageSale.toLocaleString(undefined, { maximumFractionDigits: 0 })}₦
              </p>
              <p className="text-xs text-gray-500 mt-1">{filteredSales.length} transactions</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Highest Sale</p>
              <p className="text-2xl font-bold text-gray-900">
                {highestSale.toLocaleString()}₦
              </p>
              <p className="text-xs text-gray-500 mt-1">{getTimeFilterLabel()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{todaysSales}</p>
              <p className="text-xs text-gray-500 mt-1">Sales made today</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}