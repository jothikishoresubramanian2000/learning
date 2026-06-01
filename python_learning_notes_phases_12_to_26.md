# Python Learning Notes — Phases 12 to 26

---

# Phase 12: Imports and Modules

## 1. What Is An Import?

Python code lives in files called modules. An import lets one file use code from another file.

```text
Without imports:
You would copy the same function into every file.
Changes to that function would need editing in every file.
```

Python also comes with a standard library — a large collection of built-in modules for common tasks like math, time, random, and file handling.

## 2. Basic Import

```python
import math

result = math.sqrt(16)
print(result)  # 4.0
```

You write the module name, then a dot, then the function name.

## 3. from import

Import only what you need instead of the whole module.

```python
from math import sqrt, pi

result = sqrt(25)
print(result)  # 5.0
print(pi)      # 3.141592653589793
```

No dot needed because the name is now directly in your file.

## 4. Creating Your Own Module

Any Python file is a module. If you have a file called `validators.py`, another file can import from it.

```python
# validators.py

def is_positive_amount(amount):
    return amount > 0

def is_valid_department(dept):
    allowed = ["IT", "Finance", "HR", "Operations"]
    return dept in allowed
```

```python
# main.py

from validators import is_positive_amount, is_valid_department

print(is_positive_amount(5000))     # True
print(is_valid_department("IT"))    # True
print(is_valid_department("Magic")) # False
```

Both files must be in the same folder, or in a folder Python knows about.

## 5. if \_\_name\_\_ == "\_\_main\_\_"

When Python runs a file directly, it sets a special variable `__name__` to the string `"__main__"`.

When a file is imported by another file, `__name__` is set to the module name instead.

This block lets you write test code that only runs when the file is run directly, not when it is imported.

```python
# validators.py

def is_positive_amount(amount):
    return amount > 0

if __name__ == "__main__":
    # This block only runs when you run: python validators.py
    # It does NOT run when another file imports validators
    print(is_positive_amount(100))   # True
    print(is_positive_amount(-50))   # False
```

## 6. ProcIQ Example

ProcIQ can organise validation logic into separate modules.

```python
# pr_validators.py

def is_amount_within_limit(amount, limit):
    return amount <= limit

def is_supplier_code_valid(code):
    return code.startswith("SUP-") and len(code) > 4

if __name__ == "__main__":
    print(is_amount_within_limit(5000, 10000))  # True
    print(is_supplier_code_valid("SUP-CISCO"))  # True
    print(is_supplier_code_valid("CISCO"))      # False
```

```python
# process_pr.py

from pr_validators import is_amount_within_limit, is_supplier_code_valid

pr = {
    "pr_id": "PR-101",
    "amount": 5000,
    "supplier_code": "SUP-CISCO",
}

amount_ok = is_amount_within_limit(pr["amount"], 10000)
supplier_ok = is_supplier_code_valid(pr["supplier_code"])

print(f"Amount valid: {amount_ok}")
print(f"Supplier valid: {supplier_ok}")
```

## 7. Simple Summary

Imports let you split code across files and reuse it cleanly.

Short version:

```text
import module              -> use module.function()
from module import fn      -> use fn() directly
if __name__ == "__main__"  -> run this only when file is run directly, not when imported
```

---

# Phase 13: Files and JSON

## 1. What Is File Handling?

Programs often need to read data from a file or save data to a file. Python has built-in tools for this.

```text
Without file handling:
Data only exists while the program runs.
When the program stops, all data is lost.
```

## 2. open() and the with Statement

`open()` opens a file. The `with` statement makes sure the file is always closed properly, even if an error happens.

```python
with open("notes.txt", "w") as f:
    f.write("This is a note.")
```

Common modes:

```text
"r"  -> read (default)
"w"  -> write (creates new file, overwrites existing)
"a"  -> append (adds to end of existing file)
```

## 3. Reading and Writing Text

Write to a file:

```python
with open("log.txt", "w") as f:
    f.write("PR-101 submitted\n")
    f.write("PR-102 approved\n")
```

Read the whole file:

```python
with open("log.txt", "r") as f:
    content = f.read()
    print(content)
```

Read line by line:

```python
with open("log.txt", "r") as f:
    for line in f:
        print(line.strip())
```

## 4. JSON Files

JSON is the standard format for storing and sending structured data. Python has a built-in `json` module.

```text
json.dump   -> write Python dict/list to a JSON file
json.load   -> read a JSON file into a Python dict/list
json.dumps  -> convert Python dict/list to a JSON string
json.loads  -> convert a JSON string into a Python dict/list
```

Write a dict to a JSON file:

```python
import json

pr_data = {
    "pr_id": "PR-101",
    "department": "IT",
    "amount": 5000,
    "approved": False,
}

with open("pr_101.json", "w") as f:
    json.dump(pr_data, f, indent=2)
```

Read a JSON file back:

```python
import json

with open("pr_101.json", "r") as f:
    pr = json.load(f)

print(pr["pr_id"])     # PR-101
print(pr["amount"])    # 5000
```

## 5. json.dumps and json.loads (Strings, Not Files)

Use these when working with JSON as a string, not a file. This is common when sending data over HTTP or logging.

```python
import json

pr = {"pr_id": "PR-101", "amount": 5000}

# Dict to string
pr_string = json.dumps(pr, indent=2)
print(pr_string)

# String back to dict
pr_again = json.loads(pr_string)
print(pr_again["pr_id"])  # PR-101
```

## 6. ProcIQ Example

ProcIQ can save a submitted PR to a JSON file and reload it later.

```python
import json

def save_pr(pr):
    filename = f"{pr['pr_id']}.json"
    with open(filename, "w") as f:
        json.dump(pr, f, indent=2)
    print(f"Saved {filename}")

def load_pr(pr_id):
    filename = f"{pr_id}.json"
    with open(filename, "r") as f:
        return json.load(f)

pr = {
    "pr_id": "PR-101",
    "department": "IT",
    "item": "Cisco Router",
    "amount": 5000,
}

save_pr(pr)
loaded = load_pr("PR-101")
print(loaded["item"])  # Cisco Router
```

## 7. Simple Summary

Files let you persist data. JSON lets you save structured data cleanly.

Short version:

```text
open() + with  -> always use with so the file closes safely
json.dump      -> dict to file
json.load      -> file to dict
json.dumps     -> dict to string
json.loads     -> string to dict
```

---

# Phase 14: Errors and Exceptions

## 1. What Are Exceptions?

An exception is an error that happens while the program is running. Without handling exceptions, the program crashes and stops.

```text
Without exception handling:
A bad input or missing file crashes the whole program.
The user sees a raw Python traceback.
```

## 2. try / except

Wrap risky code in a `try` block. If an error happens, the `except` block runs instead of crashing.

```python
try:
    amount = int("not a number")
except ValueError:
    print("That is not a valid number.")
```

## 3. Catching Specific Errors

Always catch the specific error type when you know what can go wrong.

```python
try:
    with open("pr_101.json", "r") as f:
        data = f.read()
except FileNotFoundError:
    print("File not found. Check the PR ID.")
```

## 4. Common Exception Types

```text
ValueError        -> wrong value type, e.g. int("abc")
TypeError         -> wrong data type used
KeyError          -> dict key does not exist
IndexError        -> list index out of range
FileNotFoundError -> file does not exist
ZeroDivisionError -> dividing by zero
AttributeError    -> object does not have that attribute
```

## 5. else and finally

`else` runs if no exception happened. `finally` always runs regardless.

```python
try:
    amount = int("5000")
except ValueError:
    print("Invalid amount.")
else:
    print(f"Amount is valid: {amount}")
finally:
    print("Validation step complete.")
```

Output:

```text
Amount is valid: 5000
Validation step complete.
```

## 6. raise

Use `raise` to trigger an exception on purpose when your own rules are broken.

```python
def validate_amount(amount):
    if amount <= 0:
        raise ValueError("Amount must be greater than zero.")
    return True

try:
    validate_amount(-100)
except ValueError as e:
    print(f"Validation failed: {e}")
```

## 7. ProcIQ Example

```python
import json

def load_pr(pr_id):
    filename = f"{pr_id}.json"
    try:
        with open(filename, "r") as f:
            pr = json.load(f)
    except FileNotFoundError:
        print(f"PR file not found: {filename}")
        return None
    except json.JSONDecodeError:
        print(f"PR file is corrupted: {filename}")
        return None

    if pr.get("amount", 0) <= 0:
        raise ValueError(f"PR {pr_id} has an invalid amount.")

    return pr

result = load_pr("PR-101")
if result:
    print(f"Loaded: {result['pr_id']}")
```

## 8. Simple Summary

Exceptions let the program handle errors gracefully instead of crashing.

Short version:

```text
try              -> run risky code here
except SomeError -> handle that specific error
else             -> runs only if no error happened
finally          -> always runs, good for cleanup
raise            -> trigger an error on purpose
```

---

# Phase 15: Classes

## 1. What Is A Class?

A function does work. A class is an object that holds data and the functions that work on that data together.

The score tracker analogy:

```text
Function version:
You hold the bag of data outside.
You pass it to every function manually.

Class version:
The object holds its own bag of data inside.
The object's methods work on that data directly.
```

## 2. Function Version vs Class Version

Function version — you pass data everywhere:

```python
score = 0

def add_point(current_score):
    return current_score + 1

def reset_score(current_score):
    return 0

score = add_point(score)
score = add_point(score)
print(score)  # 2
```

Class version — the object holds the data:

```python
class ScoreTracker:
    def __init__(self):
        self.score = 0

    def add_point(self):
        self.score += 1

    def reset(self):
        self.score = 0

tracker = ScoreTracker()
tracker.add_point()
tracker.add_point()
print(tracker.score)  # 2
```

## 3. \_\_init\_\_ and self

`__init__` is the constructor. It runs automatically when you create an object from the class.

`self` refers to the current object. Every method takes `self` as its first argument.

```python
class PRTracker:
    def __init__(self, pr_id, department):
        self.pr_id = pr_id
        self.department = department
        self.status = "Pending"

    def approve(self):
        self.status = "Approved"

    def reject(self):
        self.status = "Rejected"

    def summary(self):
        return f"{self.pr_id} | {self.department} | {self.status}"
```

Creating objects:

```python
pr1 = PRTracker("PR-101", "IT")
pr2 = PRTracker("PR-102", "Finance")

pr1.approve()
pr2.reject()

print(pr1.summary())  # PR-101 | IT | Approved
print(pr2.summary())  # PR-102 | Finance | Rejected
```

Each object has its own separate data. `pr1` and `pr2` do not share state.

## 4. Class Inside Class

One class can hold another class as an attribute. This is common when a larger object is made of smaller objects.

```python
class Supplier:
    def __init__(self, code, name):
        self.code = code
        self.name = name

    def info(self):
        return f"{self.code}: {self.name}"


class PurchaseRequest:
    def __init__(self, pr_id, amount, supplier):
        self.pr_id = pr_id
        self.amount = amount
        self.supplier = supplier  # a Supplier object lives inside here
        self.status = "Pending"

    def summary(self):
        return f"{self.pr_id} | Amount: {self.amount} | Supplier: {self.supplier.info()}"


supplier = Supplier("SUP-CISCO", "Cisco India")
pr = PurchaseRequest("PR-101", 240000, supplier)

print(pr.summary())
# PR-101 | Amount: 240000 | Supplier: SUP-CISCO: Cisco India
```

## 5. Simple Summary

A class bundles data and the functions that work on that data into one object.

Short version:

```text
class MyClass:        -> defines the blueprint
__init__(self, ...)   -> runs when object is created, sets starting data
self.x = value        -> stores data on the object
def method(self):     -> a function belonging to the object
obj = MyClass(...)    -> creates an actual object from the blueprint
```

---

# Phase 16: Backend-Ready Python

## 1. Type Hints

Type hints let you annotate what type a variable or function parameter should be. Python does not enforce them at runtime, but editors and tools like Pydantic use them.

```python
def validate_pr(amount: int, department: str) -> bool:
    allowed = ["IT", "Finance", "HR"]
    return amount > 0 and department in allowed

result: bool = validate_pr(5000, "IT")
print(result)  # True
```

```text
: int      -> this parameter should be an integer
-> bool    -> this function should return a bool
Tools use these hints to catch mistakes before runtime.
Python itself does not raise an error if you pass the wrong type.
```

## 2. Pydantic Basics

Pydantic enforces type hints at runtime. It is used heavily in FastAPI for request and response validation.

```python
from pydantic import BaseModel, ValidationError

class PurchaseRequest(BaseModel):
    pr_id: str
    department: str
    amount: int
    approved: bool = False

# Valid data
pr = PurchaseRequest(pr_id="PR-101", department="IT", amount=5000)
print(pr.pr_id)    # PR-101
print(pr.amount)   # 5000
print(pr.approved) # False

# Invalid data
try:
    bad_pr = PurchaseRequest(pr_id="PR-102", department="IT", amount="not a number")
except ValidationError as e:
    print(e)
```

Pydantic raises `ValidationError` immediately if the data does not match. This is much better than finding out later when the bad data breaks something deeper in the code.

## 3. Generators and yield

A normal function returns all results at once. A generator function uses `yield` to return one value at a time. The next value is only computed when asked for.

```python
import time

def pr_approval_steps(pr_id):
    steps = [
        "Checking budget",
        "Validating supplier",
        "Running policy check",
        "Sending to approver",
    ]
    for step in steps:
        time.sleep(0.5)  # simulate work
        yield step

for step in pr_approval_steps("PR-101"):
    print(step)
```

Using `next()` manually:

```python
gen = pr_approval_steps("PR-101")
print(next(gen))  # Checking budget
print(next(gen))  # Validating supplier
```

```text
Generators are useful when:
- Processing a large list one item at a time
- Streaming responses step by step
- You want to pause and resume work
```

## 4. Environment Variables

Never hardcode API keys, database passwords, or secrets directly in code. Use environment variables instead.

```python
import os

groq_api_key = os.environ.get("GROQ_API_KEY")
db_url = os.environ.get("DATABASE_URL", "sqlite:///default.db")

if groq_api_key is None:
    raise ValueError("GROQ_API_KEY is not set in environment.")
```

A `.env` file stores secrets locally. Use the `python-dotenv` library to load it.

```text
# .env file (never commit this to git)
GROQ_API_KEY=gsk_abc123yourkeyhere
DATABASE_URL=postgresql://user:pass@localhost/prociq
```

```python
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env file into environment

groq_api_key = os.environ.get("GROQ_API_KEY")
print(groq_api_key)
```

## 5. Logging

`print()` is for development. `logging` is for production. Logging adds timestamps, severity levels, and can be redirected to files.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger(__name__)

