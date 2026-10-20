# Module 16 — `this`

## What I learned today

`this` was the single most confusing keyword so far, because unlike every other
variable I've dealt with, **`this` is not decided by where a function is
written** — it's decided by **how the function is actually called**, fresh, at
every single call. The same function can have a completely different `this` on
two different calls if it's invoked two different ways. The rule of thumb that
finally made it click: **look at the call site, not the function definition.**

| How it's called | what `this` ends up being |
|---|---|
| `obj.method()` | `obj` — whatever is directly to the left of the dot |
| `fn()` — called bare, no dot | `undefined` (strict mode / modules) or the global object |
| arrow function | **no `this` of its own at all** — inherits it from the surrounding code, fixed at the moment the arrow was *written*, never re-decided at call time |
| `fn.call(x, ...args)` / `fn.apply(x, [...args])` | `x`, immediately |
| `fn.bind(x)` | returns a *new* function permanently locked to `x`; doesn't run anything yet |

Arrow functions are the one true exception to "look at the call site" — they
behave like a closure over `this`, the exact same lexical idea as Module 13's
closures over ordinary variables, just applied to this one special keyword.

---

## File: `this_task1.js` — line by line

```js
const prRequest ={
    id:"PR-001",
    printIdNormal(){console.log(this.id)},
    x: () =>{
      console.log(this.id) //this lives in a enclosed lexical context
    }
}

const prRequest2 ={
    id:"PR-002",
}
```
`prRequest` is an object with an `id`, a regular method `printIdNormal`
(method-shorthand syntax, same as Module 13's ATM example), and a property `x`
that holds an **arrow function** instead of a regular method. `prRequest2` is
declared here too but is never actually used anywhere below — it just sits
there, unused, in this file.

```js
prRequest.printIdNormal();
prRequest.x();
```
- `prRequest.printIdNormal()` — called with dot notation, so by the "look left of
  the dot" rule, `this` is `prRequest`. `this.id` → `"PR-001"`. Prints `PR-001`.
- `prRequest.x()` — `x` is an **arrow function**, so it doesn't matter that it's
  being called through `prRequest.x()` with a dot — arrows never look at how
  they're called. Instead, JS looks at where the arrow was *written*: directly
  inside the object literal. But an object literal `{ ... }` does **not** create
  its own `this` binding (only functions/classes do) — so the arrow actually
  inherits `this` from the scope that *surrounds the whole object literal*,
  which here is the top level of this file. This file is a plain CommonJS module
  (`"type": "commonjs"` in `package.json`), and at the top level of a CommonJS
  module, `this` is `module.exports` — an empty object `{}` by default. So
  `this.id` inside the arrow is really `({}).id`, which is `undefined`. His
  comment is right that this is about an "enclosed lexical context" — just worth
  being precise that the context it's enclosed in is the *file's* top level, not
  `prRequest`, even though the arrow is sitting right there inside `prRequest`'s
  own object literal.

---

## File: `this_task2.js` — line by line

```js
const pr = { id: "PR-002", show() {console.log(this.id)} }

pr.show()
```
`show` is a regular method. `pr.show()` is called with the dot, so `this` = `pr`.
Prints `PR-002`.

```js
let assPr = pr.show
assPr()
```
`assPr = pr.show` copies the **function itself** into a plain variable — note
there are no parentheses, so this does not call it, it just grabs a reference to
the function. Crucially, a function doesn't carry its "owning object" around
with it anywhere — it's just a block of code sitting in memory. So once `show` is
pulled out into `assPr`, the fact that it used to live on `pr` is completely
gone. `assPr()` is then called **bare**, with no dot and no object in front of
it — by the "bare call" rule, `this` becomes the global object in non-strict mode
(which is the default here, no `"use strict"` in this file). The global object
has no `id` property, so `this.id` is `undefined`. Prints `undefined`. The
function's *code* never changed between `pr.show()` and `assPr()` — only the way
it was called changed, and that alone was enough to break it. This is **losing
`this`**, and it's exactly what happens in real bugs like `setTimeout(obj.method,
1000)` — the method gets detached from its object the instant it's passed around
without its dot.

```js
assPr = pr.show.bind(pr)
assPr()
```
`.bind(pr)` creates a **brand new function** that is permanently wired to always
use `pr` as `this`, no matter how it's later called — and critically, `.bind`
does **not** call the function, it just hands back this new locked version,
which is reassigned into `assPr`. Now `assPr()` — even though it's still a bare
call with no dot — works correctly, because the binding already baked `this = pr`
into the function itself. Prints `PR-002`. This is the standard fix for exactly
the bug the previous block demonstrated.

---

## File: `this_task3.js` — line by line

```js
const dept = {
    name: "IT",
    prs: ["PR-001", "PR-002"],
    listprs(){
        let x =()=>{
            this.prs.forEach(pr => {
                console.log(`${this.name} ${pr}`)
            });
        }
        x();
    }
}

dept.listprs()
```
`listprs` is a **regular method**. Called as `dept.listprs()`, so by the dot
rule, `this` = `dept` for the whole body of `listprs`. Inside it, `x` is an
**arrow function** — and this time, unlike `this_task1.js`'s `x`, it's written
*inside a regular function* (`listprs`), not directly inside an object literal.
So the arrow correctly inherits `this` from `listprs`'s own `this`, which is
`dept`. `x()` is then called, and inside it, `this.prs.forEach(pr => {...})` runs
— the callback passed to `.forEach` is *also* an arrow function, so it too
inherits `this` from wherever it was written, which is inside `x`, where `this`
is already `dept`. So every layer here — `listprs` → `x` → the `forEach`
callback — ends up agreeing that `this` is `dept`, purely because each arrow
function just forwards along whatever `this` already existed around it rather
than creating a new one. Output: `IT PR-001` then `IT PR-002`. If any one of
these had been written as a plain `function(){}` instead of an arrow, that one
link in the chain would have broken and `this` would have come out as `undefined`
or the global object instead.

```js
function printDept(){
    console.log(this.name)
}

let it = {
    name: "IT"
}
let hr = {
    name: "HR"
}

printDept.call(it)
printDept.call(hr)
```
`printDept` is a completely standalone function — it isn't attached to `it` or
`hr` at all. `.call(it)` invokes `printDept` **immediately**, explicitly forcing
`this` to be `it` for just this one call. Prints `IT`. `.call(hr)` does the same
thing with `hr` as the forced `this`. Prints `HR`. This is the opposite situation
from `this_task2.js`'s `.bind` — `.call` doesn't create a new function to save
for later, it runs the function *right now* with whatever `this` you hand it as
the first argument. This is a common pattern for "borrowing" one function and
running it against several different plain objects that happen to have the
right shape (`{ name: ... }`), without that function ever being a real method on
any of them.

---

## Concept beyond the files: `call` vs `apply` vs `bind`

None of these three files happen to use `.apply`, but it's part of the same
family and worth keeping straight since all three solve the "I need to control
`this` explicitly" problem:

```js
show.call(pr, arg1, arg2);     // runs NOW, this = pr, extra args listed one by one
show.apply(pr, [arg1, arg2]);  // runs NOW, this = pr, extra args passed as an ARRAY
const bound = show.bind(pr);   // does NOT run anything — returns a NEW function
bound();                        // NOW it actually runs, this = pr, forever
```
`call` and `apply` only differ in how you hand over extra arguments (one at a
time vs. as a single array) — both execute immediately. `bind` is the odd one
out: it never runs anything by itself, it just manufactures a permanently
`this`-locked copy of the function for you to call whenever you're ready — which
is exactly what fixed the `assPr` bug in `this_task2.js`.

---

## Gotchas worth remembering from this module

- **Pulling a method off an object silently detaches `this`.** `this_task2.js`'s
  `let assPr = pr.show` is the textbook version of this — the function's code
  never changes, only how it's later called does, and that's enough to turn
  `PR-002` into `undefined`. This happens constantly in real code any time a
  method gets handed somewhere else as a callback — `setTimeout(obj.method,
  1000)`, `arr.forEach(obj.method)`, etc. — without `.bind`.

- **Never use an arrow function as an object's own method.** `this_task1.js`'s
  `x: () => {...}` is exactly this mistake — it looks like a normal method but
  can never see the object's own data through `this`, because arrows ignore how
  they're called entirely. `printIdNormal` right next to it, written as a normal
  method, works correctly for the exact same `console.log(this.id)` line.

- **Do use an arrow function *inside* a regular method, for nested callbacks.**
  `this_task3.js`'s `listprs` is the correct version of the pattern
  `this_task1.js` got wrong — `x` and the `forEach` callback are both arrows
  *inside* an already-correct regular method, so they ride along on `dept`'s
  `this` instead of losing it. This is precisely why arrows are the normal
  choice for callbacks passed to `forEach`, `setTimeout`, promise `.then()`, etc.
  — if those were plain `function(){}` callbacks instead, each one would create
  its own fresh, unrelated `this`.

- **`.bind()` returns a function — it does not call one.** Easy to forget the
  extra `()` afterward. `pr.show.bind(pr)` alone does nothing visible; it has to
  be stored and then actually invoked, exactly as `this_task2.js` does with
  `assPr = pr.show.bind(pr); assPr();`.

- **`.call`/`.apply` run immediately; `.bind` is for later.** All three force a
  specific `this`, but mixing up "runs now" vs. "hand me back something to run
  later" is a common source of confusion — `this_task3.js` only needed the
  "right now" version (`.call`), while `this_task2.js` needed the "save for
  later" version (`.bind`).
