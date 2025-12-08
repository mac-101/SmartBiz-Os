import React, { useState } from 'react';
import { inventory } from '../components/data';

export default function SaleForm() {
  const [products, setProducts] = useState([
    { productId: '', quantity: 1, price: 0, total: 0 }
  ]);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Format date
  const getCurrentDate = () => {
    const date = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Add new product row
  const addProductRow = () => {
    setProducts([...products, { productId: '', quantity: 1, price: 0, total: 0 }]);
  };

  // Remove product row
  const removeProductRow = (index) => {
    if (products.length > 1) {
      const newProducts = [...products];
      newProducts.splice(index, 1);
      setProducts(newProducts);
    }
  };

  // Handle product selection
  const handleProductChange = (index, productId) => {
    const newProducts = [...products];
    const selectedProduct = inventory.find(item => item.id === parseInt(productId));

    if (selectedProduct) {
      newProducts[index] = {
        ...newProducts[index],
        productId,
        price: selectedProduct.price,
        total: selectedProduct.price * newProducts[index].quantity,
        productName: selectedProduct.product,
        availableStock: selectedProduct.quantity
      };
    } else {
      newProducts[index] = {
        ...newProducts[index],
        productId,
        price: 0,
        total: 0,
        productName: '',
        availableStock: 0
      };
    }

    setProducts(newProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (index, quantity) => {
    const newProducts = [...products];
    const qty = parseInt(quantity) || 0;
    newProducts[index].quantity = qty;
    newProducts[index].total = newProducts[index].price * qty;
    setProducts(newProducts);
  };

  // Calculate total sale
  const calculateTotal = () => {
    return products.reduce((sum, item) => sum + item.total, 0);
  };

  // Check if any product exceeds available stock
  const validateStock = () => {
    return products.every(product => {
      if (!product.productId || product.quantity <= 0) return true;
      const inventoryItem = inventory.find(item => item.id === parseInt(product.productId));
      return inventoryItem && product.quantity <= inventoryItem.quantity;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateStock()) {
      alert('Some products exceed available stock! Please check quantities.');
      return;
    }

    const saleData = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      displayDate: getCurrentDate(),
      customer,
      paymentMethod,
      products: products.filter(p => p.productId && p.quantity > 0).map(p => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.quantity,
        price: p.price,
        total: p.total
      })),
      totalAmount: calculateTotal(),
    };

    console.log('Sale Data:', saleData);
    alert(`✅ Sale recorded! Total: ₦${calculateTotal().toLocaleString()}`);

    // Reset form
    setProducts([{ productId: '', quantity: 1, price: 0, total: 0 }]);
    setCustomer('');
  };

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>New Sale</h2>
          <p className='text-gray-600 text-sm'>Date: {getCurrentDate()}</p>
        </div>
        
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Customer Info */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Customer Name (Optional)
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder='Walk-in customer'
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            >
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Card</option>
              <option value="transfer">🏦 Bank Transfer</option>
              <option value="credit">📝 Credit</option>
            </select>
          </div>
        </div>

        {/* Product Selection */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-gray-700'>Products</h3>
            <button
              type="button"
              onClick={addProductRow}
              className='px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-1'
            >
              <span>+ Add Product</span>
            </button>
          </div>

          {products.map((product, index) => {
            const inventoryItem = inventory.find(item => item.id === parseInt(product.productId));
            const maxQuantity = inventoryItem ? inventoryItem.quantity : 0;
            const isOutOfStock = product.quantity > maxQuantity;

            return (
              <div key={index} className='p-3 border border-gray-200 rounded-lg bg-gray-50'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-medium text-gray-700 text-sm'>Item #{index + 1}</span>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      className='px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs'
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                  {/* Product Selection */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Product *
                    </label>
                    <select
                      value={product.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className='w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm'
                    >
                      <option value="">Select product</option>
                      {inventory.map(item => (
                        <option 
                          key={item.id} 
                          value={item.id}
                          disabled={item.quantity <= 0}
                        >
                          {item.product} (Stock: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Quantity *
                    </label>
                    <div className='relative'>
                      <input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                          isOutOfStock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {maxQuantity > 0 && (
                        <span className='absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500'>
                          /{maxQuantity}
                        </span>
                      )}
                    </div>
                    {isOutOfStock && (
                      <p className='text-xs text-red-600 mt-1'>Exceeds available stock!</p>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Unit Price
                    </label>
                    <div className='p-2 bg-gray-100 rounded-lg text-sm'>
                      <span className='font-medium'>₦{product.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Total
                    </label>
                    <div className='p-2 bg-blue-50 rounded-lg'>
                      <span className='font-bold text-blue-700 text-sm'>₦{product.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Total */}
        <div className='space-y-4'>
          <div className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h4 className='font-semibold text-gray-800'>Sale Summary</h4>
                <p className='text-sm text-gray-600'>
                  {products.filter(p => p.productId).length} product{products.filter(p => p.productId).length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Total Amount</p>
                <p className='text-2xl md:text-3xl font-bold text-blue-700'>
                  ₦{calculateTotal().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={products.every(p => !p.productId || p.quantity === 0) || !validateStock()}
          className='w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm'
        >
          {validateStock() ? 'Complete Sale' : '⚠️ Check Stock Levels'}
        </button>
      </form>
    </div>
  );
}