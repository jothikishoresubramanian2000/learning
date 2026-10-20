# Module 19 — Promises — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, with the reasoning behind each choice, so
> that months from now you can open this file cold and rebuild full understanding
> without needing to ask anyone anything again.

---

## What I learned this module

Before Promises, async code (anything that takes time — a timer, a network call, reading
a file) could only report its result through a **callback function** you handed it ("call
me back when you're done"). That works for one async step, but once you need several
async steps that depend on each other, you end up nesting callback inside callback inside
callback — "callback hell" — which is hard to read and hard to add error handling to.

A **Promise** is an object that represents "a value that doesn't exist yet, but will
later (or it will fail trying)." It has exactly three states:
- **pending** — still waiting, no answer yet.
- **fulfilled** — finished successfully, carries a value (reached via `resolve(value)`).
- **rejected** — finished with a failure, carries a reason (reached via `reject(reason)`).

Once a Promise leaves `pending`, it **never changes again** — a Promise that resolved to
`5000` is frozen at `5000` forever; you can't "re-resolve" it to something else later.

Promises replace nested callbacks with a flat chain of `.then()` calls, and they give you
ONE place (`.catch()`) to handle failure from any step in the chain, instead of needing
an `if (err)` check after every single callback.

---

## File: `promise_task1.js` — creating and consuming a basic Promise

```js
const getPr =(id) =>{
    return new Promise((resolve, reject) =>{
        setTimeout(() =>{
            if (id === "PR-001")
                resolve({id, amount: 5000})
            else
                reject("Pr not found")
        },5000)
    })
}
```
- `const getPr = (id) => { ... }` — an arrow function named `getPr`, taking one argument
  `id`. Nothing async-specific about this line yet; it's just a normal function
  definition.
- `return new Promise((resolve, reject) => { ... })` — this is how you **manually build**
  a Promise. `new Promise(...)` takes exactly one argument: a function (called the
  "executor"). JavaScript immediately calls that executor function for you and hands it
  two special functions as arguments: `resolve` and `reject`. You never define what
  `resolve`/`reject` do internally — JS wires them up; your job is just to call one of
  them, at the right moment, with the right value.
- `setTimeout(() => { ... }, 5000)` — fake "this takes time" work. Inside a real backend
  this would be a network call or DB query instead of a timer; the timer is just a stand-in
  so the Promise doesn't resolve instantly.
- `if (id === "PR-001") resolve({id, amount: 5000})` — if the id matches, call `resolve`
  with an object. That object becomes the Promise's fulfilled value — it lands wherever
  something later calls `.then(value => ...)` on this Promise.
- `else reject("Pr not found")` — otherwise call `reject` with a value explaining the
  failure (here, just a plain string). This value lands in `.catch(err => ...)`.
  (Best practice, covered properly in Module 21, is to reject with an `Error` object
  instead of a bare string — this file predates that lesson, which is fine; it's an
  early Promise exercise.)

```js
const prList = ["PR-001","PR-002"]

for(const prs of prList){
    getPr(prs)
.then(pr => console.log(`Found: ${pr.amount}`))
.catch(err => console.log(`Error: ${err}`))
}
```
- `const prList = [...]` — a plain array of two id strings to try.
- `for (const prs of prList) { ... }` — a normal `for...of` loop, going over each id one
  at a time. (Variable is named `prs`, singular id really, a little naming slip — doesn't
  change behavior.)
- `getPr(prs)` — calling the function. Because `getPr` always returns a `new Promise(...)`,
  this line immediately gives back a *pending* Promise object (the 5-second timer hasn't
  fired yet) — the loop does NOT pause here waiting for it.
- `.then(pr => console.log(...))` — attach a callback for "when/if this Promise
  resolves." `pr` here is whatever value was passed into `resolve(...)` above (the
  `{id, amount}` object for `"PR-001"`).
- `.catch(err => console.log(...))` — attach a callback for "when/if this Promise
  rejects." `err` is whatever value was passed into `reject(...)`.
- Because the loop doesn't wait, **both** `getPr("PR-001")` and `getPr("PR-002")` start
  their 5-second timers at essentially the same moment — they run in parallel, not one
  after another. Both `.then`/`.catch` pairs will fire around 5 seconds later, in
  whatever order their timers actually finish.

---

