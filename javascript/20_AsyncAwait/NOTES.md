# Module 20 — async / await — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

`async`/`await` is NOT a different thing from Promises — it's **the exact same Promise
machinery underneath**, just with nicer syntax on top so async code reads top-to-bottom
like ordinary synchronous code, instead of as a chain of `.then()` calls.

Two keywords:
- **`async`** goes in front of a function definition. It does two things: (1) it allows
  `await` to be used inside that function's body, and (2) it makes that function **always
  return a Promise**, even if you just write a plain `return someValue` inside it — JS
  automatically wraps that value in a resolved Promise for you.
- **`await`** goes in front of an expression that produces a Promise. It pauses the
  `async` function (NOT the whole program) at that exact line until the Promise settles,
  then:
  - if the Promise **resolved**, `await` "unwraps" it and hands back the plain resolved
    value, as if it were a totally ordinary variable.
  - if the Promise **rejected**, `await` **throws** that rejection as a regular JS
    exception at that line — which a surrounding `try/catch` can catch exactly like any
    other thrown error.

This last point is the single most important idea of the module: **`reject`/`throw`
become the same event** once you're inside `async`/`await` code. A `throw` inside a
plain (non-Promise) function you call with `await`, and a `reject(...)` inside a
Promise's executor, both show up at the `await` line as something `try/catch` can catch.

---

## File: `async_task1.js` — `try/catch` around `await`, and a timing surprise

```js
const getPr = (pr)=>{
    if(pr.id === "PR-001"){
        pr.amount = 5000
        return pr
    }
    else{
        throw `Error: not found`
    }
}
```
Notice this function is **not** `async` and does **not** return a `new Promise(...)` —
it's a completely ordinary synchronous function. It either mutates `pr` (adds an
`.amount` field) and `return`s it, or it `throw`s a value (again, a bare string here
rather than an `Error` object — same habit as Module 19, fixed properly in Module 21).

```js
async function flow(pr){
    try{
        const prStatus = await getPr(pr)
        console.log(`Amount: ${pr.amount}`)
    }
    catch(err){
        console.log(err)
    }
}
```
- `async function flow(pr) { ... }` — declares `flow` as an `async` function, so `await`
  is legal inside it and calling `flow(...)` always returns a Promise (even though
  nothing inside explicitly builds one).
- `const prStatus = await getPr(pr)` — here's the interesting part: `getPr` is a
  **plain, synchronous** function, not one that returns a Promise. `await` still works
  on it perfectly fine! `await` on a non-Promise value just immediately "resolves" to
  that value with no actual waiting. So this line really just means "call `getPr(pr)`,
  and if it throws, let `catch` below handle it; if it returns normally, store the
  result in `prStatus`." (`prStatus` itself is never actually used afterwards — a loose
  end in this file, but harmless.)
- `console.log(\`Amount: ${pr.amount}\`)` — logs the amount directly off the **original**
  `pr` object passed into `flow`, which `getPr` mutated in place (objects are passed by
  reference, so `pr.amount = 5000` inside `getPr` really did change the same object
  `flow` is holding).
- `catch(err){ console.log(err) }` — if `getPr` threw (the "not found" case), the thrown
  value lands here as `err` and gets printed.

```js
const pr1 = {id:"PR-999"}
const pr2 = {id:"PR-001"}

flow(pr1)
console.log("Hi")
flow(pr2)
console.log("Hi")
```
This bottom part is a deliberate demonstration of **how `async` functions actually run**.
- `flow(pr1)` is called. Since `getPr` here is synchronous and there's no real `await`-ing
  of an actual pending Promise anywhere in this file, `flow(pr1)` effectively runs to
  completion (hits the `throw`, catches it, logs the error) basically immediately —
  but it's still an `async` function, so technically its `console.log(err)` runs as a
  **microtask**, meaning it's scheduled to run only once the *currently executing*
  synchronous code finishes.
- `console.log("Hi")` — this synchronous line runs next, in between the two `flow(...)`
  calls, because `flow`'s internal logging is deferred to the microtask queue, not run
  inline.
- `flow(pr2)` starts next, same deal.
- `console.log("Hi")` runs again.
- So the real printed order ends up interleaved: `"Hi"`, `"Hi"` (the two synchronous
  lines) tend to print **before** the async functions' internal `console.log`s resolve,
  even though `flow(pr1)`/`flow(pr2)` were literally called earlier in the source. This
  is the exact same "sync code always runs before queued async callbacks" rule from
  Module 26 (Event Loop), just appearing here for the first time through `async`
  functions instead of `setTimeout`/Promises directly.

---

## File: `async_task2.js` — sequential dependent steps + a parallel pair

