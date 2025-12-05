import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sales as allSales, expense as allExpenses } from './data';

const FinancialChart = ({ timeFilter = 'week' }) => {
  const [chartData, setChartData] = useState([]);

  // Helper function to get date ranges
  const getDateRange = (period) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    
    switch(period) {
      case 'today':
        const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
        return { start: todayStr, end: todayStr };
      
      case 'week':
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
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
      
      default:
        return null;
    }
  };

  // Filter data by time period
  const filterDataByTime = (data, range) => {
    if (!range) return data;
    return data.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (timeFilter === 'today') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Prepare chart data
  useEffect(() => {
    const range = getDateRange(timeFilter);
    const filteredSales = filterDataByTime(allSales, range);
    const filteredExpenses = filterDataByTime(allExpenses, range);
    
    // Group data by date
    const dateMap = {};
    
    // Process sales
    filteredSales.forEach(sale => {
      const dateKey = sale.date;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          name: formatDate(dateKey),
          sales: 0,
          expenses: 0,
          profit: 0
        };
      }
      dateMap[dateKey].sales += sale.total;
      dateMap[dateKey].profit += sale.total;
    });
    
    // Process expenses
    filteredExpenses.forEach(exp => {
      const dateKey = exp.date;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          name: formatDate(dateKey),
          sales: 0,
          expenses: 0,
          profit: 0
        };
      }
      dateMap[dateKey].expenses += exp.amount;
      dateMap[dateKey].profit -= exp.amount;
    });
    
    // Convert to array and sort by date
    const result = Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setChartData(result);
  }, [timeFilter]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">₦{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
         className="outline-none focus:outline-none"
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0, }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Area
            type="monotone"
            dataKey="sales"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            name="Sales"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="expenses"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
            name="Expenses"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#10b981"
            fill="none"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      
    </div>
  );
};

export default FinancialChart;