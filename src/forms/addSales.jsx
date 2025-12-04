import React from 'react'

export default function addSales() {
  return (
    <div>{/* New Sale Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <h2 className="text-lg font-semibold">Record New Sale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select className="border rounded px-3 py-2">
            {inventory.map((item) => (
              <option key={item.id} value={item.name} disabled={item.stock === 0}>
                {item.name} ({item.stock} in stock)
              </option>
            ))}
          </select>
          <input type="number" placeholder="Quantity" className="border rounded px-3 py-2" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Sale
          </button>
        </div>
      </div></div>
  )
}
