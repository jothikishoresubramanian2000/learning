# Python Learning Plan

This plan is for learning Python from a C background and becoming ready for ProcIQ backend and AI development.

## Phase 1: Python Entry Basics

Goal:

```text
Understand how Python programs start and how Python syntax differs from C.
```

Topics:

1. Running Python files with `python file.py`
2. Python interpreter basics
3. Script vs module
4. `if __name__ == "__main__"`
5. Indentation instead of `{ }`
6. Comments
7. `print()`
8. f-strings

## Phase 2: Variables, Types, And Operators

Goal:

```text
Understand Python's basic data values.
```

Topics:

1. Variables without type declaration
2. `int`
3. `float`
4. `str`
5. `bool`
6. `None`
7. Arithmetic operators
8. Comparison operators
9. Logical operators: `and`, `or`, `not`
10. Type conversion: `int()`, `float()`, `str()`

## Phase 3: Control Flow

Goal:

```text
Write decision-making and repeated logic.
```

Topics:

1. `if`
2. `elif`
3. `else`
4. `for` loop
5. `while` loop
6. `range()`
7. `break`
8. `continue`
9. Truthy and falsy values

## Phase 4: Functions

Goal:

```text
Break code into reusable blocks.
```

Topics:

1. `def`
2. Function parameters
3. Return values
4. Default arguments
5. Keyword arguments
6. Scope: local vs global
7. Small pure functions

## Phase 5: Core Data Structures

Goal:

```text
Work with Python's most common containers.
```

Topics:

1. `list`
2. `tuple`
3. `dict`
4. `set`
5. Indexing
6. Slicing
7. Looping through containers
8. Nested data
9. Mutability
10. References

ProcIQ importance:

```text
API request/response data often looks like nested dicts and lists.
```

## Phase 6: String Handling

Goal:

```text
Clean and process text.
```

Topics:

1. `.lower()`
2. `.upper()`
3. `.strip()`
4. `.split()`
5. `.replace()`
6. `" ".join(...)`
7. String slicing
8. f-string formatting

ProcIQ importance:

```text
Useful for document extraction, chunking, prompts, and logs.
```

## Phase 7: Files And JSON

Goal:

```text
Read and write data files.
```

Topics:

1. `with open(...)`
2. Read text files
3. Write text files
4. Read JSON
5. Write JSON
6. `json.loads()`
7. `json.dumps()`
8. Binary files basics

ProcIQ importance:

```text
Useful for PDFs, extracted text, ERP JSON payloads, and config files.
```

## Phase 8: Exceptions

Goal:

```text
Handle errors safely.
```

Topics:

1. `try`
2. `except`
3. `finally`
4. `raise`
5. Built-in exceptions
6. Custom error messages

ProcIQ importance:

```text
ERP calls, LLM calls, file parsing, and database work can fail.
```

## Phase 9: Modules, Packages, And Pip

Goal:

```text
Organize code and use external libraries.
```

Topics:

1. `import`
2. `from x import y`
3. Standard library
4. External packages
5. `pip install`
6. `requirements.txt`
7. Virtual environments with `venv`

## Phase 10: Classes And Objects

Goal:

```text
Understand object-oriented Python.
```

Topics:

1. `class`
2. `__init__`
3. Instance attributes
4. Methods
5. `self`
6. Simple inheritance

ProcIQ importance:

```text
Used in ORM models, service classes, and structured application design.
```

## Phase 11: Type Hints

Goal:

```text
Make code easier to read and safer.
```

Topics:

1. `name: str`
2. `amount: float`
3. `items: list[str]`
4. `dict[str, int]`
5. `Optional`
6. Function return types

ProcIQ importance:

```text
FastAPI, Pydantic, and team code use type hints heavily.
```

## Phase 12: Python Features Used In Frameworks

Goal:

```text
Understand syntax commonly seen in FastAPI, LangChain, and MCP.
```

Topics:

1. Decorators: `@app.get`, `@app.post`, `@mcp.tool`
2. Generators: `yield`
3. Context managers: `with`
4. List comprehensions
5. Dict comprehensions
6. Lambda basics

## Phase 13: Async Python

Goal:

```text
Handle waiting work efficiently.
```

Topics:

1. `async def`
2. `await`
3. Coroutines
4. Event loop
5. `asyncio.run()`
6. `asyncio.gather()`
7. Blocking vs non-blocking code

ProcIQ importance:

```text
Useful for ERP calls, LLM calls, vector DB calls, and API calls.
```

## Phase 14: Backend Python Basics

Goal:

```text
Prepare for FastAPI backend development.
```

Topics:

1. Dictionaries as JSON-like data
2. Request/response thinking
3. Pydantic models
4. FastAPI endpoints
5. Path parameters
6. Query parameters
7. Request body
8. Response model

## Phase 15: Database Python Basics

Goal:

```text
Understand how Python talks to databases.
```

Topics:

1. `sqlite3`
2. SQL query execution
3. Insert/read/update basics
4. Transactions
5. ORM concept
6. SQLAlchemy basics
7. Alembic migrations

## Phase 16: AI Python Basics

Goal:

```text
Prepare for AI/RAG work.
```

Topics:

1. Text cleaning
2. Chunking
3. Embedding function calls
4. Vector search result handling
5. Prompt construction
6. Calling local/cloud LLMs
7. Streaming with `yield`
8. JSON structured output

## Phase 17: Production Readiness

Goal:

```text
Write code that works safely in a real team project.
```

Topics:

1. Environment variables
2. Secrets handling
3. Logging
4. Error handling
5. Timeouts
6. Retries
7. Testing with `pytest`
8. Git workflow
9. Docker basics

## Suggested Learning Order

Follow this order:

```text
Phase 1  -> Phase 5
Phase 6  -> Phase 9
Phase 10 -> Phase 13
Phase 14 -> Phase 17
```

Most important for ProcIQ AI/backend work:

```text
dict
list
strings
functions
files
JSON
exceptions
classes
type hints
decorators
async/await
yield
logging
pytest
```