logger.info("PR-101 submitted by user jsmith")
logger.warning("PR-102 amount is close to department limit")
logger.error("PR-103 failed validation: supplier not found")
```

Output:

```text
2026-05-28 10:00:01,234 | INFO    | PR-101 submitted by user jsmith
2026-05-28 10:00:01,235 | WARNING | PR-102 amount is close to department limit
2026-05-28 10:00:01,236 | ERROR   | PR-103 failed validation: supplier not found
```

```text
INFO     -> normal operation, what is happening
WARNING  -> something unusual, not a crash but worth noting
ERROR    -> something went wrong and needs attention
```

## 6. Simple Summary

These five tools make Python code production-ready.

Short version:

```text
Type hints         -> annotate types, tools catch mistakes, not enforced at runtime
Pydantic           -> enforces types at runtime, raises ValidationError on bad data
Generators/yield   -> one value at a time, good for streaming and large data
Environment vars   -> secrets live outside code, loaded from .env with dotenv
Logging            -> timestamps and severity levels, replaces print() in production
```

---

# Phase 17: JSON Deep Dive

## 1. Nested Dict Access

Real API responses and PR data are nested. Access nested values by chaining square brackets.

```python
pr = {
    "pr_id": "PR-101",
    "requester": {
        "name": "James Smith",
        "department": "IT",
        "email": "jsmith@company.com",
    },
    "amount": 5000,
}

print(pr["requester"]["name"])       # James Smith
print(pr["requester"]["department"]) # IT
```

Each `[]` goes one level deeper into the structure.

## 2. List of Dicts

A common pattern is a list where each item is a dict — for example, a list of line items in a PR.

```python
line_items = [
    {"item": "Cisco Router", "qty": 2, "unit_price": 80000},
    {"item": "Network Cable", "qty": 10, "unit_price": 500},
    {"item": "Rack Mount",    "qty": 1, "unit_price": 15000},
]

# Access by index + key
print(line_items[0]["item"])       # Cisco Router
print(line_items[1]["unit_price"]) # 500
```

## 3. Looping Nested Structures

Loop through a list of dicts to process each item.

```python
line_items = [
    {"item": "Cisco Router", "qty": 2, "unit_price": 80000},
    {"item": "Network Cable", "qty": 10, "unit_price": 500},
    {"item": "Rack Mount",    "qty": 1, "unit_price": 15000},
]

total = 0
for item in line_items:
    line_total = item["qty"] * item["unit_price"]
    print(f"{item['item']}: {line_total}")
    total += line_total

print(f"Total: {total}")
```

Output:

```text
Cisco Router: 160000
Network Cable: 5000
Rack Mount: 15000
Total: 180000
```

## 4. Missing Keys with .get()

Using `[]` on a missing key raises a `KeyError`. Using `.get()` returns `None` (or a default you choose) instead of crashing.

```python
pr = {
    "pr_id": "PR-101",
    "amount": 5000,
}

# This crashes if key is missing
# print(pr["notes"])  -> KeyError

# This is safe
notes = pr.get("notes")
print(notes)  # None

# With a default value
notes = pr.get("notes", "No notes provided.")
print(notes)  # No notes provided.
```

## 5. Building API Payloads

When sending data to an API, you build a dict and convert it to a formatted JSON string with `json.dumps`.

```python
import json

payload = {
    "pr_id": "PR-101",
    "department": "IT",
    "requester": "jsmith",
    "line_items": [
        {"item": "Cisco Router", "qty": 2, "unit_price": 80000},
        {"item": "Network Cable", "qty": 10, "unit_price": 500},
    ],
    "total": 165000,
    "status": "Pending",
}

formatted = json.dumps(payload, indent=2)
print(formatted)
```

Output:

```text
{
  "pr_id": "PR-101",
  "department": "IT",
  "requester": "jsmith",
  "line_items": [
    {
      "item": "Cisco Router",
      "qty": 2,
      "unit_price": 80000
    },
    {
      "item": "Network Cable",
      "qty": 10,
      "unit_price": 500
    }
  ],
  "total": 165000,
  "status": "Pending"
}
```

## 6. Simple Summary

Nested JSON is everywhere in APIs. Know how to read it, loop it, and build it safely.

Short version:

```text
pr["key"]["subkey"]     -> access nested value
list[0]["key"]          -> access item in list of dicts
for item in list        -> loop through list of dicts
.get("key", default)    -> safe access, no crash if key missing
json.dumps(data, indent=2) -> build readable JSON string for API payloads
```

---

# Phase 18: HTTP and External APIs

## 1. What Is HTTP?

HTTP is the language computers use to talk to each other over the internet. When ProcIQ calls an ERP system or an AI model, it uses HTTP.

```text
GET   -> ask for data (read)
POST  -> send data to create or trigger something (write/action)
```

## 2. Status Codes

Every HTTP response includes a status code that tells you what happened.

```text
200  -> OK — request succeeded, data returned
201  -> Created — resource was created successfully
400  -> Bad Request — you sent wrong or missing data
401  -> Unauthorized — no valid API key or login
404  -> Not Found — the resource does not exist
500  -> Internal Server Error — something broke on the server side
```

## 3. The requests Library

`requests` is the standard Python library for making HTTP calls. Install it with `pip install requests`.

GET request:

```python
import requests

response = requests.get("https://api.example.com/suppliers/SUP-CISCO")
print(response.status_code)  # 200
print(response.json())       # dict from JSON response
```

GET with API key in headers:

```python
import requests

headers = {
    "Authorization": "Bearer your_api_key_here",
    "Content-Type": "application/json",
}

response = requests.get(
    "https://api.example.com/suppliers/SUP-CISCO",
    headers=headers,
)

print(response.json())
```

POST with JSON body:

```python
import requests

pr_data = {
    "pr_id": "PR-101",
    "department": "IT",
    "amount": 5000,
}

response = requests.post(
    "https://api.example.com/purchase-requests",
    json=pr_data,
    headers={"Authorization": "Bearer your_api_key_here"},
)

print(response.status_code)  # 201
print(response.json())
```

## 4. raise_for_status() and Error Handling

`raise_for_status()` raises an exception automatically if the status code is 4xx or 5xx. Use it so you do not silently ignore errors.

```python
import requests

try:
    response = requests.get("https://api.example.com/suppliers/SUP-CISCO")
    response.raise_for_status()
    supplier = response.json()
    print(supplier)
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e}")
except requests.exceptions.ConnectionError:
    print("Could not connect to the API.")
```

## 5. httpx for Async HTTP

The standard `requests` library is synchronous. For async code, use `httpx`.

```python
import httpx
import asyncio

async def check_supplier(supplier_code):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.example.com/suppliers/{supplier_code}",
            headers={"Authorization": "Bearer your_api_key_here"},
        )
        response.raise_for_status()
        return response.json()

async def main():
    # Check multiple suppliers at the same time
    results = await asyncio.gather(
        check_supplier("SUP-CISCO"),
        check_supplier("SUP-DELL"),
        check_supplier("SUP-HP"),
    )
    for r in results:
        print(r)

asyncio.run(main())
```

```text
requests    -> sync HTTP, simple scripts and tools
httpx       -> async HTTP, use in FastAPI or when calling multiple APIs at once
```

## 6. Simple Summary

HTTP is how backend services talk to each other. Python makes it easy with requests and httpx.

Short version:

```text
requests.get(url)              -> fetch data
requests.post(url, json=data)  -> send data
headers={"Authorization": ...} -> pass API key
raise_for_status()             -> crash loudly if response is an error
httpx + AsyncClient            -> async version for FastAPI and parallel calls
```

---

# Phase 19: FastAPI Basics

## 1. What Is FastAPI?

FastAPI is a Python framework for building backend APIs. When a frontend button is clicked, FastAPI receives the request, runs Python logic, and returns a JSON response.

```text
Frontend screen
  -> HTTP request
  -> FastAPI endpoint
  -> Python logic
  -> JSON response
  -> Frontend updates
```

Install: `pip install fastapi uvicorn`

## 2. First Endpoint

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "ProcIQ API is running."}
```

Run with: `uvicorn main:app --reload`

Returning a dict from a FastAPI function automatically becomes a JSON response.

## 3. Path Parameters

```python
@app.get("/purchase-requests/{pr_id}")
def get_pr(pr_id: str):
    # In a real app, fetch from database here
    return {
        "pr_id": pr_id,
        "department": "IT",
        "amount": 5000,
        "status": "Pending",
    }
```

The value in `{pr_id}` in the URL path becomes the `pr_id` parameter in the function.

## 4. Request Body with Pydantic

Use a Pydantic model to define what data a POST endpoint expects.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class PRCreateRequest(BaseModel):
    department: str
    item: str
    amount: int
    supplier_code: str

@app.post("/purchase-requests")
def create_pr(pr: PRCreateRequest):
    # FastAPI validates the request body automatically using the model
    return {
        "pr_id": "PR-201",
        "department": pr.department,
        "amount": pr.amount,
        "status": "Submitted",
    }
```

If the request body does not match the model, FastAPI returns a `422` error automatically.

## 5. HTTPException for 404

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

fake_db = {
    "PR-101": {"pr_id": "PR-101", "department": "IT", "amount": 5000},
}

@app.get("/purchase-requests/{pr_id}")
def get_pr(pr_id: str):
    pr = fake_db.get(pr_id)
    if pr is None:
        raise HTTPException(status_code=404, detail=f"PR {pr_id} not found.")
    return pr
```

## 6. async def Endpoints

FastAPI supports both `def` and `async def` endpoints. Using `async def` is important for I/O-heavy work.

```python
import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()

@app.get("/purchase-requests/{pr_id}/validate")
async def validate_pr(pr_id: str):
    async with httpx.AsyncClient() as client:
        # While this waits for the external API, other requests can be served
        response = await client.get(f"https://api.erp.com/budget/{pr_id}")
    return {"pr_id": pr_id, "budget_status": response.json()}
```

```text
With async def:
100 users send requests at the same time.
One LLM call takes 3 seconds.
The other 99 users do not freeze and wait.
Python handles them while the first request is waiting.

With regular def:
100 users send requests.
One LLM call takes 3 seconds.
Other users wait in line.
```

## 7. /docs Interactive Testing

FastAPI generates automatic interactive documentation at `/docs`. You can test every endpoint directly in the browser without writing any test client code.

```text
http://localhost:8000/docs
```

## 8. Simple Summary

FastAPI makes it fast to build a backend API with automatic validation and documentation.

Short version:

```text
@app.get("/path")        -> GET endpoint
@app.post("/path")       -> POST endpoint
{pr_id} in path          -> path parameter, becomes function argument
BaseModel                -> defines expected request body shape
HTTPException(404, ...)  -> return a proper error response
async def                -> non-blocking, handles many users at once
/docs                    -> automatic interactive API docs in browser
```

