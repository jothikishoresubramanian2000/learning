# Module 21 — Error Handling — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

Up to this point (Modules 19-20), every file threw/rejected with a plain **string**
(`reject("over budget")`, `throw "email taken"`). This module is about doing it properly:
throw real `Error` objects, build **custom error classes** for different failure types,
and use `instanceof` to tell them apart so each kind of failure can be handled
differently (instead of every failure looking identical to the code catching it).

The core building block is `try / catch / finally`:
```js
try {
  riskyThing();         // if this throws, JS jumps straight to catch
} catch (err) {
  // only runs if try threw something
} finally {
  // ALWAYS runs — whether try succeeded or the catch just ran — optional block
}
```

An `Error` object (built with `new Error("message")`, or a class that `extends Error`)
automatically carries three useful things: `.message` (the text you gave it), `.name`
(defaults to `"Error"`, but a custom class can override it), and `.stack` (a full trace
of where it was created and the call chain that led there — Module 29 covers reading
this in depth).

This module also needed Module 23 (Classes) taught first, out of numeric order, because
building a **custom error class** requires `class X extends Error { ... }` and `super(...)`
— you can't build `BudgetError`/`NotFoundException` without already knowing `extends`.

---

## File: `error_task1.js` — basic `try/catch/finally`

```js
const checkAmount =(amount)=>{
    if(amount <=0){
        throw new Error ("amount must be positive")
    }
    return amount
}
```
- `checkAmount` is a plain function (not `async`, no Promises involved — error handling
  works identically for sync code).
