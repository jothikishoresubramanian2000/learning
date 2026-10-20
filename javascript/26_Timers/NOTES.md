# Module 26 — Timers & the Event Loop — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

JavaScript runs on **one single thread** — it can only ever do ONE thing at a time. So
how does it handle timers, network calls, and Promises, which clearly take time, without
freezing everything while waiting? The answer is the **event loop**, and this module is
about understanding its exact ordering rules, because that ordering is often surprising
at first.

The pieces:
- **Call stack** — where currently-running synchronous code actually executes, one line
  at a time, top to bottom. While anything is on the call stack, NOTHING else can run.
- **Background APIs** — where timers (`setTimeout`), I/O, and network requests are
  physically counted down / waited on, *outside* of the JS thread itself (handled by the
  browser or, in Node, by `libuv`), so they don't block the call stack while waiting.
- **Queues** — once a background task finishes, its callback doesn't run immediately; it
  gets placed into a queue, waiting for its turn.
- **The event loop** — a process that constantly checks: "is the call stack empty right
  now?" Only once it is, does it pull the next waiting callback off a queue and run it.

**Two separate queues, with a strict priority order:**
1. **Microtasks** (Promise `.then`/`.catch`/`.finally`, `async` function continuations) —
   higher priority. The event loop drains **the entire microtask queue** before moving on.
2. **Macrotasks** (`setTimeout`, `setInterval`, I/O callbacks) — lower priority. The event
   loop runs just **one** macrotask, then checks the microtask queue again, before running
   the next macrotask.

The single most important rule to memorize: **all synchronous code runs first, no matter
what; then all pending microtasks (Promises) run; only then does even a `setTimeout(fn, 0)`
get its turn.**

---

## File: `eventloop_task2.js` — proving the sync → microtask → macrotask order

