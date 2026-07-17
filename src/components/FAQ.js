import { useState } from 'react';

export default function FAQ({ 
  faqs = [], 
  title = "Frequently Asked Questions", 
  subtitle = "", 
  accentColorClass = "text-accent-violet-400" 
}) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="border-t border-base-800 pt-12">
      {title && (
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-gray-400 text-xs sm:text-sm text-center mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={`faq_${index}`}
              className="bg-base-950/30 border border-base-800/60 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm sm:text-base font-bold text-white pr-4">
                  {faq.q}
                </span>
                <span className={`${accentColorClass} font-bold transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-base-300 border-t border-base-900 bg-base-950/15 leading-relaxed whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
