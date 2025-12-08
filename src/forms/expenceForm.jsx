import React, { useState } from 'react';

function ExpenseForm() {
  const [expenses, setExpenses] = useState([
    { id: Date.now(), category: '', description: '', amount: 0, paymentMethod: 'cash' }
  ]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalNotes, setGeneralNotes] = useState('');

  const categories = ['Utilities', 'Salaries', 'Marketing', 'Office Supplies', 'Rent', 'Software', 'Travel', 'Training', 'Maintenance', 'Other'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Card', 'Cheque', 'Mobile Money'];

  const addExpense = () => {
    setExpenses([...expenses, { 
      id: Date.now() + expenses.length, 
      category: '', 
      description: '', 
      amount: 0, 
      paymentMethod: 'cash' 
    }]);
  };

  const removeExpense = (id) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  const updateExpense = (id, field, value) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const calculateTotal = () => {
    return expenses.reduce((total, exp) => total + (parseFloat(exp.amount) || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const expenseData = {
      id: Date.now(),
      date: date,
      expenses: expenses.filter(exp => exp.category && exp.description && exp.amount > 0),
      generalNotes,
      totalAmount: calculateTotal(),
      status: 'Paid'
    };
    
    console.log('New Expenses:', expenseData);
    alert(`Recorded ${expenses.length} expense(s) totaling ₦${calculateTotal().toLocaleString()}!`);
    
    // Reset form
    setExpenses([{ id: Date.now(), category: '', description: '', amount: 0, paymentMethod: 'cash' }]);
    setDate(new Date().toISOString().split('T')[0]);
    setGeneralNotes('');
  };

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-xl shadow-lg'>
      <h2 className='text-2xl lg:text-3xl font-bold text-gray-800 mb-6'>Record Expenses</h2>
      
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Date */}
        <div className='w-full md:w-1/2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        {/* Expense Cards */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-gray-700'>Expenses</h3>
            <button
              type="button"
              onClick={addExpense}
              className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm'
            >
              <span>+ Add Expense</span>
            </button>
          </div>

          {expenses.map((expense, index) => (
            <div key={expense.id} className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
              <div className='flex justify-between items-center mb-3'>
                <span className='font-medium text-gray-700'>Expense #{index + 1}</span>
                {expenses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExpense(expense.id)}
                    className='px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm'
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {/* Category */}
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Category
                  </label>
                  <select
                    required
                    value={expense.category}
                    onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                    className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value="">Select</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className='lg:col-span-2'>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                    placeholder='What was this expense for?'
                    className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={expense.amount}
                    onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                    className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* General Notes */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            General Notes (Optional)
          </label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            rows="2"
            placeholder='Any general notes about these expenses...'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        {/* Summary */}
        <div className='p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h3 className='font-semibold text-gray-800'>Expense Summary</h3>
              <p className='text-sm text-gray-600'>
                {date} • {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Total Amount</p>
              <p className='text-2xl lg:text-3xl font-bold text-red-700'>
                ₦{calculateTotal().toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Category Breakdown */}
          {expenses.some(exp => exp.category) && (
            <div className='mt-4 pt-4 border-t border-red-200'>
              <p className='text-sm font-medium text-gray-700 mb-2'>Category Breakdown:</p>
              <div className='flex flex-wrap gap-2'>
                {Array.from(new Set(expenses.map(exp => exp.category).filter(Boolean))).map(cat => {
                  const categoryTotal = expenses
                    .filter(exp => exp.category === cat)
                    .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
                  
                  return (
                    <div key={cat} className='flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200'>
                      <div className='w-2 h-2 rounded-full bg-red-500'></div>
                      <span className='text-xs text-gray-700'>{cat}:</span>
                      <span className='text-xs font-bold text-red-600'>₦{categoryTotal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <button
            type="button"
            onClick={() => {
              setExpenses([{ id: Date.now(), category: '', description: '', amount: 0, paymentMethod: 'cash' }]);
              setDate(new Date().toISOString().split('T')[0]);
              setGeneralNotes('');
            }}
            className='flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm'
          >
            Clear All
          </button>
          <button
            type="submit"
            disabled={!expenses.some(exp => exp.category && exp.description && exp.amount > 0)}
            className='flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm'
          >
            Record {expenses.length} Expense{expenses.length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;