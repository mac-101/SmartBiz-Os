import { LucideCuboid } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <LucideCuboid className="w-6 h-6" />
                SmartBiz
            </h1>
            <div className="space-x-6">
                <a href="#">Features</a>
                <a href="#">How It Works</a>
                <a href="#">Testimonials</a>
                <a href="#">Pricing</a>
                <a href="#">FAQ</a>

            </div>
            <button className="bg-black text-white px-4 py-2 rounded-lg">
                Get Started
            </button>
        </nav>
    );
}