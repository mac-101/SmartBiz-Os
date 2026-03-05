import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db, auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

export default function UpdateStock({ onClose, mode = "restock", product = null }) {

    const [products, setProducts] = useState([
        { productId: '', quantity: 0, cost: 0, price: 0, total: 0, productName: '', availableStock: 0 }
    ]);
    const [inventoryList, setInventoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load inventory from Firebase
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            const bizId = localStorage.getItem("active_business_id");
            if (user) {
                const inventoryRef = ref(db, `businessData/${bizId}/inventory`);
                const unsubscribeData = onValue(inventoryRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const list = Object.keys(data).map(key => ({
                            ...data[key],
                            firebaseKey: key
                        }));
                        setInventoryList(list);

                        // Pre-fill form for edit mode
                        if (mode === "edit" && product) {
                            setProducts([{
                                productId: product.firebaseKey,
                                productName: product.product || product.productName,
                                quantity: Number(product.quantity || 0),
                                cost: Number(product.cost || 0),
                                price: Number(product.price || 0),
                                total: Number(product.cost || 0) * Number(product.quantity || 0),
                                availableStock: Number(product.quantity || 0)
                            }]);
                        }
                    }
                    setLoading(false);
                });
                return () => unsubscribeData();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, [mode, product]);

    // Add/remove rows (only for restock mode)
    const addProductRow = () => {
        setProducts([...products, { productId: '', quantity: 0, cost: 0, price: 0, total: 0, productName: '', availableStock: 0 }]);
    };
    const removeProductRow = (index) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    // Handlers
    const handleProductChange = (index, selectedFirebaseKey) => {
        const item = inventoryList.find(i => i.firebaseKey === selectedFirebaseKey);
        if (item) {
            const newProducts = [...products];
            newProducts[index] = {
                ...newProducts[index],
                productId: item.firebaseKey,
                productName: item.product || item.productName,
                cost: Number(item.cost || 0),
                price: Number(item.price || 0),
                availableStock: Number(item.quantity || 0),
                quantity: mode === "edit" ? Number(item.quantity || 0) : 0,
                total: 0
            };
            setProducts(newProducts);
        }
    };

    const handleQuantityChange = (index, qty) => {
        const newProducts = [...products];
        const val = Math.max(0, parseInt(qty) || 0);
        newProducts[index].quantity = val;

        if (mode === "restock") {
            newProducts[index].total = newProducts[index].cost * val;
        }
        setProducts(newProducts);
    };

    const handleCostChange = (index, cost) => {
        const newProducts = [...products];
        newProducts[index].cost = Number(cost);

        if (mode === "restock") {
            newProducts[index].total = Number(cost) * newProducts[index].quantity;
        }
        setProducts(newProducts);
    };

    const handlePriceChange = (index, price) => {
        const newProducts = [...products];
        newProducts[index].price = Number(price);
        setProducts(newProducts);
    };

    const calculateTotalExpense = () => products.reduce((sum, item) => sum + item.total, 0);

    const validateForm = () => {
        if (mode === "restock") {
            return products.every(p => p.productId !== '' && p.quantity > 0 && p.cost > 0);
        }
        if (mode === "edit") {
            return products.every(p => p.productId !== '' && p.cost > 0 && p.price > 0);
        }
        return false;
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("Please log in");
        if (!validateForm()) return alert("Please complete required fields");

        try {
            const updates = {};
            const timestamp = Date.now();
            const date = new Date().toISOString().split('T')[0];

            products.forEach((p, index) => {
                const inventoryPath = `businessData/${user.uid}/inventory/${p.productId}`;

                if (mode === "restock") {
                    const expenseId = `EXP-${timestamp}-${index}`;
                    updates[`businessData/${user.uid}/expenses/${expenseId}`] = {
                        category: 'Restock',
                        description: `Restocked ${p.productName}`,
                        amount: p.total,
                        date: date,
                        paymentMethod: 'cash',
                        status: 'Paid',
                        recordedAt: date,
                    };

                    updates[`${inventoryPath}/quantity`] = Number(p.availableStock) + Number(p.quantity);
                } else if (mode === "edit") {
                    updates[`${inventoryPath}/quantity`] = Number(p.quantity); // Keep same as existing
                }

                // Always update cost & price
                updates[`${inventoryPath}/cost`] = Number(p.cost);
                updates[`${inventoryPath}/price`] = Number(p.price);
            });

            await update(ref(db), updates);

            alert(mode === "restock" ? "✅ Inventory updated and expense logged!" : "✅ Inventory updated successfully!");
            onClose();

            setProducts([{ productId: '', quantity: 0, cost: 0, price: 0, total: 0, productName: '', availableStock: 0 }]);
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

    return (
        <div className='max-w-4xl mx-auto p-4 md:p-6 rounded-xl'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800'>
                        {mode === "restock" ? "Restock Inventory" : "Edit Inventory"}
                    </h2>
                    <p className='text-gray-600 text-sm'>
                        {mode === "restock" ? "Add new stock & log as expense" : "Update cost & selling price"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='flex justify-between items-center border-b pb-2'>
                        <h3 className='text-lg font-semibold text-gray-700'>
                            Product Details
                        </h3>
                        {mode === "restock" && (
                            <button type="button" onClick={addProductRow} className='text-blue-600 font-bold text-sm'>
                                + Add Item
                            </button>
                        )}
                    </div>

                    {products.map((p, index) => (
                        <div key={index} className={`p-4 border border-gray-100 rounded-xl bg-gray-50 relative grid grid-cols-2 ${mode === "restock" ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>

                            {mode === "restock" && products.length > 1 && (
                                <button type="button" onClick={() => removeProductRow(index)} className='absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-red-500 shadow-sm'>×</button>
                            )}

                            {/* Product Name */}
                            <div className={` ${mode === "edit" ? "col-span-1 lg:col-span-1" : "col-span-2 lg:col-span-1"}`}>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Product</label>
                                {mode === "edit" ? (
                                    <input type="text" className='w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-100' value={p.productName} disabled />
                                ) : (
                                    <select value={p.productId} onChange={(e) => handleProductChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option value="">Select</option>
                                        {inventoryList.map(item => (
                                            <option key={item.firebaseKey} value={item.firebaseKey}>{item.product}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>
                                    {mode === "restock" ? "Qty Added" : "Stock Level"}
                                </label>
                                <input type="number" value={p.quantity} onChange={(e) => handleQuantityChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" disabled={mode === "edit"} />
                                <p className='text-[9px] text-gray-400 mt-1'>Current: {p.availableStock}</p>
                            </div>

                            {/* Cost */}
                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Cost (₦)</label>
                                <input type="number" value={p.cost} onChange={(e) => handleCostChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>

                            {/* Price */}
                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Selling (₦)</label>
                                <input type="number" value={p.price} onChange={(e) => handlePriceChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>

                            {/* Total cost for restock */}
                            {mode === "restock" && (
                                <div>
                                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Total Cost</label>
                                    <div className='p-2 text-blue-700 font-bold text-sm'>₦{p.total.toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Total Expense for restock */}
                {mode === "restock" && (
                    <div className='p-6 bg-blue-50 rounded-2xl flex justify-between items-center'>
                        <span className='text-blue-900 uppercase tracking-widest text-xs font-bold'>Total Expense (Cash Out)</span>
                        <span className='text-3xl font-bold text-blue-900'>₦{calculateTotalExpense().toLocaleString()}</span>
                    </div>
                )}

                <button type="submit" disabled={!validateForm()} className='w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:bg-gray-300 transition-all'>
                    {mode === "restock" ? "Update Inventory & Log Expense" : "Save Changes"}
                </button>
            </form>
        </div>
    );
}