# Module 14 — Execution Model

## What I learned today

This module is about what's actually happening *underneath* when JS runs my code
— not new syntax, but the machinery. Every time any code runs, JS creates an
**execution context**: a little environment that holds that code's variables, its
`this`, and a link back to whatever scope surrounds it. There's exactly one
**global execution context** created once when the file starts, and then a **brand
new function execution context** every single time any function is called —
even if it's the same function called twice in a row, it gets two separate fresh
contexts.

Every context goes through **two phases**, and this is the real mechanical
explanation behind hoisting (Module 15 is the specific rules; this is *why* those
rules exist at all):
```
1. CREATION  — before a single line actually runs, JS scans the whole context
               and registers every declaration it finds:
                 function declarations → stored with their full body, ready to call
                 var                   → name registered, pre-set to undefined
                 let / const           → name registered, but with NO value yet (TDZ)
2. EXECUTION — now it runs top to bottom, line by line, actually doing the work
               and filling in real values
```

Because JS can only truly do **one thing at a time** (it's single-threaded), it
needs a way to remember "where do I go back to when this finishes?" every time
one function calls another. That's the **call stack** — a Last-In-First-Out
(LIFO) structure, like a stack of plates: whatever function got called *most
recently* is the one that finishes and gets removed (popped) *first*.

And separately from all of that, there's **where values actually live in memory**:
the **stack** holds small, fixed-size things — primitives, and references
(addresses) pointing into the **heap**, which is where big flexible things like
objects, arrays, and functions actually live. This explains the reference-copying
behavior from Module 3: copying a primitive copies the value; copying an object
only copies the address that points at it.

---

## File: `callstack_task1.js` — line by line

```js
function a() { 
    console.log("a start") 
    b(); 
    console.log("a end")
}
function b() {
    console.log("b start") 
    c(); 
    console.log("b end")
}
function c() { 
    console.log("c start") 
    console.log("c end") 
}
```
Three plain **function declarations**. Because of hoisting (Creation Phase),
`a`, `b`, and `c` are all fully registered — name *and* body — before any of this
file's code actually executes, so it doesn't matter that `a` is calling `b`
before `b`'s definition is "reached" top-to-bottom; `b` already fully exists by
execution time. Each function logs a "start" message, calls the *next* function
in the chain, then logs an "end" message once that call returns. `c` is the
bottom of the chain — it has no further call, just its own start/end logs back to
back.

```js
a(); //In js, call stack is last in first out, in this code
```
This is the line that kicks everything off. Walking the call stack exactly,
frame by frame:

1. `a()` is called → stack becomes `[global, a]` → `a` runs `console.log("a
   start")` → prints `a start`.
2. Inside `a`, `b()` is called → stack becomes `[global, a, b]` → `b` runs
   `console.log("b start")` → prints `b start`.
3. Inside `b`, `c()` is called → stack becomes `[global, a, b, c]` → `c` runs
   both of its logs back to back → prints `c start` then `c end`. `c` has nothing
   left to do, so it **returns** → popped off the stack → `[global, a, b]`.
4. Control resumes **exactly where it left off inside `b`** — right after the
   `c();` line — so `b` runs its remaining line, `console.log("b end")` →
   prints `b end`. `b` is now done → popped → `[global, a]`.
5. Control resumes inside `a`, right after `b();` — `a` runs its remaining line,
   `console.log("a end")` → prints `a end`. `a` is done → popped → `[global]`.

Final printed order: `a start`, `b start`, `c start`, `c end`, `b end`, `a end`.
The "start" messages come out in the order the functions were *entered*
(outside-in: a, then b, then c); the "end" messages come out in the *reverse*
order, because the innermost call (`c`) is the first one to actually finish and
return, and each caller only gets to finish its own remaining work after the
thing it called has fully returned. It's exactly like nesting dolls — you have to
fully open the innermost one before you can close the one around it.

```js
function recursion(){
    return recursion();
}
recursion()
```
`recursion` is a function that calls **itself** with absolutely no condition to
ever stop. Every single call pushes a brand-new frame onto the stack —
`recursion` calling `recursion` calling `recursion`... — and because the `return`
is calling itself again rather than returning an actual value, **none of those
frames ever get the chance to finish and pop off**. The call stack is a real,
finite block of memory (unlike the heap, which is large and flexible) — it has a
hard size limit. Each new call eats a little more of that limited space until
there's none left, at which point JS throws `RangeError: Maximum call stack size
exceeded`. This specific failure mode is universally called a **stack overflow**,
and it's the reason every recursive function needs a **base case** — a condition
that stops the recursion and lets the stack actually unwind, the same way `a`,
`b`, and `c` above were each guaranteed to finish and return.

---

## Concept deep dive: the two phases of an execution context

This file doesn't show `var`/`let`/`const` hoisting directly (that's Module 15's
job), but it's worth connecting explicitly: the only reason `a()` could be called
on a line *before* `function a(){...}` would even "logically" be reached in a
top-to-bottom reading is that the **Creation Phase already registered the whole
function**, body included, before **Execution Phase** ran a single line. Function
declarations are the one case where hoisting gives you the complete, callable
thing up front. `var` only gets its name pre-registered (value `undefined` until
its real line runs); `let`/`const` get their name reserved but genuinely
unusable (the Temporal Dead Zone) until their own line executes. Three different
"how much do you get for free before your line runs" rules, all decided during
this same Creation Phase.

## Concept deep dive: stack vs heap memory

Not shown directly in this file either, but central to the module: imagine a
small tidy **desk** (the stack) where you can only keep a few things at a time,
each in a fixed-size slot — numbers, booleans, and *addresses* (pointers) live
here. Big, flexible things — objects, arrays, functions — actually live in a huge
**warehouse** (the heap); the desk only ever holds a slip of paper with the shelf
number where the real thing is stored.

```js
let x = 5;            // 5 sits directly on the stack
const o = { a: 1 };   // the actual object lives in the heap;
                       // o itself just holds that object's heap address
const p = o;          // this copies the ADDRESS, not the object —
                       // p and o now point at the exact same heap object
```
This is the real mechanical reason behind the "objects are copied by reference"
trap from Module 3 — `p = o` never duplicates `{ a: 1 }`; it just duplicates the
sticky-note with the warehouse shelf number, so changing a property through
`p` is visible through `o` too, because there was only ever one object the whole
time.

---

## Gotchas worth remembering from this module

- **"End" logs print in reverse order from "start" logs whenever functions call
  each other.** This isn't a quirk to memorize — it falls directly out of
  LIFO: the function that finishes *last* is the one that started *first*
  (`a`), because it was the one waiting the longest for everything it called to
  finish first.

- **Recursion with no base case is a guaranteed stack overflow, not a
  "maybe."** `recursion()` in this file will crash every single time it's run —
  there's no condition anywhere that ever lets a call actually return, so the
  stack (which has a hard, fixed size unlike the heap) always eventually runs
  out of room.

- **A function declaration's whole body is available before its own line "runs"
  — that's only true for function *declarations*.** `callstack_task1.js` relies
  on this (nothing here would work if `a`, `b`, `c` were arrow functions
  assigned with `const` and called out of order) — Module 15 covers exactly why
  function expressions don't get this same free pass.

- **Stack trace = a live printout of the call stack at the moment of an
  error.** When `recursion()` eventually throws its `RangeError`, the error
  message / stack trace is really just JS reporting which frames were still
  sitting on the stack at that instant — the same stack this module is about,
  just captured and shown to you.
