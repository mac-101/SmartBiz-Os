import { useState } from 'react';

const faqs = [
  {
    q: "How secure is Fineeds?",
    a: "Fineeds uses bank-grade encryption and complies with SOC 2, GDPR, and ISO standards to ensure enterprise-level data protection."
  },
  {
    q: "Can I integrate my ERP/CRM tools?",
    a: "Yes, we support over 100+ integrations including Salesforce, Stripe, and SAP."
  },
  {
    q: "Do you offer onboarding & training?",
    a: "Our Enterprise and Growth plans include dedicated onboarding sessions and 24/7 priority support."
  },
  {
    q: "Is there a free trial?",
    a: "Yes, you can start a 14-day free trial on our Starter and Growth plans, no credit card required."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id='faq' className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-500 mt-6 max-w-sm">
            Have questions? We've answered the most common ones to help you get started with Fineeds.
          </p>
        </div>

        <div className="border-t border-gray-100">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-gray-600 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.q}</span>
                <span className={`transform transition-transform ${openIndex === i ? "rotate-180" : ""}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="pb-6 text-sm text-gray-500 leading-relaxed animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}