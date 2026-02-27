 const testimonials = [
    {
        quote: "EnterpriseX helped us cut reporting time by 40%. Our finance team can now focus on strategy instead of spreadsheets.",
        author: "COO, TechCorp",
        avatar: "/avatar1.png"
    },
    {
        quote: "The insights are game-changing. For the first time, our KPIs are always clear and accessible in real-time.",
        author: "Head of Finance, Global LLC",
        avatar: "/avatar2.png"
    },
    {
        quote: "The support team feels like an extension of our own. Their enterprise-grade service is simply unmatched.",
        author: "IT Director, BizGroup",
        avatar: "/avatar3.png"
    },
    {
        quote: "Integration was seamless. We connected our ERP, CRM, and payroll in days — not months.",
        author: "VP of Operations, ScaleUp Co.",
        avatar: "/avatar4.png"
    },
    {
        quote: "Our leadership finally has the data they need, when they need it. It's transformed decision-making across the board.",
        author: "Finance Manager, BrightWorks",
        avatar: "/avatar5.png"
    },
    {
        quote: "As a beginner, I struggled with complex cards. Cardstock made everything intuitive—the organization tools are a must-have.",
        author: "Emily R.",
        avatar: "/avatar6.png"
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900">Why People Choose Fineeds</h2>
                    <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
                        From solo professionals to global enterprises, Fineeds makes it simple to manage workflows and grow with confidence.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 border-t border-l border-gray-100">
                    {testimonials.map((t, i) => (
                        <div key={i} className="p-10 border-r border-b border-gray-100 flex flex-col justify-between hover:bg-gray-50/50 transition-colors">
                            <p className="text-gray-500 italic text-sm leading-relaxed mb-8">"{t.quote}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-bold text-gray-900">{t.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}