export const API_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL!,
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
};

export const apiClient = {
  startJob: async (url: string, goal: string) => {
    const res = await fetch(`${API_CONFIG.BACKEND_URL}/jobs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, goal }),
    });
    if (!res.ok) {
      throw new Error("Failed to start job");
    }
    return res.json();
  },

  getJobStatus: async (jobId: string) => {
    const res = await fetch(`${API_CONFIG.BACKEND_URL}/jobs/${jobId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch job status");
    }
    return res.json();
  },

  getWebSocketUrl: (jobId: string) => {
    return `${API_CONFIG.WEBSOCKET_URL}/jobs/ws/${jobId}`;
  },
  
  getAssetUrl: (path: string) => {
   
    if (path.startsWith('http')) return path;
    
 
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const cleanBase = API_CONFIG.BACKEND_URL.endsWith('/') 
      ? API_CONFIG.BACKEND_URL.slice(0, -1) 
      : API_CONFIG.BACKEND_URL;
      
    return `${cleanBase}/${cleanPath}`;
  }
};