```js
const checkEmail =(user)=>{
    if(user.email === "taken@x.com"){
        throw "email taken"
    }
    else{
        return user
    }
}
```
Plain synchronous function again — `throw`s a string if the email is already taken,
otherwise returns the `user` object unchanged.

```js
const createUser = (user)=>{
    return new Promise((resolve) =>{
        setTimeout(() => {
            user.id = "U-01 onboarded"
            resolve(user);
        }, 1000);
    })
}
```
This one IS a real Promise-returning function — wraps a 1-second `setTimeout`, mutates
`user` by adding an `.id` field, then `resolve`s the (now-mutated) `user` object. No
`reject` branch exists here — this step is modeled as always succeeding.

```js
const sendWelcome = (user)=>{
    return new Promise((resolve) =>{
        setTimeout(() => {
        resolve( `welcome send`)
    }, 1000);
    })
}

const assignRole=(user)=>{
    return new Promise((resolve)=>{
        resolve(`role: member`)
    })
}
```
- `sendWelcome` — another 1-second-delayed Promise, resolving a confirmation string
  (ignores its `user` argument, just a stand-in for "would send an email").
- `assignRole` — resolves **instantly** (no `setTimeout`) with a fixed string. Also
  ignores its argument.

```js
async function flow (user){
    try{
        let checked = await checkEmail(user)
        let created = await createUser(checked)

        let [send,assign] = await Promise.all([sendWelcome(created),assignRole(created)])
        console.log(`${created.id} | ${send}|${assign}`)
    }
    catch(err){
        console.log(err)
    }
}
```
- `let checked = await checkEmail(user)` — `checkEmail` is synchronous, but exactly like
  task 1, `await` on it still works: if it throws (`"email taken"`), the `catch` below
  catches it; otherwise `checked` becomes the returned `user` object.
- `let created = await createUser(checked)` — THIS step genuinely depends on the
  previous one finishing first (you need a checked-valid user before you create them),
  so it's correctly written as a separate sequential `await`, not bundled in with
  anything else. `await` pauses `flow` here for the real 1-second timer inside
  `createUser` before `created` gets its value (the mutated user object, now carrying
  `.id`).
- `let [send,assign] = await Promise.all([sendWelcome(created),assignRole(created)])` —
  this is the key "sequential vs parallel" lesson of the module. `sendWelcome` and
  `assignRole` do NOT depend on each other's results at all — they only both need
  `created` (which is already available). So instead of writing
  `const send = await sendWelcome(created); const assign = await assignRole(created);`
  (which would needlessly add their delays together), both calls are started at the
  same time inside one `Promise.all([...])`, and a **single** `await` waits for both
  together. `Promise.all` resolves with a 2-element array `[sendResult, assignResult]`,
  which is immediately **array-destructured** into `send` and `assign` on the left side
  of `=`. Total extra wait here is about 1 second (the slower of the two), not 1+0=1
  either way in this specific case, but in general this pattern avoids adding delays.
- `console.log(\`${created.id} | ${send}|${assign}\`)` — prints the onboarded id plus
  both parallel results, all pulled from variables that `await` unwrapped for us as if
  they were totally ordinary synchronous values.
- `catch(err){ console.log(err) }` — one catch block protects **every** `await` above it
  — whether the failure came from `checkEmail`'s `throw`, or (hypothetically) a rejection
  from any of the Promise-based steps.

```js
const user = { name: "Kishore", email: "k@x.com" }
flow(user)
```
Builds a user object whose email is NOT `"taken@x.com"`, so this run goes all the way
through the happy path and prints the final combined message.

---

## File: `async_task3.js` — proving sequential vs parallel timing with `Date.now()`

```js
const getSupplier =  (id)=>{
    return new Promise((resolve) =>{
        setTimeout(()=>{
            resolve(id)
        },1000)
    })
}
```
A Promise-returning function that waits 1 second and then resolves with whatever `id`
string it was given — a stand-in for "look up a supplier by id, which takes time."

```js
async function sequential() {
    let start = Date.now()
    let supplier1 = await getSupplier("SUP-001")
    let supplier2 = await getSupplier("SUP-002")
    let supplier3 = await getSupplier("SUP-003")

    let end = Math.round((Date.now() - start)/1000)
    console.log(`Sequential took ~${end}s`);
}
```
- `let start = Date.now()` — `Date.now()` returns the current time as a number
  (milliseconds since Jan 1 1970). Storing it in `start` lets us measure elapsed time
  later by subtracting.
