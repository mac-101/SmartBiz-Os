import React from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "for 14 days",
    desc: "Perfect for small shops and solo entrepreneurs starting out.",
    features: ["1 Admin User", "Up to 200 SKUs", "Core Inventory Tracking", "Daily Sales Reports", "Email Support"],
    button: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    price: "₦35,000",
    period: "/month",
    desc: "For growing businesses needing deeper insights and team sync.",
    features: ["Up to 10 Users", "Unlimited SKUs", "Low Stock Alerts", "Barcode Support", "P&L Analytics", "Priority Support"],
    button: "Start Growing",
    popular: true,
  },
  {
    name: "Pro",
    price: "₦55,000",
    period: "/month",
    desc: "Advanced features for high-volume retailers and multiple teams.",
    features: ["Up to 25 Users", "Bulk CSV Import", "Inventory Aging", "Supplier Management", "Wholesale Tools", "24/7 Support"],
    button: "Go Pro",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "₦75,000",
    period: "/month",
    desc: "Full-scale solution for multi-location warehouses and large teams.",
    features: ["Unlimited Users", "Multi-Warehouse Sync", "Audit Logs", "AI Demand Forecasting", "Custom API Access", "Dedicated Support"],
    button: "Contact Sales",
    popular: false,
  }
];

const faqs = [
  { q: "Can I upgrade or downgrade later?", a: "Yes, you can change your plan at any time from your dashboard settings." },
  { q: "What happens after the 14-day free trial?", a: "You'll be prompted to select a paid plan to continue accessing your data." },
  { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption and daily backups to keep your business data safe." },
];

export default function PricingPage() {
  const navigate = useNavigate();

  const handlePayment = (planName) => {
    // Placeholder for payment logic (Paystack/Flutterwave)
    console.log(`Initializing payment for: ${planName}`);
    alert(`Redirecting to payment gateway for ${planName} plan...`);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Navigation Header */}
      <nav className="p-6 max-w-7xl mx-auto flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Investment Plans</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Scale your business operations with tools designed for every stage of growth.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {plans.map((plan, i) => (
            <div key={i} className={`relative flex flex-col p-8 rounded-[2rem] bg-white transition-all duration-300 ${
              plan.popular ? "ring-2 ring-black shadow-2xl scale-105 z-10" : "border border-gray-100 shadow-sm hover:shadow-md"
            }`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                  Recommended
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-gray-400 text-sm">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 leading-tight">
                    <svg className="w-4 h-4 mr-3 text-black mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePayment(plan.name)}
                className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.95] ${
                  plan.popular ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto border-t border-gray-100 pt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">{faq.q}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="mt-20 text-center bg-gray-50 rounded-[3rem] p-12">
          <h3 className="text-2xl font-bold text-gray-900">Need a custom enterprise setup?</h3>
          <p className="text-gray-500 mt-2 mb-6">If you have more than 10 locations, we can build a custom plan for you.</p>
          <button className="px-8 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm hover:border-black transition-all">
            Talk to an Expert
          </button>
        </div>
      </div>
    </div>
  );
}