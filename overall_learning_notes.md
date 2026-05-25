# ProcIQ Overall Learning Notes

These notes are for learning the ProcIQ project step by step from beginner level.

ProcIQ is an intake-to-PO procurement platform. It handles purchase requests, approvals, supplier checks, PO creation, ERP sync, audit logs, and AI assistance through Pico.

## Topic List

1. Async programming with `async` / `await`
2. FastAPI basics
3. Request and response validation with Pydantic
4. File handling: PDF, JSON, and text
5. Database basics: SQL and ORM
6. Embeddings concept
7. Text chunking strategies
8. Vector similarity search
9. Vector databases
10. LLM fundamentals
11. Prompt engineering
12. RAG architecture
13. Background job processing
14. Caching with Redis
15. API design and rate limiting
16. Streaming responses
17. Multi-tenant data filtering
18. Logging and monitoring
19. Performance optimization
20. Deployment with Docker and CI/CD

## Additional Topics To Learn

These are useful before or during development, especially for AI/backend work.

21. Python fundamentals refresh
22. Git and GitHub workflow
23. Python project structure
24. Environment variables and secrets
25. Testing basics with pytest
26. FastAPI dependency injection
27. Authentication basics: JWT, session, API key
28. Authorization and RBAC
29. Database migrations with Alembic
30. LangChain basics
31. LangGraph basics
32. MCP fundamentals
33. LLM tool calling / function calling
34. Structured LLM outputs with JSON schema
35. RAG evaluation
36. Hallucination detection
37. Guardrails and AI safety
38. Prompt versioning
39. Citation and source grounding
40. Re-ranking search results
41. Hybrid search: keyword + vector
42. Document extraction: OCR, scanned PDFs, tables
43. Error handling, timeouts, and retries
44. Production folder structure

---

# Topic 1: Async Programming

## 1. What Problem Does Async Solve?

Async programming helps when a program spends time waiting.

In normal synchronous code, one task must finish before the next task starts.

Example:

```text
Check budget for Finance   -> wait 2 seconds
Check budget for Marketing -> wait 2 seconds
Check budget for IT        -> wait 2 seconds
```

Total time: around 6 seconds.

In async code, waiting tasks can run together.

Example:

```text
Start budget check for Finance
Start budget check for Marketing
Start budget check for IT
All wait at the same time
```

Total time: around 2 seconds.

## 2. Important Async Keywords

### async def

Used to create an async function.

```python
async def check_budget(department):
    ...
```

Calling an async function does not immediately run it. It creates a coroutine.

### await

Used inside an async function to wait for another async operation.

```python
await check_budget("Finance")
```

While this function is waiting, Python can run other waiting tasks.

### asyncio.run()

Starts the async program.

```python
asyncio.run(main())
```

Usually, a Python async program has one main async function.

### asyncio.gather()

Runs multiple async tasks concurrently.

```python
await asyncio.gather(
    process_pr(1, "Finance"),
    process_pr(2, "Marketing"),
    process_pr(3, "IT"),
)
```

## 3. Correct Sleep In Async Code

Wrong:

```python
await time.sleep(2)
```

`time.sleep()` blocks the whole program.

Correct:

```python
await asyncio.sleep(2)
```

`asyncio.sleep()` pauses only the current async task and allows other async tasks to run.

## 4. Common Beginner Mistake

Wrong:

```python
process_pr(1, "Finance")
```

This creates a coroutine but does not run it.

Correct:

```python
await process_pr(1, "Finance")
```

Or, to run many tasks together:

```python
await asyncio.gather(
    process_pr(1, "Finance"),
    process_pr(2, "Marketing"),
    process_pr(3, "IT"),
)
```

## 5. When To Use Async

Use async when the program waits for external work.

Good use cases:

- API calls
- Database calls
- ERP calls
- File uploads
- PDF processing requests
- AI or LLM calls
- Sending notifications
- Waiting for external service responses
- Streaming responses

Async is not mainly for heavy CPU work.

Not ideal examples:

- Large mathematical calculations
- Heavy image processing
- Machine learning model training
- Compressing very large files

For heavy CPU work, use background workers, multiprocessing, or separate services.

## 6. Real ProcIQ Example

A requester creates this PR:

```text
PR-101
Department: IT
Item: Cisco Router
Quantity: 3
Supplier: Cisco India
Cost Centre: IT-OPS
Amount: 240000
```

When the user clicks Submit PR, ProcIQ may need to check:

```text
1. Is budget available?
2. Is supplier active?
3. Is this a duplicate PR?
4. Is price within tolerance?
5. Is catalogue item matched?
```

In synchronous code, each check waits one by one.

```text
Budget check       -> 2 seconds
Supplier check     -> 2 seconds
Duplicate check    -> 2 seconds
Price check        -> 2 seconds
Catalogue check    -> 2 seconds
```

Total time: around 10 seconds.

In async code, all checks can start together.

```text
Budget check
Supplier check
Duplicate check
Price check
Catalogue check
```

Total time: around 2 seconds.

Example:

```python
import asyncio
import time


async def check_budget(pr):
    print("Checking budget in ERP...")
    await asyncio.sleep(2)
    return {"budget_ok": True}


async def check_supplier(pr):
    print("Checking supplier master...")
    await asyncio.sleep(2)
    return {"supplier_active": True}


async def check_duplicate_pr(pr):
    print("Checking duplicate PRs...")
    await asyncio.sleep(2)
    return {"duplicate_found": False}


async def check_price_tolerance(pr):
    print("Checking price tolerance...")
    await asyncio.sleep(2)
    return {"price_within_tolerance": True}


async def check_catalogue_match(pr):
    print("Checking catalogue match...")
    await asyncio.sleep(2)
    return {"catalogue_match": "CSCO-RTR-001"}


async def submit_pr(pr):
    start = time.time()

    results = await asyncio.gather(
        check_budget(pr),
        check_supplier(pr),
        check_duplicate_pr(pr),
        check_price_tolerance(pr),
        check_catalogue_match(pr),
    )

    final_result = {}
    for result in results:
        final_result.update(result)

    print(final_result)
    print(f"PR-{pr['pr_id']} submitted successfully")
    print(f"Total time: {time.time() - start:.1f} seconds")


pr = {
    "pr_id": 101,
    "department": "IT",
    "item": "Cisco Router",
    "quantity": 3,
    "supplier": "Cisco India",
    "cost_centre": "IT-OPS",
    "amount": 240000,
}


asyncio.run(submit_pr(pr))
```

## 7. ProcIQ Async Use Cases

### Budget Check

When a PR is created, ProcIQ may call an ERP system to check whether budget is available.

### Supplier Validation

ProcIQ may check supplier status, risk score, tax data, or blacklist status from another service.

### PDF Or Quote Upload

A user may upload a quote PDF. The system waits while the file is processed and text is extracted.

### AI Extraction

Pico may read a document and extract supplier, item, quantity, price, tax, and delivery date.

### LLM Call

ProcIQ may call an AI model to summarize a PR, explain policy reasoning, or draft a clarification question.

### Vector Search

ProcIQ may search old PRs, policies, catalog items, or supplier documents to find similar records.

### Duplicate PR Detection

The system may compare a new PR against existing PRs to detect duplicates.

### Approval Notifications

ProcIQ may send email, Teams, SMS, or in-app notifications without blocking the user request.

### ERP Sync

After PO creation, ProcIQ may push PO data to SAP, Oracle, or another ERP system and wait for confirmation.

### Supplier Portal Updates

ProcIQ may notify suppliers, wait for acknowledgement, and update PO status.

### Background Escalation

The system may check pending approvals and escalate them when SLA is breached.

### Streaming AI Response

Pico can show the answer gradually while the AI response is still being generated.

## 8. Simple Summary

Async helps when many tasks are waiting.

In ProcIQ, async is useful because many workflows depend on external systems:

```text
ProcIQ -> ERP
ProcIQ -> database
ProcIQ -> supplier portal
ProcIQ -> AI model
ProcIQ -> notification service
```

Short version:

```text
Use async when the backend says:
"I am waiting for another system."
```

---

# Topic 2: FastAPI Basics

## 1. What Is FastAPI?

FastAPI is a Python framework used to build backend APIs.

In simple words:

```text
FastAPI helps the frontend talk to Python backend code.
```

In ProcIQ, the user works on screens like:

- Create Purchase Request
- View PR details
- Approve PR
- Upload quote PDF
- Chat with Pico
- View notifications

When the user clicks a button, the frontend sends a request to the backend. FastAPI receives that request, runs Python logic, and sends a response back.

Basic flow:

```text
Frontend screen
   -> FastAPI endpoint
   -> Python business logic
   -> Database / ERP / AI model
   -> JSON response
   -> Frontend screen updates
```

## 2. What Is An API?

API means Application Programming Interface.

Beginner meaning:

```text
An API is a way for two programs to talk to each other.
```

ProcIQ examples:

```text
Frontend -> Backend
Backend  -> Database
Backend  -> ERP system
Backend  -> AI model
Backend  -> Supplier portal
```

Example conversation:

```text
Frontend: Give me PR-101 details.
Backend: Here is PR-101 data.
```

## 3. What Is An Endpoint?

An endpoint is one specific URL in the backend.

Each endpoint has one job.

Examples:

```text
GET  /health
GET  /purchase-requests/101
POST /purchase-requests
POST /purchase-requests/101/approve
POST /pico/chat
```

ProcIQ meaning:

```text
GET /purchase-requests/101
```

Means:

```text
Get details of purchase request 101.
```

## 4. HTTP Methods

HTTP method tells the backend what action the user wants.

Common methods:

```text
GET     -> read data
POST    -> create data
PUT     -> replace full data
PATCH   -> update partial data
DELETE  -> delete data
```

