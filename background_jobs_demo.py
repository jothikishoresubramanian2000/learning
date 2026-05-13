# Topic 13: Background job processing - FastAPI demo with visible job progress.

# Predefined library: time simulates slow processing stages.
import time

# Predefined library: uuid creates unique job IDs.
import uuid

# Typing helpers: Dict and Optional describe expected variable types.
from typing import Dict, Optional

# FastAPI tools: BackgroundTasks runs work after response; FastAPI creates API app.
from fastapi import BackgroundTasks, FastAPI

# Pydantic class: BaseModel validates/serializes API response models.
from pydantic import BaseModel


app = FastAPI()
# Topic 13: Background job processing - slow each stage so progress is visible.
STAGE_DELAY_SECONDS = 10


# Topic 3: Pydantic validation - response shape for job status APIs.
class JobStatus(BaseModel):
    job_id: str
    file_name: str
    status: str
    progress: int
    result: Optional[dict] = None
    error: Optional[str] = None


# Topic 13: Background job processing - in-memory job status store for demo only.
jobs: Dict[str, JobStatus] = {}


# Topic 13: Background job processing - update progress while the job runs.
def update_job(job_id: str, status: str, progress: int):
    job = jobs[job_id]
    job.status = status
    job.progress = progress


# Topic 13: Background job processing - simulate ProcIQ quote PDF processing.
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


# Topic 13: Background job processing - accept upload and start background work.
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


# Topic 13: Background job processing - frontend polls this endpoint for status.
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


# Topic 15: API design - list all demo jobs.
@app.get("/jobs", response_model=list[JobStatus])
def list_jobs():
    return list(jobs.values())
