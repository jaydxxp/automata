# Automata

Automata is a domain-agnostic, heuristic-driven web automation and extraction engine. It allows users to submit natural-language goals to scrape and analyze modern websites. The system automatically navigates, parses complex DOM trees without hardcoded selectors, and streams real-time execution logs and screenshots to a sleek Next.js dashboard.

---

## Features

- **Domain-Agnostic Extraction Engine**: Relies on semantic structure scoring instead of fragile CSS selectors.
- **Async Concurrency**: Process multiple extraction jobs simultaneously using built-in `asyncio.Semaphore` queuing.
- **Live Observability**: Real-time WebSocket streaming of logs and headless browser screenshots.
- **Premium Dashboard**: A sleek, responsive Next.js 14 frontend with concurrent job history, formatted datasets, and raw JSON viewers.

---

## Running Locally (Docker Compose)

The easiest and recommended way to run the entire stack is via Docker Compose.

### Prerequisites
- Docker and Docker Compose installed on your machine.

### Setup Instructions

1. **Clone the repository** (if you haven't already) and navigate to the project root:
   ```bash
   cd automata/backend
   ```

2. **Start the stack**:
   This will spin up the PostgreSQL database, the FastAPI Python backend, and the Next.js frontend all at once.
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Manual Setup (Without Docker)

If you wish to run the services individually on your host machine.

### 1. Database
Ensure you have a PostgreSQL server running locally. Create a database named `automata`.

### 2. Backend (FastAPI)
Navigate to the `backend` folder:
```bash
cd backend
```
Set up your virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Install Playwright browsers:
```bash
playwright install chromium
```
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/automata
```
Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend (Next.js)
Navigate to the `frontend` folder:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Start the frontend development server:
```bash
npm run dev
```

---

## Documentation

For a detailed technical breakdown of the architecture, design decisions, and heuristic engine philosophy, please refer to the `docs/` folder:

- [`docs/reasoning.md`](./docs/reasoning.md) - System architecture and design choices.
- [`docs/schema.sql`](./docs/schema.sql) - Database layout.
