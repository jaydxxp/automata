"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Does the browser automation run in the frontend?", a: "No. All Playwright automation runs entirely on the backend infrastructure." },
    { q: "How are updates shown in realtime?", a: "Execution events stream live through persistent WebSocket connections without polling." },
    { q: "What happens when an automation job fails?", a: "Detailed failure reasons, execution steps, and runtime logs appear instantly." },
    { q: "Can I view screenshots during execution?", a: "Yes. Screenshots are streamed and displayed while workflows continue running live." },
    { q: "What can I inspect after completion?", a: "Execution logs, screenshots, structured results, and detailed workflow status information." }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
      <h2 className="text-4xl font-bold tracking-tight text-center mb-12">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
            >
              <h4 className="font-semibold text-lg">{faq.q}</h4>
              <motion.div
                animate={{ rotate: openIndex === idx ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} className="text-gray-400" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-5 border-t border-white/10">
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}