```js
console.log("1")

const promise = Promise.resolve().then(print=>{console.log("3")})
const sT = setTimeout(()=>{console.log("2")},0)
console.log("4")
```
- `console.log("1")` — runs immediately, synchronously. First thing printed: `1`.
- `const promise = Promise.resolve().then(print=>{console.log("3")})` —
  `Promise.resolve()` creates an **already-fulfilled** Promise instantly (no waiting
  needed at all — it's not like a pending Promise with a timer inside, it's resolved the
  moment it's created). `.then(print => {...})` attaches a callback to run once that
  Promise settles — but even though the Promise is already resolved, **`.then` callbacks
  are never run synchronously/immediately** — they are always deferred to the
  **microtask queue**, to run only after all currently-executing synchronous code
  finishes. (The parameter is named `print` here, which is a bit misleading — it's
  really just the resolved value, unused inside the callback, named purely out of habit;
  it doesn't call anything named `print`.)
- `const sT = setTimeout(()=>{console.log("2")},0)` — schedules a **macrotask**. Even
  with a delay of `0` milliseconds, this does NOT run immediately — it's queued in the
  macrotask queue, which only gets checked once the call stack is empty AND the
  microtask queue has been fully drained.
- `console.log("4")` — still synchronous code, runs right away. Second thing printed: `4`.
- At this point, all synchronous code (the whole top-to-bottom script) has finished
  running, so the call stack is empty. The event loop now checks the microtask queue
  first: the `.then(...)` callback is waiting there, so it runs next, printing `3`.
  **Only after** the microtask queue is completely empty does the event loop look at the
  macrotask queue and run the `setTimeout` callback, printing `2`.
- **Final printed order: `1`, `4`, `3`, `2`.** This is the exact example from
  `js_learning_notes.md`'s "two queues" table, written out as a real runnable file —
  proof that Promises always beat timers, even a timer with `0` delay, and that sync code
  always runs before either.

---

## File: `eventloop_task3.js` — a busy synchronous loop blocking a timer, plus a
written-out explanation

```js
time = setTimeout(()=>{console.log("timer done")},0)
for(let i = 0; i<=20;i++){
    if(i==20){
        console.log("sync done")
    }
}
```
- `time = setTimeout(...)` — note: no `const`/`let` here either (another instance of the
  accidental-global pattern seen a few times already in earlier modules) — schedules a
  macrotask with a `0`ms delay.
- `for(let i = 0; i<=20;i++){ if(i==20){ console.log("sync done") } }` — a plain
  synchronous loop counting `i` from `0` up to `20` (inclusive, because of `<=`). Only
  when `i` reaches exactly `20` does it log anything — so this loop runs 21 times total
  but only logs once, on the very last iteration.
- Even though `setTimeout` was scheduled *first* in the source code, it is **not** the
  first thing that logs: the `for` loop is 100% synchronous — it occupies the call stack
  completely until it finishes all 21 iterations — and a scheduled timer, no matter how
  short its delay, can only ever run **after** the currently-running synchronous code
  finishes and control returns to the event loop.
- So the real printed order is `sync done` first, then `timer done` — even though the
  timer line appears first when reading top to bottom in the source.

```js
 // syncronous thread is priority is js, this for loop first in call stack
 // the async function waits in webapi or whatever the global environment, and once all code is gone finished
 // the asyn function is pushed inside the callback queue and the event listener see if call stack is free
 // if free global execution context is created and then the asyn function is done and pushed out of the execution context and as well the call queue
```
These trailing comments are a self-written explanation capturing the reasoning in plain
words (with a few spelling slips — "syncronous," "asyn," "webapi" — left exactly as
written, since they're genuine working notes, not meant to be a polished quote). Restated
cleanly: synchronous code always has priority and fully occupies the call stack first;
async callbacks (like the timer here) wait in a background environment until the
synchronous code is completely done; once the call stack is free, the event loop moves
the waiting callback from its queue onto the (now-empty) call stack to finally run it.

---

## File: `timer_task1.js` — `setInterval` with a self-clearing counter

```js
const timerFunction =()=>{
    let count = 0
    const id = setInterval(function cb(){ count++;
        if(count == 3){
            clearInterval(id)
        }
        console.log("tick")},1000)
}

timerFunction()
```
- `let count = 0` — a counter variable, local to one call of `timerFunction`, captured
  by **closure** (Module 13) inside the `setInterval` callback below — each tick can see
  and update this same `count` variable because the callback function was defined inside
  the same scope where `count` lives.
- `const id = setInterval(function cb(){ ... }, 1000)` — **`setInterval`**, unlike
  `setTimeout`, runs its callback **repeatedly**, forever, once every `1000`ms (1 second),
  until something explicitly stops it. `setInterval` returns an id (stored here in `id`)
  that can later be passed to `clearInterval(id)` to stop the repetition. The callback is
  given a name, `cb`, right in the function expression itself (a "named function
  expression") — this isn't required, but it's a nice touch for readability in stack
  traces/debugging, and it also means the function could refer to itself by `cb` inside
  its own body if it ever needed to (it doesn't here).
- Inside the callback: `count++` increments the shared counter first, **then**
  `if(count == 3){ clearInterval(id) }` checks whether it's reached 3 — and
  **critically, `console.log("tick")` runs regardless, every single time**, including on
  this third/final tick, because the `clearInterval(id)` call only **stops future**
  ticks from being scheduled — it does not cancel or skip the *current*, already-running
  callback invocation. So the full flow is: tick 1 (count=1, log "tick"), tick 2
  (count=2, log "tick"), tick 3 (count=3, `clearInterval` runs, THEN log "tick" still
  happens one final time), and then no more ticks ever fire again.
- **`clearInterval` is mandatory** for any `setInterval` that should eventually stop —
  without it, this would print `"tick"` forever, every second, for as long as the
  program kept running — a real and easy-to-create bug (a "leaked" timer).

---

## Gotchas worth remembering from this module

- **A `setTimeout(fn, 0)` never runs synchronously, and never truly "runs now" — `0`
  means "as soon as possible after the current sync code and all pending microtasks are
  done," not "immediately."** Both `eventloop_task2.js` and `eventloop_task3.js` are
  built specifically to make this visible: the timer line appears early in the source but
  its log always prints last.
- **Promises (microtasks) always run before timers (macrotasks), even a `0`ms timer.**
  `eventloop_task2.js`'s final order (`1, 4, 3, 2`) is the clean textbook proof of this —
  worth re-deriving from scratch any time the ordering feels unintuitive: sync first,
  then ALL microtasks, then one macrotask at a time.
- **A heavy/slow synchronous loop fully blocks everything else, including timers that
  were already scheduled.** `eventloop_task3.js`'s loop is small (21 iterations, finishes
  instantly) so the effect isn't dramatic here, but the principle it demonstrates is the
  real backend danger called out in `js_learning_notes.md`: a genuinely slow synchronous
  loop in a Node server would freeze the entire single thread, stalling every other
  request the server is trying to handle at the same time — `await`ing something doesn't
  block the thread, but heavy synchronous computation absolutely does.
- **`setInterval` needs an explicit `clearInterval` to ever stop — it does not stop
  itself.** `timer_task1.js`'s whole point is the self-stopping pattern: keep a counter in
  closure, check it inside the callback, and call `clearInterval(id)` once some condition
  is met. Forgetting this (or getting the condition wrong) creates a timer that silently
  runs forever in the background — a classic resource leak.
- **Calling `clearInterval` inside the final tick's callback does not cancel that
  same, already-in-progress tick** — only future scheduled ticks. `timer_task1.js`
  deliberately places `console.log("tick")` *after* the `if(count==3){clearInterval...}`
  check, so all 3 ticks visibly log before stopping, rather than only 2.
- **Missing `const`/`let` on `time = setTimeout(...)`** in `eventloop_task3.js` is the
  same accidental-global pattern flagged in earlier modules (Module 19's `promise_task2.js`,
  Module 24's `collections_task3.js`) — worth continuing to watch for and avoid, since it
  quietly creates a global variable instead of a properly scoped one.