---

# Phase 20: AI Engineering

## 1. Prompt Design

A well-structured prompt has three parts: role, context, and task.

```text
Role    -> who is the AI in this situation
Context -> relevant data about the current request
Task    -> exactly what you want the AI to do
```

```python
def build_pr_review_prompt(pr: dict, policy_rules: list) -> str:
    rules_text = "\n".join(f"- {rule}" for rule in policy_rules)
    return f"""You are ProcIQ's procurement policy assistant.

Context:
PR ID: {pr['pr_id']}
Department: {pr['department']}
Amount: {pr['amount']}
Supplier: {pr['supplier']}

Policy Rules:
{rules_text}

Task:
Review the above PR against the policy rules.
Return a JSON object with: approved (bool), reason (str), risk_level (str: Low/Medium/High).
"""
```

Rules are injected from a policy store rather than hardcoded into the prompt. This allows policy changes without modifying code.

## 2. Groq API Call

```python
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def ask_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content
```

## 3. Multi-Turn Conversation

Store conversation history per PR ID. Append each user message and assistant reply to keep context across turns.

```python
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# One list of messages per PR
conversation_store: dict = {}

def chat_with_pr(pr_id: str, user_message: str) -> str:
    if pr_id not in conversation_store:
        conversation_store[pr_id] = [
            {"role": "system", "content": "You are Pico, ProcIQ's procurement assistant."},
        ]

    conversation_store[pr_id].append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=conversation_store[pr_id],
    )

    assistant_reply = response.choices[0].message.content
    conversation_store[pr_id].append({"role": "assistant", "content": assistant_reply})

    return assistant_reply

print(chat_with_pr("PR-101", "What is the status of this PR?"))
print(chat_with_pr("PR-101", "Why was it flagged?"))
```

## 4. Structured Output

Force the LLM to return JSON by requesting it in the prompt, then parse and validate.

```python
import json
from pydantic import BaseModel
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class PRReviewResult(BaseModel):
    approved: bool
    reason: str
    risk_level: str

def review_pr(pr: dict) -> PRReviewResult:
    prompt = f"""
Review this purchase request and return ONLY valid JSON.
PR ID: {pr['pr_id']}
Amount: {pr['amount']}
Department: {pr['department']}

Return format:
{{"approved": true or false, "reason": "short reason", "risk_level": "Low" or "Medium" or "High"}}
"""
    raw = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
    ).choices[0].message.content

    data = json.loads(raw)
    return PRReviewResult(**data)
```

## 5. Async Parallel LLM Calls

The Groq client is synchronous. Use `asyncio.to_thread` to run it in a thread pool without blocking the event loop. Use `asyncio.gather` to run multiple calls at the same time.

```python
import asyncio
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def review_pr_sync(pr_id: str) -> str:
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": f"Review PR {pr_id} for policy compliance."}],
    )
    return response.choices[0].message.content

async def review_pr_async(pr_id: str) -> str:
    return await asyncio.to_thread(review_pr_sync, pr_id)

async def main():
    pr_ids = ["PR-101", "PR-102", "PR-103"]
    results = await asyncio.gather(*[review_pr_async(pr_id) for pr_id in pr_ids])
    for pr_id, result in zip(pr_ids, results):
        print(f"{pr_id}: {result[:80]}")

asyncio.run(main())
```

## 6. Logging Agent Reasoning

Log every step the AI agent takes so you can trace decisions later.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

def process_pr_with_logging(pr: dict):
    logger.info(f"Starting review for {pr['pr_id']}")
    logger.info(f"Department: {pr['department']} | Amount: {pr['amount']}")

    if pr["amount"] > 100000:
        logger.warning(f"{pr['pr_id']} amount exceeds threshold — escalating to CFO")
    else:
        logger.info(f"{pr['pr_id']} amount within normal range")

    logger.info(f"Calling LLM for policy review on {pr['pr_id']}")
    # llm_result = review_pr(pr)

    logger.info(f"Review complete for {pr['pr_id']}")
```

## 7. Simple Summary

AI engineering is prompt design plus API calls plus structured parsing plus careful logging.

Short version:

```text
Prompt = role + context + task   -> structured prompts give better results
Groq client                      -> choices[0].message.content is the reply
conversation_store per pr_id     -> append user+assistant messages for multi-turn
json.loads + Pydantic            -> parse and validate LLM JSON output
asyncio.to_thread + gather       -> run sync Groq client calls in parallel
logger.info / warning            -> trace every step of the agent for debugging
```

---

# Phase 26: Design Patterns

---

## Registry Pattern

### 1. What Is The Registry Pattern?

The Registry Pattern is a central dictionary that maps a key to a handler function. When data arrives, you look up the key in the registry and call the correct handler.

```text
Registry = a dict where:
  key   -> category name or event type
  value -> the function that handles that category
```

### 2. Problem Without It

Without a registry, routing logic grows into a long if/elif chain. Every new category adds another branch.

```python
def handle_pr(pr):
    if pr["category"] == "IT":
        handle_it_pr(pr)
    elif pr["category"] == "Office":
        handle_office_pr(pr)
    elif pr["category"] == "Facilities":
        handle_facilities_pr(pr)
    elif pr["category"] == "Catering":
        handle_catering_pr(pr)
    # ... 20 more categories
    else:
        raise ValueError(f"Unknown category: {pr['category']}")
