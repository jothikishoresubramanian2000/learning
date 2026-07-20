# JavaScript Learning Notes — Modules 1 to 11

> Backend-focused JS notes. Format per topic: **Concept → Syntax → Example → ⚠️ Gotchas → Backend use.**
> Author: Kishore. Companion to `javascript-roadmap.md`.

---

## Module 1 — Introduction

**Concept.** JS runs on the **V8 engine**. Two homes: the **browser** (V8 inside Chrome) and **Node.js** (V8 on the server — files, DB, no browser). Backend = Node.

**Run a file:** `node file.js`

**Print:** `console.log(value)` — JS version of Python's `print()`.

**Comments:** `// single line`   `/* block */`

```js
console.log("Hello JavaScript");
```

⚠️ **Semicolons** — JS auto-inserts them (ASI), so code runs without them, but convention is to write `;` at line ends.

---

## Module 2 — Variables

**Concept.** A variable is a named box. Three declarations:

| Keyword | Reassign? | Use |
|---------|-----------|-----|
| `const` | ❌ | default — value never rebinds |
| `let`   | ✅ | value will change |
| `var`   | ✅ | **avoid** (old, scope-buggy) |

**Rule:** default `const`, use `let` only if you reassign, never `var`.

```js
const name = "Kishore";
let count = 0;
count = count + 1;   // ok
```

- Declare empty: `let x;` → `undefined`.
- `const` **must** be initialized immediately (`const x;` → error).
- Cannot redeclare in same scope (`let a; let a;` → error).
- Naming: start with letter/`_`/`$`, case-sensitive, **camelCase** convention (`empName`), `UPPER_SNAKE` for fixed config.

⚠️ **Accidental global** — assigning with NO keyword creates a hidden global variable:
```js
total = 5;   // ❌ leaks to global scope — the #1 recurring bug
```
Always declare with `const`/`let`.

---

## Module 3 — Data Types

**Primitives** (single value): Number, String, Boolean, Null, Undefined, Symbol, BigInt.
**Reference** (many values): Object, Array, Function.

- JS has **one** Number type (int + float together). Also `NaN`, `Infinity`.
- `typeof x` checks type.
- `null` = deliberately empty (you set it). `undefined` = nothing set yet (system).

```js
typeof 42        // "number"
typeof "hi"      // "string"
typeof true      // "boolean"
typeof {}        // "object"
```

⚠️ **`typeof null === "object"`** — famous 1995 bug, never fixed.

⚠️ **Value vs Reference** (critical):
```js
let a = 5; let b = a; b = 9;   // a still 5  (primitive = real copy)

const o1 = { x: 1 };
const o2 = o1;                 // same box, two labels
o2.x = 99;                     // o1.x is now 99 too
```

⚠️ **`const` object is still mutable** — `const` locks the *binding*, not the *contents*:
```js
const emp = { name: "A" };
emp.name = "B";   // ✅ allowed (edit contents)
emp = {};         // ❌ blocked (rebind)
```

---

## Module 4 — Operators

**Arithmetic:** `+ - * / % **` (`**` = power). ⚠️ JS `/` never truncates: `1234/10 = 123.4`. Use `Math.floor()`/`Math.trunc()` for whole; `%` for remainder.

**Assignment:** `= += -= *= /= %=`

**Comparison:** `< > <= >=`

**⭐ Equality:**
```js
==   // loose — coerces types → 5 == "5" is TRUE  (dangerous)
===  // strict — value AND type → 5 === "5" is FALSE
```
**Rule: always `===` / `!==`.**

**Logical:** `&& || !` — and they **return values** (short-circuit), not just booleans:
```js
const name = input || "Guest";      // fallback if input falsy
user.active && sendEmail();         // run right side only if left truthy
```

**Ternary:** `cond ? a : b`

**⭐ Nullish `??`** — fallback ONLY on `null`/`undefined` (not `0`/`""`):
```js
count ?? 10   // keeps 0;   count || 10 replaces 0 with 10
```

**⭐ Optional chaining `?.`** — safe access, no crash if missing: `user?.address?.city`.

**Logical assignment:** `x ??= 5` (set if null/undefined), `x ||= 5` (set if falsy), `x &&= 5`.

**String `+`:** with a string, `+` concatenates: `1 + "2"` → `"12"`.

---

## Module 5 — Type Conversion

**Explicit (you convert):**
```js
Number("42")     // 42
Number("abc")    // NaN
String(42)       // "42"
Boolean(1)       // true
parseInt("42px")   // 42    (reads leading int, lenient)
parseFloat("3.14kg") // 3.14
```
`Number()` strict (whole string numeric); `parseInt/Float` lenient (read from front, stop at junk).

**Implicit (coercion):**
```js
"5" - 2   // 3    (- forces numbers)
"5" + 2   // "52" (+ with string concatenates)
true + 1  // 2    (true→1, false→0)
```

**⭐ Truthy / Falsy.** Falsy values (only 6): `false`, `0`, `""`, `null`, `undefined`, `NaN`.
Everything else is **truthy** — including `"0"`, `"false"`, `[]`, `{}`, `-1`.

⚠️ `NaN === NaN` is `false`. Check with `Number.isNaN(x)`.

**Backend:** API/form input arrives as **strings** → `Number()` before math, else `"25" + 1 = "251"`.

---

## Module 6 — Conditionals

