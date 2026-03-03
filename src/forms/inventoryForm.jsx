import React, { useState, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { db, auth } from '../../firebase.config'; 

function InventoryForm({ onSuccess, product = null }) {
  // Initialize with either the selected product or a blank product
  const [products, setProducts] = useState([
    product
      ? { ...product, id: Date.now() } // clone selected product for editing
      : { id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5 }
  ]);

  const [categories, setCategories] = useState(['Electronics', 'Furniture', 'Office Supplies', 'Accessories']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // --- Logic Functions ---
  const addProduct = () => {
    setProducts([...products, { id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5 }]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(prod => prod.id !== id));
    }
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(prod => prod.id === id ? { ...prod, [field]: value } : prod));
  };

  const calculateTotalValue = () => {
    return products.reduce((total, prod) => 
      total + ((parseFloat(prod.cost) || 0) * (parseInt(prod.quantity) || 0)), 0
    );
  };

  const getStockStatus = (qty, reorder) => {
    const q = parseInt(qty) || 0;
    const r = parseInt(reorder) || 0;
    if (q === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (q <= r) return { text: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const handleCustomCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      setCategories([...categories, newCatName]);
      setIsAddingCategory(false);
      setNewCatName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please log in first");

    try {
      const promises = products.map((prod, index) => {
        // If editing, keep the existing SKU; otherwise generate a new one
        const sku = prod.sku || `${prod.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${index + 1}`;
        return set(ref(db, `businessData/${user.uid}/inventory/${sku}`), {
          ...prod,
          sku: sku, // save SKU in object
          lastUpdated: new Date().toISOString()
        });
      });

      await Promise.all(promises);
      alert("Inventory successfully updated!");
      onSuccess();

      // Reset form after add (edit form will close anyway)
      if (!product) {
        setProducts([{ id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5 }]);
      }
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  // If the `product` prop changes (selecting a different product for editing), update form
  useEffect(() => {
    if (product) {
      setProducts([{ ...product, id: Date.now() }]);
    }
  }, [product]);

  return (
    <div className='max-w-4xl mx-auto p-3 md:p-6 bg-white rounded-2xl'>
      <div className='flex justify-between items-center mb-6'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800'>
                        Add New Product to Inventory
                    </h2>
                    
                </div>
            </div>
      {/* Category Management */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-semibold text-gray-700">Categories</h4>
            <p className="text-xs text-gray-500">Add custom types for your business</p>
          </div>
          {isAddingCategory ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <input 
                className="p-2 text-sm border rounded-lg bg-white" 
                placeholder="New Category..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <button onClick={handleCustomCategory} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add</button>
              <button onClick={() => setIsAddingCategory(false)} className="text-gray-400 text-sm">✕</button>
            </div>
          ) : (
            <button onClick={() => setIsAddingCategory(true)} className="text-blue-600 text-sm font-bold hover:underline">+ Create Custom Category</button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {products.map((prod, index) => {
          const status = getStockStatus(prod.quantity, prod.reorderLevel);
          const itemTotal = (parseFloat(prod.cost) || 0) * (parseInt(prod.quantity) || 0);

          return (
            <div key={prod.id} className='p-3 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow'>
              <div className='flex justify-between items-center mb-4'>
                <div className='flex items-center gap-3'>
                  <span className='bg-gray-800 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs'>{index + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                {products.length > 1 && (
                  <button type="button" onClick={() => removeProduct(prod.id)} className='text-red-400 hover:text-red-600 text-sm font-medium'>Remove</button>
                )}
              </div>

              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                <div>
                  <label className='text-[10px] uppercase tracking-wider font-bold text-gray-400'>Product Name</label>
                  <input
                    required
                    value={prod.product}
                    onChange={(e) => updateProduct(prod.id, 'product', e.target.value)}
                    className='w-full mt-1 p-2 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-500 focus:bg-white outline-none rounded-md text-sm transition-all'
                    placeholder="e.g. Mac Studio"
                  />
                </div>
                <div>
                  <label className='text-[10px] uppercase tracking-wider font-bold text-gray-400'>Category</label>
                  <select
                    required
                    value={prod.category}
                    onChange={(e) => updateProduct(prod.id, 'category', e.target.value)}
                    className='w-full mt-1 p-2 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-500 focus:bg-white outline-none rounded-md text-sm transition-all'
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className='text-[10px] uppercase tracking-wider font-bold text-gray-400'>Quantity</label>
                  <input
                    type="number"
                    value={prod.quantity}
                    onChange={(e) => updateProduct(prod.id, 'quantity', e.target.value)}
                    className='w-full mt-1 p-2 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-500 focus:bg-white outline-none rounded-md text-sm'
                  />
                </div>
                <div>
                  <label className='text-[10px] uppercase tracking-wider font-bold text-gray-400'>Purchase Cost (₦)</label>
                  <input
                    type="number"
                    value={prod.cost}
                    onChange={(e) => updateProduct(prod.id, 'cost', e.target.value)}
                    className='w-full mt-1 p-2 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-500 focus:bg-white outline-none rounded-md text-sm'
                  />
                </div>
                <div>
                  <label className='text-[10px] uppercase tracking-wider font-bold text-gray-400'>Selling Price (₦)</label>
                  <input
                    type="number"
                    value={prod.price}
                    onChange={(e) => updateProduct(prod.id, 'price', e.target.value)}
                    className='w-full mt-1 p-2 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-500 focus:bg-white outline-none rounded-md text-sm'
                  />
                </div>
              </div>
              <div className="mt-4 text-right text-xs text-gray-400">
                Subtotal: <span className="font-bold text-gray-600">₦{itemTotal.toLocaleString()}</span>
              </div>
            </div>
          );
        })}

        {/* Inventory Summary Dashboard */}
        <div className='p-6 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-100'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className="text-center md:text-left">
              <p className='text-green-100 text-sm'>Total Items</p>
              <h3 className='text-3xl font-bold'>{products.length}</h3>
            </div>
            <div className="text-center md:text-right">
              <p className='text-green-100 text-sm'>Total Estimated Value</p>
              <h3 className='text-3xl font-bold'>₦{calculateTotalValue().toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <button
            type="button"
            onClick={addProduct}
            className='flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all'
          >
            + Add Another Product
          </button>
          <button
            type="submit"
            className='flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all'
          >
            {product ? "Update Product" : "Save All to Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventoryForm;