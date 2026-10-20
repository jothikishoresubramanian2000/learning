# Module 22 — Modules — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

Once a program grows past "one file," you need a way to split code across files and have
one file use code defined in another. JavaScript actually has **two different, mostly
incompatible systems** for doing this, and this module's files deliberately show both
side by side:

- **CommonJS** — the original Node.js way. Uses `require(...)` to import and
  `module.exports = {...}` to export. Plain `.js` files are CommonJS **by default** in
  Node (unless the project's `package.json` says otherwise).
- **ES Modules (ESM)** — the modern, standardized JavaScript way (same system browsers
  and TypeScript use). Uses `import ... from "..."` and `export ...`. In plain Node, a
  file must either end in `.mjs`, or the project's `package.json` must contain
  `"type": "module"`, for Node to treat it as ESM.

Both systems solve the exact same problem (one file sharing code with another) with
different keywords and different rules — knowing both matters because Node backend code
has historically been CommonJS, while all modern tooling (and all of TypeScript) is ESM.

---

## File: `commonjs_math.js` — exporting with CommonJS

```js
const add = (a,b)=>{
    return a+b;
}

const gst = (amount)=>{
    return amount + (amount * 0.18);
}

module.exports = {add,gst};
```
- `const add = (a,b)=>{ return a+b; }` — an ordinary arrow function, adds two numbers.
- `const gst = (amount)=>{ return amount + (amount * 0.18); }` — another ordinary arrow
  function, adds 18% tax onto an amount.
- `module.exports = {add,gst};` — this is the CommonJS way of exporting. Every CommonJS
  file has an automatic built-in object called `module`, and `module.exports` is what
  gets handed back to whoever `require`s this file. Setting it to `{add,gst}` (object
  shorthand for `{add: add, gst: gst}`) means "whoever imports this file gets an object
  with two properties, `add` and `gst`, pointing at these two functions."

## File: `commonjs_main.js` — importing with CommonJS

```js
const {add,gst} = require("./commonjs_math")

console.log(add(4,5))
console.log(gst(1000))
```
- `const {add,gst} = require("./commonjs_math")` — `require("./commonjs_math")` runs
  that file and returns whatever it set `module.exports` to (the `{add, gst}` object from
  above). `const {add,gst} = ...` is **object destructuring** — instead of storing the
  whole object in one variable and then writing `thatObject.add(...)` every time, this
  pulls the `add` and `gst` properties straight out into their own local variables named
  `add` and `gst`.
  Notice the path has **no file extension** (`"./commonjs_math"`, not
  `"./commonjs_math.js"`) — CommonJS's `require` is allowed to guess `.js` automatically.
  The leading `./` means "look in this same folder," not "search installed packages" (a
  bare name like `require("dayjs")`, seen in Module 28, means the opposite).
- `console.log(add(4,5))` → prints `9`.
- `console.log(gst(1000))` → prints `1180` (`1000 + 1000*0.18`).

---

## File: `prUtils.mjs` — named exports with ES Modules

```js
export const makePrId =(n)=>{
    console.log(`PR-${String(n).padStart(3,"0")}`)
}

export const gstAmt = (amount)=>{
    console.log(amount + (amount * 0.18))
}
```
- `export const makePrId = (n) => { ... }` — the ESM way to export: just put the keyword
  `export` directly in front of the declaration. This is a **named export** — the file
  can have as many of these as it wants, each exported under its own exact name
  (`makePrId` here).
  Inside: `String(n)` converts the number `n` into a string (needed because
  `.padStart` is a string method, numbers don't have it). `.padStart(3,"0")` pads that
  string on the left with `"0"` characters until it's at least 3 characters long (so
  `7` → `"7"` → `"007"`). The template literal then builds `"PR-007"`.
- `export const gstAmt = (amount) => { ... }` — another named export, logs the amount
  plus 18% tax, directly (doesn't `return` it — just prints it from inside the function).

## File: `budget.mjs` — exporting a class and a closure-factory, both named

```js
export class Budget{
    constructor(balance){
        this.balance = balance
    }

    spend(amount){
        if(this.balance <=0 && this.balance<amount){
            return "Insufficient balance"
        }
        return this.balance -= amount
    }
}
```
- `export class Budget{ ... }` — `export` works the exact same way in front of a `class`
  declaration as it does in front of a `const` — this makes `Budget` available as a named
  export of this file.
- `constructor(balance){ this.balance = balance }` — standard class constructor, stores
  the starting balance.
- `spend(amount){ ... }` — a method. `if(this.balance <=0 && this.balance<amount)` is a
  slightly unusual guard (requires balance to be BOTH `<= 0` AND less than the amount
  being spent before refusing) — worth noticing as written exactly as-is, because it
  doesn't actually block spending *more than* a positive balance (e.g. balance `100`,
  spend `500`, this condition is false since `100 <= 0` is false, so it falls through to
  `return this.balance -= amount`, happily going negative). Written down here as a real
  observed gotcha, not corrected, since the instruction is to describe what's actually
  there.
- `return this.balance -= amount` — `-=` is a combined operator: subtract `amount` from
  `this.balance`, store the result back into `this.balance`, AND the whole expression
  evaluates to that new value, which is what gets `return`ed — one line doing both the
  mutation and the return.

```js
export const cbudget=(balance)=>{

        return {
            spend(amount){
                balance = balance - amount
                return balance
            }
        }
}
```
- `export const cbudget=(balance)=>{ ... }` — a second named export, this time a
  **factory function** (a function whose whole job is to build and return something) —
  this is the "closure factory" pattern from Module 13 (Closures), reused here through
  the Modules lens.
- `return { spend(amount){...} }` — returns a plain object with one method, `spend`.
  Because this object is built and returned **directly** (not wrapped in yet another
  function), calling `cbudget(10000)` immediately gives you back a usable
  `{spend(...)}` object — this is the "right" depth; the notes call out the opposite
  mistake (returning a function that returns the object, one layer too many) as a trap to
  avoid.
- Inside `spend`, `balance = balance - amount; return balance` — `balance` here is NOT a
  property on the returned object (there's no `this` anywhere in this function) — it's
  the **parameter from the outer `cbudget` function**, captured and kept alive by a
  **closure**. Every call to this particular `spend` method keeps updating that same
  captured `balance` variable, privately, with no way to reach it from outside except by
  calling `spend` itself — a different, closure-based way to get "private state" compared
  to the class's `this.balance` (which is actually a public property anyone could read
  directly as `instance.balance`).

## File: `main.mjs` — importing everything with ES Modules

```js
import { makePrId,gstAmt } from "./prUtils.mjs";
import { Budget,cbudget } from "./budget.mjs";
```
- `import { makePrId,gstAmt } from "./prUtils.mjs";` — ESM's named import: the names
  inside the `{ }` **must exactly match** the names that were exported (unlike CommonJS
  destructuring, which just happens to look similar but is really plain object
  destructuring on whatever `module.exports` was set to). Here, both `.mjs` files are
  imported **with their file extension written out** — that's required for plain-Node
  ESM (`.mjs` files), unlike TypeScript's ESM, which omits extensions.
- `import { Budget,cbudget } from "./budget.mjs";` — same idea, importing the class and
  the factory function together from the other file.

```js
makePrId(7);
gstAmt(5000);
```
- `makePrId(7)` → logs `PR-007`.
- `gstAmt(5000)` → logs `5900` (`5000 + 5000*0.18`).

```js
const prb1 = new Budget(10000)
console.log(prb1.spend(3000))
```
- `new Budget(10000)` — builds a `Budget` instance with `balance: 10000`.
- `prb1.spend(3000)` — `this.balance <=0` is false (10000 is not ≤ 0), so the guard's
  `&&` short-circuits to false overall, meaning the function falls through to
  `return this.balance -= amount` → `10000 - 3000 = 7000`, both stored back into
  `prb1.balance` and returned — printed as `7000`.

```js
const cprb = cbudget(10000)
console.log(cprb.spend(3000));
```
- `cbudget(10000)` — calls the factory, immediately returns `{spend(amount){...}}` with
  `balance` captured (via closure) at `10000`.
- `cprb.spend(3000)` — runs the closure's `spend`, `balance` becomes `10000 - 3000 = 7000`,
  returned and printed as `7000` — same final number as the class version, reached
  through a completely different mechanism (closure-held variable vs. a real object
  property).

---

## Gotchas worth remembering from this module

- **CommonJS and ESM are two separate, non-interchangeable systems** — this module
  deliberately keeps them in entirely separate files (`commonjs_*.js` vs `*.mjs`) rather
  than mixing `require` and `import` in the same file, because you generally can't mix
  them directly. Which system a plain `.js` file uses depends on Node's rules (default:
  CommonJS, unless `package.json` has `"type": "module"`); a `.mjs` extension always
  forces ESM regardless of `package.json`.
