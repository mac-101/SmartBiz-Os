import React, { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database'; // Swapped set/push for update
import { db, auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

function ExpenseForm() {
  const [expenses, setExpenses] = useState([
    { id: Date.now(), category: '', description: '', amount: 0, paymentMethod: 'cash' }
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Utilities', 'Salaries', 'Marketing', 'Office Supplies', 'Rent', 'Software', 'Travel', 'Training', 'Maintenance', 'Other'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to record expenses.");

    const validExpenses = expenses.filter(exp => exp.category && exp.amount > 0);
    if (validExpenses.length === 0) return alert("Please add at least one valid expense.");

    setIsSubmitting(true);

    try {
      const updates = {};
      const timestamp = Date.now();
      const recordedAt = new Date().toISOString();

      validExpenses.forEach((exp, index) => {
        // Create a unique ID for every single line item
        const individualId = `EXP-${timestamp}-${index}`;
        const path = `businessData/${user.uid}/expenses/${individualId}`;

        updates[path] = {
          date: date, // The custom transaction date
          category: exp.category,
          description: exp.description || '',
          amount: Number(exp.amount),
          paymentMethod: exp.paymentMethod || 'cash',
          generalNotes: generalNotes || '',
          recordedAt: recordedAt,
          status: 'Paid'
        };
      });

      // Atomic update saves all individual items at once
      await update(ref(db), updates);

      alert(`✅ Successfully recorded ${validExpenses.length} individual expense entries!`);

      // Reset form
      setExpenses([{ id: Date.now(), category: '', description: '', amount: 0, paymentMethod: 'cash' }]);
      setGeneralNotes('');
      setDate(new Date().toISOString().split('T')[0]);

    } catch (err) {
      console.error("Error saving expenses:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-xl shadow-sm border border-gray-100'>
      <div className='mb-6'>
        <h2 className='text-2xl lg:text-3xl font-bold text-gray-800'>Record Expenses</h2>
        <p className='text-gray-500 text-sm'>Log business costs and overheads</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='w-full md:w-1/3'>
          <label className='block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2'>
            Transaction Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none'
          />
        </div>

        <div className='space-y-4'>
          <div className='flex justify-between items-center border-b pb-2'>
            <h3 className='text-lg font-semibold text-gray-700'>Line Items</h3>
            <button
              type="button"
              onClick={addExpense}
              className='text-blue-600 font-bold text-sm hover:underline'
            >
              + Add Row
            </button>
          </div>

          {expenses.map((expense) => (
            <div key={expense.id} className='p-4 border border-gray-200 rounded-xl bg-gray-50 relative'>
              {expenses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExpense(expense.id)}
                  className='absolute top-2 right-3 text-gray-400 hover:text-red-500 text-lg'
                >
                  ×
                </button>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Category</label>
                    <select
                      required
                      value={expense.category}
                      onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value="">Select</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Amount (₦)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={expense.amount}
                      onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div className=''>
                  <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Description</label>
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                    placeholder='e.g. Electricity bill'
                    className='w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className='block text-xs uppercase font-bold text-gray-400 mb-2'>General Notes</label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            rows="2"
            className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm'
          />
        </div>

        <div className='p-6 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center'>
          <span className='text-red-800 font-bold uppercase tracking-widest text-xs'>Total Outflow</span>
          <span className='text-3xl font-bold text-red-700'>₦{calculateTotal().toLocaleString()}</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !expenses.some(exp => exp.category && exp.amount > 0)}
          className='w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Recording...' : `Record Expenses`}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;