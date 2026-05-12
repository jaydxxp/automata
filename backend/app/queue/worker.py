import asyncio
import logging
from ..automation.runner import run_job_automation

logger = logging.getLogger(__name__)


MAX_CONCURRENT_JOBS = 2


job_queue = asyncio.Queue()
semaphore = asyncio.Semaphore(MAX_CONCURRENT_JOBS)

async def worker():
    logger.info("Worker started, waiting for jobs...")
    while True:
        
        job_data = await job_queue.get()
        job_id = job_data["id"]
        url = job_data["url"]
        goal = job_data["goal"]

        logger.info(f"Worker picked up job {job_id}. Waiting for semaphore...")

    
        async def process_job():
            async with semaphore:
                logger.info(f"Worker starting execution of job {job_id}")
                await run_job_automation(job_id, url, goal)
                logger.info(f"Worker finished execution of job {job_id}")

        asyncio.create_task(process_job())
        
      
        job_queue.task_done()

def start_worker():
    loop = asyncio.get_event_loop()
    loop.create_task(worker())
