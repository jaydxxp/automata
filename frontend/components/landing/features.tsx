"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Send,
  Activity,
  
  GitBranch,
  Database,
  Timer,
  Image,
  AlertTriangle,
  Layers,
  Trash2,
  Drama,
  Globe,
  Timeline
} from "lucide-react";

export function MajorFeatures() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const featureCategories = [
    {
      title: "Job Management",
      icon: <Globe size={20} />,
      features: [
        { name: "Browser Automation Job Submission", desc: "Submit URL and automation goal, create automation jobs dynamically" }
      ]
    },
    {
      title: "Real-Time Monitoring",
      icon: <Activity size={20} />,
      features: [
        { name: "Real-Time Automation Monitoring", desc: "Live automation logs using WebSocket, realtime status updates during Playwright execution" }
      ]
    },
    {
      title: "Playwright Engine",
      icon:<Drama size={20}/>,
      features: [
        { name: "Playwright Browser Automation", desc: "Launch headless browser, navigate websites, perform real browser actions, extract data, capture screenshots" }
      ]
    },
    {
      title: "Lifecycle Tracking",
      icon: <GitBranch size={20} />,
      features: [
        { name: "Job Lifecycle Management", desc: "Track job states: queued → running → completed → failed" }
      ]
    },
    {
      title: "Data Persistence",
      icon: <Database size={20} />,
      features: [
        { name: "PostgreSQL Persistence", desc: "Store jobs, logs/events, extracted results, errors and screenshot paths" }
      ]
    },
    {
      title: "Visual Timeline",
      icon: <Timeline size={20} />,
      features: [
        { name: "Live Event Timeline UI", desc: "Display realtime automation events, show execution flow step-by-step" }
      ]
    },
    {
      title: "Media Viewer",
      icon: <Image size={20} />,
      features: [
        { name: "Screenshot & Result Viewer", desc: "Display captured screenshots, render structured extracted data" }
      ]
    },
    {
      title: "Error Handling",
      icon: <AlertTriangle size={20} />,
      features: [
        { name: "Failure Handling & Observability", desc: "Show exact failure step, display detailed error messages, persist execution logs for debugging" }
      ]
    },
    {
      title: "Concurrency",
      icon: <Layers size={20} />,
      features: [
        { name: "Concurrent Job Execution", desc: "Support multiple simultaneous jobs, queue-based execution with concurrency limits" }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" ref={sectionRef} className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Major Features
        </h2>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Everything you need for production-grade browser automation
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {featureCategories.map((category, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            transition={{ duration: 0.4 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:translate-y-[-2px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-white tracking-tight">
                  {category.title}
                </h3>
              </div>
              
              {category.features.map((feature, fIdx) => (
                <div key={fIdx} className="space-y-1">
                  <p className="text-sm font-medium text-gray-200">
                    {feature.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

    
    </section>
  );
}