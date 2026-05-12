"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";

interface LogEntry {
  ts: string;
  tag: string;
  type: "gray" | "green" | "blue" | "amber" | "purple" | "teal" | "red";
  msg: string;
  plain: string;
}

const LOG_SEQUENCES: LogEntry[][] = [
  [
    { ts: "09:41:02", tag: "browser.launching",    type: "gray",   plain: "Launching Chromium browser…",                          msg: "Launching Chromium browser…" },
    { ts: "09:41:02", tag: "browser.launched",     type: "green",  plain: "Browser launched successfully",                        msg: "Browser launched <em>successfully</em>" },
    { ts: "09:41:02", tag: "page.navigating",      type: "blue",   plain: "Navigating to shop.example.com/products",              msg: "Navigating to <em>shop.example.com/products</em>" },
    { ts: "09:41:03", tag: "page.loaded",          type: "teal",   plain: "Page loaded successfully",                             msg: "Page loaded <em>successfully</em>" },
    { ts: "09:41:03", tag: "strategy.detected",    type: "purple", plain: "Routed goal to semantic type: product",                msg: "Routed goal to semantic type: <em>product</em>" },
    { ts: "09:41:03", tag: "extraction.started",   type: "amber",  plain: "Starting semantic extraction — type=product",          msg: "Starting semantic extraction — <em>type=product</em>" },
    { ts: "09:41:03", tag: "container.scored",     type: "gray",   plain: "Top candidates: [class*='product']:29.4 · [class*='card']:26.1", msg: "Top candidates: <em>[class*='product']:29.4</em> · <em>[class*='card']:26.1</em>" },
    { ts: "09:41:03", tag: "container.detected",   type: "purple", plain: "Selected [class*='product'] — count=24, score=29.4",  msg: "Selected <em>[class*='product']</em> — count=24, score=29.4" },
    { ts: "09:41:04", tag: "extraction.progress",  type: "blue",   plain: "Item 1 — Wireless Noise-Cancelling Headphones XR-900…",msg: "Item 1 — <em>Wireless Noise-Cancelling Headphones XR-900…</em>" },
    { ts: "09:41:04", tag: "extraction.progress",  type: "blue",   plain: "Item 2 — Mechanical Keyboard Pro 75% TKL…",            msg: "Item 2 — <em>Mechanical Keyboard Pro 75% TKL…</em>" },
    { ts: "09:41:04", tag: "extraction.progress",  type: "blue",   plain: "Item 3 — 4K USB-C Monitor 27in IPS Panel…",            msg: "Item 3 — <em>4K USB-C Monitor 27in IPS Panel…</em>" },
    { ts: "09:41:05", tag: "extraction.completed", type: "green",  plain: "Extracted 24 items for type: product",                 msg: "Extracted <em>24 items</em> for type: product" },
    { ts: "09:41:05", tag: "screenshot.capturing", type: "gray",   plain: "Capturing full-page screenshot",                       msg: "Capturing full-page screenshot" },
    { ts: "09:41:05", tag: "screenshot.captured",  type: "teal",   plain: "Screenshot captured successfully",                     msg: "Screenshot captured <em>successfully</em>" },
    { ts: "09:41:05", tag: "browser.closing",      type: "gray",   plain: "Closing browser",                                      msg: "Closing browser" },
    { ts: "09:41:06", tag: "browser.closed",       type: "amber",  plain: "Browser closed safely",                                msg: "Browser closed <em>safely</em>" },
    { ts: "09:41:06", tag: "job.completed",        type: "green",  plain: "Automation job completed successfully",                 msg: "Automation job completed <em>successfully</em>" },
  ],
  [
    { ts: "11:05:14", tag: "browser.launching",    type: "gray",   plain: "Launching Chromium browser…",                          msg: "Launching Chromium browser…" },
    { ts: "11:05:14", tag: "browser.launched",     type: "green",  plain: "Browser launched successfully",                        msg: "Browser launched <em>successfully</em>" },
    { ts: "11:05:15", tag: "page.navigating",      type: "blue",   plain: "Navigating to news.ycombinator.com",                   msg: "Navigating to <em>news.ycombinator.com</em>" },
    { ts: "11:05:15", tag: "page.loaded",          type: "teal",   plain: "Page loaded successfully",                             msg: "Page loaded <em>successfully</em>" },
    { ts: "11:05:15", tag: "strategy.detected",    type: "purple", plain: "Routed goal to semantic type: article",                msg: "Routed goal to semantic type: <em>article</em>" },
    { ts: "11:05:15", tag: "extraction.started",   type: "amber",  plain: "Starting semantic extraction — type=article",          msg: "Starting semantic extraction — <em>type=article</em>" },
    { ts: "11:05:16", tag: "container.scored",     type: "gray",   plain: "Top candidates: .athing:38.2 · .itemlist:31.0",        msg: "Top candidates: <em>.athing:38.2</em> · <em>.itemlist:31.0</em>" },
    { ts: "11:05:16", tag: "container.detected",   type: "purple", plain: "Selected .athing — count=30, score=38.2",              msg: "Selected <em>.athing</em> — count=30, score=38.2" },
    { ts: "11:05:16", tag: "extraction.progress",  type: "blue",   plain: "Item 1 — Show HN: I built a local-first AI code editor…", msg: "Item 1 — <em>Show HN: I built a local-first AI code editor…</em>" },
    { ts: "11:05:16", tag: "extraction.progress",  type: "blue",   plain: "Item 2 — Ask HN: What's your home lab setup in 2025?…",   msg: "Item 2 — <em>Ask HN: What's your home lab setup in 2025?…</em>" },
    { ts: "11:05:17", tag: "extraction.progress",  type: "blue",   plain: "Item 3 — Postgres just crossed 1M stars on GitHub…",       msg: "Item 3 — <em>Postgres just crossed 1M stars on GitHub…</em>" },
    { ts: "11:05:17", tag: "extraction.completed", type: "green",  plain: "Extracted 30 items for type: article",                 msg: "Extracted <em>30 items</em> for type: article" },
    { ts: "11:05:17", tag: "screenshot.capturing", type: "gray",   plain: "Capturing viewport screenshot",                        msg: "Capturing viewport screenshot" },
    { ts: "11:05:18", tag: "screenshot.captured",  type: "teal",   plain: "Screenshot captured successfully",                     msg: "Screenshot captured <em>successfully</em>" },
    { ts: "11:05:18", tag: "browser.closing",      type: "gray",   plain: "Closing browser",                                      msg: "Closing browser" },
    { ts: "11:05:18", tag: "browser.closed",       type: "amber",  plain: "Browser closed safely",                                msg: "Browser closed <em>safely</em>" },
    { ts: "11:05:19", tag: "job.completed",        type: "green",  plain: "Automation job completed successfully",                 msg: "Automation job completed <em>successfully</em>" },
  ],
  [
    { ts: "14:22:38", tag: "browser.launching",    type: "gray",   plain: "Launching Chromium browser…",                          msg: "Launching Chromium browser…" },
    { ts: "14:22:38", tag: "browser.launched",     type: "green",  plain: "Browser launched successfully",                        msg: "Browser launched <em>successfully</em>" },
    { ts: "14:22:39", tag: "page.navigating",      type: "blue",   plain: "Navigating to quotes.toscrape.com",                    msg: "Navigating to <em>quotes.toscrape.com</em>" },
    { ts: "14:22:39", tag: "page.loaded",          type: "teal",   plain: "Page loaded successfully",                             msg: "Page loaded <em>successfully</em>" },
    { ts: "14:22:39", tag: "strategy.detected",    type: "purple", plain: "Routed goal to semantic type: quote",                  msg: "Routed goal to semantic type: <em>quote</em>" },
    { ts: "14:22:39", tag: "extraction.started",   type: "amber",  plain: "Starting semantic extraction — type=quote",            msg: "Starting semantic extraction — <em>type=quote</em>" },
    { ts: "14:22:40", tag: "container.scored",     type: "gray",   plain: "Top candidates: [class*='quote']:31.0 · [class*='item']:28.1", msg: "Top candidates: <em>[class*='quote']:31.0</em> · <em>[class*='item']:28.1</em>" },
    { ts: "14:22:40", tag: "container.detected",   type: "purple", plain: "Selected [class*='quote'] — count=10, score=30.96",   msg: "Selected <em>[class*='quote']</em> — count=10, score=30.96" },
    { ts: "14:22:40", tag: "extraction.progress",  type: "blue",   plain: "Item 1 — The world as we have created it is a process of our thinking…", msg: "Item 1 — <em>The world as we have created it is a process of our thinking…</em>" },
    { ts: "14:22:40", tag: "extraction.progress",  type: "blue",   plain: "Item 2 — It is our choices, Harry, that show what we truly are…", msg: "Item 2 — <em>It is our choices, Harry, that show what we truly are…</em>" },
    { ts: "14:22:41", tag: "extraction.progress",  type: "blue",   plain: "Item 3 — There are only two ways to live your life…",  msg: "Item 3 — <em>There are only two ways to live your life…</em>" },
    { ts: "14:22:41", tag: "extraction.completed", type: "green",  plain: "Extracted 10 items for type: quote",                   msg: "Extracted <em>10 items</em> for type: quote" },
    { ts: "14:22:41", tag: "screenshot.capturing", type: "gray",   plain: "Capturing screenshot",                                 msg: "Capturing screenshot" },
    { ts: "14:22:42", tag: "screenshot.captured",  type: "teal",   plain: "Screenshot captured successfully",                     msg: "Screenshot captured <em>successfully</em>" },
    { ts: "14:22:42", tag: "browser.closing",      type: "gray",   plain: "Closing browser",                                      msg: "Closing browser" },
    { ts: "14:22:42", tag: "browser.closed",       type: "amber",  plain: "Browser closed safely",                                msg: "Browser closed <em>safely</em>" },
    { ts: "14:22:43", tag: "job.completed",        type: "green",  plain: "Automation job completed successfully",                 msg: "Automation job completed <em>successfully</em>" },
  ],
];