## File: `promise_task2.js` — chaining `.then()` to pass data forward

```js
const submitted = (pr) =>{
    return new Promise((resolve,reject) =>{
        if (pr.id === "PR-001") {
            pr.status = "submitted";
            resolve(pr);
        } else {
            reject("invalid pr");
        }
    })
}
```
Same shape as task 1: a function that wraps `new Promise`, and inside, either mutate the
`pr` object (add a `.status` field to it) and `resolve(pr)`, or `reject(...)` with a
reason.

```js
pr = {id:"PR-001"}
```
Note: no `const`/`let` here — this creates an accidental **global** variable (a classic
JS mistake; in strict mode / ES modules this would actually throw instead of silently
working). The intended line would have been `const pr = {id:"PR-001"}`.

```js
submitted(pr)
.then(pr =>{console.log(`${pr.id} ${pr.status}`); return pr;
})
.then(pr => {
    pr.status = "approved"
    console.log(`${pr.id} ${pr.status}`);
    return pr;
})
.then(pr => {
    pr.status = "notified"
    console.log(`${pr.id} ${pr.status}`); return pr;
})
.catch(err =>{console.log(`Error: ${err}`)})
```
This is the heart of the lesson: **chaining**. Each `.then` only ever sees what the
*previous* `.then` returned — not the original Promise's value directly (except the
first one).
- First `.then(pr => {...})`: `pr` here is the resolved value from `submitted(pr)`
  (status is `"submitted"`). It logs `PR-001 submitted`, then `return pr` — returning a
  **plain value** (not a Promise) means the next `.then` gets handed that value
  *immediately*, no extra waiting.
- Second `.then(pr => {...})`: receives the same `pr` object back (since it was returned,
  not copied), sets `pr.status = "approved"`, logs `PR-001 approved`, returns it again.
- Third `.then(pr => {...})`: sets `pr.status = "notified"`, logs `PR-001 notified`,
  returns it.
- `.catch(err => ...)` sits at the very end and acts as **one single error handler for
  every step above it**. If `submitted(pr)` had rejected, or if any `.then` callback had
  thrown an error, execution skips straight down to this `.catch` — none of the later
  `.then`s would run.

Because every callback keeps `return`ing the same object forward, the whole chain is
really just the one `pr` object getting progressively mutated and re-logged at each
stage — a simulated multi-step workflow (submit → approve → notify).

---

## File: `promise_task3.js` — `Promise.all` for independent, parallel work

```js
const getPr = (pr) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (pr.amount < 7000) {
                resolve(pr);
            } else {
                reject("PR amount high");
            }
        }, 1000);
    });
};
```
Same wrapping pattern again, this time rejecting based on an amount check instead of an
id check.

```js
const prList = [
    { id: "PR-001", amount: 5000 },
    { id: "PR-002", amount: 8000 },
    { id: "PR-003", amount: 2000 }
];

Promise.all(prList.map(pr => getPr(pr)))
    .then(results => {
        const total = results.reduce((sum, pr) => sum + pr.amount, 0);
        console.log(`Total: ${total}`);
    })
    .catch(err => {
        console.log(`Failed: ${err}`);
    });
```
- `prList.map(pr => getPr(pr))` — runs `.map` over the array, calling `getPr` on each
  item. Because `getPr` always returns a Promise, the result of this whole `.map` is
  **an array of three Promises**, not an array of three resolved values — remember,
  calling a function that wraps `new Promise` starts the timer immediately but doesn't
  wait for it.
- `Promise.all([...])` — takes that array of Promises and gives back **one single new
  Promise**. That new Promise:
  - resolves only once **every** Promise in the array has resolved, and its resolved
    value is an **array of all their results, in the same order** as the input array
    (not the order they actually finished in).
  - rejects as soon as **any one** of them rejects — "fail fast." In this file,
    `"PR-002"` has `amount: 8000`, which is NOT less than 7000, so its `getPr` call will
    reject with `"PR amount high"`.
- Because `"PR-002"` rejects, the `.then(results => ...)` branch never runs at all — the
  whole `Promise.all` Promise rejects, and execution jumps straight to `.catch(err => ...)`,
  printing `Failed: PR amount high`.
