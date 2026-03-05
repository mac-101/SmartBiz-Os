const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "for 14 days",
    desc: "Perfect for small shops and solo entrepreneurs starting out.",
    features: [
      "1 Admin User", 
      "Up to 200 SKUs",
      "Core Inventory Tracking", 
      "Daily Sales Reports", 
      "Email Support"
    ],
    button: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    price: "₦35,000",
    period: "/month",
    desc: "For growing businesses needing deeper insights and team sync.",
    features: [
      "Up to 10 Users", 
      "Unlimited SKUs", 
      "Low Stock Alerts (Push/SMS)", 
      "Barcode Scanning Support", 
      "Profit & Loss Analytics", 
      "Priority Email Support"
    ],
    button: "Start Growing",
    popular: true,
  },
  {
    name: "Pro",
    price: "₦55,000",
    period: "/month",
    desc: "Advanced features for high-volume retailers and multiple teams.",
    features: [
      "Up to 25 Users",
      "Bulk CSV Import/Export",
      "Advanced Inventory Aging",
      "Supplier Management",
      "Wholesale Pricing Tools",
      "24/7 Priority Support"
    ],
    button: "Go Pro",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "₦75,000",
    period: "/month",
    desc: "Full-scale solution for multi-location warehouses and large teams.",
    features: [
      "Unlimited Users", 
      "Multi-Warehouse Sync", 
      "Audit Logs (Staff Activity)", 
      "AI Demand Forecasting", 
      "Custom API Access", 
      "Dedicated WhatsApp Support", 
      "Advanced Security & Backups"
    ],
    button: "Contact Sales",
    popular: false,
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6"> {/* Increased max-width for 4 columns */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Choose Your Plan.</h2>
          <p className="text-gray-500 mt-4">Flexible, transparent pricing built to grow with your team.</p>
        </div>

        {/* Updated grid to lg:grid-cols-4 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div key={i} className={`relative flex flex-col p-8 rounded-3xl bg-white transition-all ${
              plan.popular ? "ring-2 ring-gray-900 shadow-2xl scale-105 z-10" : "border border-gray-100 shadow-sm"
            }`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-2">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-gray-400 text-sm ml-2">{plan.period}</span>} <br />
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.popular ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-50 text-gray-900 hover:bg-gray-100"
              }`}>
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}