ProcIQ examples:

```text
GET /purchase-requests/101
```

Read PR-101.

```text
POST /purchase-requests
```

Create a new PR.

```text
PATCH /purchase-requests/101
```

Update some fields in PR-101.

```text
POST /purchase-requests/101/approve
```

Approve PR-101.

## 5. Request And Response

### Request

A request is data sent from the client to the backend.

Example: user submits a PR form.

```json
{
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 3,
  "amount": 240000
}
```

### Response

A response is data sent from the backend to the client.

Example:

```json
{
  "pr_id": 101,
  "status": "Draft",
  "message": "Purchase request created successfully"
}
```

FastAPI usually sends and receives JSON.

## 6. Real ProcIQ Example

Scenario:

A requester opens ProcIQ and creates a purchase request.

Screen data:

```text
Department: IT
Item: Cisco Router
Quantity: 3
Supplier: Cisco India
Amount: 240000
Cost Centre: IT-OPS
```

The requester clicks Submit.

What happens:

```text
1. Frontend sends a request to FastAPI.
2. FastAPI receives the PR data.
3. FastAPI validates the data.
4. Backend checks budget, supplier, duplicates, and policy.
5. Backend saves the PR in the database.
6. Backend returns PR ID and status.
7. Frontend shows "PR-101 created".
```

Flow:

```text
User clicks Submit
   -> POST /purchase-requests
   -> FastAPI
   -> Validation
   -> Business logic
   -> Database
   -> JSON response
   -> Screen shows success
```

## 7. Health Check Endpoint

A health check endpoint is a simple endpoint used to confirm that the backend service is running.

Example:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "prociq-learning-api"
    }
```

Explanation:

```python
from fastapi import FastAPI
```

Imports FastAPI.

```python
app = FastAPI()
```

Creates the FastAPI application.

```python
@app.get("/health")
```

Creates a GET endpoint at `/health`.

```python
def health_check():
```

This function runs when someone visits `/health`.

```python
return {"status": "ok"}
```

FastAPI automatically converts the Python dictionary into JSON.

Response:

```json
{
  "status": "ok",
  "service": "prociq-learning-api"
}
```

## 8. Path Parameter Example

A path parameter is a value inside the URL.

Example:

```text
/purchase-requests/101
```

Here, `101` is the PR ID.

FastAPI code:

```python
@app.get("/purchase-requests/{pr_id}")
def get_purchase_request(pr_id: int):
    return {
        "pr_id": pr_id,
        "title": "Cisco Router Purchase",
        "department": "IT",
        "amount": 240000,
        "status": "Draft"
    }
```

Important part:

```python
{pr_id}
```

This tells FastAPI:

```text
Take the value from the URL and pass it to the function.
```

If the user opens:

```text
http://127.0.0.1:8000/purchase-requests/101
```

FastAPI calls:

```python
get_purchase_request(pr_id=101)
```

Response:

```json
{
  "pr_id": 101,
  "title": "Cisco Router Purchase",
  "department": "IT",
  "amount": 240000,
  "status": "Draft"
}
```

## 9. Why FastAPI Is Common In AI Projects

FastAPI is widely used in AI projects because AI applications usually need a clean API layer between the frontend and the model.

AI projects often wait for:

- LLM responses
- embedding generation
- vector database search
- file upload processing
- database queries
- external API calls

FastAPI supports async well, so it fits these waiting-heavy workflows.

ProcIQ AI example:

```text
User asks Pico:
"Why was PR-101 flagged?"
```

FastAPI endpoint:

```text
POST /pico/chat
```

Backend steps:

```text
1. Receive the question.
2. Load PR-101 from the database.
3. Search policy documents in vector database.
4. Send context to LLM.
5. Return answer with sources.
```

Example response:

```json
{
  "answer": "PR-101 was flagged because the amount exceeds the configured IT category threshold.",
  "sources": [
    "M12 Governance Policy",
    "S23 Approval Workflow"
  ]
}
```

## 10. Running A FastAPI App

FastAPI apps are usually run with Uvicorn.

Run:

```powershell
python -m uvicorn fastapi_basics:app --reload
```

Meaning:

```text
fastapi_basics -> Python file name without .py
app            -> FastAPI object inside the file
--reload       -> restart server automatically when code changes
```

Open the API:

```text
http://127.0.0.1:8000/health
```

Open automatic docs:

```text
http://127.0.0.1:8000/docs
```

If port 8000 is blocked, use another port:

```powershell
python -m uvicorn fastapi_basics:app --reload --port 8001
```

## 11. Simple Summary

FastAPI is the backend door of the application.

In ProcIQ:

```text
Frontend screen action
   -> FastAPI endpoint
   -> Python logic
   -> Database / ERP / AI
   -> JSON response
```

Short version:

```text
Use FastAPI when a screen, service, or AI feature needs to talk to Python backend code through HTTP.
```

---

# Topic 3: Request/Response Validation With Pydantic

## 1. What Is Validation?

Validation means checking whether data is correct before using it.

In ProcIQ, the frontend may send purchase request data like this:

```json
{
  "title": "Cisco Router Purchase",
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 3,
  "amount": 240000
}
```

The backend must check:

```text
title is present
department is present
item is present
quantity is an integer
quantity is greater than 0
amount is a number
amount is greater than 0
```

This checking is called request validation.

## 2. What Is Pydantic?

Pydantic is a Python library used to define and validate data shapes.

Beginner meaning:

```text
Pydantic is a gatekeeper for data.
```

Flow:

```text
Request comes to FastAPI
   -> Pydantic checks it
   -> If valid, endpoint function runs
   -> If invalid, FastAPI returns validation error
```

FastAPI uses Pydantic automatically.

## 3. Without Pydantic

Without Pydantic, the endpoint receives raw data.

Then we must manually check every field.

Example:

```python
@app.post("/purchase-requests")
def create_purchase_request(data: dict):
    if "title" not in data:
        return {"error": "title is required"}

    if "department" not in data:
        return {"error": "department is required"}

    if "quantity" not in data:
        return {"error": "quantity is required"}

    if not isinstance(data["quantity"], int):
        return {"error": "quantity must be an integer"}

    if data["quantity"] <= 0:
        return {"error": "quantity must be greater than 0"}

    if "amount" not in data:
        return {"error": "amount is required"}

    if not isinstance(data["amount"], int) and not isinstance(data["amount"], float):
        return {"error": "amount must be a number"}

    if data["amount"] <= 0:
        return {"error": "amount must be greater than 0"}

    return {
        "message": "PR created",
        "pr_id": 101,
        "title": data["title"],
        "department": data["department"],
        "quantity": data["quantity"],
        "amount": data["amount"],
        "status": "Draft"
    }
```

Problems:

```text
Too many if conditions
Easy to forget validation
Hard to read
Validation logic mixes with business logic
Same checks may be repeated in many endpoints
Error style may become inconsistent
Automatic API docs will not know the request shape clearly
```

## 4. With Pydantic

With Pydantic, we define the expected request shape once.

```python
from pydantic import BaseModel, Field


class PurchaseRequestCreate(BaseModel):
    title: str
    department: str
    item: str
    quantity: int = Field(gt=0)
    amount: float = Field(gt=0)
```

Meaning:

```text
title must be string
department must be string
item must be string
quantity must be integer and greater than 0
amount must be number and greater than 0
```

Endpoint:

```python
@app.post("/purchase-requests")
def create_purchase_request(pr: PurchaseRequestCreate):
    return {
        "message": "PR created",
        "title": pr.title,
        "department": pr.department,
        "item": pr.item,
        "quantity": pr.quantity,
        "amount": pr.amount,
        "status": "Draft"
    }
```

Important line:

```python
def create_purchase_request(pr: PurchaseRequestCreate):
```

Meaning:

```text
FastAPI receives the request body.
Pydantic checks it against PurchaseRequestCreate.
Only valid data reaches the function.
```

## 5. Request Validation Example

Valid request:

```json
{
  "title": "Cisco Router Purchase",
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 3,
  "amount": 240000
}
```

This is accepted.

Invalid request:

```json
{
  "title": "Cisco Router Purchase",
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 0,
  "amount": -500
}
```

This is rejected because:

```text
quantity must be greater than 0
amount must be greater than 0
```

The endpoint function does not run for invalid input.

## 6. What Is Response Validation?

Request validation checks data entering the backend.

Response validation checks data leaving the backend.

In ProcIQ, the frontend may expect a response like this:

```json
{
  "pr_id": 101,
  "title": "Cisco Router Purchase",
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 3,
  "amount": 240000,
  "status": "Draft"
}
```

Response validation makes sure the backend sends this expected shape.

## 7. Without Response Validation

Without response validation, the backend can accidentally return messy data.

Example:

```python
return {
    "id": "PR-101",
    "name": "Cisco Router Purchase",
    "state": 123,
    "amount": "two lakh"
}
```

Problems:

```text
Frontend expects pr_id, but backend sends id
Frontend expects title, but backend sends name
Frontend expects status as text, but backend sends state as number
Frontend expects amount as number, but backend sends text
```

The frontend may break.

## 8. With Response Validation

Define a response model:

```python
class PurchaseRequestResponse(BaseModel):
    pr_id: int
    title: str
    department: str
    item: str
    quantity: int
    amount: float
    status: str
