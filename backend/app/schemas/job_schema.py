from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class JobCreate(BaseModel):
    url: str
    goal: str

class JobResponse(BaseModel):
    id: UUID
    url: str
    goal: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None
    screenshot_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobLogResponse(BaseModel):
    id: int
    job_id: UUID
    event_type: str
    message: str
    metadata_json: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True
