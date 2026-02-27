export default function HeroSection() {
  return (
    <section className="text-center py-20 px-6">
      <h1 className="text-4xl md:text-6xl font-bold">
        Grow your business <br /> with financial clarity.
      </h1>
      <p className="mt-6 text-gray-500 max-w-xl mx-auto">
        Manage sales, inventory, and insights in one powerful dashboard.
      </p>

      <div className="mt-8 space-x-4">
        <button className="bg-black text-white px-6 py-3 rounded-lg">
          Start Free
        </button>
        <button className="border px-6 py-3 rounded-lg">Live Demo</button>
      </div>

      <img
        className="mt-16 rounded-xl shadow-lg mx-auto"
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
        alt="dashboard preview"
      />
    </section>
  );
}