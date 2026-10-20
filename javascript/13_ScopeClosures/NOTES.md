# Module 13 — Scope & Closures

## What I learned today

Before this module I was writing variables wherever and just hoping they were
visible where I needed them. **Scope** is the actual rule book for that: it answers
"from this exact line of code, which variables can I even see?" There are four
flavors — **global** (visible everywhere), **function** (visible only inside the
function it was declared in), **block** (anything in `{ }` declared with `let`/`const`
— `var` cheats and ignores block scope, which is one of the reasons `var` is
avoided), and **lexical scope**, which is really the glue that makes the other three
work: code *inside* a function can see variables from *outside* it, but never the
reverse. JS looks a variable up by walking outward — current block, then the
function that wraps it, then whatever wraps that, all the way to global — and stops
at the first match. That walk is called the **scope chain**. If it reaches global
and still finds nothing, that's a `ReferenceError`.

**Closures** are the big payoff of lexical scope. A closure is what happens when an
inner function is handed back out of the function that created it, and it keeps a
*live, working link* to the variables from that outer function — even though the
outer function has already finished running and would normally have its variables
thrown away. It's not a copy of the value, it's a genuine ongoing connection. The
mental picture that finally made this click for me: the inner function packs the
outer variables into a **backpack** before it leaves, and carries that backpack
with it wherever it goes afterward. Every one of my task files below is really the
same shape: an outer "factory" function holds some private data, and returns an
inner function (or object of functions) that is the *only* way to touch that data
from the outside.

---

## File: `scope_task1.js` — line by line

```js
const myName = "JK";
```
A constant at the very top level of the file. This lives in **global scope** —
every function in this file, no matter how deeply nested, will be able to see it
through the scope chain.

```js
const outerFun =() =>{
```
`outerFun` is declared with `const` and assigned an arrow function with no
parameters. Nothing inside runs yet — this line only *creates* the function and
stores it in the variable.

```js
    const outerVar = "Outer data";
```
A variable local to `outerFun`'s **function scope**. It exists only while
`outerFun` is actually running (plus a bit longer, if something keeps a closure
over it — see below), and it is invisible from outside `outerFun`.

```js
    const innerfun = ()=>{
        const innerVar = "Inside data";
        console.log(myName,outerVar,innerVar)
    }
```
A second arrow function, defined *inside* `outerFun`, stored in `innerfun`. Inside
it, `innerVar` is declared — scoped only to `innerfun` itself. The `console.log`
line asks for three names: `myName` isn't found in `innerfun`'s own scope, so JS
walks outward to global and finds it there. `outerVar` isn't found locally either,
so JS walks outward to `outerFun`'s scope and finds it there. `innerVar` is found
immediately, in `innerfun`'s own scope. This is the scope chain in action: inner
code can see everything above it, all the way up.

```js
    innerfun();
```
This is where `innerfun` actually executes (just defining it above didn't run
it). Output of this line: `JK Outer data Inside data`.