const TAG_STYLES: Record<string, string> = {
  gray:   "text-zinc-500 bg-zinc-900 border border-zinc-800",
  green:  "text-emerald-400 bg-emerald-950 border border-emerald-900",
  blue:   "text-blue-400 bg-blue-950 border border-blue-900",
  amber:  "text-amber-400 bg-amber-950 border border-amber-900",
  purple: "text-violet-400 bg-violet-950 border border-violet-900",
  teal:   "text-teal-400 bg-teal-950 border border-teal-900",
  red:    "text-red-400 bg-red-950 border border-red-900",
};

const DELAYS = [140, 140, 120, 100, 90, 80, 70, 70, 65, 65, 65, 80, 70, 70, 70, 70, 80];

export default function ExecutionLogs() {
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [seqIndex, setSeqIndex] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const seq = LOG_SEQUENCES[seqIndex];
    if (logIndex < seq.length) {
      const delay = DELAYS[logIndex] ?? 70;
      timerRef.current = setTimeout(() => {
        setVisibleLogs((prev) => [...prev, seq[logIndex]]);
        setLogIndex((i) => i + 1);
      }, delay);
    } else {

      timerRef.current = setTimeout(() => {
        setIsRunning(false);
        setTimeout(() => {
          setVisibleLogs([]);
          setLogIndex(0);
          setSeqIndex((s) => (s + 1) % LOG_SEQUENCES.length);
          setIsRunning(true);
        }, 600);
      }, 2500);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [logIndex, seqIndex]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  const seq = LOG_SEQUENCES[seqIndex];
  const jobId = ["#4821", "#4822", "#4823"][seqIndex];

  return (
    <div
      className="rounded-2xl bg-black border border-white/10 overflow-hidden flex flex-col h-[400px]"
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
    >
 
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-zinc-400" />
          <span className="text-xs text-zinc-400 tracking-tight">Execution Logs</span>
          <span className="text-[10px] text-zinc-600 ml-1">{jobId}</span>
        </div>
        {isRunning && logIndex < seq.length && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-widest">Live</span>
          </div>
        )}
        {logIndex >= seq.length && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-zinc-600 rounded-full" />
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Done</span>
          </div>
        )}
      </div>

 
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-0.5"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
      >
        {visibleLogs.map((log, i) => (
          <div key={`${seqIndex}-${i}`} style={{ animation: "logfadein 0.2s ease forwards" }}>
            {i > 0 && i % 5 === 0 && (
              <div className="border-t border-white/[0.04] my-1.5" />
            )}
            <div className="flex items-baseline gap-2.5 text-[11.5px] leading-[1.75]">
              <span className="text-zinc-700 whitespace-nowrap text-[11px] min-w-[60px]">
                {log.ts}
              </span>
              <span
                className={`text-[10px] px-1.5 py-px rounded whitespace-nowrap font-medium leading-5 ${TAG_STYLES[log.type]}`}
              >
                {log.tag}
              </span>
              <span
                className="text-zinc-400 flex-1 min-w-0"
                dangerouslySetInnerHTML={{
                  __html: log.msg.replace(/<em>/g, '<em style="color:#d4d4d8;font-style:normal">'),
                }}
              />
            </div>
          </div>
        ))}


        {logIndex >= seq.length && visibleLogs.length > 0 && (
          <div className="flex items-center gap-2.5 mt-0.5">
            <span className="text-zinc-700 text-[11px] min-w-[60px]" />
            <span
              className="inline-block w-1.5 h-3 bg-zinc-600 rounded-sm"
              style={{ animation: "blink 1.1s step-end infinite" }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes logfadein {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}