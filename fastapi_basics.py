from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class PurchaseRequestCreate(BaseModel):
    title: str
    department: str
    item: str
    quantity: int = Field(gt=0)
    amount: float = Field(gt=0)


class PurchaseRequestResponse(BaseModel):
    pr_id: int
    title: str
    department: str
    item: str
    quantity: int
    amount: float
    status: str


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "prociq-learning-api"
    }


@app.get("/purchase-requests/{pr_id}")
def get_purchase_request(pr_id: int):
    return {
        "pr_id": pr_id,
        "title": "Cisco Router Purchase",
        "department": "IT",
        "amount": 240000,
        "status": "Draft"
    }


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
