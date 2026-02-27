export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6">
      <h1 className="text-xl font-bold">SmartBiz</h1>
      <div className="space-x-6">
        <a href="#">Features</a>
        <a href="#">Pricing</a>
        <a href="#">Login</a>
        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Get Started
        </button>
      </div>
    </nav>
  );
}