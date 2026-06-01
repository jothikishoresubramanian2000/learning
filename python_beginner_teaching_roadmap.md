# Python Beginner Teaching Roadmap

This roadmap is for teaching Python to a complete beginner who knows some C but has zero Python experience.

Teaching rule:

```text
Do not use a Python concept before teaching it.
One tiny concept at a time.
Every topic must include a small hands-on task.
```

## Teaching Style

1. Explain one concept only.
2. Compare with C only when it helps.
3. Show the smallest possible code.
4. Explain every line.
5. Give one tiny task.
6. Wait for the learner before moving on.

---

## Phase 1: Running Python And Printing ✅

Goal:

```text
Run a Python file and print text.
```

Topics:

1. What is a `.py` file? ✅
2. How to run `python file.py` ✅
3. First `print("Hello")` ✅
4. Multiple `print()` lines ✅
5. Common beginner errors: missing quote, missing bracket ✅

---

## Phase 2: Values And Basic Data ✅

Goal:

```text
Understand simple values Python can print.
```

Topics:

1. Printing numbers ✅
2. Printing text ✅
3. Printing simple calculations ✅
4. `True` and `False` ✅
5. `None` ✅

---

## Phase 3: Variables ✅

Goal:

```text
Store values using names.
```

Topics:

1. What is a variable? ✅
2. Python variable vs C variable ✅
3. Assigning number to variable ✅
4. Assigning text to variable ✅
5. Reassigning a variable ✅
6. Printing variables ✅

---

## Phase 4: Basic Types ✅

Goal:

```text
Understand int, float, str, bool, and None.
```

Topics:

1. Integer values ✅
2. Decimal values ✅
3. String values ✅
4. Boolean values ✅
5. `None` ✅
6. Checking type with `type()` ✅

---

## Phase 5: Operators ✅

Goal:

```text
Do simple operations.
```

Topics:

