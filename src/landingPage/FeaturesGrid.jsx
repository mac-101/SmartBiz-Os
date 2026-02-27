const features = [
  {
    title: "Sales Tracking",
    desc: "Monitor daily transactions and revenue trends.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  },
  {
    title: "Inventory Control",
    desc: "Track stock levels and avoid shortages.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
  },
  {
    title: "Customer Insights",
    desc: "Understand buying patterns and loyalty.",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
  },
  {
    title: "Analytics Dashboard",
    desc: "Visualize growth with clear metrics.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((f, i) => (
        <div key={i} className="p-6 rounded-xl border hover:shadow-lg">
          <img src={f.img} className="rounded-lg mb-4" />
          <h3 className="font-semibold text-lg">{f.title}</h3>
          <p className="text-gray-500 mt-2">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}