- **`require(...)` paths skip the extension; ESM `import` paths (in plain `.mjs` Node)
  need it.** `commonjs_main.js` writes `require("./commonjs_math")` (no `.js`);
  `main.mjs` writes `import ... from "./prUtils.mjs"` (full `.mjs` included). Mixing
  these habits up between the two systems is an easy mistake.
- **Named exports must match names exactly on import; a default export can be renamed
  freely by whoever imports it.** This module only exercises named exports
  (`export const`, `export class`) — every single export here is imported inside
  `{ }` using its exact original name. (`js_learning_notes.md` covers the default-export
  alternative, not used in any of these files, but good to remember the distinction
  exists.)
- **The closure-factory trap** — `cbudget` in `budget.mjs` is written at exactly the
  correct depth: `return { spend(amount){...} }` directly, not
  `return function(){ return {spend...} }`. The latter, one layer too deep, would mean
  `cbudget(10000)` hands back a *function* instead of the usable object, and calling
  `.spend` on it would throw `cbudget(...).spend is not a function`. Worth re-checking
  this depth any time a factory function feels like it's "not working."
- **A class property (`this.balance`) is genuinely public; a closure-captured variable
  (`balance` inside `cbudget`) is genuinely private.** Both `Budget` and `cbudget` reach
  the same final numeric answer in `main.mjs`, but `prb1.balance` can be read or
  overwritten directly from outside the class (`prb1.balance = -999999` would "work," no
  protection) — whereas nothing outside `cbudget`'s returned object can ever reach its
  captured `balance` variable except by calling `.spend(...)` itself. (Module 23's `#`
  private fields later give classes this same real protection.)
- **Watch the `spend` guard condition in `Budget` closely** — `if(this.balance <=0 &&
  this.balance<amount)` only refuses a spend when the balance is *already* zero or
  negative AND smaller than the requested amount; it does **not** stop a spend that would
  push a currently-positive balance into the negative (e.g. balance `100`, `spend(500)`
  silently succeeds, leaving balance at `-400`). A worthwhile case to notice and reason
  about, not an error in this file's purpose (the module's lesson is about imports/exports,
  not budget validation), but a good "what did I assume wasn't true" (Module 29) example
  to recall later.