- `if(amount <=0){ throw new Error("amount must be positive") }` — if the check fails,
  build a **real `Error` object** (not a bare string, unlike Module 19/20's examples)
  with `new Error("amount must be positive")`, and `throw` it. `throw` immediately stops
  running `checkAmount` right there — the `return amount` line below never executes in
  this branch.
- `return amount` — if the amount was positive, just hand it back unchanged.

```js
const callcheck =(amount) =>{
    try{
        checkAmount(amount)
        console.log(`Valid: ${amount}`);
    }
    catch(err){
        console.log(`Error: ${err.message}`)
    }
    finally{
        console.log(`validation done`)
    }
}
```
- `try{ checkAmount(amount); console.log(...) }` — calls `checkAmount`. If it throws,
  everything after that line **inside the same `try` block** is skipped — so
  `console.log(\`Valid: ${amount}\`)` never runs when `checkAmount` throws.
- `catch(err){ console.log(\`Error: ${err.message}\`) }` — `err` here is the actual
  `Error` object that was thrown. `.message` pulls out just the clean text
  (`"amount must be positive"`) — this is the important habit: **log `err.message`, not
  the whole `err`**, because logging the whole object dumps the entire stack trace,
  which is noisy for a simple user-facing message (though useful in real backend logs,
  just not here).
- `finally{ console.log(\`validation done\`) }` — this block runs **no matter what** —
  whether `try` succeeded or `catch` just ran. It's for cleanup/logging that must always
  happen regardless of outcome (closing a file, releasing a lock, etc. in real code; here
  just a log line proving it always fires).

```js
callcheck(-1000)
callcheck(1000)
```
- `callcheck(-1000)` → `checkAmount` throws → prints `Error: amount must be positive`,
  then (because of `finally`) also prints `validation done`.
- `callcheck(1000)` → `checkAmount` returns `1000` normally → prints `Valid: 1000`, then
  (again because of `finally`, which always runs) prints `validation done`.
- So the full output is 4 lines total — proving `finally` fires on **both** the failure
  and the success path.

---

## File: `error_task2.js` — a custom `Error` subclass + `instanceof`

```js
class BudgetError extends Error{
    constructor(message){
        super(message)
        this.name = "Budget error"
    }
}
```
- `class BudgetError extends Error { ... }` — declares a brand-new error **type** that
  inherits everything a normal `Error` has (`.message`, `.stack`, etc.) plus whatever
  extra behavior/identity you add.
- `constructor(message){ ... }` — runs whenever someone does `new BudgetError("...")`.
- `super(message)` — **must** be called before using `this` inside a subclass
  constructor (the Module 23 rule). This hands the `message` string up to the real
  built-in `Error` constructor, which is what actually sets up `.message` and `.stack`
  correctly.
- `this.name = "Budget error"` — overrides the default `.name` (which would otherwise
  just be `"Error"`) so that anything printing `err.name` or `err.toString()` reports
  this as a Budget error specifically, not a generic one.

```js
const amountCheck=(amount)=>{
    if(amount > 10000){
        throw new BudgetError("over budget");
    }
    return "approved"
}
```
- If `amount` is over the limit, throws a `BudgetError` instance (not a plain `Error`,
  not a string) — carrying the message `"over budget"`.
- Otherwise returns the string `"approved"`.

```js
const prflow =(pr)=>{
    try{
        console.log(amountCheck(pr.amount))
    }
    catch(err){
        if (err instanceof BudgetError){
            console.log(`Budget error: ${err.message}`)
        }
        else{
            throw err;
        }
    }
}
```
- `console.log(amountCheck(pr.amount))` — calls `amountCheck`; if it returns normally,
  logs the returned `"approved"` string directly.
- `catch(err){ if (err instanceof BudgetError) {...} else { throw err; } }` — this is the
  key new idea: **`instanceof`** checks whether `err` was built from the `BudgetError`
  class specifically (as opposed to some other kind of error). If yes, handle it here
  with a friendly, specific message. If the error is something else entirely (a bug, a
  `TypeError`, anything not anticipated), **re-throw it** (`throw err`) rather than
  silently treating it the same way — this lets an unexpected error keep propagating
  upward to wherever (or whoever) actually knows how to deal with it, instead of being
  incorrectly swallowed here as if it were a budget problem.

```js
const pr ={amount: 6000}
const pr1 ={amount: 11000}
prflow(pr1)
prflow(pr)
```
- `prflow(pr1)` → `amount: 11000` is over 10000 → `BudgetError` thrown → caught →
  `instanceof BudgetError` is true → prints `Budget error: over budget`.
- `prflow(pr)` → `amount: 6000` is fine → `amountCheck` returns `"approved"` → prints
  `approved` directly (no error path at all).

---

## File: `error_task3.js` — custom error + `async`/`await` + `try/catch` together

```js
class NotFoundException extends Error{
    constructor(message){
        super(message)
        this.name = "NotFoundException"
    }
}
```
Exact same custom-error pattern as `BudgetError` above, just a different name/purpose —
proving the pattern is reusable for any category of failure you want to distinguish.

```js
const getPr=(pr)=>{
    if(pr!="PR-001"){
        throw new NotFoundException("not found")
    }
    else{
        return "success"
    }
}
```
A plain synchronous function (note: not `async`, doesn't return a Promise) — throws
`NotFoundException` when the id doesn't match, otherwise returns `"success"`.

```js
async function processPr(pr){
    try{
        const check = await getPr(pr)
        console.log(check);
    }
    catch(err){
        if (err instanceof NotFoundException){
            console.log(`Failed: ${err.message}`)
        }
        else{
            throw err;
        }
    }
}
```
- `async function processPr(pr) { ... }` — this ties Module 20's lesson together with
  this module's: `getPr` is synchronous, but it's called with `await` anyway (legal and
  harmless — `await` on a non-Promise value just resolves to it instantly, per Module 20),
  inside an `async` function, wrapped in `try/catch`.
- `const check = await getPr(pr)` — if `getPr` throws (the `pr != "PR-001"` case), this
  is where that throw surfaces, and `try/catch` catches it exactly the same way it would
  catch a synchronous throw with no `await`/`async` involved at all — proving the
  resolve/reject ↔ return/throw equivalence from Module 20's notes.
- The `catch` block uses the same `instanceof` + re-throw pattern as `error_task2.js`:
  handle `NotFoundException` specifically with a friendly message, re-throw anything
  else.

```js
processPr("PR-002")
```
`"PR-002" != "PR-001"` is true, so `getPr` throws `NotFoundException("not found")`,
caught inside `processPr`, `instanceof` check passes, prints `Failed: not found`.

---

## Gotchas worth remembering from this module

- **Throw `Error` objects (or a custom subclass), never bare strings.** Modules 19 and 20
  threw plain strings (`reject("over budget")`, `throw "email taken"`); this module fixes
  that habit in every single file — `new Error(...)`, `new BudgetError(...)`,
  `new NotFoundException(...)`. A real `Error` carries `.message`/`.name`/`.stack`; a
  string carries nothing extra, and code that assumes `err.message` exists would break
  (get `undefined`) if it were accidentally fed a bare string instead.
- **Log `err.message`, not the whole `err` object** (`error_task1.js`) — keeps
  user-facing/console output clean; the full object (with its stack trace) matters more
  for a dedicated logging/debugging context (Module 29), not a friendly status message.
- **Custom error classes exist so `instanceof` can tell failure types apart** —
  `BudgetError` and `NotFoundException` both `extends Error`, and both follow the exact
  same 3-line shape (`constructor(message){ super(message); this.name = "..."; }`). The
  payoff is entirely in the `catch` block: `if (err instanceof X) { handle it }` lets one
  function react differently to different kinds of failure, instead of treating every
  thrown thing identically.
- **Always re-throw what you don't recognize** — every `catch` block in this module ends
  its `else` branch with `throw err;`, never with nothing. Catching an error you don't
  actually know how to handle and silently doing nothing (`catch {}` or a catch that just
  logs and moves on) **hides real bugs** — the failure vanishes instead of reaching
  whatever code further up the call chain actually knows what to do about it.
- **`finally` always runs, success or failure** (`error_task1.js`) — useful for guaranteed
  cleanup/logging regardless of outcome; don't rely on code placed *after* a `try/catch`
  block for something that must happen even if the function returns early from inside the
  `catch`.
- **`try/catch` works identically whether the risky call is sync or `await`ed** —
  `error_task1.js`/`error_task2.js` catch a plain synchronous `throw`; `error_task3.js`
  catches the exact same kind of `throw`, just reached through `await getPr(pr)` inside
  an `async` function. There is no separate "async error handling" syntax to learn — it's
  the same `try/catch`, because `await` turns a rejection/throw into a regular thrown
  exception at that line (Module 20's "resolve/reject ↔ return/throw" table).
