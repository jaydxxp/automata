# System Architecture & Reasoning

Automata is a full-stack, distributed web-scraping and automation system. It is designed to interpret natural language goals, navigate websites, intelligently extract DOM structures, and return deterministic JSON structures to the end-user while providing live visibility into the process.

## Core Architecture

The architecture consists of three primary domains:

1. **Frontend**: Next.js 14 App Router, styled with Tailwind CSS and animated with Framer Motion.
2. **Backend Engine**: FastAPI (Python), utilizing Asyncio for high concurrency.
3. **Execution Layer**: Playwright for headless browser automation.
4. **Data Persistence**: PostgreSQL via SQLAlchemy ORM.

## Key Design Decisions

### 1. Goal-Oriented Heuristic Extraction Engine
The hardest problem in scalable web automation is parsing heavily obfuscated or continually changing DOM trees. Instead of relying on hardcoded CSS selectors for specific websites (`.product_pod` or `.athing`), the extraction engine is **domain-agnostic**.

- **Goal Route Mapping**: When the user provides a natural language goal (e.g., "extract products"), the system maps it to a predefined generic `ExtractionStrategy` using a scoring algorithm.
- **Semantic Container Scoring**: The engine does not look for CSS classes. Instead, it analyzes the DOM tree to find generic "containers" (e.g., lists, grids, repeated div structures). It scores these containers based on text density, repetition, and semantic meaning, allowing it to adapt to almost any e-commerce site or news aggregator without custom code.
- **Safe Extraction**: Data is cleaned using robust regex filters (e.g., extracting precise float prices from messy strings) to ensure deterministic, structured output.

### 2. Asyncio Concurrency & Queue System
Scraping is an inherently I/O-bound, memory-heavy operation. We handle scale using standard Asyncio primitives without resorting to heavyweight brokers like Celery or Redis for the current scope.

- **`asyncio.Queue`**: All incoming requests immediately return an HTTP 200 containing the Job ID, while the job itself is pushed to a background worker queue.
- **`asyncio.Semaphore`**: To prevent Playwright from crashing the host machine by opening 100 simultaneous browsers, a strict concurrency limit is applied via a Semaphore (`MAX_CONCURRENT_JOBS = 2`). Jobs wait in the queue safely until a slot is freed.
- **Isolation**: Each job spins up a fully isolated Chromium instance (`async_playwright`). They share zero context, preventing cookie contamination or cache issues.

### 3. Real-Time Observability (WebSockets)
A scraper is essentially a black box. Users want to know what it is doing.

- **Pub/Sub WebSockets**: Each job gets its own isolated event emitter (`EventEmitter`). The frontend connects via `ws://.../jobs/ws/{job_id}`.
- As Playwright navigates the DOM, it emits lifecycle events (`navigating`, `analyzing_dom`, `screenshot.captured`). 
- The FastAPI `ConnectionManager` broadcasts these events to the specific frontend client watching that job. 

### 4. UI/UX: The Command Center
The frontend dashboard is designed to look like a premium developer tool. 

- **Multi-Job Tracking**: The frontend tracks an array of jobs in memory. Users can queue 5 jobs simultaneously and freely click between them. 
- **Dynamic Layouts**: The `Execution Logs` and `Screenshot` panels are synchronized dynamically using CSS Grid stretching (`items-stretch`) to perfectly match heights across all breakpoints (`h-[400px]` to `h-[600px]`), ensuring internal scrollability without page layout thrashing.
- **Raw vs Formatted**: Because the heuristic engine might encounter unknown sites, users can seamlessly toggle between the structured UI format and a raw JSON viewer.