1. `+` ✅
2. `-` ✅
3. `*` ✅
4. `/` ✅
5. `//` ✅
6. `%` ✅
7. Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=` ✅
8. Logical: `and`, `or`, `not` ✅

---

## Phase 6: Strings ✅

Goal:

```text
Work with text.
```

Topics:

1. Single quotes and double quotes ✅
2. Joining strings with `+` ✅
3. f-strings ✅
4. `.lower()` ✅
5. `.upper()` ✅
6. `.strip()` ✅
7. `.replace()` ✅
8. `.split()` ✅
9. `len()` ✅

---

## Phase 7: Conditions ✅

Goal:

```text
Make decisions.
```

Topics:

1. `if` ✅
2. indentation ✅
3. `else` ✅
4. `elif` ✅
5. nested `if` ✅
6. truthy and falsy basics ✅

---

## Phase 8: Loops ✅

Goal:

```text
Repeat work.
```

Topics:

1. `while` ✅
2. `for` ✅
3. `range()` ✅
4. `break` ✅
5. `continue` ✅
6. loop with strings ✅

---

## Phase 9: Lists ✅

Goal:

```text
Store many values in order.
```

Topics:

1. Create list ✅
2. Access by index ✅
3. Change item ✅
4. Add item with `.append()` ✅
5. Remove item ✅
6. Loop through list ✅
7. List length ✅
8. List comprehension ⬅ PENDING

---

## Phase 10: Dictionaries ✅

Goal:

```text
Store key-value data like JSON.
```

Topics:

1. Create dictionary ✅
2. Access value by key ✅
3. Add key ✅
4. Update value ✅
5. Check key exists ✅
6. Loop through dictionary ✅

ProcIQ connection:

```text
API request and response data usually looks like dictionaries.
```

---

## Phase 11: Functions ✅

Goal:

```text
Reuse code with def.
```

Topics:

1. Why functions are needed ✅
2. `def` ✅
3. function call ✅
4. parameters ✅
5. return value ✅
6. default parameters ✅
7. Scope basics — local vs global ⬅ PENDING
8. `*args` and `**kwargs` ⬅ PENDING
9. Lambda functions ⬅ PENDING
10. `map()` and `filter()` ⬅ PENDING

---

## Phase 12: Imports And Modules ✅

Goal:

```text
Use code from other files and libraries.
```

Topics:

1. What is import? ✅
2. Import standard library ✅
3. Create our own module ✅
4. Script vs module ✅
5. `if __name__ == "__main__"` ✅
6. pip and dependency management ⬅ PENDING
7. Virtual environments ⬅ PENDING

---

## Phase 13: Files And JSON ✅

Goal:

```text
Read and write files.
```

Topics:

1. `open()` ✅
2. `with` ✅
3. read text ✅
4. write text ✅
5. `json.load` ✅
6. `json.dump` ✅
7. `json.loads` ✅
8. `json.dumps` ✅
9. Reading Excel files — `openpyxl` ⬅ PENDING
10. Working with PDF files — `pypdf` ⬅ PENDING
11. Date and time handling — `datetime` ⬅ PENDING
12. Config files — `configparser` / `.env` patterns ⬅ PENDING

---

## Phase 14: Errors And Exceptions ✅

Goal:

```text
Handle failures.
```

Topics:

1. Common errors ✅
2. `try` ✅
3. `except` ✅
4. `finally` ✅
5. `raise` ✅

---

## Phase 15: Classes ✅

Goal:

```text
Understand object-oriented Python.
```

Topics:

1. What is a class? ✅
2. What is an object? ✅
3. `__init__` ✅
4. `self` ✅
5. methods ✅
6. Inheritance — `class Child(Parent)` ⬅ PENDING
7. `__str__` — readable object printing ⬅ PENDING
8. Using classes to structure AI automation projects ⬅ PENDING
9. Polymorphism — same method name, different behaviour per class ⬅ PENDING (light)
10. Abstract classes — `ABC`, force subclasses to implement methods ⬅ PENDING (light)

---

## Phase 16: Developer Python Skills ✅

Goal:

```text
Write cleaner, production-aware Python.
```

Topics:

1. Type hints ✅
2. Pydantic basics ✅
3. Decorators ✅
4. async/await ✅
5. Generators and `yield` ✅
6. Environment variables ✅
7. Logging ✅
8. Code organization — project folder structure ⬅ PENDING
9. Debugging basics — `print` debug, `breakpoint()` ⬅ PENDING

---

## Phase 17: JSON Deep Dive ✅

Goal:

```text
Parse and build complex nested JSON confidently.
```

Topics:

1. Nested dict/list access ✅
2. `json.loads` and `json.dumps` ✅
3. Handling missing keys safely ✅
4. Looping through nested structures ✅
5. Building JSON payloads for API calls ✅

ProcIQ connection:

```text
Claude returns nested JSON. ERP sync sends nested JSON. Every API response is JSON.
```

---

## Phase 18: HTTP and External APIs

Goal:

```text
Call external APIs and handle responses.
```

Topics:

1. What is HTTP? GET vs POST
2. `requests` library basics
3. Sending headers and API keys
4. Parsing JSON response
5. Error handling for API calls
6. `httpx` for async HTTP calls
7. Connecting backend to AI service

ProcIQ connection:

```text
ERP sync, supplier data fetch, budget check from external system — all HTTP calls.
```

---

## Phase 19: FastAPI Basics

Goal:

```text
Build and serve a simple API endpoint.
```

Topics:

1. What is FastAPI?
2. First endpoint with `@app.get`
3. Path parameters
4. Request body with Pydantic
5. Returning JSON response
6. Running with `uvicorn`
7. Async endpoints
8. API error handling — `HTTPException`
9. Request and response models

ProcIQ connection:

```text
Pico co-pilot served as a FastAPI endpoint. Frontend calls /pico/ask, gets agent response back.
```

---

## Phase 20: AI Engineering

Goal:

```text
Build ProcIQ AI features with LLM APIs.
```

Topics:

1. Prompt design for procurement context
2. Prompt templates — reusable prompt builders
3. Multi-turn conversation (approval dialogue)
4. Structured output with Pydantic
5. Tool use / function calling
6. Streaming responses
7. Async parallel LLM calls
8. Logging agent reasoning steps

ProcIQ connection:

```text
Pico co-pilot, IIWO recommendations, Reasoning Drawer, Handoff Card — all built here.
```

---

## Phase 21: Document Processing

Goal:

```text
Read, clean, and prepare documents for AI.
```

Topics:

1. Reading text from PDF
2. Reading text from Word / Excel
3. Text cleaning — strip noise, normalize whitespace
4. Chunking text — split into pieces for LLM context window
5. Preparing document chunks for embedding

ProcIQ connection:

```text
Supplier contracts, SOW documents, quote PDFs fed into Pico for analysis.
```

---

## Phase 22: Embeddings and Vector Search

Goal:

```text
Understand and use semantic search.
```

Topics:

1. What is an embedding?
2. Generating embeddings via API
3. Vector similarity search — cosine similarity
4. Vector database basics — Chroma / Pinecone concept
5. Storing and querying embeddings

ProcIQ connection:

```text
Pico searches past PRs, contracts, supplier history semantically — not keyword match.
```

---

## Phase 23: RAG and Document Q&A

Goal:

```text
Build a retrieval-augmented generation pipeline.
```

Topics:

1. What is RAG?
2. Indexing documents into vector store
3. Retrieval — fetch relevant chunks by query
4. Augmented prompt — inject chunks into LLM context
5. Building a basic document Q&A chatbot
6. Storing chat history

ProcIQ connection:

```text
Pico answers questions about org policy, contracts, past PRs using RAG.
```

---

## Phase 24: Database and SQL

Goal:

```text
Store and query structured data.
```

Topics:

1. SQL basics for Python developers — SELECT, INSERT, UPDATE, DELETE
2. Database normalization — 1NF, 2NF, 3NF concept
3. PostgreSQL connection — `psycopg2`
4. SQLAlchemy basics — ORM pattern
5. Storing chat history in DB
6. Storing automation task logs

ProcIQ connection:

```text
PR records, approval history, supplier data, agent logs all live in Postgres.
```

---

## Phase 25: Production Python

Goal:

```text
Run Python in production.
```

Topics:

1. Background jobs — `asyncio` tasks, `celery` concept
2. Redis caching basics — cache API responses
3. API rate limiting concept — tokens per minute
4. Testing basics — `pytest`, one unit test
5. Dockerizing Python apps — `Dockerfile`, `docker-compose`
6. Deployment basics — env vars, health check endpoint

ProcIQ connection:

```text
Pico runs as background job. Supplier risk scores cached in Redis. Agent calls rate-limited.
```

---

## Phase 26: Design Patterns and System Design

Goal:

```text
Recognize and apply common patterns in real systems.
```

Topics:

1. Registry pattern ✅
2. Factory pattern ✅
3. Strategy pattern ✅
4. Singleton pattern ✅
5. Observer pattern ✅
6. Decorator pattern ✅
7. Retry with exponential backoff ✅
8. Circuit breaker — stop calling failing service ⬅ PENDING
9. Continuous polling — poll until condition met ⬅ PENDING
10. API rate limiter — token bucket concept ⬅ PENDING

ProcIQ connection:

```text
Pico uses circuit breaker when ERP is down. Approval polling uses backoff. Supplier sync uses retry.
```

---

## Phase 27: Backend Architecture Patterns (Critically Missed)

Goal:

```text
Patterns you WILL hit in real FastAPI / backend work — not optional.
```

Topics:

1. Repository pattern — separate DB code from business logic ⬅ PENDING
   - `PRRepository.get(id)` instead of raw SQL scattered everywhere
2. Dependency Injection — FastAPI `Depends()` ⬅ PENDING
   - inject DB session, current user, config into endpoints
3. Middleware — code that runs on every request ⬅ PENDING
   - auth check, request logging, rate limiting, CORS

ProcIQ connection:

```text
Repository keeps PR/supplier DB logic clean. Depends() injects tenant + user into every endpoint.
Middleware enforces auth and logs every API call.
```

---

## Status Summary

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Running & printing | ✅ Done |
| 2 | Values & types | ✅ Done |
| 3 | Variables | ✅ Done |
| 4 | Basic types | ✅ Done |
| 5 | Operators | ✅ Done |
| 6 | Strings | ✅ Done |
| 7 | Conditions | ✅ Done |
| 8 | Loops | ✅ Done |
| 9 | Lists | ✅ Done (list comprehension pending) |
| 10 | Dictionaries | ✅ Done |
| 11 | Functions | ✅ Done (scope, args/kwargs, lambda, map/filter pending) |
| 12 | Imports & modules | ✅ Done (pip, venv pending) |
| 13 | Files & JSON | ✅ Done (Excel, PDF, datetime, config pending) |
| 14 | Errors & exceptions | ✅ Done |
| 15 | Classes | ✅ Done (inheritance, __str__, AI structure pending) |
| 16 | Developer Python skills | ✅ Done (code org, debugging pending) |
| 17 | JSON deep dive | ✅ Done |
| 18 | HTTP & external APIs | ✅ Done |
| 19 | FastAPI basics | ✅ Done |
| 20 | AI engineering | ✅ Done |
| 21 | Document processing | ✅ Done (theory) |
| 22 | Embeddings & vector search | ✅ Done (theory) |
| 23 | RAG & document Q&A | ✅ Done (theory) |
| 24 | Database & SQL | ✅ Done (theory) |
| 25 | Production Python | ✅ Done (theory) |
| 26 | Design patterns & system design | 🔄 In progress (circuit breaker, polling, rate limiter pending) |
| 27 | Backend architecture patterns | ⬜ Not started (Repository, DI, Middleware) |
