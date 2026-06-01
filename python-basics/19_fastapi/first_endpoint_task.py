# FastAPI app with GET /status and GET /suppliers/{supplier_id} endpoints
from fastapi import FastAPI

app = FastAPI()

@app.get('/status')
def status():
    return{"status": "ProcIQ running"}

@app.get('/suppliers/{supplier_id}')
def supplier_status(supplier_id: str):
    return{"supplier_id": "SUP-001", "name": "Cisco"}