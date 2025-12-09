import React, { useState } from 'react';

function InventoryForm() {
  const [products, setProducts] = useState([
    { id: Date.now(), product: '', category: '', quantity: 0, price: 0, reorderLevel: 5 }
  ]);

  const categories = ['Electronics', 'Furniture', 'Office Supplies', 'Accessories', 'Audio', 'Gaming', 'Other'];

  const addProduct = () => {
    setProducts([...products, { 
      id: Date.now() + products.length, 
      product: '', 
      category: '', 
      quantity: 0, 
      price: 0, 
      reorderLevel: 5 
    }]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(prod => prod.id !== id));
    }
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(prod => 
      prod.id === id ? { ...prod, [field]: value } : prod
    ));
  };

  const calculateTotalValue = () => {
    return products.reduce((total, prod) => 
      total + ((parseFloat(prod.price) || 0) * (parseInt(prod.quantity) || 0)), 0
    );
  };

  const getStockStatus = (product) => {
    const qty = parseInt(product.quantity) || 0;
    const reorder = parseInt(product.reorderLevel) || 5;
    
    if (qty === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (qty <= reorder) return { text: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate SKU for each product
    const productsWithSKU = products.map((prod, index) => ({
      ...prod,
      sku: `SKU-${Date.now().toString().slice(-6)}-${index + 1}`,
      dateAdded: new Date().toISOString().split('T')[0]
    }));

    const inventoryData = {
      date: new Date().toISOString().split('T')[0],
      products: productsWithSKU,
      totalValue: calculateTotalValue(),
      totalItems: products.length
    };
    
    console.log('New Inventory Items:', inventoryData);
    alert(`Added ${products.length} product${products.length !== 1 ? 's' : ''} to inventory! Total value: ₦${calculateTotalValue().toLocaleString()}`);
    
    // Reset form
    setProducts([{ id: Date.now(), product: '', category: '', quantity: 0, price: 0, reorderLevel: 5 }]);
  };

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-xl '>
      <h2 className='text-2xl lg:text-3xl font-bold text-gray-800 mb-6'>Add Products to Inventory</h2>
      
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Product Cards */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-gray-700'>Products</h3>
            <button
              type="button"
              onClick={addProduct}
              className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm'
            >
              <span>+ Add Product</span>
            </button>
          </div>

          {products.map((product, index) => {
            const status = getStockStatus(product);
            const totalValue = (parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0);
            
            return (
              <div key={product.id} className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
                <div className='flex justify-between items-center mb-3'>
                  <div className='flex items-center gap-3'>
                    <span className='font-medium text-gray-700'>Product #{index + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className='px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm'
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                  {/* Product Name */}
                  <div className='lg:col-span-2'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={product.product}
                      onChange={(e) => updateProduct(product.id, 'product', e.target.value)}
                      placeholder='e.g., Laptop, Monitor, Keyboard'
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Category *
                    </label>
                    <select
                      required
                      value={product.category}
                      onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value="">Select</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                {/* Second Row - Reorder Level and Supplier */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                  {/* Reorder Level */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={product.reorderLevel}
                      onChange={(e) => updateProduct(product.id, 'reorderLevel', parseInt(e.target.value) || 5)}
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Alert when stock ≤ this</p>
                  </div>

                  {/* Supplier (Optional) */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Supplier (Optional)
                    </label>
                    <input
                      type="text"
                      value={product.supplier || ''}
                      onChange={(e) => updateProduct(product.id, 'supplier', e.target.value)}
                      placeholder='e.g., Dell, Amazon'
                      className='w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  {/* Product Value Display */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Total Value
                    </label>
                    <div className='p-2 bg-blue-50 rounded-lg border border-blue-100'>
                      <p className='text-sm font-bold text-blue-700'>
                        ₦{totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className='p-4 bg-linear-to-r from-green-50 to-green-100 rounded-lg border border-green-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h3 className='font-semibold text-gray-800'>Inventory Summary</h3>
              <p className='text-sm text-gray-600'>
                {products.length} product{products.length !== 1 ? 's' : ''} to add
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Total Inventory Value</p>
              <p className='text-2xl lg:text-3xl font-bold text-green-700'>
                ₦{calculateTotalValue().toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Stock Status Overview */}
          <div className='mt-4 pt-4 border-t border-green-200'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Stock Status:</p>
            <div className='flex flex-wrap gap-2'>
              {products.filter(p => p.product).map((product, index) => {
                const status = getStockStatus(product);
                return (
                  <div key={index} className='flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200'>
                    <div className={`w-2 h-2 rounded-full ${
                      status.text === 'Out of Stock' ? 'bg-red-500' :
                      status.text === 'Low Stock' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></div>
                    <span className='text-xs text-gray-700 truncate max-w-[100px]'>{product.product}</span>
                    <span className='text-xs font-medium text-gray-500'>({product.quantity})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <button
            type="button"
            onClick={() => {
              setProducts([{ id: Date.now(), product: '', category: '', quantity: 0, price: 0, reorderLevel: 5 }]);
            }}
            className='flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm'
          >
            Clear All
          </button>
          <button
            type="submit"
            disabled={!products.some(prod => prod.product && prod.category && prod.price > 0)}
            className='flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm'
          >
            Add {products.length} Product{products.length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventoryForm;