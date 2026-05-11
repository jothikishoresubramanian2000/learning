import time
import uuid
from typing import Dict, Optional

from fastapi import BackgroundTasks, FastAPI
from pydantic import BaseModel


app = FastAPI()
STAGE_DELAY_SECONDS = 10


class JobStatus(BaseModel):
    job_id: str
    file_name: str
    status: str
    progress: int
    result: Optional[dict] = None
    error: Optional[str] = None


jobs: Dict[str, JobStatus] = {}


def update_job(job_id: str, status: str, progress: int):
    job = jobs[job_id]
    job.status = status
    job.progress = progress


def process_quote_pdf(job_id: str, file_name: str):
    try:
        update_job(job_id, "processing", 10)
        time.sleep(STAGE_DELAY_SECONDS)

        update_job(job_id, "extracting_text", 30)
        extracted_text = (
            "Supplier Cisco India quoted 3 Cisco routers. "
            "Unit price is 80000. Total amount is 240000."
        )
        time.sleep(STAGE_DELAY_SECONDS)

        update_job(job_id, "chunking_text", 50)
        chunks = [
            "Supplier Cisco India quoted 3 Cisco routers.",
            "Unit price is 80000. Total amount is 240000.",
        ]
        time.sleep(STAGE_DELAY_SECONDS)

        update_job(job_id, "creating_embeddings", 75)
        embeddings_created = len(chunks)
        time.sleep(STAGE_DELAY_SECONDS)

        update_job(job_id, "creating_draft_pr", 90)
        draft_pr = {
            "draft_pr_id": 101,
            "supplier": "Cisco India",
            "item": "Cisco Router",
            "quantity": 3,
            "amount": 240000,
            "status": "Draft",
        }
        time.sleep(STAGE_DELAY_SECONDS)

        job = jobs[job_id]
        job.status = "completed"
        job.progress = 100
        job.result = {
            "file_name": file_name,
            "extracted_text": extracted_text,
            "chunks_created": len(chunks),
            "embeddings_created": embeddings_created,
            "draft_pr": draft_pr,
        }

    except Exception as error:
        job = jobs[job_id]
        job.status = "failed"
        job.error = str(error)


@app.post("/documents/upload", response_model=JobStatus)
def upload_document(background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    file_name = "cisco_quote.pdf"

    jobs[job_id] = JobStatus(
        job_id=job_id,
        file_name=file_name,
        status="queued",
        progress=0,
    )

    background_tasks.add_task(process_quote_pdf, job_id, file_name)

    return jobs[job_id]


@app.get("/jobs/{job_id}", response_model=JobStatus)
def get_job_status(job_id: str):
    if job_id not in jobs:
        return JobStatus(
            job_id=job_id,
            file_name="unknown",
            status="not_found",
            progress=0,
        )

    return jobs[job_id]


@app.get("/jobs", response_model=list[JobStatus])
def list_jobs():
    return list(jobs.values())