```

Attach it to the endpoint:

```python
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
```

Important part:

```python
response_model=PurchaseRequestResponse
```

Meaning:

```text
Before FastAPI sends data to the frontend,
Pydantic checks that the response matches PurchaseRequestResponse.
```

Actual response sent:

```json
{
  "pr_id": 101,
  "title": "Cisco Router Purchase",
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 3,
  "amount": 240000,
  "status": "Draft"
}
```

Notice:

```text
debug_notes is not sent.
```

The response model filters it out because it is not part of the frontend contract.

## 9. Real ProcIQ Advantage

ProcIQ handles serious business data:

```text
PR amount
quantity
supplier ID
cost centre
GL code
approval status
tenant ID
PO number
ERP sync status
agent confidence score
audit event IDs
```

Bad data can create real business problems.

Examples:

```text
amount = "two lakh"
quantity = -5
supplier_id missing
tenant_id missing
approval_status = "maybe approved"
raw ERP payload accidentally sent to frontend
internal debug notes visible to user
```

Pydantic helps prevent these mistakes.

## 10. Side-By-Side Summary

Without Pydantic:

```text
Function receives anything.
You must manually protect every endpoint.
Validation code becomes long and repetitive.
Frontend may receive messy output.
```

With Pydantic:

```text
Request model checks incoming data.
Response model controls outgoing data.
Endpoint focuses on business logic.
API docs clearly show expected request and response shape.
```

## 11. Simple Summary

FastAPI receives the API request.

Pydantic validates the data.

Request model:

```text
Protects backend from bad input.
```

Response model:

```text
Protects frontend from bad output.
```

ProcIQ flow:

```text
User submits PR
   -> FastAPI receives request
   -> Pydantic validates request body
   -> Business logic runs
   -> Pydantic validates response
   -> Frontend receives clean JSON
```

---

# Topic 5: Database Basics, SQL, And ORM

## 1. What Is A Database?

A database is where application data is stored permanently.

Without a database:

```text
User creates PR
Server restarts
PR is lost
```

With a database:

```text
User creates PR
Data is saved in database
Server restarts
PR is still available
```

In ProcIQ, a database stores things like:

- users
- roles
- suppliers
- purchase requests
- purchase orders
- approval workflows
- notifications
- audit logs
- Pico conversations
- uploaded document metadata

## 2. What Is A Table?

A table is like one Excel sheet inside a workbook.

Example table: `purchase_requests`

| pr_id | title | department | amount | status |
|---|---|---|---|---|
| 101 | Cisco Router Purchase | IT | 240000 | Draft |
| 102 | Laptop Purchase | HR | 90000 | In Approval |
| 103 | Office Chairs | Admin | 35000 | Approved |

Meaning:

```text
Table -> purchase_requests
Row   -> one purchase request
Column -> one field of the purchase request
```

Examples:

```text
pr_id      -> unique PR number
title      -> PR title
department -> department name
amount     -> PR amount
status     -> current PR state
```

## 3. What Is SQL?

SQL means Structured Query Language.

Beginner meaning:

```text
SQL is the language used to talk to relational databases.
```

Main SQL actions:

```text
INSERT -> create data
SELECT -> read data
UPDATE -> change data
DELETE -> remove data
```

These actions are called CRUD:

```text
Create
Read
Update
Delete
```

## 4. SQL Examples In ProcIQ

### Create A PR

```sql
INSERT INTO purchase_requests (pr_id, title, department, amount, status)
VALUES (101, 'Cisco Router Purchase', 'IT', 240000, 'Draft');
```

Meaning:

```text
Add a new PR row into the purchase_requests table.
```

### Read A PR

```sql
SELECT * FROM purchase_requests WHERE pr_id = 101;
```

Meaning:

```text
Find PR where pr_id is 101.
```

### Update PR Status

```sql
UPDATE purchase_requests
SET status = 'In Approval'
WHERE pr_id = 101;
```

Meaning:

```text
Change PR-101 status to In Approval.
```

### Delete A PR

```sql
DELETE FROM purchase_requests WHERE pr_id = 101;
```

Meaning:

```text
Delete PR-101.
```

In real procurement systems, important records are usually not deleted. Instead, the status is changed.

Example:

```text
status = Cancelled
```

This protects audit history.

## 5. What Is A Primary Key?

A primary key uniquely identifies one row in a table.

Example:

```text
pr_id = 101
```

In the `purchase_requests` table, `pr_id` can be the primary key.

Why this matters:

```text
Many PRs can have the same department.
Many PRs can have the same amount.
But each PR must have a unique PR ID.
```

Example:

| pr_id | department | amount |
|---|---|---|
| 101 | IT | 240000 |
| 102 | IT | 240000 |

The department and amount are the same, but the PR IDs are different.

## 6. What Is A Foreign Key?

A foreign key connects one table to another table.

Example supplier table:

| supplier_id | supplier_name |
|---|---|
| 1 | Cisco India |
| 2 | Dell India |

Example purchase request table:

| pr_id | title | supplier_id |
|---|---|---|
| 101 | Cisco Router Purchase | 1 |
| 102 | Laptop Purchase | 2 |

Here:

```text
purchase_requests.supplier_id
```

connects to:

```text
suppliers.supplier_id
```

ProcIQ meaning:

```text
PR-101 belongs to supplier Cisco India.
```

## 7. What Is ORM?

ORM means Object Relational Mapper.

Beginner meaning:

```text
ORM lets Python code work with database tables using classes and objects.
```

Without ORM, we often write raw SQL:

```python
cursor.execute(
    "SELECT * FROM purchase_requests WHERE pr_id = ?",
    (101,)
)
```

With ORM, we can write Python-style code:

```python
pr = db.query(PurchaseRequest).filter(PurchaseRequest.pr_id == 101).first()
```

Common Python ORMs:

- SQLAlchemy
- SQLModel
- Django ORM

FastAPI projects commonly use SQLAlchemy or SQLModel.

## 8. Table Vs ORM Model

Database table:

```text
purchase_requests
```

Python ORM model:

```python
class PurchaseRequest:
    pr_id: int
    title: str
    department: str
    amount: float
    status: str
```

Mental connection:

```text
Database table -> Python class
Table row      -> Python object
Table column   -> Python attribute
```

Example:

```text
purchase_requests table -> PurchaseRequest class
one PR row              -> one PurchaseRequest object
amount column           -> pr.amount
```

## 9. SQL Vs ORM Side By Side

### Insert PR

SQL:

```sql
INSERT INTO purchase_requests (title, department, amount, status)
VALUES ('Cisco Router Purchase', 'IT', 240000, 'Draft');
```

ORM idea:

```python
pr = PurchaseRequest(
    title="Cisco Router Purchase",
    department="IT",
    amount=240000,
    status="Draft"
)

db.add(pr)
db.commit()
```

### Read PR

SQL:

```sql
SELECT * FROM purchase_requests WHERE pr_id = 101;
```

ORM idea:

```python
pr = db.query(PurchaseRequest).filter(PurchaseRequest.pr_id == 101).first()
```

### Update PR

SQL:

```sql
UPDATE purchase_requests
SET status = 'Approved'
WHERE pr_id = 101;
```

ORM idea:

```python
pr.status = "Approved"
db.commit()
```

## 10. Real ProcIQ Database Flow

User creates a purchase request.

Flow:

```text
Frontend
   -> POST /purchase-requests
   -> FastAPI
   -> Pydantic validates request
   -> Backend creates PR object
   -> ORM saves it to database
   -> Response returns PR ID
```

Example submitted PR:

```text
Title: Cisco Router Purchase
Department: IT
Item: Cisco Router
Quantity: 3
Amount: 240000
Status: Draft
```

Saved database row:

| pr_id | title | department | item | quantity | amount | status |
|---|---|---|---|---|---|---|
| 101 | Cisco Router Purchase | IT | Cisco Router | 3 | 240000 | Draft |

Later, approver opens the PR:

```text
GET /purchase-requests/101
```

Backend does:

```text
Find PR-101 in database
Return PR data as JSON
```

Then approver approves:

```text
POST /purchase-requests/101/approve
```

Backend updates:

```text
status = Approved
```

## 11. Why Database Matters In ProcIQ

ProcIQ must remember:

- who created the PR
- who approved the PR
- what was changed
- which supplier was selected
- which policy was applied
- what Pico suggested
- which ERP sync happened
- what the current PO status is

Possible ProcIQ tables:

- users
- tenants
- roles
- suppliers
- items
- purchase_requests
- purchase_request_lines
- approval_workflows
- approval_steps
- purchase_orders
- notifications
- audit_logs
- documents
- pico_conversations

## 12. Beginner Mental Model

Database:

```text
Permanent Excel workbook for the application.
```

Table:

```text
One sheet inside the workbook.
```

Row:

```text
One record.
```

Column:

```text
One field.
```

SQL:

```text
Language used to talk to the database.
```

ORM:

```text
Python-friendly way to talk to the database.
```

## 13. Simple Summary

```text
Database stores application data permanently.
SQL is the language used to talk to the database.
ORM lets Python code work with the database using classes and objects.
```

ProcIQ flow:

```text
User creates PR
   -> FastAPI receives request
   -> Pydantic validates request
   -> ORM saves PR into database
   -> SQL runs behind the scenes
   -> PR stays saved permanently
```

Short version:

```text
SQL is what the database understands.
ORM is what Python developers prefer to write.
```

---

# Topic 6: Embeddings Concept

## 1. The Basic Problem

Computers do not naturally understand meaning like humans.

Humans can understand that these two sentences are similar:

```text
Cisco router purchase request
```

```text
Need network device from Cisco
```

But normal keyword matching sees different words:

```text
router != network device
purchase request != need
```

So we need a way to convert meaning into something a computer can compare.

That is why embeddings are used.

## 2. What Is An Embedding?

An embedding is a list of numbers that represents the meaning of text.

Example text:

```text
Cisco router purchase request
```

Example embedding:

```python
[0.12, -0.45, 0.88, 0.31, ...]
```

This list of numbers is called a vector.

Simple definition:

```text
Embedding = meaning converted into numbers.
```

## 3. Why Convert Text To Numbers?

Computers are good at comparing numbers.

They cannot directly compare human meaning.

So the flow is:

```text
Text
   -> embedding model
   -> vector numbers
```

Example:

```text
"Cisco router purchase request"
   -> embedding model
   -> [0.12, -0.45, 0.88, 0.31, ...]
```

Now the computer can compare this vector with other vectors.

## 4. Who Creates Embeddings?

Embeddings are created by an embedding model.

An embedding model is a special AI model whose job is:

```text
Take text
Convert it into numbers
```

Examples of embedding model providers:

- OpenAI embedding models
- Azure OpenAI embedding models
- Google embedding models
- Cohere embedding models
- Hugging Face models
- Sentence Transformers
- AWS Bedrock embedding models

In a backend project, Python code calls one of these models.

Conceptual code:

```python
embedding = embedding_model.create("Cisco router purchase request")
```

The embedding model returns a vector:

```python
[0.12, -0.45, 0.88, 0.31, ...]
```

## 5. Who Decides Two Sentences Have Similar Meaning?

The embedding model is the main brain behind meaning.

But the final similarity result comes from two parts:

```text
1. Embedding model
2. Similarity calculation
```

### Part 1: Embedding Model

The embedding model converts each sentence into a vector based on learned meaning.

Example:

```text
Sentence A -> vector A
Sentence B -> vector B
```

The model has learned language patterns during training.

It may learn patterns like:

```text
router is related to network device
Cisco is related to network equipment
purchase is related to buy/order/need
firewall, router, and switch are related to network infrastructure
```

### Part 2: Similarity Calculation

After vectors are created, math compares them.

A common method is cosine similarity.

Beginner meaning:

```text
Cosine similarity checks whether two vectors point in a similar direction.
```

If vectors are close, the text meanings are considered similar.

If vectors are far, the text meanings are considered different.

## 6. ProcIQ Similarity Example

New PR text:

```text
Need Cisco router for IT network upgrade
```

Old PR text:

```text
Cisco router purchase for IT department
```

Embedding process:

```text
New PR text -> embedding model -> vector A
Old PR text -> embedding model -> vector B
```

Similarity calculation:

```text
vector A compared with vector B
```

Example result:

```json
{
  "similarity": 0.92
}
```

ProcIQ can interpret this as:

```text
0.92 is high similarity.
This may be a duplicate or related PR.
```

## 7. Who Decides The Business Action?

The embedding model gives meaning-based vectors.

Similarity math gives a score.

ProcIQ business rules decide what to do with the score.

Example thresholds:

```text
similarity >= 0.85 -> possible duplicate
similarity >= 0.70 -> related PR
similarity < 0.70  -> probably not related
```

Important split:

```text
Embedding model -> understands meaning as numbers
Similarity math -> gives closeness score
ProcIQ rules    -> decide business action
```

## 8. Beginner Analogy

Imagine every sentence gets a location on a meaning map.

Similar meanings are placed near each other.

Different meanings are far away.

Example:

```text
Network purchase area:
  - Cisco router purchase
  - Need network device
  - Buy firewall appliance

Office furniture area:
  - Office chair purchase
  - Desk order
  - Ergonomic chair quote

HR area:
  - Leave request
  - Employee onboarding
```

Embeddings are like map coordinates for meaning.

## 9. Keyword Search Vs Embedding Search

Keyword search:

```text
Searches exact words.
```

Embedding search:

```text
Searches meaning.
```

Example query:

```text
Need network device for IT
```

Stored text:

```text
Cisco router purchase
```

Keyword search may fail:

```text
network not found
device not found
maybe no result
```

Embedding search can succeed:

```text
network device is semantically related to Cisco router
return this result
```

## 10. Real ProcIQ Use Cases

Embeddings help ProcIQ find similar or related things.

Examples:

- similar PRs
- duplicate PRs
- related supplier quotes
- matching catalog items
- relevant policy clauses
- past purchases
- similar approval cases
- similar audit events

Questions embeddings help answer:

```text
Have we seen a similar PR before?
Which policy is relevant to this PR?
Which catalog item matches this free-text request?
Which old supplier quote is similar?
What documents should Pico read before answering?
```

## 11. Embeddings In RAG

RAG means Retrieval-Augmented Generation.

We will study it later, but embeddings are a key part of it.

Simple RAG flow:

```text
User question
   -> convert question into embedding
   -> search stored document embeddings
   -> find most similar documents
   -> send those documents to LLM
   -> LLM writes answer using that context
```

ProcIQ example:

```text
User asks Pico:
"Why does this PR need finance approval?"
```

System searches policy document embeddings and finds:

```text
IT purchases above 100000 require Finance approval.
```

Then the LLM can answer using that policy.

## 12. Important Terms

Embedding model:

```text
AI model that converts text into vectors.
```

Vector:

```text
List of numbers representing meaning.
```

Similarity:

```text
How close two vectors are.
```

Semantic search:

```text
Search by meaning instead of exact words.
```

Vector database:

```text
Database designed to store and search embeddings efficiently.
```

## 13. What Embeddings Are Not

Embeddings are not final chatbot answers.

Embeddings are mainly used for:

- search
- matching
- recommendation
- clustering
- similarity
- retrieval

Important split:

```text
Embedding model -> finds related content
LLM             -> writes natural language answer
```

## 14. Simple Summary

```text
Embedding = meaning converted into numbers.
Vector = list of numbers.
Similar meaning = vectors close together.
Embedding search = search by meaning, not exact words.
```

ProcIQ use:

```text
Find similar PRs
Find duplicate PRs
Find matching catalog items
Find relevant policies
Find related supplier quotes
Help Pico retrieve useful context
```

Short version:

```text
Embeddings help ProcIQ understand:
"this text is similar to that text."
```

---

# Topic 7: Text Chunking Strategies

## 1. The Basic Problem

AI models and embedding models cannot always handle very large documents well.

Example ProcIQ documents:

- Procurement Policy Manual
- Supplier Contract
- Purchase Order Terms
- Audit Report
- ProcIQ Product Specification
- ERP Integration Guide

These documents may be 40, 80, or 120 pages long.

If we send the full document at once, problems happen:

```text
too much text
slow processing
higher cost
model may miss important details
search result becomes vague
```

So large text is split into smaller pieces.

This is called text chunking.

## 2. What Is Text Chunking?

Text chunking means splitting large text into smaller meaningful parts.

Simple definition:

```text
Chunking = breaking big text into smaller useful pieces.
```

Example original text:

```text
IT purchases above 100000 require Finance approval.
Office supplies below 5000 can be auto-approved.
Supplier onboarding requires GST and bank validation.
```

Good chunks:

```text
Chunk 1:
IT purchases above 100000 require Finance approval.

Chunk 2:
Office supplies below 5000 can be auto-approved.

Chunk 3:
Supplier onboarding requires GST and bank validation.
```

Each chunk has one clear idea.

## 3. Why Chunking Is Needed For Embeddings

Embedding models convert text into vectors.

If we embed a full 120-page policy document as one vector:

```text
Full policy document -> one embedding
```

That one vector tries to represent too many topics.

Problem:

```text
approval rules
supplier onboarding
PO cancellation
audit retention
budget checks
all get mixed into one vector
```

Search becomes less accurate.

Better approach:

```text
Section 1 -> embedding
Section 2 -> embedding
Section 3 -> embedding
```

Then when Pico asks a question, the system can find the exact relevant chunk.

## 4. Real ProcIQ Example

Document:

```text
Procurement Policy Manual
```

Contains:

```text
Section A: IT purchase approval rules
Section B: Office supplies policy
Section C: Supplier onboarding rules
Section D: PO cancellation rules
Section E: Audit retention rules
```

User asks Pico:

```text
Can I auto-approve an office chair purchase under 5000?
```

Good chunking helps retrieve:

```text
Section B: Office supplies policy
```

Bad chunking may retrieve:

```text
the whole policy manual
```

or the wrong section.

## 5. Chunk Size

Chunk size means how big each piece is.

Examples:

```text
small chunk  -> around 100 words
medium chunk -> around 500 words
large chunk  -> around 1000 words
```

If the chunk is too small, the meaning may be incomplete.

Bad small chunk:

```text
above 100000 require approval
```

Problem:

```text
We do not know what category this applies to.
```

Better chunk:

```text
IT purchases above 100000 require Finance approval.
```

If the chunk is too large, many topics may get mixed together.

Problem:

```text
Search becomes less precise.
```

Good chunking keeps one useful idea together.

## 6. Chunk Overlap

Chunk overlap means repeating some text between neighboring chunks.

Why overlap is useful:

```text
Important meaning can be split at the boundary between two chunks.
```

Bad split without overlap:

```text
Chunk 1:
IT purchases above 100000

Chunk 2:
require Finance approval.
```

Both chunks are incomplete alone.

Better with overlap:

```text
Chunk 1:
IT purchases above 100000 require Finance approval.

Chunk 2:
Finance approval is mandatory before PO generation.
```

Simple definition:

```text
Overlap = repeated text between chunks to avoid losing meaning.
```

## 7. Common Chunking Strategies

### Strategy 1: Fixed-Size Chunking

Split every fixed number of words or characters.

Example:

```text
Every 500 words
```

Good:

```text
simple
easy to implement
works when document structure is unknown
```

Bad:

```text
may cut sentences in the middle
may split a useful idea into two chunks
```

### Strategy 2: Sentence-Based Chunking

Split using sentence boundaries.

Example:

```text
Sentence 1 + Sentence 2 + Sentence 3 = one chunk
```

Good:

```text
does not cut sentence in half
more readable than fixed character splitting
```

Bad:

```text
may still mix different topics
```

### Strategy 3: Paragraph-Based Chunking

Split by paragraphs.

Good:

```text
keeps related lines together
works well for readable documents
```

Bad:

```text
some paragraphs may be too long
some paragraphs may be too short
```

Use for:

```text
policies
contracts
specification documents
business documents
```

### Strategy 4: Section-Based Chunking

Split by headings and sections.

Example:

```text
1. Approval Rules
2. Supplier Onboarding
3. PO Cancellation
```

Good:

```text
keeps one topic together
best for structured documents
very useful for policy and contract search
```

Bad:

```text
depends on detecting headings correctly
```

This is very useful for ProcIQ policy documents.

### Strategy 5: Semantic Chunking

Split based on meaning.

Meaning:

```text
Keep related ideas together even if paragraph boundaries are not perfect.
```

Good:

```text
best quality chunks
good for advanced RAG systems
```

Bad:

```text
more complex
may need AI or advanced logic
```

## 8. Best Practical Strategy For ProcIQ

For ProcIQ, a good practical approach is:

```text
1. Use section-based chunking for policies, specs, and contracts.
2. Use paragraph-based chunking when sections are not clear.
3. Add overlap to avoid losing context.
4. Store metadata with every chunk.
```

This helps Pico retrieve the right part of the right document.

## 9. Metadata Is Very Important

A chunk should not be stored alone.

Bad:

```text
IT purchases above 100000 require Finance approval.
```

Good:

```json
{
  "text": "IT purchases above 100000 require Finance approval.",
  "document_name": "Procurement Policy Manual",
  "section": "IT Purchase Approval Rules",
  "page": 12,
  "tenant_id": "tenant_abc"
}
```

Metadata helps with:

```text
showing source to user
filtering by tenant
filtering by document type
auditability
source citation
security
```

ProcIQ multi-tenant warning:

```text
Tenant A chunks must not be searched for Tenant B.
```

This is why `tenant_id` metadata is important.

## 10. Bad Chunking Example

Original text:

```text
IT purchases above 100000 require Finance approval.
Office supplies below 5000 can be auto-approved.
Supplier onboarding requires GST validation.
```

Bad chunk:

```text
Finance approval. Office supplies below
```

Problem:

```text
meaning is broken
search quality becomes poor
Pico may answer incorrectly
```

## 11. Good Chunking Example

Good chunks:

```text
Chunk 1:
IT purchases above 100000 require Finance approval.

Chunk 2:
Office supplies below 5000 can be auto-approved.

Chunk 3:
Supplier onboarding requires GST validation.
```

Why this is good:

```text
each chunk has one clear idea
each chunk can be embedded separately
search can retrieve the exact useful rule
```

## 12. Full ProcIQ RAG Flow With Chunking

Document upload:

```text
Procurement policy PDF uploaded
```

Backend flow:

```text
1. Extract text from PDF.
2. Split text into chunks.
3. Add metadata to each chunk.
4. Create embedding for each chunk.
5. Store chunk and embedding in vector database.
```

Later Pico question:

```text
Why does this IT PR need finance approval?
```

Search flow:

```text
1. Convert question into embedding.
2. Search similar chunks.
3. Filter by tenant_id.
4. Retrieve top matching policy chunks.
5. Send chunks to LLM.
6. LLM answers with source citation.
```

## 13. Simple Code Shape

Conceptual code:

```python
text = extract_text_from_pdf("policy.pdf")

chunks = split_into_chunks(text, chunk_size=500, overlap=50)

for chunk in chunks:
    embedding = create_embedding(chunk.text)
    save_to_vector_db(
        text=chunk.text,
        embedding=embedding,
        metadata=chunk.metadata
    )
```

Meaning:

```text
Extract text
Split into chunks
Create embedding for each chunk
Store for search
```

## 14. Simple Summary

```text
Chunking = splitting large text into smaller useful pieces.
```

Why chunking matters:

```text
AI models cannot handle huge documents well.
Embeddings work better when each vector represents one clear idea.
Search becomes more accurate.
```

A good chunk:

```text
has one complete idea
is not too small
is not too large
has metadata
may include overlap
```

ProcIQ use:

```text
policy search
supplier contract search
quote extraction
Pico answers
audit source citations
RAG pipeline
```

Short version:

```text
Good chunking helps Pico find the right part of the right document.
```

---

# Topic 10: LLM Fundamentals

## 1. What Is An LLM?

LLM means Large Language Model.

Simple meaning:

```text
An LLM is an AI model that understands and generates human-like text.
```

Examples:

- GPT
- Claude
- Gemini
- Llama
- Mistral

In ProcIQ, Pico can use an LLM to answer questions, summarize PRs, explain policies, draft messages, and help users understand procurement decisions.

## 2. What Does An LLM Do?

At a simple level, an LLM predicts the next piece of text.

Example:

```text
Input:
Summarize this PR.

Output:
This PR requests 3 Cisco routers for the IT department at a total cost of 240000.
```

It generates text based on:

```text
prompt + context
```

## 3. Prompt And Context

A prompt is the instruction given to the LLM.

Example:

```text
Explain why this PR needs approval.
```

Context is the factual data given to the LLM.

Example:

```text
PR amount: 240000
Department: IT
Policy: IT purchases above 100000 require Finance approval.
```

Good context helps the LLM answer correctly.

## 4. Real ProcIQ Example

User asks Pico:

```text
Why does this PR need Finance approval?
```

Backend should not ask the LLM blindly.

Good flow:

```text
1. Get PR details from database.
2. Get policy chunks from vector database.
3. Send PR + policy context to LLM.
4. LLM writes the answer.
```

Context:

```text
PR:
Department: IT
Amount: 240000
Item: Cisco Router

Policy:
IT purchases above 100000 require Finance approval.
```

LLM answer:

```text
This PR needs Finance approval because it is an IT purchase of 240000, and the policy says IT purchases above 100000 require Finance approval.
```

## 5. LLM Is Not A Database

An LLM does not automatically know live ProcIQ data.

It does not automatically know:

- current PR status
- tenant-specific policy
- latest ERP sync result
- uploaded supplier quote
- approval workflow state

Those facts must come from:

```text
database
vector database
backend business logic
retrieved documents
```

Simple rule:

```text
LLM writes the answer.
Backend provides the truth.
```

## 6. Hallucination

Hallucination means the LLM gives an answer that sounds confident but is wrong.

Example:

```text
LLM says CFO approval is needed.
```

But actual policy says:

```text
Finance Manager approval is enough.
```

To reduce hallucination:

- provide correct context
- use RAG
- ask for source-based answers
- keep temperature low for business workflows
- validate important outputs

## 7. Temperature

Temperature controls how creative or random the LLM answer is.

```text
Low temperature, like 0.1 -> focused, predictable, better for policy/business answers.
High temperature, like 0.9 -> creative, varied, higher risk of unsupported ideas.
```

For ProcIQ, use low temperature for approval reasoning, audit answers, and policy Q&A.

## 8. LLM Vs Embedding Model

Embedding model:

```text
Converts text into vectors for search.
```

LLM:

```text
Generates text answers.
```

In ProcIQ:

```text
Embedding model finds the right policy.
LLM explains the policy to the user.
```

## 9. Simple Summary

```text
LLM = AI model that understands and generates text.
Prompt = instruction.
Context = facts given to the model.
Hallucination = confident but wrong answer.
```

ProcIQ use:

```text
Pico explanations
PR summaries
policy Q&A
quote understanding
supplier email drafts
audit summaries
```

Short version:

```text
LLM writes language.
Backend and databases provide truth.
```

---

# Topic 11: Functions And Decorators

## 1. What Is A Function?

A function is a named block of code that does one specific job.

Simple meaning:

```text
Function = give a task a name so you can reuse it.
```

Real life example:

Every morning you make tea using the same steps. Instead of repeating those steps every time, you name them "make tea" and call that name whenever needed. That is a function.

## 2. Function Without Input

```python
def make_tea():
    print("boil water")
    print("add tea bag")
    print("add sugar")

make_tea()
make_tea()
```

Output:

```text
boil water
add tea bag
add sugar
boil water
add tea bag
add sugar
```

The steps are written once. Called twice. No repetition.

## 3. Function With Input

```python
def make_tea(sugar_spoons):
    print("boil water")
    print("add tea bag")
    print(f"add {sugar_spoons} spoons of sugar")

make_tea(2)
make_tea(0)
```

Output:

```text
add 2 spoons of sugar
add 0 spoons of sugar
```

The function behaves differently based on what you pass in.

## 4. Function With Output

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
```

Output:

```text
8
```

`return` sends the result back to whoever called the function.

## 5. Real ProcIQ Example

Without function:

```python
print("Checking budget for Finance...")
time.sleep(2)
print("Budget OK")

print("Checking budget for IT...")
time.sleep(2)
print("Budget OK")
```

With function:

```python
def check_budget(department):
    print(f"Checking budget for {department}...")
    time.sleep(2)
    return "Budget OK"

result = check_budget("Finance")
result = check_budget("IT")
```

Same logic. No repetition. Easy to update.

## 6. What Is A Decorator?

A decorator adds extra behavior to a function without changing the function itself.

Real life example:

You have a regular door. You add a security camera above it. The door still works the same way. But now it also records who enters. The camera is the decorator.

## 7. Decorator Without Framework

```python
def logger(func):
    def wrapper():
        print("Function is starting...")
        func()
        print("Function finished.")
    return wrapper

@logger
def greet():
    print("Hello!")

greet()
```

Output:

```text
Function is starting...
Hello!
Function finished.
```

`@logger` is the decorator. It wraps `greet()` with extra steps before and after.

## 8. How Decorator Works Step By Step

Without `@logger`:

```text
greet() -> prints Hello
```

With `@logger`:

```text
greet() -> logger runs -> prints starting -> prints Hello -> prints finished
```

The function itself did not change. The decorator added the outer behavior.

## 9. Real ProcIQ Example

A decorator that checks if the user is logged in before any function runs:

```python
def require_login(func):
    def wrapper(user, *args, **kwargs):
        if not user.is_logged_in:
            return {"error": "You must be logged in."}
        return func(user, *args, **kwargs)
    return wrapper

@require_login
def get_pr_details(user, pr_id):
    return {"pr_id": pr_id, "title": "Cisco Router Purchase"}
```

Every function using `@require_login` checks login automatically. No need to repeat that check inside every function.

## 10. Why Decorators Matter In LangChain And MCP

MCP uses decorators to register tools.

```python
@mcp.tool()
def get_pr_status(pr_id: str) -> str:
    """Get the current status of a purchase request."""
    return f"PR-{pr_id}: In Approval"
```

Without `@mcp.tool()`, this is just a regular Python function.

With `@mcp.tool()`, the MCP server registers it and an AI model can call it.

FastAPI uses the same pattern:

```python
@app.get("/purchase-requests/{pr_id}")
def get_purchase_request(pr_id: int):
    return {"pr_id": pr_id}
```

`@app.get(...)` registers the function as an API endpoint.

## 11. Simple Summary

Function:

```text
Name a task. Reuse it. Avoid repetition.
```

Decorator:

```text
Wrap a function with extra behavior without changing the function.
```

Real use in ProcIQ and LangChain/MCP:

```text
@require_login    -> add login check to any function
@app.get(...)     -> register any function as FastAPI endpoint
@mcp.tool()       -> register any function as AI tool
```

Short version:

```text
Decorators = reusable wrappers that change how a function behaves from the outside.
```

---

# Topic 12: RAG Architecture

## 1. What Is RAG?

RAG means Retrieval-Augmented Generation.

Breakdown:

```text
Retrieval  -> find relevant information
Augmented  -> add that information as context
Generation -> LLM writes the answer
```

Simple meaning:

```text
RAG = search first, then ask the LLM to answer using the search results.
```

## 2. Why RAG Is Needed

An LLM does not automatically know private or live ProcIQ data.

It does not automatically know:

- current PR status
- tenant-specific policy
- uploaded supplier quote
- ERP sync result
- approval workflow
- customer-specific rules

So the backend must retrieve the right information before asking the LLM.

## 3. Without RAG Vs With RAG

User asks Pico:

```text
Why does PR-101 need Finance approval?
```

Without RAG:

```text
LLM may guess.
Answer may not cite policy.
Answer may be wrong.
```

With RAG:

```text
Backend retrieves PR details.
Backend retrieves policy chunks.
LLM answers using that context.
```

Example context:

```text
PR:
Department: IT
Amount: 240000

Policy:
IT purchases above 100000 require Finance approval.
```

Answer:

```text
PR-101 needs Finance approval because it is an IT purchase of 240000, and the policy says IT purchases above 100000 require Finance approval.
```

## 4. Two Main Phases

### Phase 1: Indexing

This happens before the user asks a question.

Example: policy PDF is uploaded.

```text
PDF uploaded
   -> extract text
   -> split into chunks
   -> create embedding for each chunk
   -> store chunks + vectors + metadata in vector database
```

### Phase 2: Retrieval And Generation

This happens when user asks a question.

```text
User question
   -> create question embedding
   -> search vector database
   -> retrieve relevant chunks
   -> build prompt with context
   -> send to LLM
   -> return answer
```

## 5. ProcIQ RAG Example

User asks Pico:

```text
Why does this Cisco router PR require Finance approval?
```

Normal database gives:

```json
{
  "pr_id": 101,
  "department": "IT",
  "item": "Cisco Router",
  "amount": 240000,
  "status": "Draft"
}
```

Vector database gives:

```text
IT purchases above 100000 require Finance approval.
```

Prompt to LLM:

```text
You are Pico, a procurement copilot.
Use only the given context.

PR:
Department: IT
Item: Cisco Router
Amount: 240000

Policy:
IT purchases above 100000 require Finance approval.

Question:
Why does this PR require Finance approval?
```

LLM answer:

```text
This PR requires Finance approval because it is an IT purchase worth 240000, which is above the 100000 threshold in the policy.
```

## 6. Main RAG Components

RAG usually has these parts:

```text
Document source
Text extractor
Chunker
Embedding model
Vector database
Retriever
Prompt builder
LLM
API layer
```

In ProcIQ:

```text
Document source -> policy PDFs, contracts, quotes, PR notes
Text extractor  -> extracts text from PDF/document/email
Chunker         -> splits large text
Embedding model -> converts chunks to vectors
Vector DB       -> stores and searches vectors
Retriever       -> gets top relevant chunks
Prompt builder  -> prepares LLM input
LLM             -> writes final answer
FastAPI         -> exposes endpoint like /pico/chat
```

## 7. RAG Uses Two Types Of Databases

Normal database:

```text
Stores structured business data.
```

Examples:

```text
PR amount
supplier ID
status
approval workflow
tenant ID
PO number
```

Vector database:

```text
Stores searchable meaning.
```

Examples:

```text
policy chunks
contract chunks
quote text chunks
similar PR descriptions
catalog item embeddings
```

ProcIQ often needs both in the same answer.

## 8. Metadata Filtering

Metadata filtering is very important.

Search should filter by:

```text
tenant_id
document_type
department
category
supplier_id
```

Reason:

```text
Tenant A data must not appear in Tenant B answer.
```

Example:

```text
Search policy chunks where tenant_id = tenant_abc
```

## 9. Good RAG Answer

A good RAG answer should:

- answer the question
- use retrieved context
- avoid guessing
- cite source when possible
- say when context is missing

Example:

```text
PR-101 requires Finance approval because the IT purchase amount is 240000, which exceeds the 100000 threshold in the policy.

Source: Procurement Policy Manual, page 12.
```

## 10. Simple Architecture Diagram

Document upload flow:

```text
PDF / Text / JSON
   -> text extraction
   -> chunking
   -> embeddings
   -> vector database
```

Question answering flow:

```text
User question
   -> FastAPI
   -> embed question
   -> search vector database
   -> fetch structured PR data from normal database
   -> build prompt
   -> LLM
   -> answer with sources
```

## 11. Simple Summary

```text
RAG = retrieve useful information first, then ask LLM to answer.
```

ProcIQ use:

```text
Pico policy Q&A
approval explanation
supplier quote understanding
contract question answering
audit summaries
similar PR reasoning
```

Short version:

```text
RAG helps Pico answer using ProcIQ's real documents and data instead of guessing.
```

---

# Topic 13: Background Job Processing

## 1. What Is A Background Job?

A background job is slow work that runs separately from the main API response.

Simple meaning:

```text
Return response to user quickly.
Do slow work behind the scenes.
```

ProcIQ example:

```text
User uploads quote PDF.
FastAPI returns job_id immediately.
PDF extraction, chunking, embeddings, and PR draft creation run in background.
```

## 2. Why Background Jobs Are Needed

Some work takes time:

- PDF text extraction
- document chunking
- embedding generation
- vector database indexing
- ERP sync retries
- email/notification sending
- audit report generation
- bulk approval processing

Without background jobs:

```text
User waits until all slow work finishes.
API may timeout.
App feels slow.
```

With background jobs:

```text
API accepts work.
User gets job_id.
Worker/background task continues processing.
Frontend checks status later.
```

## 3. Real ProcIQ Flow

Smart quote upload:

```text
1. User uploads cisco_quote.pdf.
2. FastAPI saves file or file metadata.
3. FastAPI creates a job_id.
4. FastAPI returns status = queued.
5. Background job extracts text.
6. Background job chunks text.
7. Background job creates embeddings.
8. Background job stores vectors.
9. Background job creates draft PR.
10. Job status becomes completed.
```

Response from upload endpoint:

```json
{
  "job_id": "job_123",
  "status": "queued"
}
```

Status endpoint later:

```json
{
  "job_id": "job_123",
  "status": "completed",
  "draft_pr_id": 101
}
```

## 4. FastAPI BackgroundTasks

FastAPI has a simple built-in background task feature.

Example:

```python
background_tasks.add_task(process_quote_pdf, job_id, file_name)
```

Meaning:

```text
After sending the HTTP response,
run process_quote_pdf(job_id, file_name).
```

This does not create a separate Celery-style worker.

It uses FastAPI/Starlette's background task mechanism inside the web server process.

Good for:

```text
learning
small follow-up tasks
simple demos
short background work
```

Not ideal for:

```text
very long jobs
heavy CPU work
retry-heavy jobs
production queue processing
jobs that must survive server restart
```

## 5. FastAPI BackgroundTasks Flow

```text
POST /documents/upload
   -> create job_id
   -> status = queued
   -> register background task
   -> return job_id
   -> background function starts after response
```

Status checking:

```text
GET /jobs/{job_id}
   -> return queued / processing / completed / failed
```

## 6. Celery + Redis Production Style

For production, background jobs often use:

```text
FastAPI + Redis + Celery worker
```

Flow:

```text
FastAPI creates job
   -> Redis queue stores job
   -> Celery worker picks job
   -> worker processes job
   -> result/status is stored
```

Celery job creation:

```python
task = process_quote_pdf.delay("uploads/cisco_quote.pdf")
```

Status checking:

```python
task = process_quote_pdf.AsyncResult(job_id)
```

Important:

```text
AsyncResult is not Python async/await.
It is a Celery object used to check a background job status/result.
```

## 7. Async/Await Vs Background Jobs

Use `async/await` when:

```text
work is I/O waiting
same request should still return final answer
task is not very long
```

Examples:

```text
call LLM
call ERP API
query database
search vector DB
```

Use background jobs when:

```text
work is slow
user should not wait
job may need retry
job should run outside request lifecycle
```

Examples:

```text
process 100-page PDF
generate embeddings for many chunks
send 500 notifications
retry ERP sync
generate audit report PDF
```

## 8. Simple Summary

```text
Background job = slow work handled after or outside the main request.
```

ProcIQ use:

```text
PDF upload processing
RAG indexing
ERP sync retry
notification sending
audit export generation
M11 escalation engine
```

Short version:

```text
API receives work.
Background job does slow work.
User checks status with job_id.
```

---

# Topic 14: Caching With Redis

## 1. What Is Caching?

Caching means storing a result temporarily so the next request can be faster.

Simple meaning:

```text
Do slow work once.
Reuse the result for a short time.
```

## 2. What Is Redis?

Redis is a very fast in-memory data store.

Beginner meaning:

```text
Redis is super-fast temporary storage.
```

It is commonly used for:

- cache
- job queue
- session storage
- rate limit counters
- temporary job status

## 3. Cache Hit And Cache Miss

Cache hit:

```text
Data is found in Redis.
Return fast.
```

Cache miss:

```text
Data is not found in Redis.
Fetch from database/API.
Store in Redis.
Return result.
```

## 4. Real ProcIQ Example

ProcIQ needs supplier risk summary.

Without cache:

```text
Open PR screen
   -> call supplier risk service
   -> wait 2 seconds
```

This may happen again and again for the same supplier.

With Redis:

```text
First request:
   -> Redis miss
   -> call supplier risk service
   -> store result for 10 minutes
   -> return result

Second request:
   -> Redis hit
   -> return result immediately
```

Cache key:

```text
supplier_risk:55
```

Cache value:

```json
{
  "supplier_id": 55,
  "risk": "LOW",
  "score": 82
}
```

Expiry:

```text
10 minutes
```

## 5. What To Cache In ProcIQ

Good cache candidates:

- supplier risk summary
- tenant configuration
- M12 policy settings
- frequently used master data
- catalog search results
- user session data
- rate limit counters
- temporary job status

Be careful caching:

- highly sensitive data
- financial posting truth
- final audit records
- data that must be real-time exact

## 6. Redis With Background Jobs

Redis and background jobs often work together.

Example:

```text
User uploads PDF
FastAPI creates job_id
Redis stores job status = processing
Worker processes PDF
Worker updates Redis status = completed
Frontend checks job status
```

Redis job status:

```json
{
  "job_id": "job_123",
  "status": "processing",
  "progress": 60
}
```

Later:

```json
{
  "job_id": "job_123",
  "status": "completed",
  "draft_pr_id": 101
}
```

## 7. Redis In Celery

Celery can use Redis as:

```text
broker -> stores pending jobs
backend -> stores job results
```

Flow:

```text
FastAPI sends job to Redis queue.
Celery worker takes job from Redis.
Worker stores result/status back in Redis.
```

## 8. Simple Summary

Caching:

```text
Store repeated result temporarily.
Return faster next time.
```

Redis:

```text
Fast temporary storage used for cache, queues, sessions, counters, and job status.
```

ProcIQ use:

```text
cache supplier risk
cache tenant policies
cache master data
store job status
support Celery queues
track rate limits
```

Short version:

```text
Background jobs handle slow work.
Redis helps store fast temporary data and coordinate jobs.
```

---

# Topic 15: API Design And Rate Limiting

## 1. What Is API Design?

API design means deciding how the backend endpoints should look and behave.

Simple meaning:

```text
API design = making backend URLs clear, predictable, and easy to use.
```

In ProcIQ, APIs may support:

- creating PRs
- viewing PR details
- approving PRs
- uploading documents
- checking background job status
- asking Pico questions
- reading notifications

## 2. Good Endpoint Names

Use clear resource names.

Good:

```text
/purchase-requests
/purchase-orders
/suppliers
/documents
/jobs
/notifications
```

Avoid unclear action-style names:

```text
/createPR
/getPR
/doApproval
```

## 3. HTTP Methods

Use the right method for the action.

```text
GET     -> read data
POST    -> create data or trigger an action
PATCH   -> update some fields
PUT     -> replace full data
DELETE  -> delete data
```

ProcIQ examples:

```text
GET /purchase-requests/101
```

Read PR-101.

```text
POST /purchase-requests
```

Create a new PR.

```text
POST /purchase-requests/101/approve
```

Approve PR-101.

```text
POST /documents/upload
```

Upload a quote PDF.

```text
GET /jobs/job_123
```

Check background job status.

## 4. Good Request And Response Shape

Create PR request:

```json
{
  "title": "Cisco Router Purchase",
  "department": "IT",
  "item": "Cisco Router",
  "quantity": 3,
  "amount": 240000
}
```

Good response:

```json
{
  "pr_id": 101,
  "title": "Cisco Router Purchase",
  "status": "Draft"
}
```

Avoid vague responses:

```json
{
  "ok": true,
  "data": "done"
}
```

The frontend should clearly know what happened.

## 5. Important Status Codes

```text
200 OK                -> success
201 Created           -> new resource created
202 Accepted          -> accepted, processing later
400 Bad Request       -> bad input
401 Unauthorized      -> not logged in
403 Forbidden         -> logged in but not allowed
404 Not Found         -> record not found
422 Validation Error  -> Pydantic validation failed
429 Too Many Requests -> rate limit exceeded
500 Server Error      -> backend bug
```

ProcIQ examples:

```text
POST /documents/upload -> 202 Accepted
```

Because document processing happens in background.

```text
GET /purchase-requests/999 -> 404 Not Found
```

Because PR-999 does not exist.

```text
POST /purchase-requests/101/approve -> 403 Forbidden
```

If the current user is not allowed to approve.

## 6. Pagination And Filtering

Do not return thousands of records at once.

Good:

```text
GET /purchase-requests?page=1&page_size=20
```

Filter example:

```text
GET /purchase-requests?status=Draft&department=IT
```

ProcIQ needs this for:

- PR lists
- PO lists
- notifications
- audit logs
- supplier lists

## 7. What Is Rate Limiting?

Rate limiting means controlling how many requests a user or client can make in a time period.

Simple meaning:

```text
Rate limiting = stop too many requests.
```

Example:

```text
20 Pico chat requests per minute per user
```

If user sends more than allowed:

```text
429 Too Many Requests
```

## 8. Why Rate Limiting Matters

Rate limiting protects the system from:

- buggy frontend loops
- accidental repeated clicks
- attackers
- expensive LLM overuse
- database overload
- file upload abuse

AI endpoints need stricter limits because LLM calls are slower and more expensive.

## 9. ProcIQ Rate Limit Examples

```text
GET /purchase-requests/101
Limit: 300 requests/minute
```

```text
POST /pico/chat
Limit: 20 requests/minute
```

```text
POST /documents/upload
Limit: 10 uploads/minute
```

```text
POST /login
Limit: 5 attempts/minute
```

Different endpoints get different limits because cost and risk are different.

## 10. Redis For Rate Limiting

Redis is often used because it is fast.

Example key:

```text
rate_limit:pico_chat:user_123
```

Value:

```text
18
```

Meaning:

```text
user_123 has used Pico chat 18 times in the current time window.
```

Flow:

```text
Request comes
   -> identify user_id
   -> increase Redis counter
   -> if counter is within limit, allow
   -> if counter is over limit, return 429
```

Blocked response:

```json
{
  "detail": "Rate limit exceeded. Try again later."
}
```

## 11. Simple Summary

API design:

```text
Makes backend endpoints clear and predictable.
```

Rate limiting:

```text
Protects backend from too many requests.
```

ProcIQ short version:

```text
Good APIs make ProcIQ easy to use.
Rate limits keep ProcIQ stable, safe, and cost-controlled.
```

---

# Topic 17: Multi-Tenant Data Filtering

## 1. What Is A Tenant?

A tenant is one customer or company using the same SaaS product.

Example:

```text
tenant_abc = ABC Manufacturing
tenant_xyz = Global Pharma
```

ProcIQ may serve many tenants from the same application.

## 2. What Is Multi-Tenant?

Multi-tenant means:

```text
One application serves many customers.
```

But each customer must see only its own data.

## 3. Why Tenant Filtering Matters

Example table:

| tenant_id | pr_id | title | amount |
|---|---|---|---|
| tenant_abc | 101 | Cisco Router Purchase | 240000 |
| tenant_xyz | 101 | Office Chairs | 35000 |

Both tenants can have `PR-101`.

So this is unsafe:

```sql
SELECT * FROM purchase_requests
WHERE pr_id = 101;
```

Safe query:

```sql
SELECT * FROM purchase_requests
WHERE tenant_id = 'tenant_abc'
AND pr_id = 101;
```

Simple rule:

```text
Always filter tenant-owned data by tenant_id.
```

## 4. API Example

Unsafe API:

```python
def get_pr(pr_id: int):
    return db.get_pr(pr_id)
```

Problem:

```text
User may see another tenant's PR if they guess the ID.
```

Safer API:

```python
def get_pr(pr_id: int, current_user: User):
    return db.get_pr(
        pr_id=pr_id,
        tenant_id=current_user.tenant_id
    )
```

Backend checks:

```text
pr_id + tenant_id
```

## 5. Vector Search Tenant Filtering

Tenant filtering is also required in RAG and vector search.

Vector chunk metadata:

