# POST creates PR with auto ID, GET fetches by ID with 404 handling
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI()

pr_count =1

class PRCreate(BaseModel):
    amount: float
    category: str
    supplier: str

pr_store = {}

@app.post("/purchase-requests")
def create_pr(pr: PRCreate):
    global pr_count
    pr_id = f"PR-{pr_count:03d}"   # PR-001, PR-002...
    pr_store[pr_id] = {
        "pr_id": pr_id,
        "amount": pr.amount,
        "category": pr.category,
        "supplier": pr.supplier,
        "status": "Draft"
    }
    pr_count += 1
    return pr_store[pr_id]

@app.get("/purchase-requests/{pr_id}")
def pr_status(pr_id: str):
    if pr_id not in pr_store:
        raise HTTPException(status_code= 404, detail="PR not found")
    
    return pr_store[pr_id]

@app.get("/pico/ask")
async def ask_pico():
    await asyncio.sleep(0)
    return {"pico": "ready", "model": "llama-3.3-70b-versatile"}

@app.get("/pico/status")
async def pico_status():
    return {"pico": "ready", "model": "llama-3.3-70b-versatile"}
