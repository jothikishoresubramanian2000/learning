# Topics 2 and 3: FastAPI + Pydantic basics for ProcIQ purchase request APIs.

# Framework class: FastAPI creates the web API app.
from fastapi import FastAPI

# Pydantic classes: BaseModel defines schemas; Field adds validation rules.
from pydantic import BaseModel, Field

app = FastAPI()


# Pydantic request model: validates data coming into POST /purchase-requests.
class PurchaseRequestCreate(BaseModel):
    title: str
    department: str
    item: str
    quantity: int = Field(gt=0)
    amount: float = Field(gt=0)


# Pydantic response model: controls data sent back to the frontend.
class PurchaseRequestResponse(BaseModel):
    pr_id: int
    title: str
    department: str
    item: str
    quantity: int
    amount: float
    status: str


# API endpoint: simple health check to confirm the service is running.
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "prociq-learning-api"
    }


# API endpoint: get one fake purchase request by path parameter pr_id.
@app.get("/purchase-requests/{pr_id}")
def get_purchase_request(pr_id: int):
    return {
        "pr_id": pr_id,
        "title": "Cisco Router Purchase",
        "department": "IT",
        "amount": 240000,
        "status": "Draft"
    }


# API endpoint: create a fake PR using request and response validation.
@app.post("/purchase-requests", response_model=PurchaseRequestResponse)
def create_purchase_request(pr: PurchaseRequestCreate):
    return {
        "pr_id": 101,
        "title": pr.title,
        "department": pr.department,
        "item": pr.item,
        "quantity": pr.quantity,
        "amount": pr.amount,
        "status": "Draft",
        "debug_notes": "Internal note should not go to frontend"
    }
