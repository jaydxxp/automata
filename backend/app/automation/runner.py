from .event_emitter import EventEmitter
from .playwright_service import PlaywrightService
from ..db.session import SessionLocal
from ..db.models import Job
import logging

logger = logging.getLogger(__name__)

async def run_job_automation(job_id: str, url: str, goal: str):
    emitter = EventEmitter(job_id)
    service = PlaywrightService(job_id, emitter)
    
    db = SessionLocal()
    try:
       
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "starting"
            db.commit()

        await emitter.emit("job.starting", f"Starting automation job for goal: {goal}")
        
       
        job.status = "running"
        db.commit()

        result, screenshot_path = await service.run_workflow(url, goal)
        

        job.status = "completed"
        job.result = result
        job.screenshot_url = screenshot_path
        db.commit()

        await emitter.emit("job.completed", "Automation job completed successfully", {"result": result})

    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}")
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = "failed"
            job.error = str(e)
            db.commit()
        await emitter.emit("job.failed", f"Job failed: {str(e)}")
    finally:
        db.close()
