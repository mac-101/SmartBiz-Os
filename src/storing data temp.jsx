// Save to browser
localStorage.setItem('sales', JSON.stringify(sales));

// Load from browser
const savedSales = JSON.parse(localStorage.getItem('sales')) || [];
// Data stays after refresh