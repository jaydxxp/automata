from ..websocket.manager import manager
from ..db.session import SessionLocal
from ..db.models import JobLog
import logging

logger = logging.getLogger(__name__)

class EventEmitter:
    def __init__(self, job_id: str):
        self.job_id = job_id

    async def emit(self, event_type: str, message: str, metadata: dict = None):

        logger.info(f"[{self.job_id}] {event_type}: {message}")


        payload = {
            "type": event_type,
            "message": message,
            "metadata": metadata or {}
        }
        await manager.broadcast_to_job(self.job_id, payload)

  
        db = SessionLocal()
        try:
            log_entry = JobLog(
                job_id=self.job_id,
                event_type=event_type,
                message=message,
                metadata_json=metadata
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to persist log for job {self.job_id}: {str(e)}")
        finally:
            db.close()