```js
    console.log(innerVar) // ref error as innerVar is scope closed
}
```
Now we're back in `outerFun`'s own body, *after* `innerfun` already returned. This
tries to read `innerVar` — but `innerVar` was never declared inside `outerFun`; it
only exists inside `innerfun`'s own private scope, and that scope is not visible
from the outside. Lexical scope only flows in one direction (inner sees outer,
never outer sees inner), so this throws `ReferenceError: innerVar is not defined`.
His comment calling it "scope closed" is getting at the right idea — `innerVar` is
sealed inside `innerfun` and nothing outside can reach in and grab it — though the
more precise way to say it is "it was never in `outerFun`'s scope in the first
place," rather than a closure effect. This is a plain visibility violation, not
the Temporal Dead Zone (that's a different error, covered in Module 15).

```js
outerFun();
```
The call that kicks off everything above. Because the `ReferenceError` happens
*inside* `outerFun`, and nothing in the file catches it, the script crashes at
that point — there's no code after it anyway, so no further harm.

---

## File: `closure_revision.js` — line by line

```js
const poNumberer =(dept)=>{
    let number = 0;
    const label = "PO"
    return function(){
        number ++;
        return(`${dept}-${label}-${String(number).padStart(3,"0")}`)
    }
}
```
`poNumberer` is a **factory function** — a function whose entire job is to build
and hand back *another* function. It takes one parameter, `dept`. Inside, it sets
up two private values: `number` (a running counter, starts at 0) and `label` (a
fixed string `"PO"`). Then it `return`s a brand-new, unnamed function — this
returned function is the closure. It increments `number` by one every time it
runs (`number ++`), then builds and returns a formatted string using a **template
literal** (the backtick string with `${...}` slots). `String(number)` converts the
number to text, and `.padStart(3,"0")` pads that text on the left with zeroes
until it's 3 characters long (so `1` becomes `"001"`, `12` becomes `"012"`).

The key thing: `number`, `label`, and `dept` are all variables that belong to
*this one specific call* of `poNumberer`. The returned inner function keeps a
backpack reference to exactly those three — not to variables from any other call.

```js
let hrPo = poNumberer("HR")
let itPo = poNumberer("IT")
```
Two **separate calls** to the factory. Each call creates its own brand-new
`number` (starting at 0) and its own `dept`. `hrPo` and `itPo` are two completely
independent closures — they do not share any memory with each other, even though
they came from the exact same function definition.

```js
console.log(itPo());
console.log(itPo());
console.log(hrPo());
console.log(itPo());
```
Tracing this exactly: `itPo()` → its private `number` goes 0→1 → returns
`"IT-PO-001"`. `itPo()` again → `number` goes 1→2 → `"IT-PO-002"`. `hrPo()` → this
is a *different* closure with its *own* `number`, which is still at 0 → goes 0→1 →
`"HR-PO-001"`. Then `itPo()` one more time → its `number` continues from where
*it* left off, 2→3 → `"IT-PO-003"`. HR's counter and IT's counter never interfere
with each other — that's the proof that each call to the factory creates a
genuinely separate, private memory space.

---

## File: `closure_task2.js` — line by line

```js
const counter = () =>{
    let count = 0;

    return function() {
        count ++;
        return count;
    }
}
```
Same factory shape as above, simplified: no parameters, one private variable
`count` starting at 0, and the returned function increments and returns it.

```js
const a = counter()
a();
a(); //3
console.log(a())
```
`a` is the closure returned by one call to `counter()`. `a()` is called and its
return value is thrown away (count becomes 1, but nothing is printed). `a()` again
— count becomes 2, still not printed. Then `console.log(a())` calls it a *third*
time (count becomes 3) and logs the return value, `3`. The comment `//3` next to
the second call is a little misleading at first glance — it's not saying the
*second* call returns 3, it's a note-to-self about what the *third* call (two
lines down) will print. The real lesson here: calling a closure without logging
it still runs it and still changes its private state — the counter keeps counting
whether or not you look at the result.

```js
b= counter()
console.log(b()) // second counter start from 1
```
`b` is a *new, independent* call to `counter()`, so it gets its own fresh `count`
starting at 0. `b()` → count becomes 1 → logs `1`. This confirms the same
independence shown in `closure_revision.js`: every call to the factory is a clean
slate. (There's something else going on in this exact line worth flagging — see
Gotchas below.)

---

## File: `closure_task3.js` — line by line

```js
const myAtm = (balance)=>{
    return{
        deposite(amt){return balance = amt + balance},
        withDraw(amt){return balance = amt>balance? "Insuff bal":balance - amt}
    }
}
```
`myAtm` is a factory that takes a starting `balance` and returns an **object**
(not a single function this time) with two methods on it, written with **method
shorthand** (`deposite(amt){...}` is shorthand for `deposite: function(amt){...}`).
Both methods close over the exact same `balance` variable from this one call to
`myAtm`.

