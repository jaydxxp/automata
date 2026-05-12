"use client";

import { Bug } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function BugReports() {
  const [activeStep, setActiveStep] = useState(-1);
  const sectionRef = useRef(null);
  

  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const points = [
    { title: "Submit", desc: "Start browser workflows using a target URL and execution goal." },
    { title: "Monitor", desc: "Track live browser events, execution logs, and captured screenshots continuously." },
    { title: "Review", desc: "Inspect structured outputs, workflow progress, and detailed execution failure states." }
  ];

  useEffect(() => {
    if (isInView) {
      const timers = points.map((_, idx) => {
        return setTimeout(() => {
          setActiveStep(idx);
        }, idx * 600);
      });
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [isInView]); 

  return (
    <section ref={sectionRef} className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            For realtime browser workflows
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Run browser automation jobs with live execution tracking and detailed runtime visibility.
          </p>
          
          <div className="relative">
          
            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
            
            <div className="space-y-6">
              {points.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  className="relative flex items-start gap-3"
                >
            
                  <div className="relative z-10 h-6 w-6 rounded-full bg-[#0A0A0A] flex items-center justify-center mt-0.5">
                    <div className={`h-2 w-2 rounded-full transition-all duration-500 ${
                      activeStep >= idx ? "bg-white" : "bg-white/20"
                    }`} />
                    
                 
                    {activeStep === idx && (
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </div>
                  
                  <div className="transition-all duration-500">
                    <h4 className={`font-semibold transition-colors duration-500 ${
                      activeStep >= idx ? "text-white" : "text-gray-500"
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm transition-colors duration-500 ${
                      activeStep >= idx ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

       
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/5 rounded-xl p-8 border border-white/10"
        >
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Bug size={48} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Preview</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}