```json
{
  "text": "IT purchases above 100000 require Finance approval.",
  "metadata": {
    "tenant_id": "tenant_abc",
    "document_type": "policy"
  }
}
```

Pico should search:

```text
policy chunks where tenant_id = current_user.tenant_id
```

Never search all tenants together.

Bad result risk:

```text
Pico may answer using another customer's policy.
```

## 6. Redis And Jobs Need Tenant Too

Bad Redis key:

```text
supplier_risk:55
```

Good Redis key:

```text
tenant_abc:supplier_risk:55
```

Bad job payload:

```json
{
  "job_id": "job_123",
  "file_path": "quote.pdf"
}
```

Good job payload:

```json
{
  "job_id": "job_123",
  "tenant_id": "tenant_abc",
  "file_path": "tenant_abc/uploads/quote.pdf"
}
```

## 7. Where Tenant Filtering Is Needed

Use tenant filtering in:

- SQL queries
- vector database searches
- uploaded documents
- background jobs
- Redis cache keys
- notifications
- audit logs
- Pico conversations
- API endpoints

## 8. Database Planning For ProcIQ

For ProcIQ MVP, a practical plan is:

```text
Use one shared database with tenant_id on every tenant-owned table.
```

Example table design:

```text
id UUID PRIMARY KEY
tenant_id UUID NOT NULL
pr_number TEXT NOT NULL
title TEXT
amount NUMERIC
status TEXT
```

Then enforce:

```text
tenant_id + pr_number must be unique.
```

Meaning:

```text
tenant_abc can have PR-101.
tenant_xyz can also have PR-101.
tenant_abc cannot have two PR-101s.
```

## 9. Single DB Vs Separate DB

Single shared database with `tenant_id`:

```text
good for MVP
lower cost
easier migrations
easier reporting
simpler operations
```

Separate database per tenant:

```text
stronger isolation
useful for very large enterprise customers
better for strict compliance needs
more expensive and complex
```

Recommended approach:

```text
Start with shared DB + tenant_id.
Design so large tenants can move to dedicated DB later if needed.
```

## 10. Simple Summary

```text
Tenant = one customer/company.
Multi-tenant = one app serving many customers.
Tenant filtering = always read/search/process only current tenant's data.
```

ProcIQ rule:

```text
Never search, read, cache, or process tenant-owned data without tenant_id.
```

Short version:

```text
tenant_id is the safety boundary between customers.
```

---

# Topic 18: Logging And Monitoring

## 1. Simple Meaning

Logging and monitoring help us understand what the application is doing.

```text
Logging = record what happened.
Monitoring = watch system health over time.
Alerting = notify humans when something is wrong.
```

## 2. What Is Logging?

Logging means writing important events into logs.

Example:

```text
2026-05-12 10:30:01 PR-101 created by user_123
```

Logs help answer:

```text
What happened?
When did it happen?
Who triggered it?
Did it fail?
Why did it fail?
```

## 3. Log Levels

```text
DEBUG    -> detailed developer information
INFO     -> normal important event
WARNING  -> unusual but not fatal
ERROR    -> operation failed
CRITICAL -> serious system failure
```

ProcIQ examples:

```text
INFO: PR-101 created
INFO: PO-5001 dispatched
WARNING: Supplier risk service slow
ERROR: ERP sync failed for PO-5001
CRITICAL: Database unavailable
```

## 4. What To Log In ProcIQ

Good events to log:

- PR created/submitted
- approval completed
- PDF uploaded
- background job started/completed/failed
- ERP sync success/failure
- Pico request started/completed
- rate limit exceeded
- tenant access denied

Example structured log:

```json
{
  "level": "INFO",
  "event": "purchase_request_created",
  "tenant_id": "tenant_abc",
  "pr_id": 101,
  "user_id": "user_123"
}
```

## 5. What Not To Log

Avoid logging sensitive data:

- passwords
- access tokens
- bank account numbers
- full supplier tax IDs
- private document text
- full confidential LLM prompts

Bad:

```text
User password is abc@123
```

Good:

```text
Login failed for user_id=user_123
```

## 6. What Is Monitoring?

Monitoring means continuously watching application health.

It answers:

```text
Is the system healthy?
Is it slow?
Are errors increasing?
Is database slow?
Are background jobs stuck?
```

## 7. Metrics

Metrics are numbers tracked over time.

Examples:

- request count
- error count
- average response time
- CPU usage
- memory usage
- database query time
- background job queue size
- LLM response time
- vector search latency

ProcIQ metrics:

```text
PR creation count per hour
Pico chat latency
PDF processing time
ERP sync failure count
background jobs pending
notification delivery failure count
```

## 8. Alerting

Alerting means notifying the team when something is wrong.

Examples:

```text
ERP sync failure rate > 10%
Pico response time > 20 seconds
background job queue > 500
database CPU > 90%
API error rate > 5%
```

Alerts may go to:

```text
Slack
Teams
email
PagerDuty
monitoring dashboard
```

## 9. Real ProcIQ Example

ERP sync starts failing.

Log:

```json
{
  "level": "ERROR",
  "event": "erp_sync_failed",
  "tenant_id": "tenant_abc",
  "po_id": 5001,
  "error": "SAP timeout"
}
```

Metric:

```text
ERP sync failure rate increased from 1% to 25%.
```

Alert:

```text
ERP sync failure rate above threshold.
```

Team investigates the SAP connector.

## 10. Logging Background Jobs

For background jobs, log each important stage.

Example:

```text
job started
text extraction started
text extraction completed
embedding generation started
vector DB insert completed
draft PR created
job completed
```

If the job fails, include:

```text
job_id
tenant_id
file_id
failed stage
error message
```

## 11. Logging RAG And LLM

For RAG/LLM, log useful metadata:

```text
question received
tenant_id
retrieved chunk IDs
similarity scores
LLM latency
answer generated
```

Avoid logging full sensitive document text unless company policy allows it.

Good log:

```json
{
  "event": "pico_answer_generated",
  "tenant_id": "tenant_abc",
  "retrieved_chunks": ["policy_chunk_001"],
  "llm_latency_ms": 2400
}
```

## 12. Common Tools

Logging:

```text
Python logging
Loguru
structlog
ELK stack: Elasticsearch, Logstash, Kibana
```

Monitoring and metrics:

```text
Prometheus
Grafana
Datadog
New Relic
CloudWatch
Azure Monitor
```

Tracing:

```text
OpenTelemetry
Jaeger
Zipkin
```

Error tracking:

```text
Sentry
Rollbar
Bugsnag
```

## 13. Simple Summary

```text
Logging = what happened?
Monitoring = how healthy is the system?
Alerting = who should be notified when something is wrong?
```

ProcIQ use:

```text
track PR creation
track approvals
track PDF jobs
track ERP sync
track Pico/RAG answers
track errors
track performance
```

Short version:

```text
Logs help debug past events.
Monitoring helps catch live problems.
```

---

# Topic 19: pip And Virtual Environments

## 1. What Is pip?

pip is the tool used to download and install Python packages.

Simple meaning:

```text
pip = app store for Python libraries.
```

You find a package online, install it with pip, and use it in your project.

## 2. Installing A Package

```bash
pip install langchain
pip install langchain-anthropic
pip install mcp
```

After this, your Python code can import and use those packages.

Without `pip install langchain`:

```python
from langchain_anthropic import ChatAnthropic
# Error: No module named 'langchain_anthropic'
```

After `pip install langchain-anthropic`:

```python
from langchain_anthropic import ChatAnthropic
# Works
```

## 3. What Is A Virtual Environment?

A virtual environment is an isolated box for a project's packages.

Simple meaning:

```text
Virtual environment = separate package storage per project.
```

## 4. Why Virtual Environments Are Needed

Real problem:

```text
ProcIQ project needs langchain version 0.1
LangChain MCP project needs langchain version 0.3
```

If both are installed globally:

```text
One overwrites the other.
One project breaks.
```

With virtual environments:

```text
ProcIQ project  -> its own box -> langchain 0.1 inside
MCP project     -> its own box -> langchain 0.3 inside
```

Each project is isolated. No conflict.

## 5. How To Create And Use

Step 1: go to project folder:

```bash
cd d:\learning
```

Step 2: create virtual environment:

```bash
python -m venv venv
```

This creates a `venv` folder inside your project.

Step 3: activate it on Windows:

```bash
venv\Scripts\activate
```

You will see this in the terminal after activation:

```text
(venv) d:\learning>
```

The `(venv)` prefix means the virtual environment is active.

Step 4: install packages inside it:

```bash
pip install langchain langchain-anthropic mcp
```

These packages go into `venv/` only. Not into global Python.

Step 5: deactivate when done:

```bash
deactivate
```

## 6. Real ProcIQ Connection

In ProcIQ development:

```text
d:\prociq\venv  -> has fastapi, pydantic, sqlalchemy, celery, redis
```

In LangChain MCP project:

```text
d:\learning\venv  -> has langchain, mcp, langchain-anthropic
```

Same machine. Two projects. No conflict.

## 7. requirements.txt

When sharing the project with teammates, they need to know which packages to install.

Save all current packages to a file:

```bash
pip freeze > requirements.txt
```

This creates a file like:

```text
langchain==0.3.0
langchain-anthropic==0.2.0
mcp==1.0.0
```

Teammate installs everything:

```bash
pip install -r requirements.txt
```

Exact same packages. Exact same versions. No guessing.

## 8. Simple Summary

```text
pip = install packages.
Virtual environment = isolate packages per project.
requirements.txt = list of packages to share with team.
```

ProcIQ and LangChain projects both use these.

Short version:

```text
One virtual environment per project.
Always activate before installing.
Always save requirements.txt before sharing.
```
