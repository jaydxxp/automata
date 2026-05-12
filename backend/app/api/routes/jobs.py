from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from ...db.session import get_db
from ...schemas.job_schema import JobCreate, JobResponse, JobLogResponse
from ...services.job_service import JobService
from ...websocket.manager import manager

router = APIRouter()

@router.post("/", response_model=JobResponse)
async def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    return await JobService.create_job(db, job_in)

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = JobService.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/logs", response_model=List[JobLogResponse])
def get_job_logs(job_id: str, db: Session = Depends(get_db)):
    return JobService.get_job_logs(db, job_id)

@router.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await manager.connect(job_id, websocket)
    try:
        while True:
          
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(job_id, websocket)
