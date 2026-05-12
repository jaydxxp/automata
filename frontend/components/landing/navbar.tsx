"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-7 w-7 bg-white/10 border-white rounded-lg flex items-center justify-center">
            <div className="h-3 w-3 bg-white rounded-sm" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Automata</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link>
          <Link href="/#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <button className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
