from fastapi import FastAPI, Request
import time

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming: {request.method} {request.url.path}")
    start = time.time()

    response = await call_next(request)  

    elapsed = time.time() - start
    print(f"Done: {response.status_code} in {elapsed:.2f}s")
    return response

@app.get("/purchase-requests/{pr_id}")
def get_pr(pr_id: str):
    return {"pr_id": pr_id, "status": "Draft"}

@app.get("/suppliers/{supplier_id}")
def get_supplier(supplier_id):
    return {'supplier_id': supplier_id}