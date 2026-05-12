"use client";

import { motion } from "framer-motion";
import { Send, TvMinimal, SquareMousePointer } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <Send size={22}/>,
      title: "Submit",
      description: "Start browser automation jobs using a target URL and workflow goal."
    },
    {
      icon: <TvMinimal size={22}/>,
      title: "Stream",
      description: "Receive realtime browser events, logs, screenshots, and execution status updates."
    },
    {
      icon: <SquareMousePointer size={22}/>,
      title: "Inspect",
      description: "Review structured results, execution history, and detailed workflow failure information."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
          From a request to a live browser workflow
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Submit browser automation jobs, stream execution events in realtime, and monitor every step from one dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-center"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-2 mx-auto">
              {step.icon}
            </div>
            <h3 className="text-md font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm max-w-[350px] mx-auto">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
