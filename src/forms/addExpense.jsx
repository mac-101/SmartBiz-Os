import React from 'react'

export default function addExpense() {
  return (
    <div>{/* New Expense Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <h2 className="text-lg font-semibold">Add New Expense</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input type="text" placeholder="Expense Title" className="border rounded px-3 py-2" />
          <input type="text" placeholder="Category" className="border rounded px-3 py-2" />
          <input type="number" placeholder="Amount (₦)" className="border rounded px-3 py-2" />
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Add Expense
          </button>
        </div>
      </div></div>
  )
}
