import dashboard from "../assets/localhost_5173_dashboard.png";

export default function HeroSection() {
    return (
        <section className="text-center py-20 px-6">
            <h1 className="text-4xl md:text-8xl font-medium">
                Grow your business <br /> with financial clarity.
            </h1>
            <p className="mt-10 text-gray-500 max-w-xl mx-auto">
                Get real-time insights,track cash flow, and make smart financial decisions with SmartBiz OS. Your all-in-one dashboard for business success.
            </p>

            <button className="bg-black text-white mt-8 px-6 py-2 rounded-lg">
                Get Started
            </button>

            <div className="relative">
                <img
                    className="mt-16 w-[80%] rounded-xl shadow-lg mx-auto"
                    src={dashboard}
                    alt="dashboard preview"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent rounded-xl opacity-20"></div>
            </div>
        </section>
    );
}