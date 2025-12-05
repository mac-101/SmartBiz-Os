import { expense, sales, inventory } from "../components/data";
import React, { useEffect, useState } from "react";
import FloatingBtn from "../components/floatingBtn";
import FinancialChart from "../components/chart";

export default function Dashboard() {
	const [timeFilter, setTimeFilter] = useState('today'); // 'today', 'week', 'month', 'year'
	const [totalSales, setTotalSales] = React.useState(0);
	const [totalExpenses, setTotalExpenses] = React.useState(0);
	const [inventoryItems, setInventoryItems] = React.useState(inventory.length);
	const [lowStockAlerts, setLowStockAlerts] = React.useState(
		inventory.filter(item => item.quantity < 5).length
	);
	const [todaysProfit, setTodaysProfit] = React.useState(0);
	const [weeklySales, setWeeklySales] = React.useState(0);
	const [monthlySales, setMonthlySales] = React.useState(0);
	const [monthlyExpenses, setMonthlyExpenses] = React.useState(0);
	const [monthlyProfit, setMonthlyProfit] = React.useState(0);
	// Add this with your other state variables
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

			default:
				return { start: '2025-01-01', end: '2025-12-31' };
		}
	};

	// Helper function to check if date is within range
	const isDateInRange = (dateStr, range) => {
		const date = new Date(dateStr);
		const start = new Date(range.start);
		const end = new Date(range.end);
		return date >= start && date <= end;
	};

	// Calculate filtered data
	const calculateFilteredData = () => {
		const range = getDateRange(timeFilter);

		// Filter sales and expenses by time period
		const filteredSales = sales.filter(sale => isDateInRange(sale.date, range));
		const filteredExpenses = expense.filter(exp => isDateInRange(exp.date, range));

		// Calculate totals
		const salesTotal = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
		const expensesTotal = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

		setTotalSales(salesTotal);
		setTotalExpenses(expensesTotal);

		// Calculate profit for the filtered period
		const profit = salesTotal - expensesTotal;
		if (timeFilter === 'today') setTodaysProfit(profit);

		return { salesTotal, expensesTotal, profit };
	};

	// Calculate weekly sales (last 7 days)
	const calculateWeeklySales = () => {
		const today = new Date();
		const weekAgo = new Date(today);
		weekAgo.setDate(today.getDate() - 7);

		const weekRange = {
			start: `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`,
			end: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
		};

		const weeklySalesData = sales.filter(sale => isDateInRange(sale.date, weekRange));
		const weeklyTotal = weeklySalesData.reduce((acc, sale) => acc + sale.total, 0);
		setWeeklySales(weeklyTotal);
	};

	// Calculate monthly data
	const calculateMonthlyData = () => {
		const today = new Date();
		const currentYear = today.getFullYear();
		const currentMonth = today.getMonth();

		const monthRange = {
			start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
			end: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date(currentYear, currentMonth + 1, 0).getDate()).padStart(2, '0')}`
		};

		const monthlySalesData = sales.filter(sale => isDateInRange(sale.date, monthRange));
		const monthlyExpensesData = expense.filter(exp => isDateInRange(exp.date, monthRange));

		const monthlySalesTotal = monthlySalesData.reduce((acc, sale) => acc + sale.total, 0);
		const monthlyExpensesTotal = monthlyExpensesData.reduce((acc, exp) => acc + exp.amount, 0);

		setMonthlySales(monthlySalesTotal);
		setMonthlyExpenses(monthlyExpensesTotal);
		setMonthlyProfit(monthlySalesTotal - monthlyExpensesTotal);
	};

	useEffect(() => {
		calculateFilteredData();
		calculateWeeklySales();
		calculateMonthlyData();
	}, [timeFilter]);

	// Get current date string for display
	const getCurrentDate = () => {
		const today = new Date();
		return today.toISOString().split('T')[0];
	};

	// Get label for time filter
	const getTimeFilterLabel = () => {
		switch (timeFilter) {
			case 'today': return 'Today';
			case 'week': return 'This Week';
			case 'month': return 'This Month';
			case 'year': return 'This Year';
			default: return 'Today';
		}
	};

	// Get date range display
	const getDateRangeDisplay = () => {
		const range = getDateRange(timeFilter);
		if (timeFilter === 'today') {
			return new Date(range.start).toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		}
		return `${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()}`;
	};

	return (
		<div className="p-6 md:rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 min-h-screen space-y-8">

			{/* Header with Time Filter */}

			<FloatingBtn />
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
					<div className="text-sm text-gray-500 mt-1">{getDateRangeDisplay()}</div>
				</div>

				{/* Time Period Filter */}
				<div className="flex flex-wrap gap-2">
					{['today', 'week', 'month', 'year'].map((period) => (
						<button
							key={period}
							onClick={() => setTimeFilter(period)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${timeFilter === period
								? period === 'today' ? 'bg-blue-600 text-white' :
									period === 'week' ? 'bg-purple-600 text-white' :
										period === 'month' ? 'bg-green-600 text-white' :
											'bg-amber-600 text-white'
								: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
								}`}
						>
							{period === 'today' ? 'Today' :
								period === 'week' ? 'This Week' :
									period === 'month' ? 'This Month' : 'This Year'}
						</button>
					))}
				</div>
			</div>

			{/* Top Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-linear-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
					<div className="flex items-center justify-between">
						<div className="">
							<p className="text-sm font-medium text-blue-600">Sales</p>
							<h2 className="text-3xl font-bold text-gray-800">{totalSales.toLocaleString()}₦</h2>
							<p className="text-xs text-gray-500 mt-2">Total Sale's {getTimeFilterLabel()}</p>

						</div>

						<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-linear-to-br from-red-50 to-white p-6 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-shadow duration-300">
					<div className="flex items-center justify-between">
						<div className="">
							<p className="text-sm font-medium text-red-600">Expenses</p>
							<h2 className="text-3xl font-bold text-gray-800">{totalExpenses.toLocaleString()}₦</h2>
							<p className="text-xs text-gray-500 mt-2">Total Expense {getTimeFilterLabel()}</p>


						</div>
						<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">

							<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-linear-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-green-600 mb-1">Inventory Items</p>
							<h2 className="text-3xl font-bold text-gray-800">{inventoryItems}</h2>
							<p className="text-xs text-gray-500 mt-2">Total products in stock</p>
						</div>
						<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-linear-to-br from-amber-50 to-white p-6 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-amber-600 mb-1">Low Stock Alerts</p>
							<h2 className="text-3xl font-bold text-gray-800">{lowStockAlerts}</h2>
							<p className="text-xs text-gray-500 mt-2">Items need restocking</p>
						</div>
						<div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
							<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Middle Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Chart Placeholder with Time Filter */}
				<div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<div>
							<h3 className="text-lg font-semibold text-gray-800">Financial Overview</h3>
							<p className="text-sm text-gray-500">
								Sales vs Expenses vs Profit for {getTimeFilterLabel().toLowerCase()}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{['today', 'week', 'month', 'year', 'all'].map((period) => (
								<button
									key={period}
									onClick={() => setTimeFilter(period)}
									className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${timeFilter === period
											? period === 'today'
												? 'bg-blue-100 text-blue-700 border border-blue-200'
												: period === 'week'
													? 'bg-purple-100 text-purple-700 border border-purple-200'
													: period === 'month'
														? 'bg-green-100 text-green-700 border border-green-200'
														: period === 'year'
															? 'bg-amber-100 text-amber-700 border border-amber-200'
															: 'bg-gray-100 text-gray-700 border border-gray-200'
											: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
										}`}
								>
									{period === 'today' ? 'Today' :
										period === 'week' ? 'This Week' :
											period === 'month' ? 'This Month' :
												period === 'year' ? 'This Year' :
													'All Time'}
								</button>
							))}
						</div>
					</div>

					{/* Chart Container */}
					<div className="relative">
						<div className="absolute top-3 right-3 z-10">
							<div className="flex items-center gap-3 text-xs text-gray-600">
								<div className="flex items-center gap-1.5">
									<div className="w-3 h-3 rounded-sm bg-blue-500"></div>
									<span>Sales</span>
								</div>
								<div className="flex items-center gap-1.5">
									<div className="w-3 h-3 rounded-sm bg-red-500"></div>
									<span>Expenses</span>
								</div>
								<div className="flex items-center gap-1.5">
									<div className="w-3 h-3 rounded-sm bg-green-500"></div>
									<span>Profit</span>
								</div>
							</div>
						</div>

						{/* Chart with proper height */}
						<div className="h-fit rounded-lg border border-gray-100 bg-linear-to-br from-gray-50 to-white pt-6 pb-1">
							<FinancialChart timeFilter={timeFilter} />
						</div>











						{/* Chart Summary */}
						<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-blue-700">Total Sales</p>
										<p className="text-2xl font-bold text-gray-900">
											₦{sales.filter(s => {
												const range = getDateRange(timeFilter);
												return !range || isDateInRange(s.date, range);
											}).reduce((acc, s) => acc + s.total, 0).toLocaleString()}
										</p>
									</div>
									<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
										<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-red-50 p-3 rounded-lg border border-red-100">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-red-700">Total Expenses</p>
										<p className="text-2xl font-bold text-gray-900">
											₦{expense.filter(e => {
												const range = getDateRange(timeFilter);
												return !range || isDateInRange(e.date, range);
											}).reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
										</p>
									</div>
									<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
										<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
										</svg>
									</div>
								</div>
							</div>

							<div className="bg-green-50 p-3 rounded-lg border border-green-100">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-green-700">Net Profit</p>
										<p className="text-2xl font-bold text-gray-900">
											₦{(sales.filter(s => {
												const range = getDateRange(timeFilter);
												return !range || isDateInRange(s.date, range);
											}).reduce((acc, s) => acc + s.total, 0) -
												expense.filter(e => {
													const range = getDateRange(timeFilter);
													return !range || isDateInRange(e.date, range);
												}).reduce((acc, e) => acc + e.amount, 0)
											).toLocaleString()}
										</p>
									</div>
									<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
										<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>







				{/* Quick Summary */}
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Summary</h3>

					<div className="space-y-6">
						<div className="pb-4 border-b border-gray-100">
							<p className="flex justify-between items-center mb-2">
								<span className="text-gray-600">Profit ({getTimeFilterLabel()})</span>
								<span className={`text-sm px-2 py-1 rounded-full ${(totalSales - totalExpenses) >= 0
									? 'bg-green-50 text-green-600'
									: 'bg-red-50 text-red-600'
									}`}>
									{totalSales >= totalExpenses ? 'Profit' : 'Loss'}
								</span>
							</p>
							<h4 className={`text-2xl font-bold ${(totalSales - totalExpenses) >= 0
								? 'text-green-600'
								: 'text-red-600'
								}`}>
								₦{Math.abs(totalSales - totalExpenses).toLocaleString()}
							</h4>
						</div>

						<div className="pb-4 border-b border-gray-100">
							<p className="flex justify-between items-center mb-2">
								<span className="text-gray-600">This Week Sales</span>
								<span className="text-sm text-blue-600">Last 7 Days</span>
							</p>
							<h4 className="text-2xl font-bold text-gray-800">₦{weeklySales.toLocaleString()}</h4>
						</div>

						<div className="pb-4">
							<p className="flex justify-between items-center mb-2">
								<span className="text-gray-600">This Month</span>
								<span className="text-sm text-green-600">Profit/Loss</span>
							</p>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-gray-500 text-sm">Sales:</span>
									<span className="font-medium">{monthlySales.toLocaleString()}₦</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500 text-sm">Expenses:</span>
									<span className="font-medium">{monthlyExpenses.toLocaleString()}₦</span>
								</div>
								<div className="flex justify-between border-t pt-2">
									<span className="text-gray-700 font-medium">Net:</span>
									<span className={`font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
										}`}>
										{monthlyProfit >= 0 ? '+' : ''}{monthlyProfit.toLocaleString()}₦
									</span>
								</div>
							</div>
						</div>

						<div className="pt-4 border-t border-gray-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-500">Inventory Status</p>
									<p className="text-xs text-gray-400">{lowStockAlerts} items need attention</p>
								</div>
								<div className={`px-3 py-1 rounded-full text-sm font-medium ${lowStockAlerts > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
									{lowStockAlerts > 0 ? 'Attention Needed' : 'All Good'}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
						<p className="text-sm text-gray-500">Latest transactions for {getTimeFilterLabel().toLowerCase()}</p>
					</div>

				</div>

				{/* Display recent sales and expenses */}
				<div className="space-y-4">
					{sales
						.filter(sale => {
							const range = getDateRange(timeFilter);
							return isDateInRange(sale.date, range);
						})
						.sort((a, b) => new Date(b.date) - new Date(a.date))
						.slice(0, 3)
						.map((sale, index) => (
							<div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
										<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
										</svg>
									</div>
									<div>
										<p className="font-medium text-gray-900">Sale: {sale.product}</p>
										<p className="text-sm text-gray-500">{sale.customer} • {sale.date}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-bold text-green-600">+{sale.total.toLocaleString()}₦</p>
									<p className="text-sm text-gray-500">{sale.quantity} units</p>
								</div>
							</div>
						))}

					{expense
						.filter(exp => {
							const range = getDateRange(timeFilter);
							return isDateInRange(exp.date, range);
						})
						.sort((a, b) => new Date(b.date) - new Date(a.date))
						.slice(0, 2)
						.map((exp, index) => (
							<div key={exp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
										<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
										</svg>
									</div>
									<div>
										<p className="font-medium text-gray-900">Expense: {exp.category}</p>
										<p className="text-sm text-gray-500">{exp.vendor} • {exp.date}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-bold text-red-600">-{exp.amount.toLocaleString()}₦</p>
									<p className="text-sm text-gray-500">{exp.description}</p>
								</div>
							</div>
						))}

					{/* Show message if no activity */}
					{sales.filter(sale => {
						const range = getDateRange(timeFilter);
						return isDateInRange(sale.date, range);
					}).length === 0 &&
						expense.filter(exp => {
							const range = getDateRange(timeFilter);
							return isDateInRange(exp.date, range);
						}).length === 0 && (
							<div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
								<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<h4 className="text-gray-600 font-medium mb-2">No Activity for {getTimeFilterLabel()}</h4>
								<p className="text-gray-400 text-sm">No transactions found for the selected time period</p>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}