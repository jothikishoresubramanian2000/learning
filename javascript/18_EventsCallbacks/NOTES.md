# Module 18 — Events & Callbacks

## What I learned today

A **callback** is just a regular function, passed as an *argument* into another
function, with the understanding "run this for me once you're ready / once
you're done." That's the entire idea — nothing magic about it syntactically,
functions are already values in JS (I knew that from Module 8), this module is
really about the *pattern* of handing one off to be run later rather than
calling it myself directly.

The reason this pattern matters so much is **async ordering**: JS doesn't freeze
and wait on slow operations (timers, network calls, file reads). It kicks the
slow thing off, immediately moves on to the next line of code, and only comes
back to run the callback once the slow thing is actually finished — which could
be lines, or even whole functions, later in real time. This means the order
things print can be completely different from the order they're *written* in the
file.

Node also has a very specific convention for callbacks called the
**error-first callback**: the first parameter is always the error (or `null` if
nothing went wrong), the second is the actual result. `(err, result) => {...}`,
always in that order — it's not enforced by the language, it's just the
agreed-upon shape every built-in Node function and most libraries follow.

The big practical downside of callbacks shows up once several async steps need
to happen one after another, each depending on the last one's result: the code
has to nest deeper and deeper, one callback inside another inside another. This
is called **Callback Hell**, and it's the entire reason Promises (Module 19) and
`async`/`await` (Module 20) exist — they're solving exactly this nesting problem,
not inventing a new concept from scratch.

**Events** are callbacks organized around a *name*, with support for *many*
independent listeners reacting to the same thing. `.on(eventName, fn)`
subscribes a listener; `.emit(eventName, data)` fires the event, running every
listener registered for that name. The real win over a plain callback: the thing
firing the event (the **emitter**) doesn't need to know or care who's listening,
or how many listeners there are — it just announces "this happened," and
whoever's interested reacts on their own. That's **decoupling**.

---

## File: `callback_task1.js` — line by line

```js
const pr = {
        id: "PR-001",
        amount: 10000
    }
const processPr = (pr,callback) =>{
    let gstPrAmount = pr.amount + (pr.amount * 0.18);
    callback(pr.id,gstPrAmount);
}
```
A `pr` object with an `id` and an `amount`. `processPr` takes **two**
parameters: `pr` and `callback`. Notice the parameter is also named `pr` — this
is **shadowing** (same idea as Module 13): inside `processPr`, the name `pr`
refers only to whatever gets passed in as the first argument, not the outer
`const pr` above it, even though they share a name. Inside, it computes 18% GST
on top of the amount (`amount + amount*0.18`), stores it in `gstPrAmount`, and
then **calls** `callback`, handing it `pr.id` and the computed total as
arguments. This call happens immediately, synchronously — nothing about this
particular callback is actually delayed; it's still a genuine example of the
*callback pattern* (a function handed in to be run by someone else), just not an
asynchronous one.

```js
processPr(pr,(id,gstAmount)=>{console.log(`${id} total:${gstAmount}`);
})
```
Calls `processPr`, passing the real outer `pr` object and an inline arrow
function as the callback. Inside `processPr`, `amount` is `10000`, so
`gstPrAmount = 10000 + 1800 = 11800`. The callback then runs with
`id = "PR-001"` and `gstAmount = 11800`, printing `PR-001 total:11800`.

---

## File: `callback_task2.js` — line by line

```js
console.log("1 submitting");

setTimeout(()=>{console.log(`2 approved (after 1s)`)},1000)
console.log("3 next task");
```
This is the clearest possible demonstration of async ordering. `"1 submitting"`
prints immediately. `setTimeout` is handed an arrow function and a delay of
`1000` ms — but calling `setTimeout` does **not** pause anything; it just tells
JS "run this function in at least 1 second," registers it, and returns control
*immediately* so the very next line can run right away. `"3 next task"` prints
next, well before a single second has passed. Only once there's nothing else
left to run does JS actually check back in on the timer and run its callback,
printing `2 approved (after 1s)` roughly a second later. The numbers in the log
messages (`1`, `2`, `3`) are a deliberate hint from past-me about what order
things were *expected* to print in versus the order they're *written* in.