```

Adding a new category means editing this function every time.

### 3. Implementation

```python
def handle_it_pr(pr):
    print(f"IT handler: checking software licences for {pr['pr_id']}")

def handle_office_pr(pr):
    print(f"Office handler: checking stationery catalogue for {pr['pr_id']}")

def handle_facilities_pr(pr):
    print(f"Facilities handler: routing to building management for {pr['pr_id']}")

# The registry — add new categories here without touching routing logic
PR_HANDLER_REGISTRY = {
    "IT":         handle_it_pr,
    "Office":     handle_office_pr,
    "Facilities": handle_facilities_pr,
}

def route_pr(pr):
    category = pr["category"]
    handler = PR_HANDLER_REGISTRY.get(category)
    if handler is None:
        raise ValueError(f"No handler registered for category: {category}")
    handler(pr)

pr = {"pr_id": "PR-101", "category": "IT", "amount": 5000}
route_pr(pr)
# IT handler: checking software licences for PR-101
```

Adding a new category only requires adding one line to the registry dict.

### 4. ProcIQ Example

ProcIQ S13 Branching Gate: when a PR arrives, its category determines which validation pipeline runs.

```python
def it_pipeline(pr):
    print(f"[{pr['pr_id']}] IT pipeline: licence check -> vendor risk -> budget")

def finance_pipeline(pr):
    print(f"[{pr['pr_id']}] Finance pipeline: cost centre -> approval matrix -> audit")

def hr_pipeline(pr):
    print(f"[{pr['pr_id']}] HR pipeline: headcount check -> position validation")

PIPELINE_REGISTRY = {
    "IT":      it_pipeline,
    "Finance": finance_pipeline,
    "HR":      hr_pipeline,
}

def run_s13_branching_gate(pr):
    pipeline = PIPELINE_REGISTRY.get(pr["category"])
    if pipeline is None:
        raise ValueError(f"Unknown category: {pr['category']}")
    pipeline(pr)

prs = [
    {"pr_id": "PR-101", "category": "IT"},
    {"pr_id": "PR-102", "category": "Finance"},
    {"pr_id": "PR-103", "category": "HR"},
]

for pr in prs:
    run_s13_branching_gate(pr)
```

### 5. Simple Summary

Registry replaces if/elif chains with a dict lookup. Adding a new category is one line.

Short version:

```text
Registry = dict of {key: function}
route(data) -> looks up key -> calls function
New category? Add one line to the dict.
No need to touch routing logic.
```

---

## Factory Pattern

### 1. What Is The Factory Pattern?

The Factory Pattern is one function that creates and returns different objects based on an input value. The caller asks for an object by name and gets back the right one.

```text
Factory function = "give me the right object for this situation"
The caller does not need to know how each object is built.
```

### 2. Problem Without It

Without a factory, every file creates its own LLM client directly. Switching provider means editing every file.

```python
# File 1: pr_review.py
from groq import Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
response = client.chat.completions.create(...)

# File 2: dedup_check.py
from groq import Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
response = client.chat.completions.create(...)

# File 3: policy_check.py
from groq import Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
response = client.chat.completions.create(...)
```

To switch from Groq to OpenAI, you must edit every file.

### 3. Implementation

```python
import os