```js
if (cond) { } else if (cond2) { } else { }   // first true wins
```
- Nested `if` allowed.
- **`switch`** — one value vs many fixed options, matches with `===`:
```js
switch (role) {
  case "admin": console.log("full"); break;   // ⚠️ break is mandatory
  case "user":  console.log("limited"); break;
  default:      console.log("guest");
}
```
- Ternary for simple 2-way. Guard clause (`if (!x) return;`) to avoid deep nesting.

⚠️ **`switch` fall-through** — `case` labels are just *entry doors*, not repeated checks. After a match JS runs **every line downward, ignoring case labels, until `break`**. Forget one `break` → the next case's code runs too.

⚠️ **Order + boundary bugs:**
- Validate invalid input **first** in an if-chain (`grade > 100` before `grade >= 90`, else 150 prints "A").
- Watch `>` vs `>=` at boundaries (age 18). Test edge values.

---

## User Input (Node) — helper

Node has no built-in `input()`. Using `prompt-sync` (`npm install prompt-sync`):
```js
const prompt = require("prompt-sync")();
const name = prompt("Name: ");
const age  = Number(prompt("Age: "));   // ⚠️ input is ALWAYS a string
```
⚠️ Run input files **interactively** in a real terminal — cannot be auto-tested via piping.

---

## Module 7 — Loops

```js
for (let i = 0; i < 5; i++) { }     // known count
while (cond) { }                    // unknown count
do { } while (cond);                // runs at least once
```

- **`for...of`** → iterate **values** (arrays, strings): `for (const c of "abc")`.
- **`for...in`** → iterate **keys** (objects): `for (const k in obj)`.
- `break` = exit loop. `continue` = skip this turn.
- Nested loops for grids/patterns.
- `process.stdout.write("*")` = print without newline.

⚠️ **`of` = values, `in` = keys.** On a string, `for...in` gives indexes `0,1,2`, `for...of` gives chars.
⚠️ Ensure the loop moves toward ending, or infinite loop.

**Loop object values/pairs:**
```js
for (const v of Object.values(obj)) { }
for (const [k, v] of Object.entries(obj)) { }
```

---

## Module 8 — Functions

**Three forms:**
```js
function add(a, b) { return a + b; }        // declaration (name required, hoisted)
const add = function(a, b) { return a+b; }; // expression (anonymous fn, var named)
const add = (a, b) => a + b;                // arrow (implicit return, one expression)
```
Arrow rules: single param → drop `()`; one expression → drop `{}` and `return`.

- **Parameters** = placeholders; **arguments** = real values.
- `return` sends value back; no return → `undefined`; code after `return` never runs.
- **Default params:** `function greet(name = "Guest") {}`.
- **Rest `...`** — collect args into array: `function sum(...nums) {}`.
- **Spread `...`** — expand array into args: `Math.max(...nums)`. (Rest collects, spread expands — same symbol.)
- **Callback** — a function passed to another function: `applyDiscount(price, fn)`.

**When to use which:** standalone helper → declaration. Callback / stored-in-object / passed-around → expression/arrow.

⚠️ **Hoisting:**
```js
sayHi();  function sayHi() {}      // ✅ declarations hoisted (name + body)
sayBye(); const sayBye = () => {}; // ❌ ReferenceError — const/let in TDZ (not ready)
```
Declarations callable before their line; `const`/`let` functions are not (Temporal Dead Zone). Best practice: define, then use.

---

## Module 9 — Strings

**Quotes:** `'...'`, `"..."`, `` `...` `` (backticks).
**⭐ Template literals:** `` `Hi ${name}, ${100*1.18}` `` — prefer over `+`.

**⭐ Strings are immutable** — methods return a **new** string; `s[0] = "H"` does nothing.

```js
str.length              // count
str[0] / str.charAt(0)  // access
str.toUpperCase() / toLowerCase()
str.includes("x") / indexOf("x") / startsWith / endsWith
str.slice(0, 3) / slice(-2)      // extract (start, end-excluded; negative from end)
str.substring(1, 4)
str.replace("a","X") / replaceAll("a","X") / trim() / padStart(3,"0")
str.split(",")          // string → array
arr.join("-")           // array → string
str.repeat(3)
```
Escapes: `\n` newline, `\t` tab, `\"` quote.

