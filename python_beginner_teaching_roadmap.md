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

## Phase 1: Running Python And Printing

Goal:

```text
Run a Python file and print text.
```

Allowed concepts:

- `.py` file
- `python file.py`
- `print()`
- text inside quotes

Do not use yet:

- variables
- functions
- imports
- `if`
- loops

Topics:

1. What is a `.py` file?
2. How to run `python file.py`
3. First `print("Hello")`
4. Multiple `print()` lines
5. Common beginner errors: missing quote, missing bracket

## Phase 2: Values And Basic Data

Goal:

```text
Understand simple values Python can print.
```

Allowed concepts:

- numbers
- text
- `True`
- `False`
- `None`

Do not use yet:

- variables
- conditions
- loops
- functions

Topics:

1. Printing numbers
2. Printing text
3. Printing simple calculations
4. `True` and `False`
5. `None`

## Phase 3: Variables

Goal:

```text
Store values using names.
```

Allowed concepts:

- variable assignment
- reading variable values
- changing variable values

Do not use yet:

- functions
- loops
- lists
- dictionaries

Topics:

1. What is a variable?
2. Python variable vs C variable
3. Assigning number to variable
4. Assigning text to variable
5. Reassigning a variable
6. Printing variables

## Phase 4: Basic Types

Goal:

```text
Understand int, float, str, bool, and None.
```

Allowed concepts:

- `type()`
- `int`
- `float`
- `str`
- `bool`
- `None`

Topics:

1. Integer values
2. Decimal values
3. String values
4. Boolean values
5. `None`
6. Checking type with `type()`

## Phase 5: Operators

Goal:

```text
Do simple operations.
```

Topics:

1. `+`
2. `-`
3. `*`
4. `/`
5. `//`
6. `%`
7. Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=`
8. Logical: `and`, `or`, `not`

Do not use `if` yet until comparisons are clear.

## Phase 6: Strings

Goal:

```text
Work with text.
```

Topics:

1. Single quotes and double quotes
2. Joining strings with `+`
3. f-strings
4. `.lower()`
5. `.upper()`
6. `.strip()`
7. `.replace()`
8. `.split()`
9. `len()`

## Phase 7: Conditions

Goal:

```text
Make decisions.
```

Topics:

1. `if`
2. indentation
3. `else`
4. `elif`
5. nested `if`
6. truthy and falsy basics

## Phase 8: Loops

Goal:

```text
Repeat work.
```

Topics:

1. `while`
2. `for`
3. `range()`
4. `break`
5. `continue`
6. loop with strings

## Phase 9: Lists

Goal:

```text
Store many values in order.
```

Topics:

1. Create list
2. Access by index
3. Change item
4. Add item with `.append()`
5. Remove item
6. Loop through list
7. List length

## Phase 10: Dictionaries

Goal:

```text
Store key-value data like JSON.
```

Topics:

1. Create dictionary
2. Access value by key
3. Add key
4. Update value
5. Check key exists
6. Loop through dictionary

ProcIQ connection:

```text
API request and response data usually looks like dictionaries.
```

## Phase 11: Functions

Goal:

```text
Reuse code with def.
```

Only teach `def` here, not before.

Topics:

1. Why functions are needed
2. `def`
3. function call
4. parameters
5. return value
6. default parameters

## Phase 12: Imports And Modules

Goal:

```text
Use code from other files and libraries.
```

Only teach modules after functions.

Topics:

1. What is import?
2. Import standard library
3. Create our own module
4. Script vs module
5. `if __name__ == "__main__"`

## Phase 13: Files And JSON

Goal:

```text
Read and write files.
```

Topics:

1. `open()`
2. `with`
3. read text
4. write text
5. `json.load`
6. `json.dump`
7. `json.loads`
8. `json.dumps`

## Phase 14: Errors And Exceptions

Goal:

```text
Handle failures.
```

Topics:

1. Common errors
2. `try`
3. `except`
4. `finally`
5. `raise`

## Phase 15: Classes

Goal:

```text
Understand object-oriented Python.
```

Topics:

1. What is a class?
2. What is an object?
3. `__init__`
4. `self`
5. methods

## Phase 16: Backend-Ready Python

Goal:

```text
Prepare for FastAPI and ProcIQ code.
```

Topics:

1. Type hints
2. Pydantic basics
3. decorators
4. async/await
5. generators and `yield`
6. environment variables
7. logging

