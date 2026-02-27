const plans = [
  { name: "Starter", price: "$49", features: ["Sales", "Inventory"] },
  { name: "Pro", price: "$149", features: ["All features", "Analytics"] },
  { name: "Custom", price: "Contact", features: ["Enterprise tools"] },
];

export default function PricingSection() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl font-bold">Choose your plan</h2>

      <div className="grid md:grid-cols-3 gap-8 mt-12 px-6">
        {plans.map((plan, i) => (
          <div key={i} className="border rounded-xl p-8 hover:shadow-lg">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-3xl font-bold my-4">{plan.price}</p>
            <ul className="text-gray-500 space-y-2">
              {plan.features.map((f, idx) => (
                <li key={idx}>✓ {f}</li>
              ))}
            </ul>
            <button className="mt-6 bg-black text-white px-6 py-2 rounded-lg">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}