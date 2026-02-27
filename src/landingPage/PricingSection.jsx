const plans = [
  {
    name: "Starter",
    price: "$49",
    desc: "Ideal for small teams to track finances with essential tools.",
    features: ["Up to 10 users", "Core dashboard & reporting", "Standard integrations", "Email support"],
    button: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    price: "$149",
    desc: "Built for scaling teams needing advanced insights and automation.",
    features: ["Up to 50 users", "Advanced analytics", "Priority integrations", "Automated workflows"],
    button: "Start Growing",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Tailored for large organizations with strict compliance.",
    features: ["Unlimited users", "Dedicated manager", "On-premise deployment", "24/7 support"],
    button: "Talk to Sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Choose Your Plan.</h2>
          <p className="text-gray-500 mt-4">Flexible, transparent pricing built to grow with your team.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
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
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-gray-400 text-sm ml-2">/month</span>}
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
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