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

*Next: Module 14 (Execution Model) + Module 15 (Hoisting).*
