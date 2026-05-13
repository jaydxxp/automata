CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    goal TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'queued',
    result JSONB,
    error TEXT,
    screenshot_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE job_logs (
    id SERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_logs_job_id ON job_logs(job_id);
