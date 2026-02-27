import dashboard1 from "../assets/localhost_5173_dashboard.png";
import dashboard2 from "../assets/sales.png";
import dashboard3 from "../assets/expence.png";
import dashboard4 from "../assets/inventory.png";

const features = [
    {
    title: "Inventory and Stock Management",
    text: "Keep track of your inventory levels, monitor stock movements, and avoid overstocking or stockouts.",
    image: dashboard4,
    reverse: false,
  },
  {
    title: "Sales Tracking and Cash Flow",
    text: "Monitor your sales pipeline and cash flow trends to make informed decisions and keep your business thriving.",
    image: dashboard2,
    reverse: true,
  },
  {
    title: "Expense Breakdown",
    text: "See exactly where your money goes — from software and tools to operations and marketing.",
    image: dashboard3,
    reverse: false,
  },
  
  {
    title: "Real-Time Financial Overview",
    text: "Stay on top of your business with live updates on balance, income, expenses, and net profit — all in one glance.",
    image: dashboard1,
    reverse: true,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20 border-t border-gray-100 pt-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Clarity and Control,<br /> All in One Dashboard.
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            See your balance, cash flow, and expenses at a glance — giving you the confidence to make better financial decisions every day.
          </p>
        </div>

        {/* Feature Rows */}
        <div className="space-y-24">
          {features.map((feature, i) => (
            <div
              key={i}
              className="grid lg:grid-cols-2 gap-16 items-center border-t border-gray-100 pt-16"
            >
              {/* Image Card - We use lg:order-last to push it to the right if reversed */}
              <div className={`relative ${feature.reverse ? "lg:order-last" : ""}`}>
                {/* Gradient Frame */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 rounded-2xl blur-2xl opacity-50"></div>

                {/* Dashboard Card */}
                <div className="relative bg-white rounded-2xl shadow-xl p-4">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-500 mt-4 leading-relaxed">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}