- `deposite(amt)`: `balance = amt + balance` is an **assignment used as an
  expression** — it computes `amt + balance`, stores that back into the closed-over
  `balance` variable, and the assignment itself evaluates to that new value, which
  is what gets `return`ed. So in one line it both updates the private state *and*
  reports the new total.
- `withDraw(amt)`: a ternary decides what to assign/return. If `amt` is bigger
  than the current `balance`, it assigns (and returns) the string `"Insuff bal"`.
  Otherwise it assigns (and returns) `balance - amt`.

```js
const me = myAtm(100);
console.log(me.withDraw(50))
console.log(me.balance) //is locked inside — only the returned methods can change it.
```
`me` is one closure instance with a private `balance` starting at 100.
`me.withDraw(50)`: is `50 > 100`? No — so `balance` becomes `100 - 50 = 50`, and
`50` is returned and logged. Then `me.balance` — this tries to read a `balance`
*property* directly off the `me` object. But `balance` was never attached to the
object as a property; it only exists as a private variable inside the closure that
the two methods can reach. So this logs `undefined`. This is **true privacy**: the
only way to affect or observe `balance` is through `deposite`/`withDraw`, exactly
the same idea as a private class field, years before JS even had those.

---

## File: `closure_task4.js` — line by line

```js
const prNumberGen = () =>{
    const label = "PR-"
    let idNum = 0

    return function(){
        idNum++;
        return (label + String(idNum).padStart(3,"0"));
    }
}
```
Same ID-generator pattern as `closure_revision.js`, just with string
concatenation (`label + ...`) instead of a template literal, and no parameter —
every generator always uses the fixed label `"PR-"`.

```js
const prId = prNumberGen()
console.log(prId());
console.log(prId());
console.log(prId());
const prId2 = prNumberGen()
console.log(prId2());
```
`prId` is one closure: calls produce `"PR-001"`, `"PR-002"`, `"PR-003"` as its
private `idNum` climbs 1, 2, 3. `prId2` is a **brand-new, separate** call to the
factory, so its own `idNum` starts fresh at 0 — its first call produces
`"PR-001"` again, completely unaffected by `prId` having already reached 3. Same
proof as before, just a different flavor of ID.

---

## File: `closure_task5.js` — line by line

```js
const costCenter = (budget) =>{
    return {
        spend(amount){return budget = amount<=budget? (budget - amount):"Budget exceeded"}
    }
}
```
A factory holding a private `budget`. `spend(amount)` is a ternary, same
assignment-as-expression trick as `closure_task3.js`: if `amount` fits within the
remaining `budget`, it assigns (and returns) `budget - amount`. Otherwise it
assigns (and returns) the *string* `"Budget exceeded"`.

```js
const itBudget = costCenter(10000)
console.log(itBudget.spend(1000));
console.log(itBudget.spend(9000));
console.log(itBudget.spend(1000));
console.log(itBudget.budget);
```
Tracing it: start `budget = 10000`. `spend(1000)`: `1000 <= 10000` → true →
`budget = 10000 - 1000 = 9000` → logs `9000`. `spend(9000)`: `9000 <= 9000` → true
→ `budget = 9000 - 9000 = 0` → logs `0`. `spend(1000)`: `1000 <= 0` → **false** →
`budget` gets assigned the *string* `"Budget exceeded"` → logs `"Budget exceeded"`.
Last line, `itBudget.budget`, logs `undefined` for the same reason as
`closure_task3.js` — `budget` is private, never attached as a real property. (See
Gotchas — that third `spend` call leaves the closure in a genuinely broken state.)

---

## File: `closure_task6.js` — line by line

```js
const approver = (max_limit) =>{
    let limit = max_limit;
    return function(){
        limit --;
        return limit>=0?`Approved. ${limit} left`:`Limit reached`
    }
}
```
Notice this one copies the parameter into a *new* variable, `let limit =
max_limit`, rather than reassigning `max_limit` itself directly (unlike
`closure_task3.js`/`closure_task5.js`, which reassigned their parameter in
place) — functionally it doesn't matter here since nothing else needs the
original `max_limit`, but it's a slightly cleaner habit: the parameter stays as
the "original value" and `limit` is the thing that actually changes. Each call to
the returned function first decrements `limit`, *then* checks whether it's still
`>= 0` to decide what to return.