- `await getSupplier("SUP-001")` then `await getSupplier("SUP-002")` then
  `await getSupplier("SUP-003")` — **three separate, back-to-back `await`s**. Each one
  fully pauses `sequential()` until its own 1-second timer finishes, and only THEN does
  the next line even start its own timer. So these three 1-second waits **stack up**:
  roughly 1 + 1 + 1 = 3 seconds total, even though none of the three calls actually
  needed each other's results — this function deliberately writes them sequentially to
  demonstrate how much slower that is when it isn't necessary.
- `let end = Math.round((Date.now() - start)/1000)` — `Date.now() - start` is the
  elapsed milliseconds; dividing by `1000` converts to seconds; `Math.round(...)` rounds
  to a whole number for a clean log message.
- Logs something like `Sequential took ~3s`.

```js
async function parallel() {
    let start = Date.now()
    const [a, b, c] = await Promise.all([
    getSupplier("PR-001"),
    getSupplier("PR-002"),
    getSupplier("PR-003"),
  ]);

  const secs = Math.round((Date.now() - start) / 1000);
  console.log(`Parallel took ~${secs}s`);
}
```
Same measurement idea, but this time all three `getSupplier(...)` calls are started
together inside one `Promise.all([...])` — all three 1-second timers run **at the same
time**, overlapping, so the whole `Promise.all` only takes about 1 second total (the
length of the single longest one), not 3. `const [a, b, c] = await Promise.all([...])`
array-destructures the three resolved ids into `a`, `b`, `c` (not actually used
afterwards here, but shown for completeness of the pattern). Logs something like
`Parallel took ~1s`.

```js
async function main() {
  await sequential();
  await parallel();
}
main();
```
- `main()` itself awaits `sequential()` first, then `parallel()` — these two calls to
  `main`'s own body ARE meant to run one after another (so their console logs print in a
  predictable, readable order), which is exactly why `await` is used here rather than
  `Promise.all([sequential(), parallel()])`. The point of the exercise is to **compare**
  the two timings side by side in the log output, not to make them faster — so
  `main` itself is intentionally sequential even while demonstrating what parallel means
  one level down.
- Net effect when run: `Sequential took ~3s` prints first, then (about 1 second later)
  `Parallel took ~1s` prints — visually proving the exact point Module 20's notes make:
  independent async work run with `Promise.all` is dramatically faster than awaiting it
  one call at a time.

---

## Gotchas worth remembering from this module

- **`await` works on non-Promise values too — it just resolves instantly.** Both
  `async_task1.js` (`await getPr(pr)`, a plain sync function) and the first line of
  `async_task2.js`'s `flow` (`await checkEmail(user)`, also plain sync) rely on this.
  It's a nice safety net: you don't have to remember whether a given helper happens to
  return a Promise or not before `await`-ing it — but it also means a forgotten `await`
  on something that actually IS async won't immediately look "wrong," it'll just hand
  you a pending `Promise` object instead of the real value, and you often won't notice
  until you try to use a field on it and get `undefined`.
- **`throw` inside a sync function, caught by `try/catch` around an `await` call to it —
  this is the resolve/reject ↔ return/throw equivalence in action**, appearing in both
  `async_task1.js` and `async_task2.js`. A plain `throw` and a Promise's `reject(...)`
  end up in the exact same `catch` block once you're inside `async`/`await` code — you
  don't need two different error-handling strategies for "sync errors" vs "async
  errors."
- **The #1 real mistake this module exists to prevent: sequential-awaiting independent
  work.** `async_task3.js` is built specifically to make the cost visible — three
  1-second calls awaited one after another take 3 seconds; the same three calls
  started together via `Promise.all` take about 1. `async_task2.js`'s
  `Promise.all([sendWelcome(created), assignRole(created)])` applies the fix for real,
  right after a genuinely *dependent* step (`createUser` after `checkEmail`) that
  correctly stays sequential. The rule: only chain `await`s one after another when a
  later step truly needs an earlier step's result; otherwise, start them together.
- **One `try/catch` around several `await`s protects all of them** — seen in both
  `async_task1.js` and `async_task2.js`. You don't need (and shouldn't write) a separate
  `try/catch` per `await` line unless you genuinely need different recovery behavior for
  different steps.
- **Faking an async delay requires `new Promise` + `resolve` inside `setTimeout` — a bare
  `setTimeout` is not itself a Promise.** Every delayed function in this module
  (`createUser`, `sendWelcome`, `getSupplier`) follows the correct pattern: wrap in
  `new Promise((resolve) => { setTimeout(() => resolve(value), ms); })`. If you instead
  wrote `return setTimeout(() => value, ms)` directly, `await` on it would do nothing
  useful — `setTimeout` itself returns a timer id, not a Promise, and a `return` inside
  the timeout callback goes nowhere (it's not returning from the outer function at all).
