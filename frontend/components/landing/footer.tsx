"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
        <p>You run browser workflows. We make every step observable.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="https://x.com/Jayydeeppp" className="hover:text-white transition-colors">Twitter</Link>
          <Link href="https://github.com/jaydxxp" className="hover:text-white transition-colors">GitHub</Link>
         
        </div>
      </div>
    </footer>
  );
}