```js
const validatePr = (pr, callback)=>{
    let error = pr.amount <= 0 ? true:false
    callback(error, pr.id)
}
```
`validatePr` checks whether `pr.amount` is `<= 0` and stores `true`/`false` in
`error` (a ternary used purely to produce a boolean — `pr.amount <= 0` already
*is* a boolean, so this could be written as just `let error = pr.amount <= 0`,
but it works correctly as written either way). It then calls `callback(error,
pr.id)` — **error first, then data**, matching the Node error-first convention
even though this is hand-rolled rather than a real Node API.

```js
validatePr({ id: "PR-002", amount: 0},(err,id)=>{
    if(err) 
       return console.log("Failed: invalid amount"); 
    
    console.log(`Valid: ${id}`)})
validatePr({ id: "PR-003", amount: 5000 },(err,id)=>{
    if(err) 
       return console.log("Failed: invalid amount"); 
    
    console.log(`Valid: ${id}`)})
```
Two calls, each with its own inline callback. In the callback, `if(err) return
console.log(...)` — this is a **guard clause**: `console.log` itself always
returns `undefined`, so the `return` here isn't handing back anything useful to
whoever called the callback; it's purely being used to **exit the function
early** so the line below it (`console.log(\`Valid: ${id}\`)`) doesn't also run
in the error case. First call: `amount` is `0`, so `0 <= 0` is `true` → `error =
true` → callback runs with `err = true` → prints `Failed: invalid amount`.
Second call: `amount` is `5000`, so `error = false` → callback runs with `err =
false` → skips the `if`, prints `Valid: PR-003`.

Both `validatePr` calls run fully, synchronously, **before** the 1-second timer
from the top of the file ever fires. Putting the whole trace together, the
actual printed order for this file is: `1 submitting`, `3 next task`, `Failed:
invalid amount`, `Valid: PR-003`, and only after about a second, `2 approved
(after 1s)`.

---

## File: `callback_task3.js` — line by line

```js
const pr = "PR-001";

const notify =(pr,callback) =>{
    callback(pr)
}
const approve =(pr,callback)=>{
    callback(pr)
    notify(pr,pr => console.log(`notified ${pr}`))
}
const submit = (pr,callback)=>{
    callback(pr)
    approve(pr,pr => console.log(`Approved ${pr}`))
}
```
This time `pr` at the top is just a plain string, `"PR-001"`. All three
functions — `notify`, `approve`, `submit` — reuse the parameter name `pr`, and
every inline callback passed into them *also* uses `pr` as its parameter name.
None of these are actually the same variable — each one is its own local
parameter, shadowing everything outside it — they just all happen to be handed
the identical string value as it gets threaded down through each call, so the
output looks consistent even though there are really five-plus completely
separate `pr` bindings involved. Each function's job is: run the callback it was
given, then call the *next* function in the chain, handing that one a brand-new
inline callback of its own.

```js
submit(pr,pr => console.log(`Submitted ${pr}`))

//each needs to call other so it grows too much nested and promise will fix this
```
Tracing the call: `submit("PR-001", cb1)` where `cb1` logs `Submitted PR-001` →
runs `cb1(pr)` → prints `Submitted PR-001` → then calls `approve("PR-001", cb2)`
where `cb2` logs `Approved PR-001` → inside `approve`: runs `cb2(pr)` → prints
`Approved PR-001` → then calls `notify("PR-001", cb3)` where `cb3` logs `notified
PR-001` → inside `notify`: runs `cb3(pr)` → prints `notified PR-001`. Final
order: `Submitted PR-001`, `Approved PR-001`, `notified PR-001`. His own comment
at the bottom is the real takeaway of this file: every new step in a process like
this means another function that has to explicitly know about and call the next
one, with its own nested callback — exactly the "pyramid" shape that gets
unmanageable fast once there are more than two or three steps, and exactly the
problem Promises exist to flatten.