- If all three amounts had been under 7000, `.then` would run with `results` being
  `[{id:"PR-001",amount:5000}, {id:"PR-002",amount:...}, {id:"PR-003",amount:2000}]`, and
  `.reduce((sum, pr) => sum + pr.amount, 0)` would add up all three `.amount` fields
  starting from `0`.
- Important timing point: because all three `getPr` calls start together (via `.map`),
  their 1-second timers run **in parallel**, not one after another — the whole thing
  takes about 1 second total, not 3.

---

## File: `promise_task4.js` — chained `Promise.all` steps + `allSettled`

```js
const checkBudget = (pr) =>{
    return new Promise((resolve, reject) =>{
        if(pr.amount > 10000){
            reject(`failed - over budget`)
        } else{
            pr.status = "ok"
            resolve(pr)
        }
    })
}

const reserveFunds =(pr)=>{
    return new Promise((resolve) =>{
        pr.reserved = true
        resolve(pr)
    })
}

const raisePo=(pr) =>{
    return new Promise((resolve) =>{
        resolve(`PO raise for ${pr.id}`)
    })
}
```
Three small Promise-returning steps of a workflow:
- `checkBudget` rejects if the amount is too high, otherwise tags the pr `status = "ok"`
  and resolves it.
- `reserveFunds` always succeeds — sets `pr.reserved = true` and resolves the same object.
  Notice this one's executor only takes `resolve` as a parameter (no `reject` named) —
  perfectly legal, since this step can never fail in this exercise.
- `raisePo` always succeeds too — resolves a plain description string, not the `pr`
  object itself.

```js
const pr = [
    {id: "PR-001",amount: 6000},
    {id: "PR-002", amount: 15000},
    {id: "PR-002", amount: 5000}
]

Promise.all(pr.map(prs => checkBudget(prs)))
    .then(prs => Promise.all(prs.map(pr => reserveFunds(pr))))
    .then(prs => Promise.all(prs.map(pr => raisePo(pr))))
    .then(results => console.log(results))
    .catch(err => console.log(`Flow failed: ${err}`));
```
This chains THREE separate `Promise.all` calls, one per workflow stage, across the whole
list of PRs at once:
1. `Promise.all(pr.map(prs => checkBudget(prs)))` — run budget-check on all 3 PRs in
   parallel. The second PR has `amount: 15000`, over the 10000 limit, so `checkBudget`
   rejects for it.
2. Because `Promise.all` fails fast on the **first** rejection it sees, the whole first
   `Promise.all` Promise rejects with `"failed - over budget"`.
3. That means `.then(prs => Promise.all(prs.map(pr => reserveFunds(pr))))` **never runs**
   — a rejection skips every `.then` in the chain and jumps straight to the first
   `.catch` it finds.
4. So the final `.catch(err => console.log(...))` runs, printing
   `Flow failed: failed - over budget`.
- If none of the amounts had been over budget, the chain would have gone:
  checkBudget-all → reserveFunds-all → raisePo-all → log the final array of `"PO raise
  for ..."` strings. Each `.then` returns a **new** `Promise.all(...)`, and because
  that's a Promise (not a plain value), the chain **waits** for it before moving to the
  next `.then` — this is the "return a Promise → chain waits" rule in action, just with
  `Promise.all` standing in for a single async step.

```js
Promise.allSettled(pr.map(prs => checkBudget(prs)))
    .then(results => {
        results.forEach(result => {
            if (result.status === "fulfilled") {
                console.log(result.value.status);
            } else {
                console.log(result.reason);
            }
        });
    });
```
This is a second, separate run — contrasting `Promise.all` with `Promise.allSettled`.
- `Promise.allSettled([...])` **never rejects** — it always resolves, once every input
  Promise has *settled* (either way), with an array describing each outcome individually.
- Each entry in `results` is an object shaped either:
  - `{ status: "fulfilled", value: <the resolved value> }`, or
  - `{ status: "rejected", reason: <the rejected value> }`.
- `results.forEach(result => {...})` walks through all three outcomes:
  - if `result.status === "fulfilled"`, print `result.value.status` — the `.status`
    field that `checkBudget` set on the pr object (`"ok"`) for the two PRs under budget.
  - otherwise (`"rejected"`), print `result.reason` — the rejection message
    `"failed - over budget"` for the one over-limit PR.
