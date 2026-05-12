"use client";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { BugReports } from "@/components/landing/bug-reports";
import { MajorFeatures } from "@/components/landing/features";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent pointer-events-none" />

      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <BugReports />
        <MajorFeatures />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
