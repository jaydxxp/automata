"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-semibold font-hanken-grotesk tracking-tight mb-6 leading-[1.2] md:leading-[1.1]">
            Make your 
            <br />
            <span className="">
              browser agents{" "}
              <span className="px-1 py-0.5 md:px-1 md:py-0 bg-white text-black rounded-xl md:rounded-2xl inline-block">
  observable.
</span>
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mb-8 leading-relaxed">
            Stream realtime browser events, screenshots, execution logs, failures, and structured results while your automation runs live with full visibility into every browser action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/jobs">
              <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold text-base hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                Get Started
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
