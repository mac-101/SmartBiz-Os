import React, { useState, useEffect } from "react";
import FloatingBtn from "../components/floatingBtn";
import { expense } from "../components/data";
import { MinusIcon } from "lucide-react";


export default function Expenses() {
  const [expenses, setExpenses] = useState(expense);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState(expense);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get date range for different time filters
  const getDateRange = (filter) => {
    const today = new Date();

    switch (filter) {
      case 'today':
        return getCurrentDate();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return {
          start: weekAgo.toISOString().split('T')[0],
          end: getCurrentDate()
        };
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return {
          start: monthAgo.toISOString().split('T')[0],
          end: getCurrentDate()
        };
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return {
          start: yearAgo.toISOString().split('T')[0],
          end: getCurrentDate()
        };
      default:
        return null;
    }
  };

  // Filter and sort expenses
  useEffect(() => {
    let result = [...expenses];

    // Apply time filter
    if (timeFilter !== 'all') {
      if (timeFilter === 'today') {
        const today = getCurrentDate();
        result = result.filter(exp => exp.date === today);
      } else if (timeFilter === 'custom' && selectedDate) {
        result = result.filter(exp => exp.date === selectedDate);
      } else if (['week', 'month', 'year'].includes(timeFilter)) {
        const range = getDateRange(timeFilter);
        result = result.filter(exp => exp.date >= range.start && exp.date <= range.end);
      }
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(exp => exp.category === categoryFilter);
    }

    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'highest':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        result.sort((a, b) => a.amount - b.amount);
        break;
      default:
        break;
    }

    setFilteredExpenses(result);
  }, [expenses, sortOrder, timeFilter, categoryFilter, selectedDate]);



  // Calculate totals based on filtered expenses
  const totalExpenses = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const highestExpense = filteredExpenses.length > 0
    ? Math.max(...filteredExpenses.map(e => e.amount))
    : 0;
  const averageExpense = filteredExpenses.length > 0
    ? totalExpenses / filteredExpenses.length
    : 0;

  // Get unique categories
  const categories = ['all', ...new Set(expenses.map(e => e.category))];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-linear-to-br rounded-2xl from-gray-50 to-gray-100 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all business expenditures</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto">
          {/* Total Expenses Card */}
          <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-5 rounded-2xl shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium opacity-90 truncate">Total Expenses</p>
                  <p className="text-2xl font-bold truncate mt-1">{totalExpenses.toLocaleString()}₦</p>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-white/20">
                <p className="text-xs opacity-80 truncate">
                  {timeFilter === 'today' ? 'Today' :
                    timeFilter === 'week' ? 'This Week' :
                      timeFilter === 'month' ? 'This Month' :
                        timeFilter === 'year' ? 'This Year' :
                          categoryFilter !== 'all' ? categoryFilter :
                            'All Time'}
                </p>
              </div>
            </div>
          </div>

          {/* Highest Expense Card */}

          <div className="bg-linear-to-r from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium opacity-90 truncate">Highest Expense</p>
                  <p className="text-2xl font-bold truncate mt-1">{highestExpense.toLocaleString()}₦</p>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-white/20">
                <p className="text-xs opacity-80 truncate">
                  {sortOrder === 'highest' ? 'Sorted by Highest' : 'Single transaction'}
                </p>
              </div>
            </div>
          </div>

          {/* Average Expense Card */}
          <div className="bg-linear-to-r from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium opacity-90 truncate">Average Expense</p>
                  <p className="text-2xl font-bold truncate mt-1">
                    {averageExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}₦
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-white/20">
                <p className="text-xs opacity-80 truncate">
                  Based on {filteredExpenses.length} records
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Filter & Sort Expenses</h3>
            <p className="text-gray-600 text-sm">Customize your view based on time, category, and order</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Reset Filters Button */}
            <button
              onClick={() => {
                setTimeFilter('all');
                setCategoryFilter('all');
                setSortOrder('newest');
                setSelectedDate('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Reset Filters
            </button>

            {/* Export Button */}
            <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Date</option>
            </select>

            {/* Custom Date Picker */}
            {timeFilter === 'custom' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="highest">Amount: Highest First</option>
              <option value="lowest">Amount: Lowest First</option>
            </select>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-sm text-gray-600">Filtered Results</div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Records:</span>
                <span className="font-bold text-gray-900">{filteredExpenses.length}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-700">Total:</span>
                <span className="font-bold text-red-600">{totalExpenses.toLocaleString()}₦</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingBtn action="expense" />

      {/* Expense History Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Expense History</h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredExpenses.length} expense records • Sorted by {sortOrder}
                {timeFilter !== 'all' && ` • ${timeFilter}`}
                {categoryFilter !== 'all' && ` • ${categoryFilter}`}
              </p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    ID {sortOrder === 'newest' || sortOrder === 'oldest' ? '↓' : ''}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'highest' ? 'lowest' : 'highest')}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Amount {sortOrder === 'highest' || sortOrder === 'lowest' ? '↓' : ''}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{expense.id.toString().padStart(3, '0')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${expense.category === 'Utilities' ? 'bg-blue-50 text-blue-700' :
                        expense.category === 'Salaries' ? 'bg-purple-50 text-purple-700' :
                          expense.category === 'Marketing' ? 'bg-pink-50 text-pink-700' :
                            expense.category === 'Office Supplies' ? 'bg-green-50 text-green-700' :
                              'bg-gray-50 text-gray-700'
                        }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-gray-900 font-medium truncate">{expense.description}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="rounded-lg text-red-700 font-extrabold flex items-center justify-center mr-1">
                          <MinusIcon size={15} />
                        </div>
                        <div>
                          <div className="text-gray-900 font-bold">{expense.amount.toLocaleString()}₦</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{expense.date}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Paid
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">No expenses found</p>
                      <p className="text-gray-400 mt-1">Try changing your filters or add new expenses</p>
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
              Showing {filteredExpenses.length} of {expenses.length} expense records
              {timeFilter !== 'all' && ` • Filtered by ${timeFilter}`}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Filtered Total: <span className="font-bold text-red-600">{totalExpenses.toLocaleString()}₦</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Expense Breakdown by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from(new Set(expenses.map(e => e.category))).map(category => {
            const categoryTotal = filteredExpenses
              .filter(e => e.category === category)
              .reduce((acc, e) => acc + e.amount, 0);
            const percentage = (categoryTotal / totalExpenses * 100).toFixed(1);

            return (
              <div key={category} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${category === 'Utilities' ? 'bg-blue-100 text-blue-800' :
                    category === 'Salaries' ? 'bg-purple-100 text-purple-800' :
                      category === 'Marketing' ? 'bg-pink-100 text-pink-800' :
                        category === 'Office Supplies' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {category}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{categoryTotal.toLocaleString()}₦</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${category === 'Utilities' ? 'bg-blue-500' :
                      category === 'Salaries' ? 'bg-purple-500' :
                        category === 'Marketing' ? 'bg-pink-500' :
                          category === 'Office Supplies' ? 'bg-green-500' :
                            'bg-gray-500'
                      }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}