- The key behavior difference from `Promise.all`: `allSettled` lets you see **every**
  result, success and failure together, instead of stopping at the first failure.

---

## File: `promise_task5.js` — full multi-step flow: dependent steps + bundling data

```js
const validate=(pr)=>{
    return new Promise((resolve, reject) =>{
        if(pr.id == null|| pr.amount <=0){
            reject(`Invalid`)
        }
        else{
            resolve(pr)
        }
    })
}
```
Validates a PR object: `pr.id == null` checks for both `null` and `undefined` in one go
(using loose `==` against `null` is one of the few places loose equality is actually the
idiomatic, intentional choice in JS — it deliberately catches both). `pr.amount <= 0`
checks for a non-positive amount. Rejects `"Invalid"` if either is wrong, else resolves
the whole `pr` object unchanged.

```js
const checkBudget =(pr)=>{
    return new Promise((resolve, reject) =>{
        if(pr.amount >10000){
            reject(`over budget`);
        }
        else{
            resolve(pr);
        }
    })
}
```
Same budget-limit idea as before: reject above 10000, else resolve the `pr`.

```js
const raisePo = (pr)=>{
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve(`PO-${pr.id} raised`);
        }, 1000);
    })
}
```
Resolves (after a fake 1-second delay) a string describing the raised purchase order,
built from `pr.id` with a template literal.

```js
const getApprovers=(dept)=>{
    return new Promise((resolve) =>{
        resolve([`Kishore`,`Jk`])
    })
}

const getBudget =(dept)=>{
    return new Promise((resolve) =>{
        resolve(50000)
    })
}
```
Two more Promise-returning helper functions — both ignore the `dept` argument they
receive and always resolve a fixed value (an array of names, and a number). They exist
to represent "look something up by department," even though this version is hardcoded.

```js
const prList ={id:"PR-001",dept: "IT", amount: 6000 }
```
A single PR object this time, not an array — this file demonstrates one PR going through
a whole pipeline, not many PRs in parallel.

```js
validate(prList)
  .then(pr => checkBudget(pr))              // returns pr
  .then(pr =>
    Promise.all([getApprovers(pr.dept), getBudget(pr.dept)])
      .then(([approvers, budget]) => ({ pr, approvers, budget }))  // bundle ALL together
  )
  .then(data =>
    raisePo(data.pr).then(po => ({ ...data, po }))  // add po to the bundle
  )
  .then(data =>
    console.log(data)
    //console.log(`${data.po} | approvers: ${data.approvers.length} | budget: ${data.budget}`)
  )
  .catch(err => console.log("Flow failed:", err));
```
This is the most advanced chain of the module — it solves the problem: **"a later step
needs more than one earlier value, but `.then` only ever hands you the single thing the
previous step returned."**

- `validate(prList)` kicks off the chain, Promise-wrapped `prList` in, resolved `pr` out.
- `.then(pr => checkBudget(pr))` — a *dependent* step: it needs the validated `pr` before
  it can run, so it's correctly chained, not parallelized. `checkBudget` returns a
  Promise, and that Promise is `return`ed out of the `.then` callback, so the chain
  **waits** for it before continuing — exactly the "return a Promise → chain waits" rule.
