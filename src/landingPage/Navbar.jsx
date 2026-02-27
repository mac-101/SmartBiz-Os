import { LucideCuboid } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Navbar() {

    const navigate = useNavigate();

    return (
        <nav className="flex justify-between items-center p-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <LucideCuboid className="w-6 h-6" />
                SmartBiz
            </h1>
            <div className="space-x-6">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#testimonials">Testimonials</a>
                <a href="#pricing">Pricing</a>
                <a href="#faq">FAQ</a>

            </div>
            <button onClick={() => navigate('/login')} className="bg-black text-white px-4 py-2 rounded-lg">
                Login
            </button>
        </nav>
    );
}