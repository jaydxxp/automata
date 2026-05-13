"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Send, Terminal, Image as ImageIcon, Loader2, Play, CheckCircle2, AlertCircle, X, Maximize2 } from "lucide-react";
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
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [logsByJob, setLogsByJob] = useState<Record<string, JobLog[]>>({});
  const [screenshotsByJob, setScreenshotsByJob] = useState<Record<string, string | null>>({});
  
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const socketRefs = useRef<Record<string, WebSocket>>({});
  const logEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true); 

  const activeJob = jobs.find(j => j.id === activeJobId) || null;
  const logs = activeJobId ? (logsByJob[activeJobId] || []) : [];
  const screenshot = activeJobId ? (screenshotsByJob[activeJobId] || null) : null;

  
  useEffect(() => {
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (activeJobId && logs.length > 0 && logEndRef.current) {
      const container = logEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [logs.length, activeJobId]); 

  const connectWebSocket = (jobId: string) => {
    if (socketRefs.current[jobId]) return;

    const ws = new WebSocket(apiClient.getWebSocketUrl(jobId));
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogsByJob(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), { ...data, timestamp: new Date().toLocaleTimeString() }]
      }));
      
      if (data.type === "job.starting") {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "running" } : j));
      }
      
      if (data.type === "screenshot.captured") {
        setScreenshotsByJob(prev => ({
          ...prev,
          [jobId]: apiClient.getAssetUrl(data.metadata.path)
        }));
      }
      
      if (data.type === "job.completed" || data.type === "job.failed") {
        fetchJobStatus(jobId);
      }
    };

    ws.onclose = () => {
      delete socketRefs.current[jobId];
    };
    socketRefs.current[jobId] = ws;
  };

  const fetchJobStatus = async (jobId: string) => {
    try {
      const data = await apiClient.getJobStatus(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? data : j));
    } catch (err) {
      console.error("Failed to fetch job status", err);
    }
  };

  const startJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiClient.startJob(url, goal);
      setJobs(prev => [data, ...prev]);
      setActiveJobId(data.id);
      setLogsByJob(prev => ({ ...prev, [data.id]: [] }));
      setScreenshotsByJob(prev => ({ ...prev, [data.id]: null }));
      connectWebSocket(data.id);
      
      setUrl("");
      setGoal("");
    } catch (err) {
      console.error("Failed to start job", err);
      if (activeJobId) {
        setLogsByJob(prev => ({
          ...prev,
          [activeJobId]: [...(prev[activeJobId] || []), { type: "error", message: "Failed to connect to backend", timestamp: new Date().toLocaleTimeString() }]
        }));
      }
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
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Queue Workflow
                </button>
              </form>
            </div>

            {jobs.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Job Queue & History</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setActiveJobId(job.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        activeJobId === job.id 
                          ? 'bg-white/10 border-white/30 shadow-lg' 
                          : 'bg-black/50 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[140px]">{job.id.split('-')[0]}</span>
                        <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${
                          job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          job.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                          job.status === 'running' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-200 truncate">{job.url}</div>
                      <div className="text-xs text-gray-500 truncate mt-1">{job.goal}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl bg-black border border-white/10 overflow-hidden flex flex-col h-[400px]">
              <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-gray-400" />
                  <span className="text-xs font-mono text-gray-400 tracking-tight">
                    Execution Logs {activeJob ? `[${activeJob.id.split('-')[0]}]` : ''}
                  </span>
                </div>
                {activeJob?.status === 'running' && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-widest">Live</span>
                  </div>
                )}
                {activeJob?.status === 'queued' && (
                  <div className="flex items-center gap-2">
                    <Loader2 size={12} className="text-gray-400 animate-spin" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Queued</span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                {(!activeJob || logs.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    {activeJob?.status === 'queued' ? (
                      <>
                        <Loader2 size={32} className="mb-4 opacity-20 animate-spin" />
                        <p>Waiting for an available execution slot...</p>
                        <p className="text-[10px] mt-2 opacity-50">Max concurrency is 2 jobs.</p>
                      </>
                    ) : (
                      <>
                        <Terminal size={32} className="mb-2 opacity-20" />
                        <p>Select a job or start a new one to view logs.</p>
                      </>
                    )}
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
                    <span className="text-gray-300 break-words flex-1 min-w-0">{log.message}</span>
                  </motion.div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col h-[400px] md:h-[500px] lg:h-[600px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Result Data
                  </h3>
                  <div className="flex bg-black/50 p-1 rounded-lg">
                    <button 
                      onClick={() => setViewMode("formatted")} 
                      className={`text-[10px] px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === "formatted" ? "bg-white/20 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                      Formatted
                    </button>
                    <button 
                      onClick={() => setViewMode("raw")} 
                      className={`text-[10px] px-3 py-1 rounded-md transition-all cursor-pointer ${viewMode === "raw" ? "bg-white/20 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                      Raw JSON
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {activeJob?.result ? (
                    <div className="space-y-4">
                      {viewMode === "raw" ? (
                        <pre className="bg-black/40 rounded-lg p-4 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(activeJob.result, null, 2)}
                        </pre>
                      ) : (
                        <>
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
                            <pre className="bg-black/40 rounded-lg p-4 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                              {JSON.stringify(activeJob.result, null, 2)}
                            </pre>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No results yet...</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col h-[400px] md:h-[500px] lg:h-[600px]">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-400" />
                  Latest Screenshot
                </h3>
                <div 
                  className="flex-1 min-h-[200px] bg-black/40 rounded-lg overflow-hidden border border-white/5 relative group cursor-pointer"
                  onClick={() => screenshot && setIsModalOpen(true)}
                >
                  {screenshot ? (
                    <>
                      <img 
                        src={screenshot} 
                        alt="Execution Screenshot" 
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white drop-shadow-lg" size={36} />
                      </div>
                    </>
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

      <AnimatePresence>
        {isModalOpen && screenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12"
            onClick={() => setIsModalOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all cursor-pointer z-[101]"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={screenshot} 
              alt="Full Screenshot" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10 cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