class GroqLLM:
    def __init__(self):
        from groq import Groq
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    def ask(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content


class OpenAILLM:
    def __init__(self):
        from openai import OpenAI
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def ask(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content


def create_llm(provider: str):
    if provider == "groq":
        return GroqLLM()
    elif provider == "openai":
        return OpenAILLM()
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")
```

Every file that needs an LLM now does this:

```python
from llm_factory import create_llm

llm = create_llm("groq")
result = llm.ask("Review PR-101 for policy compliance.")
print(result)
```

To switch to OpenAI, change `"groq"` to `"openai"` in one place — or read the provider from an environment variable.

### 4. ProcIQ Example

ProcIQ can read the LLM provider from environment and create the right client once at startup.

```python
import os
from llm_factory import create_llm

provider = os.environ.get("LLM_PROVIDER", "groq")
llm = create_llm(provider)

# Now all modules use this shared llm object
print(llm.ask("What is the budget policy for IT department?"))
```

Switching from Groq to OpenAI: add the new class and change the `.env` file. Zero other changes.

### 5. Simple Summary

Factory creates the right object based on input. All callers share the same interface.

Short version:

```text
Factory = one function that returns different objects
All objects share the same interface (.ask(), .check(), etc.)
Switching provider = change one place, not 20 files
```

---

## Strategy Pattern

### 1. What Is The Strategy Pattern?

The Strategy Pattern lets you plug in different behaviour into the same code. The caller does not know or care which strategy is active — it just calls the same method.

```text
Strategy = a swappable behaviour object
Same call signature, different logic inside
Swap the strategy without changing the caller
```

### 2. Problem Without It

Without strategies, behaviour differences pile up as if/elif blocks that grow with every new category.

```python
def check_duplicate(pr, existing_prs):
    if pr["category"] == "IT":
        # fuzzy match because IT items get repriced often
        for existing in existing_prs:
            if similar_text(pr["item"], existing["item"]):
                return True
    elif pr["category"] == "Office":
        # exact match for stationery
        for existing in existing_prs:
            if pr["item"] == existing["item"]:
                return True
    elif pr["category"] == "Facilities":
        # different logic again...
        pass
    # keeps growing
```

### 3. Implementation

```python
class ExactMatchStrategy:
    def check(self, item_a: str, item_b: str) -> bool:
        return item_a.strip().lower() == item_b.strip().lower()


class FuzzyMatchStrategy:
    def check(self, item_a: str, item_b: str) -> bool:
        # Simple word overlap for demo purposes
        words_a = set(item_a.lower().split())
        words_b = set(item_b.lower().split())
        overlap = words_a & words_b
        return len(overlap) / max(len(words_a), len(words_b)) > 0.6


class DedupChecker:
    def __init__(self, strategy):
        self.strategy = strategy

    def is_duplicate(self, new_item: str, existing_items: list) -> bool:
        for item in existing_items:
            if self.strategy.check(new_item, item):
                return True
        return False


existing = ["Cisco Router Model X", "Dell Laptop 15 inch", "Office Chair Black"]

it_checker = DedupChecker(strategy=FuzzyMatchStrategy())
print(it_checker.is_duplicate("Cisco Router", existing))        # True (fuzzy match)

office_checker = DedupChecker(strategy=ExactMatchStrategy())
print(office_checker.is_duplicate("Office Chair Black", existing))  # True (exact match)
print(office_checker.is_duplicate("office chair black", existing))  # True (normalised)
```

### 4. ProcIQ Example

IT items get repriced often — "Cisco Router Model X" and "Cisco Router" should be flagged as duplicates. Office stationery must match exactly.

```python
DEDUP_STRATEGIES = {
    "IT":         FuzzyMatchStrategy(),
    "Office":     ExactMatchStrategy(),
    "Facilities": ExactMatchStrategy(),
}

def check_pr_for_duplicate(pr: dict, existing_items: list) -> bool:
    strategy = DEDUP_STRATEGIES.get(pr["category"], ExactMatchStrategy())
    checker = DedupChecker(strategy=strategy)
    return checker.is_duplicate(pr["item"], existing_items)

pr = {"pr_id": "PR-201", "category": "IT", "item": "Cisco Router"}
existing = ["Cisco Router Model X", "Dell Laptop"]
print(check_pr_for_duplicate(pr, existing))  # True
```

### 5. Simple Summary

Strategy injects the right behaviour into a shared piece of code. Adding a new strategy does not change the caller.

Short version:

```text
Strategy = a class with one key method (.check(), .run(), etc.)
DedupChecker takes a strategy object
Different strategies for different categories
Caller code does not change when new strategies are added
```

---

# Pattern Comparison: Registry vs Factory vs Strategy

## 1. What Each Pattern Does

```text
Registry   -> look up by key at runtime, route data to correct handler
Factory    -> create the right object once based on configuration
Strategy   -> inject a behaviour into shared code, swap per situation
```

## 2. Question To Ask

```text
Question                                   -> Pattern to use
-------------------------------------------+-------------------
Which object should I create?             -> Factory
Which behaviour should I use for this?    -> Strategy
Which handler should process this data?   -> Registry
```

## 3. ProcIQ Examples

```text
Registry  -> PR arrives with category "IT" -> registry looks up IT pipeline -> runs it
Factory   -> LLM_PROVIDER=groq in .env    -> factory creates GroqLLM once at startup
Strategy  -> IT dedup uses FuzzyMatch     -> Office dedup uses ExactMatch
```

## 4. The Restaurant Analogy

```text
Factory   -> hire the right chef once based on the cuisine type
             (Italian chef, French chef — hired at setup time, not per dish)

Strategy  -> the chef picks the right cooking method per dish
             (grill, steam, fry — method changes per dish, same chef)

Registry  -> the menu maps each dish name to the chef's function
             (customer orders "Pasta" -> menu -> Italian chef's pasta function)
```

## 5. Code Comparison

Registry — routing:

```python
HANDLER_REGISTRY = {
    "IT":     handle_it_pr,
    "Office": handle_office_pr,
}
route_pr(pr)  # looks up category -> calls handler
```

Factory — creating the right object:

```python
llm = create_llm("groq")  # returns GroqLLM object
llm.ask("Review PR-101")  # same call regardless of provider
```

Strategy — swappable behaviour:

```python
checker = DedupChecker(strategy=FuzzyMatchStrategy())
checker.is_duplicate("Cisco Router", existing_items)
```

## 6. Simple Summary

All three patterns remove growing if/elif chains. Each solves a different version of that problem.

Short version:

```text
Factory   -> "Which object do I build?"    -> build it once, use everywhere
Strategy  -> "How do I behave right now?"  -> swap the behaviour object
Registry  -> "Where does this data go?"    -> dict maps key to handler function

Combined in ProcIQ:
Factory   creates the LLM client at startup
Registry  routes each PR to the right pipeline
Strategy  applies the right dedup rule inside each pipeline
```
