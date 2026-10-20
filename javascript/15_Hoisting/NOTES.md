# Module 15 — Hoisting

## What I learned today

Module 14 explained that every execution context runs a **Creation Phase** before
anything actually executes, where declarations get registered in memory ahead of
time. **Hoisting** is just the name for the *visible effect* of that Creation
Phase: it looks like declarations have been "lifted" to the top of their scope,
even though the code wasn't physically moved anywhere. What hoisting really means
depends entirely on *how* something was declared, and the differences between
`var`, `let`, `const`, and function declarations are exactly what both files in
this module are testing:

| | Memory allocated during Creation? | Given a value right away? | What happens if you touch it before its line |
|---|---|---|---|
| `var` | yes | yes — initialized to `undefined` | silently reads `undefined`, no error |
| `let` / `const` | yes | **no** — stays uninitialized | throws `ReferenceError` |
| function declaration | yes | yes — the **entire function body** | fully callable, works normally |

That gap for `let`/`const` — the space between "the name is reserved" and "the
name actually has a value" — is called the **Temporal Dead Zone (TDZ)**. The
error you get there, `Cannot access 'x' before initialization`, is actually proof
that the TDZ idea is real: it's a completely different message from `x is not
defined` (which means the name was never registered anywhere at all). TDZ errors
mean the seat is reserved, you're just not allowed to sit in it yet.

---

## File: `hoisting_task2.js` — line by line

```js
console.log(c)
console.log(a)
console.log(b)

var c =10; //  allocated memory and have placeholder undefined - global memory allocation
let a = 10; // reference error, allocated memory and not initialized - this and const are in script memory location instead of global, so this is in TDZ
const b =10; //reference error, allocated memory and not initialized
```
Even though all three `console.log` calls are written *before* any of the
declarations, the Creation Phase already ran before execution started, so by the
time line 1 executes, all three names (`c`, `a`, `b`) already exist in memory —
just with very different states:

- `var c` was hoisted **and** pre-initialized to `undefined`. `console.log(c)` on
  line 1 reads that placeholder value and prints `undefined` — no error, the
  script keeps going.
- `let a` was hoisted, but it's sitting in the **TDZ** — reserved, but not yet
  usable. `console.log(a)` on line 2 throws `ReferenceError: Cannot access 'a'
  before initialization`.
- This error is **uncaught**, and nothing in this script catches it, so the
  script **crashes right there**. That matters a lot for reading this file
  correctly: `console.log(b)` on line 3 is never actually reached at all —
  execution stops dead at line 2. The real printed output of this whole file is
  just `undefined`, followed by a crash.

The comments are also pointing at something slightly deeper: `var` declared at
the top level attaches itself to the **global object** (so in a browser it'd
literally become `window.c`), while `let`/`const` at the top level live in a
separate internal "script" scope that is *not* attached to the global object at
all — they're still global in the sense of being visible everywhere in the file,
just not exposed as properties the way old-style `var` globals are.

---

## File: `hoisting_task3.js` — line by line

```js
console.log(supplier); //silent bug, because this is undefined, dangerous because this is not strict as let/const
console.log(prId());
console.log(prId2());

var supplier = "Cisco"

function prId(){
    return "PR-001"
}

const prId2 =()=>{
    return "PR-001"
}
```
Tracing top to bottom:

- `console.log(supplier)` — `var supplier` was hoisted and pre-set to
  `undefined`, exactly like `c` in the previous file. Prints `undefined`. No
  crash, no warning, nothing — the script just silently carries on with the
  wrong value. His comment nails exactly why this is the dangerous one: nothing
  about this *looks* wrong. If `supplier` were used in a real calculation two
  hundred lines later, this bug could travel a long way before anyone notices.
- `console.log(prId())` — `prId` is a **function declaration**, so unlike
  `var`, it was hoisted with its **entire body** ready to run, not just its
  name. Calling it before its own line is written is completely safe. Prints
  `PR-001`.
- `console.log(prId2())` — `prId2` looks similar (it's also "a function"), but
  it's declared with `const prId2 = () => {...}` — a **function expression**
  assigned to a `const`. Hoisting only cares about *how the name was declared*,
  and this was declared with `const`, so it follows `const`'s rule: name
  reserved, value in the TDZ until its own line runs. Calling `prId2()` here
  throws `ReferenceError: Cannot access 'prId2' before initialization`, and the
  script crashes on this line — so the `var supplier = "Cisco"` assignment and
  both function bodies further down never get the chance to matter; they'd only
  have mattered if execution had survived long enough to reach them.

The real output of this file, in order: `undefined`, then `PR-001`, then a crash.

---

## Gotchas worth remembering from this module

- **`var`'s hoisting bug is silent; `let`/`const`'s hoisting bug is loud.** This
  is really the headline lesson of both files. `var` hands you `undefined` and
  lets the program keep running with a wrong value that might not cause visible
  trouble until much later. `let`/`const` crash immediately, at the exact
  mistake, with a message that even tells you what's wrong. A loud failure right
  next to the bug is *always* easier to fix than a quiet one that surfaces three
  functions away — this is the real argument for using `let`/`const` everywhere
  and avoiding `var`.

- **A TDZ error stops the whole script, not just that one line.** It's easy to
  misread `hoisting_task2.js`/`hoisting_task3.js` as "each console.log prints
  something," but a thrown, uncaught error halts execution completely. Anything
  written after the crashing line — more logs, declarations, function bodies —
  simply never runs. Always trace these top to bottom and stop at the first
  thrown error.

- **"Cannot access before initialization" and "is not defined" are different
  errors that mean different things.** The first (TDZ) means the name already
  has a reserved slot waiting for its value — it exists, you're just early. The
  second means the name was never declared anywhere JS could find it at all.
  Mixing these up makes debugging real hoisting issues much harder.

- **Function declarations are the one true exception: fully hoisted, body
  included.** `prId` in `hoisting_task3.js` proves this directly — calling it
  three lines before its own definition works perfectly. The moment a function
  is written as an expression instead (`const prId2 = () => {...}`, or even
  `const prId2 = function(){...}`), that free pass disappears completely and it
  follows whatever rule its variable keyword gives it.

- **Best practice that falls straight out of all of this: declare a variable or
  function *before* you use it, every time**, and never lean on hoisting to make
  out-of-order code work. Hoisting is a fact about how JS works internally, not
  a style to actually write code around.