- The third `.then`:
  ```js
  .then(pr =>
    Promise.all([getApprovers(pr.dept), getBudget(pr.dept)])
      .then(([approvers, budget]) => ({ pr, approvers, budget }))
  )
  ```
  Here `getApprovers(pr.dept)` and `getBudget(pr.dept)` are **independent of each other**
  (neither needs the other's result), so they're run together via `Promise.all`, not
  chained one after another — faster, and the "right" choice per the independent-vs-
  dependent rule.
  `Promise.all([...])` resolves with a 2-element array: `[approversArray, budgetNumber]`.
  `.then(([approvers, budget]) => ...)` — **array destructuring**: pulls the first
  element into a variable named `approvers` and the second into `budget`, straight out of
  that result array.
  `({ pr, approvers, budget })` — **object shorthand**, building a brand-new object whose
  keys are named after the variables (`{ pr: pr, approvers: approvers, budget: budget }`
  written the short way). This is the "bundle into an object" trick: since the next
  `.then` can only receive ONE thing, pack everything you'll need later into a single
  bundle object now. Note the parentheses around `{ ... }` — required, because an arrow
  function body that starts with `{` is normally read as "a code block," so wrapping it
  in `( )` tells JS "no, this curly-brace thing is an object I'm returning."
  This whole `Promise.all(...).then(...)` expression is itself returned out of the outer
  `.then(pr => ...)` — so again, the chain waits for this whole nested Promise to settle
  before the NEXT `.then` runs, and that next `.then` receives the **bundle object**
  (`{pr, approvers, budget}`), not just `pr` alone anymore.
- The fourth `.then`:
  ```js
  .then(data =>
    raisePo(data.pr).then(po => ({ ...data, po }))
  )
  ```
  `data` is now the whole bundle from before. `raisePo(data.pr)` kicks off the PO step
  using the `pr` stored inside the bundle. `.then(po => ({ ...data, po }))` takes the
  resolved PO string and builds a **new** object that spreads every key already in
  `data` (`pr`, `approvers`, `budget`) and adds a new key `po` on top — `{ ...data, po }`
  is shorthand for `{ pr: data.pr, approvers: data.approvers, budget: data.budget, po }`.
  This is the "add to the bundle" pattern — growing the carried-forward object one field
  at a time as more async steps complete.
- The fifth `.then(data => console.log(data))` just prints the final, fully-assembled
  bundle: `{ pr, approvers, budget, po }`, everything gathered across the whole pipeline.
  There's a commented-out alternative line showing a friendlier formatted log using
  template literals and `data.approvers.length` — left as a note-to-self, not deleted.
- `.catch(err => console.log("Flow failed:", err))` sits at the very end and would catch
  a rejection from **any** step above — `validate`, `checkBudget`, either half of the
  `Promise.all`, or `raisePo`.

---

## Gotchas worth remembering from this module

- **Reject with an `Error` object, not a bare string.** Every file in this module
  rejects with a plain string (`reject("Pr not found")`, `reject("over budget")`, etc.).
  That works, but a real `Error` object carries a `.message`, a `.name`, and a `.stack`
  (where it happened) — a string carries none of that. Module 21 fixes this habit with
  `reject(new Error("..."))` / `throw new Error("...")`.
- **`.catch()` placement matters — it only protects steps *above* it.** A single
  `.catch()` at the end of a chain covers every `.then` written before it in that same
  chain, but a rejection happening *inside* a nested `.then(...).catch(...)` wouldn't
  reach an outer `.catch` unless it's re-thrown/re-rejected. In this module everything
  uses one linear chain with one trailing `.catch`, which is the simple, correct shape to
  default to.
- **Always `return` the inner Promise inside a `.then`.** Every working file here does
  this correctly (`.then(pr => checkBudget(pr))`, nested `Promise.all(...).then(...)`
  returned out). If you forget the `return`, the outer chain doesn't wait for the inner
  Promise at all — it moves on immediately with `undefined`, and the inner work finishes
  "in the background," disconnected from your error handling.
- **Chaining independent work makes it needlessly slow.** `promise_task5.js` deliberately
  uses `Promise.all([getApprovers(...), getBudget(...)])` instead of awaiting them one
  after the other, because neither depends on the other's result. Chaining two unrelated
  async calls back-to-back (`.then(() => stepA()).then(() => stepB())`) when they don't
  actually need each other just adds up their delays for no benefit.
- **`Promise.all` fails fast; `Promise.allSettled` never rejects.** `promise_task4.js`
  shows both side by side on the exact same input array — same budget check, but `all`
  throws away all results the instant one PR fails, while `allSettled` reports every
  single outcome (fulfilled or rejected) so you can inspect each one. Use `all` when one
  failure should cancel the whole operation; use `allSettled` when you want a full report
  even with partial failures.
- **An accidental global (`pr = {...}` with no `const`/`let`) in `promise_task2.js`.**
  This happens to "work" in a plain script, but it's a bug waiting to surprise you with
  a name collision later, and ES modules/strict mode would throw a `ReferenceError`
  instead of silently allowing it. Always declare variables.
- **`.map()` over an array of Promise-returning calls produces an array of Promises, not
  values** — seen in task 3 and task 4 (`prList.map(pr => getPr(pr))`). You then need
  `Promise.all(...)` (or `allSettled`) to turn that array of pending Promises into one
  Promise for the whole batch; `.map` by itself never waits for anything.
