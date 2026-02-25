import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Removed the static imports - now using props from Dashboard
const FinancialChart = ({ timeFilter = 'today', salesData = [], expensesData = [] }) => {
  const [chartData, setChartData] = useState([]);

  // 1. Helper function to get date ranges (Matching Dashboard logic)
  const getDateRange = (period) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    switch(period) {
      case 'today':
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'week':
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'month':
        return {
          start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
          end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
      case 'year':
        return { start: `${currentYear}-01-01`, end: `${currentYear}-12-31` };
      default:
        return { start: '1970-01-01', end: '2099-12-31' }; // The "All" case
    }
  };

  const isDateInRange = (dateStr, range) => {
    if (!dateStr) return false;
    const d = new Date(dateStr).setHours(0, 0, 0, 0);
    const s = new Date(range.start).setHours(0, 0, 0, 0);
    const e = new Date(range.end).setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  };

  // 2. Format label for the X-Axis
  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    
    if (timeFilter === 'today') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // 3. Process Data for Chart
  useEffect(() => {
    const range = getDateRange(timeFilter);
    
    // Filter props data based on time
    const filteredSales = salesData.filter(s => isDateInRange(s.date, range));
    const filteredExpenses = expensesData.filter(e => isDateInRange(e.date, range));

    const dateMap = {};

    // Process Sales into Map
    filteredSales.forEach(sale => {
      const key = sale.date;
      if (!dateMap[key]) {
        dateMap[key] = { date: key, name: formatXAxis(key), sales: 0, expenses: 0 };
      }
      dateMap[key].sales += Number(sale.total) || 0;
    });

    // Process Expenses into Map
    filteredExpenses.forEach(exp => {
      const key = exp.date;
      if (!dateMap[key]) {
        dateMap[key] = { date: key, name: formatXAxis(key), sales: 0, expenses: 0 };
      }
      dateMap[key].expenses += Number(exp.amount) || 0;
    });

    // Convert Map to Array, Sort, and add Profit
    const result = Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        profit: item.sales - item.expenses
      }));

    setChartData(result);
  }, [timeFilter, salesData, expensesData]); // Re-run when data OR filter changes

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-gray-900">₦{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            hide={true} // Cleaner look, or set to false if you want labels
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" />
          
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorSales)"
            name="Sales"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorExpenses)"
            name="Expenses"
            strokeWidth={2}
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;