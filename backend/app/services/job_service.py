from sqlalchemy.orm import Session
from ..db.models import Job, JobLog
from ..schemas.job_schema import JobCreate
from ..queue.worker import job_queue
import uuid

class JobService:
    @staticmethod
    async def create_job(db: Session, job_in: JobCreate):
        db_job = Job(
            url=job_in.url,
            goal=job_in.goal,
            status="queued"
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)

       
        await job_queue.put({
            "id": str(db_job.id),
            "url": db_job.url,
            "goal": db_job.goal
        })

        return db_job

    @staticmethod
    def get_job(db: Session, job_id: str):
        return db.query(Job).filter(Job.id == job_id).first()

    @staticmethod
    def get_job_logs(db: Session, job_id: str):
        return db.query(JobLog).filter(JobLog.job_id == job_id).order_by(JobLog.created_at.asc()).all()
