"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Send, Terminal, Image as ImageIcon, Loader2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";

interface JobLog {
  type: string;
  message: string;
  metadata?: any;
  timestamp: string;
}

interface Job {
  id: string;
  url: string;
  goal: string;
  status: string;
  result?: any;
  screenshot_url?: string;
  error?: string;
}

export default function JobsPage() {
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const connectWebSocket = (jobId: string) => {
    if (socketRef.current) socketRef.current.close();

    const ws = new WebSocket(apiClient.getWebSocketUrl(jobId));
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, { ...data, timestamp: new Date().toLocaleTimeString() }]);
      
      if (data.type === "screenshot.captured") {
        setScreenshot(apiClient.getAssetUrl(data.metadata.path));
      }
      
      if (data.type === "job.completed") {
        fetchJobStatus(jobId);
      }
    };

    ws.onclose = () => console.log("WebSocket closed");
    socketRef.current = ws;
  };

  const fetchJobStatus = async (jobId: string) => {
    try {
      const data = await apiClient.getJobStatus(jobId);
      setActiveJob(data);
    } catch (err) {
      console.error("Failed to fetch job status", err);
    }
  };

  const startJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setScreenshot(null);
    setActiveJob(null);

    try {
      const data = await apiClient.startJob(url, goal);
      setActiveJob(data);
      connectWebSocket(data.id);
    } catch (err) {
      console.error("Failed to start job", err);
      setLogs((prev) => [...prev, { type: "error", message: "Failed to connect to backend", timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
         
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Play size={20} className="text-emerald-400" />
                New Job
              </h2>
              <form onSubmit={startJob} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Goal</label>
                  <textarea
                    required
                    placeholder="e.g. extract title and scroll"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all min-h-[100px]"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Run Workflow
                </button>
              </form>
            </div>

            {activeJob && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${
                      activeJob.status === 'completed' ? 'text-emerald-400' : 
                      activeJob.status === 'failed' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {activeJob.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID</span>
                    <span className="text-gray-300 font-mono text-[10px]">{activeJob.id}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

   
          <div className="lg:col-span-8 space-y-6">
            

            <div className="rounded-2xl bg-black border border-white/10 overflow-hidden flex flex-col h-[400px]">
              <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-gray-400" />
                  <span className="text-xs font-mono text-gray-400 tracking-tight">Execution Logs</span>
                </div>
                {activeJob?.status === 'running' && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-widest">Live</span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                {logs.length === 0 && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <Terminal size={32} className="mb-2 opacity-20" />
                    <p>Waiting for a job to start...</p>
                  </div>
                )}
                {logs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                    <span className={`shrink-0 ${
                      log.type.includes('failed') ? 'text-red-400' : 
                      log.type.includes('completed') ? 'text-emerald-400' : 
                      'text-blue-400'
                    }`}>
                      [{log.type}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </motion.div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 overflow-hidden">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  Result Data
                </h3>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {activeJob?.result ? (
                    <div className="space-y-4">
                      {activeJob.result.products && (
                        <div className="space-y-3">
                          {activeJob.result.products.map((product: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                              <div className="text-xs font-semibold text-white">{product.title || "No Title"}</div>
                              <div className="flex justify-between mt-2 text-[10px]">
                                <span className="text-emerald-400">{product.price || ""}</span>
                                <span className="text-gray-500">{product.availability || ""}</span>
                              </div>
                              {product.description && (
                                <div className="mt-2 text-[10px] text-gray-400 truncate">{product.description}</div>
                              )}
                              {product.url && (
                                <div className="mt-2 text-[9px] text-blue-400 truncate max-w-full italic">{product.url}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeJob.result.quotes && (
                        <div className="space-y-3">
                          {activeJob.result.quotes.map((quote: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                              <div className="text-xs text-gray-300 italic">"{quote.text || "No text"}"</div>
                              {quote.author && <div className="text-[10px] text-gray-500 mt-2">— {quote.author}</div>}
                            </div>
                          ))}
                        </div>
                      )}


                      {activeJob.result.headlines && (
                        <div className="space-y-2">
                          {activeJob.result.headlines.map((h: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                              <div className="text-xs font-medium text-white">{h.title}</div>
                              {h.link && h.link !== "N/A" && (
                                <div className="text-[9px] text-blue-400 mt-1 truncate max-w-full italic">{h.link}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeJob.result.links && (
                        <div className="space-y-2">
                          {activeJob.result.links.map((l: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                              <div className="text-xs font-medium text-white">{l.text || "Link"}</div>
                              {l.url && (
                                <div className="text-[9px] text-blue-400 mt-1 truncate max-w-full italic">{l.url}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeJob.result.discovered_items && (
                        <div className="space-y-2">
                          {activeJob.result.discovered_items.map((item: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                              {item.title && <div className="text-xs font-medium text-white">{item.title}</div>}
                              {item.snippet && <div className="text-[10px] text-gray-400 mt-1">{item.snippet}</div>}
                              {item.url && <div className="text-[9px] text-blue-400 mt-1 truncate max-w-full italic">{item.url}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {!activeJob.result.products && !activeJob.result.quotes && !activeJob.result.headlines && !activeJob.result.links && !activeJob.result.discovered_items && (
                        <pre className="bg-black/40 rounded-lg p-4 text-[11px] font-mono text-gray-300 overflow-x-auto">
                          {JSON.stringify(activeJob.result, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No results yet...</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-400" />
                  Latest Screenshot
                </h3>
                <div className="flex-1 min-h-[200px] bg-black/40 rounded-lg overflow-hidden border border-white/5 relative">
                  {screenshot ? (
                    <img 
                      src={screenshot} 
                      alt="Execution Screenshot" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                      <ImageIcon size={24} className="mb-2 opacity-20" />
                      <p className="text-xs">No screenshot captured</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
