# GET /purchase-requests/{pr_id} looks up PR from in-memory dict store
from fastapi import FastAPI

app = FastAPI()

pr_store = {
    "PR-101": {"pr_id": "PR-101", "amount": 50000, "status": "In Approval"},
    "PR-102": {"pr_id": "PR-102", "amount": 120000, "status": "Approved"},
    "PR-103": {"pr_id": "PR-103", "amount": 8000, "status": "Draft"},
}

@app.get('/purchase-requests/{pr_id}')
def purchase_request(pr_id: str):
    return pr_store[pr_id]