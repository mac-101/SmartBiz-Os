import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const FinancialChart = ({ timeFilter = 'today', salesData = [], expensesData = [] }) => {
  const [chartData, setChartData] = useState([]);

  /* ---------------- DATE RANGE ---------------- */

  const getDateRange = (period) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (period) {
      case 'today': {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return { start, end: new Date() };
      }

      case 'week': {
        const start = new Date();
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return { start, end: new Date() };
      }

      case 'month': {
        return {
          start: new Date(year, month, 1),
          end: new Date()
        };
      }

      case 'year': {
        return {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31, 23, 59, 59)
        };
      }

      default:
        return {
          start: new Date(0),
          end: new Date()
        };
    }
  };

  /* ---------------- GROUPING KEY ---------------- */

  const getGroupingKey = (date) => {
    const d = new Date(date);

    if (timeFilter === 'today') {
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
    }

    if (timeFilter === 'year') {
      return `${d.getFullYear()}-${d.getMonth()}`;
    }

    // week & month
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  /* ---------------- LABEL FORMAT ---------------- */

  const formatXAxis = (date) => {
    const d = new Date(date);

    if (timeFilter === 'today') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (timeFilter === 'year') {
      return d.toLocaleDateString('en-US', { month: 'short' });
    }

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  /* ---------------- PROCESS DATA ---------------- */

  /* ---------------- PROCESS DATA ---------------- */

  useEffect(() => {
    const range = getDateRange(timeFilter);
    const bucket = {};

    const inRange = (dateStr) => {
      const d = new Date(dateStr);
      return d >= range.start && d <= range.end;
    };

    // SALES
    salesData
      .filter(s => s.date && inRange(s.date))
      .forEach(sale => {
        const key = getGroupingKey(sale.date);
        const baseDate = new Date(sale.date);

        if (!bucket[key]) {
          bucket[key] = {
            date: baseDate,
            name: formatXAxis(baseDate),
            sales: 0,
            expenses: 0
          };
        }

        // FIX: Change 'sale.total' to 'sale.grandTotal'
        bucket[key].sales += Number(sale.grandTotal) || 0;
      });

    // EXPENSES
    expensesData
      .filter(e => e.date && inRange(e.date))
      .forEach(exp => {
        const key = getGroupingKey(exp.date);
        const baseDate = new Date(exp.date);

        if (!bucket[key]) {
          bucket[key] = {
            date: baseDate,
            name: formatXAxis(baseDate),
            sales: 0,
            expenses: 0
          };
        }

        bucket[key].expenses += Number(exp.amount) || 0;
      });

    const result = Object.values(bucket)
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        ...item,
        profit: item.sales - item.expenses
      }));

    setChartData(result);
  }, [timeFilter, salesData, expensesData]);

  /* ---------------- TOOLTIP ---------------- */

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>

        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold text-gray-900">
              ₦{entry.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            minTickGap={30}
          />

          <YAxis hide={true} />

          <Tooltip content={<CustomTooltip />} />
          {/* <Legend iconType="circle" /> */}

          <Area
            type="monotone"
            dataKey="sales"
            stroke="#3b82f6"
            fill="url(#colorSales)"
            name="Sales"
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            fill="url(#colorExpenses)"
            name="Expenses"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;