**Backend:** build IDs (`EMP-KISHORE-001`), parse CSV, extract email domain via `split("@")[1]` (derive, don't hardcode lengths).

---

## Module 10 — Arrays

### 10A — Basics / Mutation / Search
```js
const a = [10, 20, 30];
a[0]; a.length; a[a.length-1];

a.push(4); a.pop();          // back door: add/remove END
a.unshift(0); a.shift();     // front door: add/remove START

a.slice(1, 3);   // COPY a range — original untouched
a.splice(1, 2);  // SURGERY on real array — removes/inserts in place
a.splice(1, 0, "x");         // insert without removing

a.indexOf(20); a.includes(20);
Array.isArray(a);            // (typeof [] is "object")
[...a];                      // real copy (breaks reference sharing)
```
⚠️ **slice = safe copy, splice = mutates the original.** One letter, opposite behavior.
⚠️ Arrays are **reference type** (same trap as objects).

### 10B — Power methods (take callbacks; don't mutate except sort/reverse)
```js
arr.forEach(x => ...);              // just loop (returns nothing)
arr.map(x => x * 2);                // transform → new array, same length
arr.filter(x => x > 10);            // keep where true → shorter array
arr.find(x => x.id === 2);          // first match (item) — or undefined
arr.findIndex(...);                 // first match position — or -1
arr.some(x => ...); arr.every(x => ...);  // booleans
arr.reduce((acc, x) => acc + x, 0); // boil down to one value (start value!)
```

**⭐ `sort` gotcha:**
```js
[10, 2, 1].sort();             // [1, 10, 2]  ❌ sorts as TEXT
[10, 2, 1].sort((a,b) => a-b); // [1, 2, 10]  ✅ ascending
[10, 2, 1].sort((a,b) => b-a); // descending
```
Default `sort` converts to strings → `"100" < "25"`. For numbers you MUST pass `(a,b)=>a-b`. Mutates original.

**⭐ Chaining** (backend pipeline):
```js
orders.filter(o => o.amount > 100).map(o => o.amount).reduce((a,b)=>a+b, 0);
```

**Array of objects** = the core backend shape (like DB rows / API response):
```js
const orders = [{ item: "pen", amount: 50 }, { item: "laptop", amount: 800 }];
orders[1].item;   // "laptop"
```
Callback param (`o`, `x`, any name) is filled by the method each pass — the method IS the loop.

---

## Module 11 — Objects (full)

```js
const emp = { name: "Kishore", age: 24 };

emp.name;  emp["name"];        // dot (fixed key) vs bracket (dynamic key in variable)
const k = "age"; emp[k];       // bracket required for variable keys
emp.dept = "IT"; delete emp.age;  // add / delete
emp.address.city;              // nested access

const obj = { greet() { return `Hi ${this.name}`; } };  // method; this = the object

const { name, dept: department, salary = 0 } = emp;     // destructure (rename, default)

const copy = { ...emp };                 // shallow copy
const merged = { ...a, ...b, x: 1 };     // merge + override

Object.keys(emp); Object.values(emp); Object.entries(emp);
Object.freeze(obj);                      // true lock (const only stops rebind)
"name" in emp; emp.hasOwnProperty("name");
user?.address?.city ?? "N/A";            // safe deep access + default
JSON.stringify(emp); JSON.parse(str);    // object ↔ text (Module 25)
```

**Shorthand:** `{ name, age }` when var names = keys. **Computed key:** `{ [field]: value }`.

⚠️ **Shallow vs deep copy:**
```js
const a = { info: { count: 1 } };
const b = { ...a };        // top level copied, but b.info === a.info (SHARED)
b.info.count = 99;         // a.info.count also 99 ❌
const d = structuredClone(a);   // true independent deep copy ✅
```
Spread/`{...}` copies **top level** real; **nested objects/arrays stay shared** (only their reference is copied). Primitive values inside are always independent.

---

## ⚠️ Recurring traps cheat-sheet

| Trap | Fix |
|------|-----|
| Accidental global (`x = 5` no keyword) | always `const`/`let` |
| `==` type coercion | use `===` / `!==` |
| `\|\|` replaces `0`/`""` | use `??` when 0/"" are valid |
| Reference sharing (`b = a`) | copy with `[...a]` / `{...a}` / `structuredClone` |
| `slice` vs `splice` | slice copies, splice mutates |
| `sort()` sorts as text | pass `(a,b) => a - b` |
| `switch` missing `break` | break every case |
| if-chain order (150 → "A") | validate invalid input first |
| `>` vs `>=` at boundary | test edge values (18) |
| Hoisting: call before define | define first (const/let in TDZ) |
| Shallow copy of nested | `structuredClone` for deep |
| String immutable (`s[0]="H"`) | reassign a new string |
| Input is always a string | `Number()` before math |

---

## Module 12 — Dates

**Concept.** A `Date` is really **one number** — milliseconds since Jan 1 1970 (the "epoch") — wearing a friendly costume. Used for `createdAt`, expiry, ages, scheduling.

**Create:**
```js
const now = new Date();               // current date + time
const d   = new Date("2026-07-07");   // from ISO string
const d2  = new Date(2026, 6, 7);     // year, MONTH-INDEX, day
```
⚠️ **Months are 0-indexed:** Jan = 0 … Dec = 11. July = `6`. The #1 Date bug. Rule: **building → human month − 1; reading → `getMonth() + 1`.**

**Get parts:**
```js
d.getFullYear()   // 2026
d.getMonth()      // 0–11  (add 1 for human)
d.getDate()       // 1–31  day of month
d.getDay()        // 0–6   weekday (0 = Sunday)
d.getHours() / getMinutes() / getSeconds()
```
⚠️ **`getDate()` = day-of-month (1–31); `getDay()` = weekday (0–6).** Different things.

**Timestamps (numbers, easy to compare/subtract):**
```js
Date.now()    // ms right now
d.getTime()   // ms of a specific date
```

**Difference between dates:**
```js
const diffMs   = end - start;                     // subtracting dates → ms
const diffDays = diffMs / (1000 * 60 * 60 * 24);  // ms → days
```

**Formatting:**
```js
d.toISOString()        // "2026-07-07T10:30:00.000Z"  ⭐ backend/API/DB standard (UTC)
d.toLocaleDateString() // "7/7/2026"  human
d.toLocaleTimeString() // "10:30:00 AM"
```

**⭐ Correct age calculation** — year-difference alone is wrong if the birthday hasn't happened yet this year:
```js
let age = today.getFullYear() - birth.getFullYear();
const birthdayNotYet =
  today.getMonth() < birth.getMonth() ||
  (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
if (birthdayNotYet) age--;   // subtract 1 if birthday still ahead
```
Compare **month first, then day** (bigger unit first); year ignored in the check. Both use 0-indexed month so no `+1` needed (they cancel).

**Backend:** store as ISO strings / timestamps; format only when displaying.

---

## ✅ Phase 1 complete — Modules 1–12 (Fundamentals)

---

# Phase 2 — Intermediate JavaScript

## Module 13 — Scope & Closures

**Scope = where a variable is visible/alive.**

- **Global scope** — declared outside everything → visible everywhere.
- **Function scope** — declared in a function → visible only inside it.
- **Block scope** — `let`/`const` in any `{ }` → visible only in that block. ⚠️ `var` ignores block scope (leaks out) — avoid `var`.
- **Lexical scope** — inner code sees **outer** variables, not vice-versa. **One-way: inner → outer.**
- **Scope chain** — lookup order: current block → enclosing function → outer → global. First match wins; not found → `ReferenceError`.

```js
const a = 1;
function outer() {
  const b = 2;
  function inner() {
    const c = 3;
    console.log(a, b, c);   // ✅ sees own + outer + global
  }
  console.log(c);            // ❌ outer can't see inner's c
}
```

**⭐ Closure** = a function that **remembers the variables from where it was created**, even after that outer function has finished.

```js
function makeCounter() {
  let count = 0;             // private
  return function () { count++; return count; };
}
const c = makeCounter();
c(); // 1   c(); // 2   c(); // 3    ← same private count survives
const c2 = makeCounter();
c2(); // 1  ← independent closure, fresh count
```
Why: the inner function was born inside `makeCounter`, so by lexical scope it keeps a **live link** to `count`; JS keeps `count` alive while the inner function exists. Analogy: the inner function packs the outer variables into a **backpack** and carries them everywhere.

**Private state (function factory)** — data nothing outside can touch:
```js
function makeAccount(balance) {          // balance is private
  return {
    deposit(amt) { balance += amt; return balance; },   // method shorthand (Module 11)
    withdraw(amt) { balance -= amt; return balance; }
  };
}
const acc = makeAccount(100);   // returns an OBJECT (deposit NOT run yet)
acc.deposit(50);                // NOW deposit runs → 150
acc.balance;                    // undefined — private, only methods touch it
```
⚠️ `makeAccount(100)` runs the factory and **returns an object**; the methods run only when you later call `acc.deposit(...)`. Two separate calls.

**Backend use:** closures power module privacy, function factories (ID generators, budget trackers, approval limiters), middleware, caching, rate-limiters, per-request handlers — all over procIq (`makeLogger`, `makeRepo`, config factories).

---

## Module 14 — Execution Model

**Execution Context** = the environment created whenever code runs. Holds its variables, its `this`, and a link to the outer scope (the scope chain).
- **Global context** — created once when the file starts.
- **Function context** — created fresh on **every** call.

**⭐ Two phases per context** (this IS hoisting, mechanically):
```
1. CREATION  — scan code, register declarations:
                 function declarations → name + full body ready
                 var                   → name registered, value = undefined
                 let/const             → name registered, NO value (TDZ)
2. EXECUTION — run line by line, assign real values
```

**Call Stack** — JS is **single-threaded**, one thing at a time; tracks position with a LIFO stack.
```js
function a(){ b(); }  function b(){ c(); }  function c(){ }
a();
// push a → [a] → push b → [a,b] → push c → [a,b,c]
// c returns → [a,b] → b returns → [a] → a returns → []
```
"End" lines print in **reverse** because the innermost call finishes first. A **stack trace** shows the frames still on the stack.

**Stack Overflow** — recursion with no exit:
```js
function boom(){ boom(); }   // RangeError: Maximum call stack size exceeded
```

**⭐ Memory: Stack vs Heap**
- **Stack** — fast, fixed slots. Holds **primitives** and **references (addresses)**.
- **Heap** — big, flexible. Holds **objects, arrays, functions**.
```js
let x = 5;            // 5 on the stack
const o = { a: 1 };   // object in HEAP; o holds its address on the stack
const p = o;          // copies only the ADDRESS → same heap object
```
**This explains the reference trap (Module 3):** primitives copy the value; objects copy the address.

Analogy: stack = your **desk** (small, tidy, top paper first). Heap = a **warehouse**; the desk only holds a slip with the shelf number.

---

## Module 15 — Hoisting

**Hoisting** = the Creation Phase. Declarations are registered *before* execution.

```js
console.log(a);   // undefined       ← var: hoisted AND initialized to undefined
console.log(b);   // ReferenceError  ← let: TDZ
console.log(c);   // ReferenceError  ← const: TDZ
var a = 1; let b = 2; const c = 3;
```

| | Memory allocated? | Initialized? | Access before its line |
|---|---|---|---|
| `var` | ✅ | ✅ **to `undefined`** | prints `undefined` (silent bug) |
| `let` / `const` | ✅ | ❌ **uninitialized** | `ReferenceError` (TDZ) |

- **Function declarations** are hoisted with the **full body** → callable before their line.
- **Function expressions / arrows** follow their variable's rule → `const fn = () => {}` is in the TDZ.
- The error says *"Cannot access"* (not *"is not defined"*) — proof the name **is** registered, it just has no value yet. That gap is the **Temporal Dead Zone**.
- At top level, `var` attaches to the global object; `let`/`const` live in a separate script scope.

**⭐ Why `let`/`const` are safer:** `var` silently hands you `undefined` and the bug surfaces far away, later. `let`/`const` **throw at the mistake**. Loud failure beats a silent wrong value.

Analogy: TDZ = a **reserved seat with a "do not sit yet" sign** — the seat exists, sitting early throws you out. `var` gives you an **empty chair** — you sit, find nothing, notice much later.

**Best practice:** define, then use. Never rely on hoisting.

---

## Module 16 — `this`

**⭐ `this` = who called the function — decided at CALL time, not where it's written.** Read the call site.

| Call form | `this` is |
|-----------|-----------|
| `obj.method()` | `obj` (left of the dot) |
| `fn()` (bare) | `undefined` (strict/modules) or global |
| arrow function | inherited from where it was **written** (lexical) |
| `fn.call(x)` / `fn.apply(x)` | `x` |
| `fn.bind(x)` then call | `x` |

```js
const pr = { id: "PR-001", show() { console.log(this.id); } };
pr.show();            // "PR-001"  (left of dot = pr)
const fn = pr.show;   // pulled OUT of the object
fn();                 // undefined — no dot, no owner → this lost
```

**⭐ Losing `this`** — the function didn't change, the **call site** did. Same bug passing a method as a callback (`setTimeout(pr.show)`).

**⭐ Arrow functions have NO own `this`** — inherit lexically (like closures):
```js
const pr = {
  id: "PR-001",
  regular() { console.log(this.id); },     // this = pr ✅
  arrow: () => console.log(this.id)         // this = outer/module ❌ undefined
};
```
- **Never use an arrow as an object method.**
- **DO use arrows *inside* a method** — they keep the method's `this`:
```js
list() { this.items.forEach(i => console.log(this.id, i)); }  // ✅ arrow keeps this = the object
```
If that callback were `function(){}`, `this` would be lost.

**Fix `this` explicitly:**
```js
show.call(pr);              // invoke NOW, this = pr, args listed:  call(obj, a, b)
show.apply(pr, [a, b]);     // invoke NOW, args as ARRAY
const bound = show.bind(pr);// returns a NEW function tied to pr (does NOT call)
bound();                    // "PR-001"  — use to fix a callback: pr.show.bind(pr)
```
- `call`/`apply` → invoke immediately (differ only in arg passing).
- `bind` → returns a new bound function to call later.

Analogy: `this` is like the word **"here"** — meaning depends on **where you stand when you say it** (call site). Arrows are a **quote** — they keep the "here" of where they were written.

**Backend:** NestJS services use `this.repo`, `this.logger` everywhere; passing `this.method` as a callback without `bind` loses `this` — a real bug. That's why arrows are used inside methods.

---

## Module 17 — DOM (awareness only)

**DOM = Document Object Model** — the browser turns loaded HTML into a **tree of objects** JS can read/change. Browser-only; does NOT run in Node.
```js
document.querySelector("#id");          // find element
el.textContent = "Approved";            // change it
el.addEventListener("click", handler);  // react
```
Backend never touches the DOM. But JS being **event-driven + callback-heavy** comes from its DOM origins — those patterns carry into Node. procIq's DOM work lives in `apps/compass` (React); `apps/spine` backend never touches it.

---

## Module 18 — Events & Callbacks

**Callback = a function passed to another function, run later.** Used for "do this when X finishes."
```js
function fetchUser(id, cb) { const user = {id, name:"K"}; cb(user); }
fetchUser(1, (user) => console.log(user.name));   // runs when ready
```

**⭐ Async ordering** — JS doesn't block on slow work; it moves on and runs the callback later. [`setTimeout` fakes delay — Module 26]
```js
console.log("1"); setTimeout(() => console.log("2"), 1000); console.log("3");
// prints 1 → 3 → 2   (didn't wait for the timer)
```

**Error-first callback** (Node convention): first arg = error (`null` if ok), second = result.
```js
readData((err, data) => { if (err) return handle(err); use(data); });
```
⚠️ Guard missing values, not just bad ones: `pr.amount == null || pr.amount <= 0`.

**⭐ Callback Hell** — when each async step needs the previous result, callbacks nest into a "pyramid of doom." Ugly, repeated error handling. **Promises (M19) + async/await (M20) exist to flatten this.**

### Events
**Event = "something happened"; listener = function that reacts.** Register with `.on`, fire with `.emit`.
- Browser: `el.addEventListener("click", fn)`
- Node: **EventEmitter** [deep: M27; used in event-driven architecture M46]
```js
const EventEmitter = require("events");
const bus = new EventEmitter();
bus.on("pr.submitted", (pr) => console.log("Email", pr));   // subscribe (many allowed)
bus.on("pr.submitted", (pr) => console.log("Audit", pr));
bus.emit("pr.submitted", "PR-001");   // fire → all listeners run in order
```
- `.on(name, fn)` = subscribe; `.emit(name, data)` = fire.
- **Decoupling** — the emitter doesn't know who listens. Add/remove reactions without touching the emitter. The listener IS a callback; events = callbacks organized by name with many-listener support.

Analogy: radio. `.on` = tune to a channel; `.emit` = station broadcasts; every tuned radio receives it.

**Backend (procIq):** `@nestjs/event-emitter` — emit `user.created`, and separate listeners (welcome email, ERP sync) react independently. Backbone of event-driven architecture.

---

## Module 19 — Promises

**Promise** = an object for a value that will exist **later**. States: **pending → fulfilled (resolve) / rejected (reject)**. Once settled, never changes.

```js
const p = new Promise((resolve, reject) => {
  if (ok) resolve(value);   // success
  else    reject(error);    // failure
});
p.then(v => ...)     // on resolve
 .catch(e => ...)    // on reject
 .finally(() => ...) // always
```

**⭐ Chaining flattens callback hell.** Each `.then` sees ONLY what the previous returned:
- `return a value` → next `.then` gets it immediately.
- `return a Promise` → chain **waits** for it, next `.then` gets ITS resolved value.
```js
validate(pr)
  .then(pr => checkBudget(pr))   // return a Promise → chain waits (dependent step)
  .then(pr => raisePo(pr))
  .catch(err => ...);            // ONE catch for all steps; any reject jumps here
```
⚠️ Always `return` the inner promise, or the chain won't wait.

**⭐ Carry data forward** — a `.then` only receives the previous return. To use an earlier value later, **nest** (keep it in scope via closure) or **bundle into an object** you keep returning:
```js
.then(pr =>
  Promise.all([getApprovers(pr.dept), getBudget(pr.dept)])
    .then(([approvers, budget]) => ({ pr, approvers, budget }))  // bundle old + new
)
.then(data => raisePo(data.pr).then(po => ({ ...data, po })))     // add to bundle
```
`([approvers, budget])` = array destructuring (READ the Promise.all result array). `({ pr, approvers, budget })` = object shorthand (MAKE a bundle). Arrow returning an object needs `( )` around `{ }`.

**⭐ Combinators:**
| Method | Resolves when | Use |
|--------|--------------|-----|
| `Promise.all` | ALL succeed (rejects if ANY fails — fail-fast) | need every result, parallel |
| `Promise.allSettled` | ALL finish (never rejects; `{status,value/reason}[]`) | want all outcomes incl. failures |
| `Promise.race` | FIRST to settle (win or lose) | timeouts |
| `Promise.any` | FIRST to succeed | first working source |

**When to use what:**
- One async op → single Promise.
- Steps **depend** on each other, ordered → **chain + return**.
- **Independent** ops, need all, want speed → **`Promise.all`** (parallel).
- Independent, want all outcomes even on failure → **`allSettled`**.
- ⚠️ Don't chain independent calls — makes them needlessly sequential/slow.

Analogy: Promise = a restaurant **buzzer**. Order → get buzzer (pending); sit down (JS keeps running); green → food (`resolve`/`.then`); red → failed (`reject`/`.catch`). `Promise.all` = hold 3 buzzers, eat when all flash.

**Backend:** `prisma.user.findMany()`, `axios.get()`, `sqs.send()` all return Promises. procIq is Promises everywhere (usually via async/await — M20).

---

## Module 20 — async / await

**Nicer syntax over Promises** — same machinery, but async code reads top-to-bottom like normal code.

- **`async`** marks a function that **always returns a Promise** (a plain `return` value is auto-wrapped).
- **`await`** pauses until a Promise settles, then **hands back the resolved value as a normal variable**. Only usable inside an `async` function.

```js
async function run(id) {
  try {
    const pr = await getPr(id);      // resolve → value here
    console.log(pr.amount);
  } catch (err) {
    console.log("Error:", err);      // reject/throw → caught here
  }
}
```

**⭐ Flattens the chain** — `valid`, `checked`, `po` are just variables in one scope. No `.then`, no bundling, no nesting (the M19 pain, gone).

**⭐ resolve/reject ↔ return/throw:**
| Inside `new Promise(...)` | Inside `async function` |
|---------------------------|-------------------------|
| `resolve(value)` | `return value` |
| `reject(error)` | `throw error` |
A rejected `await` **throws** → caught by `try/catch`. One `catch` covers all awaits above it.

**⭐ Sequential vs Parallel (the #1 mistake):**
```js
// ❌ slow — independent calls awaited one-by-one (1s + 1s = 2s)
const a = await getApprovers(dept);
const b = await getBudget(dept);

// ✅ fast — start both, await together (~1s)
const [a, b] = await Promise.all([getApprovers(dept), getBudget(dept)]);
```
`await` pauses. Sequential only when a step **depends** on the previous; independent work → `Promise.all`.

**⚠️ Faking async delay — `setTimeout` alone does NOT make a Promise.** `return` inside a `setTimeout` callback goes nowhere. Must wrap and `resolve` inside:
```js
const delayed = (x) => new Promise((resolve) => {
  setTimeout(() => resolve(x), 1000);   // resolve is the ONLY way a value leaves a timeout
});
```

**Common mistakes:** forgetting `await` (get the Promise, not the value); `await` in a non-async function (SyntaxError); `forEach` with `await` doesn't wait (use `for...of` or `Promise.all(map(...))`).

**Timing:** `Date.now()` = ms now; subtract two to measure elapsed.

**Backend (procIq):** services are almost entirely async/await — every DB/AWS/HTTP call is `await`ed:
```js
async create(dto) {
  const user = await this.repo.create(dto);
  await this.cognito.createUser(user.email);
  return user;
}
```

*(Taught out of number order — Classes before Error Handling, since custom errors need `extends`.)*

---

## Module 23 — Classes

A **class** = blueprint for objects sharing shape + behavior. Like Python classes; a few JS differences.

```js
class PurchaseRequest {
  constructor(id, amount) {   // like __init__; runs on `new`
    this.id = id;             // instance property (this = the new object)
    this.amount = amount;
  }
  withTax() { return this.amount * 1.18; }   // method (no `function`, no commas between)
}
const pr = new PurchaseRequest("PR-001", 5000);   // `new` is REQUIRED
```

**Constructor is optional** — needed only when instance data comes from `new` arguments. Fixed defaults use **class fields** instead:
```js
class Counter { count = 0; increment() { return ++this.count; } }   // no constructor needed
```

**Inheritance — `extends` / `super`:**
```js
class PurchaseOrder extends Document {
  constructor(id, vendor) {
    super(id);              // ⭐ call parent constructor FIRST, before using `this`
    this.vendor = vendor;
  }
  describe() { return `PO ${this.id}`; }   // override parent; super.describe() calls parent's
}
```

**Getters / setters** — properties that run code:
```js
get tax() { return this._amount * 0.18; }   // read: p.tax  (NO parens)
set amount(v) { this._amount = v; }          // write: p.amount = 6000  (v = the assigned value)
```
⚠️ Store the real value in a **different backing field** (`_amount`) — a setter assigning to its own name recurses forever. `_amount` = convention ("internal"), still public.

**Static** — belongs to the CLASS, not instances:
```js
class PR { static count = 0; static fromJson(j) { return new PR(j.amount); } }
PR.count;  PR.fromJson({...});   // called on the class, not an instance
```

**Private fields — `#`** (truly private, enforced):
```js
class Account {
  #balance = 0;                       // MUST be declared in class body
  deposit(a) { this.#balance += a; }  // only accessible inside via this.#balance
}
a.#balance;   // ❌ SyntaxError outside
```
`#balance` = real lock (enforced); `_amount` = convention (polite request). Class version of the closure private-state (M13).

**JS vs Python:** `__init__`→`constructor`, `self`→`this`, `class C(P)`→`class C extends P`, `super().__init__()`→`super()`, `@property`→`get`, `@staticmethod`→`static`, `self.__x`→`this.#x`, and JS **requires `new`**.

**Backend:** procIq is built on classes — every NestJS service/controller/guard/custom-error is a class (`class UsersService`, `class BudgetError extends Error`, `class RbacGuard implements CanActivate`) using constructor injection, `extends`, decorators.

---

## Module 21 — Error Handling

```js
try {
  riskyThing();
} catch (err) {
  console.log(err.message);   // runs only if try threw
} finally {
  cleanup();                  // runs ALWAYS (success or fail); optional
}
```

**`throw`** — raise an error; stops the function immediately, jumps to nearest `catch`. **Throw an `Error` object** (not a string) — carries `.message`, `.name`, `.stack`.
```js
if (amount <= 0) throw new Error("amount must be positive");
```
⚠️ Log `err.message` (clean), not the whole `err` (dumps the stack trace).

**Built-in error types** JS throws: `TypeError` (wrong type), `ReferenceError` (undeclared/TDZ), `SyntaxError` (broken code), `RangeError` (stack overflow).

**⭐ Custom error classes** (needs `extends` — Module 23):
```js
class BudgetError extends Error {
  constructor(message) { super(message); this.name = "BudgetError"; }
}
throw new BudgetError("over budget");
```
Lets you tell error types apart and handle each differently:
```js
catch (err) {
  if (err instanceof BudgetError) handleBudget(err);
  else throw err;                 // not mine → re-throw, let a higher layer handle
}
```

**Async errors** — a rejected `await` throws → catch with `try/catch` (M20). `.catch()` does the same for `.then` chains. In an `async` function, `throw` = reject.

**When to catch vs bubble:**
- **Catch** when you can act (retry, default, friendly message).
- **Let it bubble** (don't catch) when you can't handle it — a higher layer decides.
- ⚠️ Never silently swallow (`catch {}` doing nothing) — you lose the failure.

**Guard clauses** — validate early, throw fast:
```js
if (!pr) throw new Error("pr required");
if (pr.amount <= 0) throw new Error("invalid amount");
// past here, inputs are guaranteed valid
```

**Backend:** every route validates input and throws typed errors; a global handler catches them and returns the right HTTP status. procIq's `AllExceptionsFilter` catches everything → consistent JSON error response. `NotFoundException`, `BadRequestException`, `ProcIQError` are custom error classes mapped to 404/400/etc.

---

## Module 22 — Modules

Splitting code across files: one file **exports**, another **imports**. Two systems in JS.

**CommonJS** (Node classic, `.js` default):
```js
// math.js
const add = (a, b) => a + b;
module.exports = { add };          // export
// main.js
const { add } = require("./math"); // import (no extension; ./ = local file)
```

**ES Modules** (modern standard — browsers, TypeScript, all of procIq):
```js
// named exports (many per file)
export const add = (a, b) => a + b;
export function gst(a) { return a * 0.18; }
import { add, gst } from "./math.mjs";     // braces, names MUST match

// default export (ONE main thing per file)
export default class Budget { }
import Budget from "./budget.mjs";          // no braces, YOU name it

// mix + rename
import Budget, { add as sum } from "./x.mjs";
```

| | Named | Default |
|---|-------|---------|
| Count | many | one per file |
| Import | `import { x }` (exact name) | `import x` (any name) |

**How Node picks:** `.js` → CommonJS · `.mjs` → ESM · or `"type":"module"` in package.json → `.js` becomes ESM. **TypeScript `.ts` files use ESM natively** — the TS tooling handles it, so procIq needs no `.mjs`. ESM path in TS omits the extension (`'./users.repository'`); plain-Node ESM needs it (`'./x.mjs'`).

**You export a BINDING (name/value)** — function decl, arrow-in-const, class, number… all the same. Arrows export via their const: `export const add = (a,b) => ...` (can't `export` an arrow without const/let). `export function` shorthand works for declarations only.

⚠️ **Static `import` must be top-level** (hoisted/resolved before code runs) — not inside functions/ifs. For conditional/lazy loading use **dynamic `import()`** — a function returning a Promise, works anywhere (rare in backend).

⚠️ **Closure-factory trap:** a factory returns the thing directly. `cbudget(bal)` should `return { spend() {...} }` — NOT `return function(){ return {...} }` (that's one layer too many → `cbudget(bal)` gives a function, not the object → `.spend is not a function`). One function per layer you actually need.

Analogy: a module is a shop; `export` = the display window (public); the rest of the file = back room (private). Default export = the shop's signature product; named = labeled shelf items.

**Backend:** every procIq file starts with imports (`import { Injectable } from '@nestjs/common'`). One class/concern per file.

---

## Module 24 — Collections (Map & Set)

**`Set`** — a list of **unique** values (no index, just membership):
```js
const s = new Set();
s.add("PR-001"); s.add("PR-001");   // dupe ignored
s.size; s.has("PR-001"); s.delete("x");   // note .size, not .length
const unique = [...new Set(array)];        // ⭐ dedupe an array in one line
const deptSet = new Set(prs.map(p => p.dept));  // Set from a field
```

**`Map`** — key→value with **any key type**, keeps insertion order:
```js
const m = new Map();
m.set("PR-001", 5000); m.get("PR-001"); m.has(k); m.delete(k); m.size;
for (const [key, value] of m) { ... }               // iterate pairs
const m2 = new Map(prs.map(p => [p.id, p.amount])); // ⭐ build from [k,v] pairs
```
Values can be any type (number/object/array); keep them consistent per Map.

**⭐ Tally pattern** (count/group):
```js
const counts = new Map();
for (const rec of records) {
  counts.set(rec.user, (counts.get(rec.user) || 0) + 1);  // current-or-0, +1, set back
}
```

**⭐ Map vs Object:**
| | Object | Map |
|---|--------|-----|
| Keys | strings/symbols only (numbers→strings, objects→`"[object Object]"`) | **any type** (object, number, fn) kept as-is |
| Order | not guaranteed | insertion order |
| Size | `Object.keys(o).length` | `m.size` |
| Iterate | `for...in`/`Object.entries` | `for...of` direct |
| JSON | serializes | does NOT |
Decision: **Object = fixed-shape record ("a thing")**; **Map = dynamic lookup/dictionary ("a table")**, runtime keys, non-string keys, frequent add/remove.

⚠️ **Objects as Set members / Map keys = by REFERENCE, not content.** `{a:1}` and `{a:1}` are two different objects → both kept in a Set. To dedupe objects by a field, Set/Map on that field's value.

**`WeakMap`/`WeakSet`** — object-only keys, don't block garbage collection; rare (internal caches). Know the name.

**Backend:** `Set` for dedupe / membership (unique roles, seen ids); `Map` for in-memory caches/registries/tallies.

---

## Module 25 — JSON

**JSON = text format for data.** Objects live in memory; to send/store them, convert to text. Every API request/response, config, DB field is JSON.
```
JS object (memory)  ⇄  JSON string (text)
        stringify → / ← parse
```

```js
JSON.stringify({ id: "PR-001", amount: 5000 });   // '{"id":"PR-001","amount":5000}'  (string)
JSON.parse('{"id":"PR-001","amount":5000}').amount; // 5000  (object again)
JSON.stringify(obj, null, 2);                      // pretty-print (null=replacer, 2=indent)
```
- **stringify** when sending a response / saving.
- **parse** when receiving a request / reading stored data.

**⭐ JSON vs JS object:**
| | JS object | JSON |
|---|-----------|------|
| Is a | live value | **text string** |
| Keys | can be unquoted | **must be `"double-quoted"`** |
| Quotes | ' or " | **" only** |
| Values | any (fn, undefined, Date, Map) | string/number/boolean/null/array/object only |
| Trailing comma | ok | **not allowed** |

**⭐ What JSON drops:** functions & `undefined` → omitted; `Date` → string; `Map`/`Set` → `{}`. (Why Map "doesn't JSON".)

⚠️ `JSON.parse` **throws** (SyntaxError) on malformed text — always `try/catch` external input:
```js
try { const data = JSON.parse(input); } catch { console.log("Invalid JSON"); }
```
Log a friendly message, not the raw parser error.

Analogy: object = a built Lego model; `stringify` = the flat instruction sheet you can mail; `parse` = rebuild from the sheet. The sheet can't describe motors/glue (functions/Dates) — they don't survive.

**Backend:** every HTTP body is JSON. Express/NestJS auto-parse incoming JSON → `req.body` object, auto-stringify your response object → JSON. You work with objects; JSON is the wire format at the edges.

*Next: Module 26 (Timers & Event Loop).*