```js
const kishore = approver(2)
console.log(kishore())
console.log(kishore())
console.log(kishore())
console.log(kishore())
```
Tracing all four calls against a private `limit` starting at 2:
- call 1: `limit` 2→1, `1 >= 0` → `"Approved. 1 left"`
- call 2: `limit` 1→0, `0 >= 0` → `"Approved. 0 left"`
- call 3: `limit` 0→-1, `-1 >= 0` is false → `"Limit reached"`
- call 4: `limit` -1→-2, still false → `"Limit reached"`

Worth noticing: `limit` doesn't stop at 0 once it's "used up" — it just keeps
sliding further negative on every future call. That's harmless here because the
ternary already treats *any* negative number the same way (`"Limit reached"`),
but it's a reminder that the private state inside a closure keeps changing
forever unless the code explicitly guards against going past a boundary.

---

## Gotchas worth remembering from this module

- **Scope only flows one way.** `scope_task1.js` is the clean proof: a variable
  declared inside `innerfun` (`innerVar`) is completely invisible back in
  `outerFun`, even though `outerFun` is the one that *contains* `innerfun`. Inner
  code can always see outward; outer code can never see inward.

- **Accidental global variable — `closure_task2.js` line `b= counter()`.** This
  assigns to `b` with **no `let`, `const`, or `var`** at all. In non-strict
  (sloppy) mode — which is what a plain CommonJS `.js` file runs as by
  default unless `"use strict"` is added — assigning to an undeclared name like
  this silently creates a variable attached to the **global object** instead of
  throwing an error. It happens to work in this tiny script, but in a bigger
  program this is a classic, hard-to-trace bug: a typo in a variable name
  anywhere suddenly becomes a brand-new accidental global instead of an error
  that would tell you something is wrong. Always declare with `let`/`const`.

- **An assignment-based return can silently change the *type* of your private
  state — `closure_task5.js`.** Once `spend` is called with more than the
  remaining budget, the line `budget = ... : "Budget exceeded"` doesn't just
  *return* the string — it actually **overwrites the private `budget` variable
  itself** with that string. Any *future* call to `spend` would now be comparing
  a number (`amount`) against a string (`"Budget exceeded" `), which is a real
  latent bug hiding in otherwise-working code. The fix would be to return the
  message without reassigning `budget` when the limit is exceeded.

- **Privacy is real, not just convention.** `closure_task3.js` and
  `closure_task5.js` both prove this the same way: `me.balance` and
  `itBudget.budget` both come back `undefined`, because the private variable was
  never attached to the returned object as a property — it only lives in the
  closure's backpack, reachable solely through the methods that were deliberately
  handed out.

- **Every call to a factory function is a fresh, independent closure.**
  `closure_revision.js` (`hrPo`/`itPo`), `closure_task2.js` (`a`/`b`), and
  `closure_task4.js` (`prId`/`prId2`) all demonstrate the same thing three
  different ways: calling the *same* factory function twice does **not** share
  memory between the two results. Each call gets its own private variables.

- **The classic trap not shown in these files, but worth knowing cold: `var` in
  a loop.**
  ```js
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
  // logs 3, 3, 3 — NOT 0, 1, 2
  ```
  `var` is function-scoped, not block-scoped, so there is only **one** `i` shared
  by every iteration of the loop and by every closure created inside it. By the
  time the `setTimeout` callbacks actually run, the loop has already finished and
  `i` is `3` for all of them. Switching to `let i` fixes it immediately, because
  `let` creates a **brand-new `i` for every single iteration** of the loop — each
  closure then captures its own separate copy, printing `0, 1, 2` as expected.
  This is one of the most common real-world reasons closures surprise people, and
  it's exactly the same "which `i` does the backpack actually hold" question that
  all the factory-function examples above answer correctly by using `let`/`const`
  inside a fresh function call every time.
