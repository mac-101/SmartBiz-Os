import { useState, useEffect, useRef } from "react";
import {
  Building2, User, Mail, Phone, MapPin, Globe,
  TrendingUp, TrendingDown, DollarSign, Package,
  Edit2, Share2, Download, Calendar,
  Users, Target, BarChart3, CreditCard,
  FileText, QrCode, Sparkles
} from "lucide-react";
import { sales, expense, inventory } from "../components/data";
import { businessInfo } from "../components/data";

export default function BusinessProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [businessData, setBusinessData] = useState(businessInfo);
  const [isGenerating, setIsGenerating] = useState(false);
  const businessCardRef = useRef(null);

  // Calculate stats from real data
  const calculateStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expense.reduce((sum, exp) => sum + exp.amount, 0);
    const activeProducts = inventory.reduce((count, item) => count + (item.quantity > 0 ? 1 : 0), 0);

    const uniqueCustomers = [...new Set(sales.map(sale => sale.customer))].length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);

    const lastMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === (currentMonth - 1 + 12) % 12 &&
        saleDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
    }).reduce((sum, sale) => sum + sale.total, 0);

    const growthRate = lastMonthSales > 0 ?
      ((monthlyRevenue - lastMonthSales) / lastMonthSales * 100).toFixed(1) :
      monthlyRevenue > 0 ? "100.0" : "0.0";

    return {
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      growthRate: parseFloat(growthRate),
      activeProducts,
      monthlyRevenue,
      pendingOrders: sales.filter(sale => sale.status === 'pending').length,
      customerCount: uniqueCustomers
    };
  };

  const [stats, setStats] = useState(calculateStats());

  useEffect(() => {
    setStats(calculateStats());
  }, [sales, expense, inventory]);

  const getRecentTransactions = () => {
    const salesWithType = sales.slice(0, 3).map(sale => ({
      ...sale,
      type: "sale",
      status: "completed"
    }));

    const expensesWithType = expense.slice(0, 2).map(exp => ({
      ...exp,
      type: "expense",
      status: "paid",
      category: exp.category || "General"
    }));

    return [...salesWithType, ...expensesWithType]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const recentTransactions = getRecentTransactions();

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saving business data:", businessData);
  };

  // Simple text-based business card download
  const downloadTextBusinessCard = () => {
    const cardText = `
╔═══════════════════════════════════════════╗
║         ${businessData.businessName.toUpperCase()}         ║
║         ${businessData.businessType}         ║
╠═══════════════════════════════════════════╣
║                                           ║
║  👤 ${businessData.ownerName}              ║
║  ✉️ ${businessData.email}                  ║
║  📞 ${businessData.phone}                  ║
║  📍 ${businessData.address}                ║
║  🌐 ${businessData.website}                ║
║                                           ║
║  📅 Established: ${businessData.established} ║
║  🆔 Tax ID: ${businessData.taxId}          ║
║                                           ║
║  "${businessData.description}"            ║
║                                           ║
╚═══════════════════════════════════════════╝

${businessData.businessName} - Professional Business Card
Generated on ${new Date().toLocaleDateString()}
        `;

    const blob = new Blob([cardText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessData.businessName.replace(/\s+/g, '_')}_Business_Card.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Create and download business card as HTML file (viewable in browser)
  const downloadHTMLBusinessCard = () => {
    setIsGenerating(true);

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${businessData.businessName} - Business Card</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }
                
                .business-card {
                    width: 100%;
                    max-width: 800px;
                    min-height: 450px;
                    background: linear-gradient(145deg, #ffffff, #f0f0f0);
                    border-radius: 25px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex;
                    overflow: hidden;
                    position: relative;
                    flex-direction: column;
                }
                
                @media (min-width: 768px) {
                    .business-card {
                        flex-direction: row;
                        height: 450px;
                    }
                }
                
                .card-left {
                    flex: 1;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                
                @media (min-width: 768px) {
                    .card-left {
                        padding: 40px;
                    }
                }
                
                .card-left::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200px;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                }
                
                .card-left::after {
                    content: '';
                    position: absolute;
                    bottom: -30%;
                    left: -30%;
                    width: 150px;
                    height: 150px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 50%;
                }
                
                .logo {
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: white;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                @media (min-width: 768px) {
                    .logo {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                }
                
                .company-name {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 6px;
                    line-height: 1.2;
                    word-break: break-word;
                }
                
                @media (min-width: 768px) {
                    .company-name {
                        font-size: 32px;
                        margin-bottom: 8px;
                    }
                }
                
                .company-type {
                    font-size: 14px;
                    opacity: 0.9;
                    margin-bottom: 20px;
                    word-break: break-word;
                }
                
                @media (min-width: 768px) {
                    .company-type {
                        font-size: 18px;
                        margin-bottom: 30px;
                    }
                }
                
                .card-right {
                    flex: 1.5;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                @media (min-width: 768px) {
                    .card-right {
                        padding: 40px;
                    }
                }
                
                .contact-info {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 15px;
                    color: #333;
                }
                
                @media (min-width: 768px) {
                    .contact-info {
                        margin-bottom: 20px;
                        align-items: center;
                    }
                }
                
                .contact-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    color: white;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                @media (min-width: 768px) {
                    .contact-icon {
                        width: 40px;
                        height: 40px;
                        margin-right: 15px;
                        margin-top: 0;
                    }
                }
                
                .contact-details h4 {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 3px;
                    font-weight: 500;
                }
                
                @media (min-width: 768px) {
                    .contact-details h4 {
                        font-size: 14px;
                        margin-bottom: 4px;
                    }
                }
                
                .contact-details p {
                    font-size: 14px;
                    font-weight: 600;
                    color: #222;
                    line-height: 1.3;
                    word-break: break-word;
                }
                
                @media (min-width: 768px) {
                    .contact-details p {
                        font-size: 16px;
                    }
                }
                
                .footer {
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                @media (min-width: 768px) {
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        gap: 0;
                    }
                }
                
                .established {
                    font-size: 12px;
                    color: #666;
                    line-height: 1.4;
                }
                
                @media (min-width: 768px) {
                    .established {
                        font-size: 14px;
                    }
                }
                
                .website {
                    font-size: 14px;
                    font-weight: 600;
                    color: #4f46e5;
                    text-decoration: none;
                    word-break: break-word;
                }
                
                @media (min-width: 768px) {
                    .website {
                        font-size: 16px;
                    }
                }
                
                .qr-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 15px;
                }
                
                @media (min-width: 768px) {
                    .qr-section {
                        margin-top: 20px;
                        gap: 10px;
                    }
                }
                
                .qr-box {
                    width: 50px;
                    height: 50px;
                    background: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    font-size: 10px;
                }
                
                @media (min-width: 768px) {
                    .qr-box {
                        width: 60px;
                        height: 60px;
                        font-size: 12px;
                    }
                }
                
                .qr-text {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.9);
                }
                
                @media (min-width: 768px) {
                    .qr-text {
                        font-size: 12px;
                    }
                }
                
                /* Print styles */
                @media print {
                    body {
                        background: white !important;
                        padding: 0;
                    }
                    
                    .business-card {
                        box-shadow: none;
                        border: 1px solid #ddd;
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="business-card">
                <div class="card-left">
                    <div class="logo">${businessData.businessName.charAt(0)}</div>
                    <h1 class="company-name">${businessData.businessName}</h1>
                    <p class="company-type">${businessData.businessType}</p>
                    
                </div>
                
                <div class="card-right">
                    <div class="contact-info">
                        <div class="contact-icon">👤</div>
                        <div class="contact-details">
                            <h4>OWNER</h4>
                            <p>${businessData.ownerName}</p>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <div class="contact-icon">✉️</div>
                        <div class="contact-details">
                            <h4>EMAIL</h4>
                            <p>${businessData.email}</p>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <div class="contact-icon">📞</div>
                        <div class="contact-details">
                            <h4>PHONE</h4>
                            <p>${businessData.phone}</p>
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <div class="contact-icon">📍</div>
                        <div class="contact-details">
                            <h4>ADDRESS</h4>
                            <p>${businessData.address}</p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="established">
                            <strong>Established:</strong> ${businessData.established}<br>
                            <strong>Tax ID:</strong> ${businessData.taxId}
                        </div>
                        <a href="${businessData.website}" class="website">${businessData.website}</a>
                    </div>
                </div>
            </div>
            
            <script>
                // Add click to print functionality
                document.querySelector('.business-card').addEventListener('dblclick', function() {
                    window.print();
                });
                
                // Mobile touch support
                let touchStart = 0;
                document.querySelector('.business-card').addEventListener('touchstart', function(e) {
                    touchStart = e.touches[0].clientX;
                });
                
                document.querySelector('.business-card').addEventListener('touchend', function(e) {
                    if (e.changedTouches[0].clientX - touchStart > 50) {
                        alert('Double tap to print this business card');
                    }
                });
            </script>
        </body>
        </html>
            `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessData.businessName.replace(/\s+/g, '_')}_Business_Card.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setIsGenerating(false), 1000);
  };

  // Simple share function
  const shareBusinessCard = () => {
    const shareText = `${businessData.businessName}

${businessData.ownerName}
${businessData.email}
${businessData.phone}
${businessData.address}
${businessData.website}

${businessData.businessType}
Established: ${businessData.established}
Tax ID: ${businessData.taxId}

${businessData.description}`;

    if (navigator.share) {
      navigator.share({
        title: `${businessData.businessName} - Business Card`,
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => alert('Business card copied to clipboard!'))
        .catch(() => {
          // Fallback: Create text file download
          const blob = new Blob([shareText], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${businessData.businessName.replace(/\s+/g, '_')}_Business_Card.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
    }
  };

  // Download business summary as text file
  const downloadBusinessSummary = () => {
    const summary = `
BUSINESS PROFILE SUMMARY
========================

COMPANY INFORMATION
-------------------
Business Name: ${businessData.businessName}
Business Type: ${businessData.businessType}
Owner: ${businessData.ownerName}
Established: ${businessData.established}
Tax ID: ${businessData.taxId}

CONTACT DETAILS
---------------
Email: ${businessData.email}
Phone: ${businessData.phone}
Address: ${businessData.address}
Website: ${businessData.website}

BUSINESS DESCRIPTION
-------------------
${businessData.description}

PERFORMANCE METRICS
-------------------
Total Sales: ₦${stats.totalSales.toLocaleString()}
Total Expenses: ₦${stats.totalExpenses.toLocaleString()}
Profit: ₦${stats.profit.toLocaleString()}
Active Products: ${stats.activeProducts}
Total Customers: ${stats.customerCount}
Growth Rate: ${stats.growthRate > 0 ? '+' : ''}${stats.growthRate}%

INVENTORY SUMMARY
-----------------
Total Products: ${inventory.length}
Products Needing Reorder: ${inventory.filter(item => item.quantity < item.reorderLevel).length}
Active Products: ${stats.activeProducts}

RECENT TRANSACTIONS
-------------------
${recentTransactions.map(t =>
      `${t.date} - ${t.type.toUpperCase()}: ${t.type === 'sale' ? t.product : t.category} - ${t.type === 'sale' ? '+' : '-'}₦${t.type === 'sale' ? t.total?.toLocaleString() : t.amount?.toLocaleString()}`
    ).join('\n')}

REPORT GENERATED
----------------
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

${businessData.businessName} - All Rights Reserved
        `;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessData.businessName.replace(/\s+/g, '_')}_Business_Summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCustomerNames = () => {
    return [...new Set(sales.map(sale => sale.customer))];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Business Profile</h1>
        <p className="text-gray-600 mt-2">Manage your business information and view performance metrics</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Business Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Business Info Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                  {businessData.businessName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{businessData.businessName}</h2>
                  <p className="text-sm md:text-base text-gray-600 truncate">{businessData.businessType}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm md:text-base"
                >
                  <Edit2 size={16} className="md:size-5" />
                  <span className="hidden sm:inline">{isEditing ? "Cancel" : "Edit"}</span>
                  <span className="sm:hidden">{isEditing ? "Cancel" : "Edit"}</span>
                </button>
              </div>
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {isEditing ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={businessData.ownerName}
                      onChange={(e) => setBusinessData({ ...businessData, ownerName: e.target.value })}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={businessData.email}
                      onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={businessData.address}
                      onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                      rows="2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={businessData.description}
                      onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                      rows="3"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base w-full sm:w-auto"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Building2 className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Business Type</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.businessType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <User className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Owner</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <Calendar className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Established</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.established}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Mail className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Email</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <Phone className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Phone</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <MapPin className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Address</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <Globe className="text-blue-500 shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-gray-500">Website</p>
                        <p className="text-sm md:text-base font-medium truncate">{businessData.website}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg md:rounded-xl p-4 md:p-5">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-green-700 font-medium">Total Sales</p>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mt-1 truncate">₦{stats.totalSales.toLocaleString()}</h3>
                </div>
                <DollarSign size={20} className="text-green-500 shrink-0 ml-2 md:size-6" />
              </div>
              <div className="flex items-center gap-1 mt-2 md:mt-3">
                <TrendingUp size={14} className="md:size-4 text-green-600" />
                <span className="text-xs md:text-sm text-green-600 font-medium truncate">
                  {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}% growth
                </span>
              </div>
            </div>

            <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg md:rounded-xl p-4 md:p-5">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-red-700 font-medium">Total Expenses</p>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mt-1 truncate">₦{stats.totalExpenses.toLocaleString()}</h3>
                </div>
                <CreditCard size={20} className="text-red-500 shrink-0 ml-2 md:size-6" />
              </div>
              <div className="flex items-center gap-1 mt-2 md:mt-3">
                <TrendingDown size={14} className="md:size-4 text-red-600" />
                <span className="text-xs md:text-sm text-red-600 font-medium truncate">{expense.length} transactions</span>
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-4 md:p-5">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-blue-700 font-medium">Active Products</p>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mt-1 truncate">{stats.activeProducts}</h3>
                </div>
                <Package size={20} className="text-blue-500 shrink-0 ml-2 md:size-6" />
              </div>
              <div className="text-xs md:text-sm text-blue-600 mt-2 md:mt-3 truncate">
                {inventory.filter(item => item.quantity < item.reorderLevel).length} need reorder
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-xl p-4 md:p-5">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-purple-700 font-medium">Customers</p>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mt-1 truncate">{stats.customerCount}</h3>
                </div>
                <Users size={20} className="text-purple-500 shrink-0 ml-2 md:size-6" />
              </div>
              <div className="flex items-center gap-1 mt-2 md:mt-3">
                <Target size={14} className="md:size-4 text-purple-600" />
                <span className="text-xs md:text-sm text-purple-600 truncate">{sales.length} total sales</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <div className="min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Recent Transactions</h3>
                <p className="text-xs md:text-sm text-gray-500">Latest sales and expenses</p>
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${transaction.type === 'sale' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                      {transaction.type === 'sale' ? (
                        <TrendingUp size={14} className="md:size-5 text-green-600" />
                      ) : (
                        <TrendingDown size={14} className="md:size-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-base font-medium truncate">
                        {transaction.type === 'sale'
                          ? `Sale: ${transaction.product}`
                          : `Expense: ${transaction.category}`
                        }
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {transaction.type === 'sale'
                          ? transaction.customer
                          : transaction.description
                        } • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <p className={`text-sm md:text-base font-bold ${transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {transaction.type === 'sale' ? '+' : '-'}₦{transaction.type === 'sale'
                        ? transaction.total?.toLocaleString()
                        : transaction.amount?.toLocaleString()
                      }
                    </p>
                    <span className={`px-1 md:px-2 py-0.5 md:py-1 text-xs rounded-full ${transaction.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-6 md:py-8 text-sm md:text-base text-gray-500">
                  No recent transactions found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Business Card & Actions */}
        <div className="space-y-4 md:space-y-6">
          {/* Business Card Design */}
          <div
            ref={businessCardRef}
            className="relative bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl md:rounded-2xl p-6 text-white overflow-hidden shadow-2xl"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Building2 size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{businessData.businessName}</h3>
                  <p className="text-blue-100">{businessData.businessType}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Owner</p>
                    <p className="font-medium">{businessData.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Email</p>
                    <p className="font-medium">{businessData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Phone</p>
                    <p className="font-medium">{businessData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Location</p>
                    <p className="font-medium">{businessData.address.split(',')[0]}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <QrCode size={24} />
                  <span className="text-sm text-blue-100">Digital Business Card</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Est. {businessData.established.split(' ')[2]}</p>
                  <p className="font-medium">{businessData.website}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-3 md:p-4">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3">Export Options</h3>
            <div className="space-y-2">
              {/* Save Business Card Button */}
              <button
                onClick={downloadHTMLBusinessCard}
                disabled={isGenerating}
                className="w-full flex items-center gap-2 p-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download size={16} />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">Save Business Card</p>
                  <p className="text-blue-100 text-xs truncate">Download as HTML file</p>
                </div>
              </button>

              {/* Share Business Card Button */}
              <button
                onClick={shareBusinessCard}
                className="w-full flex items-center gap-2 p-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Share2 size={16} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">Share Business Card</p>
                  <p className="text-purple-100 text-xs truncate">Share or copy to clipboard</p>
                </div>
              </button>

              {/* Download Full Profile Button */}
              <button
                onClick={downloadBusinessSummary}
                className="w-full flex items-center gap-2 p-3 bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">Save Full Profile</p>
                  <p className="text-indigo-100 text-xs truncate">Download complete summary</p>
                </div>
              </button>
            </div>
          </div>

          {/* Business Description */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Business Overview</h3>
            <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4">{businessData.description}</p>
            <div className="space-y-2 md:space-y-3">
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-xs md:text-sm text-gray-500">Total Products</p>
                <p className="font-medium text-sm md:text-base">{inventory.length} items</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-xs md:text-sm text-gray-500">Tax ID</p>
                <p className="font-medium text-sm md:text-base">{businessData.taxId}</p>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                <p className="text-xs md:text-sm text-gray-500">Top Customers</p>
                <p className="font-medium text-xs md:text-sm truncate">
                  {getCustomerNames().slice(0, 3).join(', ')}
                  {getCustomerNames().length > 3 && '...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}