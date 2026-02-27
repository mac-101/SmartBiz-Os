export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 text-center">
      <h2 className="text-xl font-bold">SmartBiz</h2>
      <p className="text-gray-400 mt-2">
        © {new Date().getFullYear()} All rights reserved.
      </p>
    </footer>
  );
}