---

## File: `event_task4.js` — line by line

```js
const EventEmitter = require("events");
const bus = new EventEmitter();
```
`require("events")` pulls in Node's **built-in** `events` module (no install
needed) and gives back the `EventEmitter` class. `new EventEmitter()` creates an
actual instance, `bus` — this is the central hub that listeners subscribe to and
that announcements get broadcast through. (Same idea as a radio station: `bus`
is the station itself.)

```js
bus.on("pr.submitted",(pr)=>{
    console.log("Email send for", pr)
})

bus.on("pr.submitted",(pr)=>{
    console.log("Audit logged for", pr)
})
```
Two **separate** `.on` calls, both subscribing to the exact same event name,
`"pr.submitted"`. This is allowed and normal — an event can have any number of
independent listeners, and all of them will run, in the order they were
registered, whenever that event fires. Neither listener knows the other exists.

```js
bus.emit("pr.submitted","PR-001")
bus.emit("pr.submitted","PR-002") // It doesn't need to know who, it just needs to pr.submitted? and the listeners just do their job
```
`.emit(name, data)` fires the event **synchronously and immediately** — it calls
every listener registered under `"pr.submitted"`, in registration order, passing
`data` as that listener's argument. First `emit("pr.submitted", "PR-001")` runs
both listeners back to back: `Email send for PR-001`, then `Audit logged for
PR-001`. Second `emit("pr.submitted", "PR-002")` does the same with `"PR-002"`:
`Email send for PR-002`, then `Audit logged for PR-002`. His comment captures the
actual point of this whole pattern precisely: `bus.emit` has zero knowledge of
what the two listeners do, or that there even are two of them — it just
broadcasts "this event name happened, here's the payload," and whoever
subscribed reacts independently. A third listener could be added later with
another `.on(...)` and `bus.emit` would never need to change at all.

---

## Gotchas worth remembering from this module

- **Code order on the page is not execution order once timers are involved.**
  `callback_task2.js` is the clean proof: the `setTimeout` call is textually
  second, but its callback is the very *last* thing to print. Always trace
  "what's synchronous (runs now, top to bottom)" separately from "what's
  scheduled for later" before predicting output order.

- **`return console.log(...)` is a guard-clause trick, not a meaningful return
  value.** `console.log` always returns `undefined` — the `return` in
  `callback_task2.js`'s inline callbacks exists purely to stop the function
  early so the success-path line underneath doesn't also execute. It's easy to
  misread this as "returning the logged message" when it isn't returning
  anything usable at all.

- **Reusing the same parameter name everywhere (`pr`) works, but it's
  confusing.** `callback_task1.js` and especially `callback_task3.js` both name
  every parameter and every inline callback argument `pr`, shadowing the outer
  `pr` repeatedly. It happens to behave correctly here because the exact same
  value gets threaded through unchanged at every step, but it would be very easy
  to assume there's only "one `pr`" being mutated across all these functions when
  there are actually several completely separate local bindings.

- **The error-first signature `(err, result)` is a hard convention, not
  optional.** `callback_task2.js`'s `callback(error, pr.id)` follows it
  correctly. Getting the order backwards (`callback(pr.id, error)`) is a classic
  real-world bug once this pattern is used with actual Node APIs that all expect
  `err` first.

- **Callback Hell is a real, visible shape, not just a scary term.**
  `callback_task3.js` is only three steps deep and it's already nested three
  functions inside each other, each needing its own inline callback just to move
  to the next step. That nesting only gets worse with more steps — which is
  exactly the motivation for Promises and `async`/`await` in the next two
  modules, not a separate, unrelated feature.

- **`EventEmitter.emit` runs listeners synchronously, right then and there** —
  it is easy to assume anything "event-related" must be async, but
  `event_task4.js`'s two listeners both run immediately and in the exact order
  they were registered with `.on`, with no delay at all involved anywhere in
  that file.
