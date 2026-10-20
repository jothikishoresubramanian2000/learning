# Module 29 — Debugging — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

Debugging is a skill with a repeatable method, not random guessing: **read the error
message fully → find the first line of the stack trace that's actually in YOUR code →
form one single hypothesis about what's wrong → test it with one targeted log or
breakpoint → walk backward from the crash toward the real cause.** The crash site (where
the error is thrown) is very often NOT the bug site (where the bad data actually came
from) — you usually have to walk *backward* through the call chain to find where a wrong
assumption was first made.

This module also covers `console` methods beyond plain `.log`, and (conceptually, no
code file for it here) the VS Code built-in debugger as a more powerful alternative to
scattering `console.log` calls everywhere.

---

## File: `debug_task1.js` — silent `NaN`, and reasoning about *where* a bug actually
originates

```js
  function tax(pr)      { return (pr.amount||0) * 0.18; }
  function total(pr)    { return (pr.amount||0) + tax(pr); }
  function report(prs)  { return prs.map(pr => total(pr)); }
  console.log(report([{ id: "PR-001", amount: 5000 }, { id: "PR-002" }]));
```
- `function tax(pr) { return (pr.amount||0) * 0.18; }` — computes 18% tax off
  `pr.amount`. `(pr.amount||0)` guards against `pr.amount` being `undefined`/`0`/falsy by
  substituting `0` in that case, so this never produces `NaN` by itself.
- `function total(pr) { return (pr.amount||0) + tax(pr); }` — same guard, adds the
  (guarded) amount to the computed tax.
- `function report(prs) { return prs.map(pr => total(pr)); }` — runs `total` over every
  PR in an array, producing an array of totals.
- `console.log(report([{ id: "PR-001", amount: 5000 }, { id: "PR-002" }]));` — the second
  object in the array has **no `amount` field at all**. Because of the `||0` guards in
  both `tax` and `total`, this doesn't crash — `total({id:"PR-002"})` correctly computes
  `(undefined||0) + (undefined||0)*0.18` = `0 + 0 = 0`. So the real output here is
  `[5900, 0]`, not a crash and not `NaN` — the guards actually did their job correctly in
  this exact version of the file.

```js
  /* Answers:
  1. NAN - Not a number
  2. I guess the first accessed function total()- this one
  3. pr.amount - narrow, and I didn't predict the case of amount being absent
  4.I just added ||*/
```
This comment block is a self-written answer key to a debugging exercise that was clearly
posed with **the `||0` guards intentionally missing** at first (i.e. the original buggy
version would have been `return pr.amount * 0.18;` and `return pr.amount + tax(pr);`,
with no fallback at all). Walking through what each numbered answer means:
1. **"NAN - Not a number"** — identifying the *symptom*: without the guard, `undefined *
   0.18` and `undefined + something` both produce `NaN`, which is JS's special "this
   isn't a valid number" value — notably, `NaN` does **not** throw an error; it just
   silently propagates through further math, making it one of the sneakiest bugs to spot
   (exactly `js_learning_notes.md`'s warning: "silent wrong values are worse than
   crashes — no trace, flows downstream").
2. **"the first accessed function total()"** — identifying where in the call chain the
   `NaN` would first be produced/visible (`total` calls `tax` and then does its own
   addition, so `total` is where the bad value would first surface as you inspect the
   call stack, even though...).
3. **"`pr.amount` - narrow, and I didn't predict the case of amount being absent"** —
   this is the real root cause, the actual bug site, one level deeper than where the
   symptom appears: the original assumption "every pr object will have an `.amount`
   field" was never actually guaranteed, and the code trusted it anyway. This matches
   `js_learning_notes.md`'s core debugging question exactly: *"what did I assume that
   isn't true?"*
4. **"I just added `||`"** — the fix actually applied: wrapping `pr.amount` with
   `(pr.amount||0)` in both functions, so a missing amount degrades gracefully to `0`
   instead of poisoning the whole calculation with `NaN`.

This file is a great real example of the full debugging method in miniature: notice the
bad *symptom* (`NaN`), trace back through the call stack to find *where* it first
appears, keep going back further to find the actual *false assumption* that caused it,
then apply a targeted fix — here, already applied, which is why the "live" code at the
top of the file runs clean.

---

## File: `debug_task2.js` — three different "what went wrong" error shapes

```js
function snip1(){
    x = "TCA"
    console.log(x())
}


function snip2(){
    console.log(x)
}

function snip3(){
    console.log(x)
    const x ="Thalapathy vetri Kondan"
}

snip1() // x is string and we try to access as function, so it says x is not a function
snip2() // In this, there is x is not there itself, so not defined
snip3() // here x is defined but accessed in before hand
```
Three tiny, deliberately broken snippets, each demonstrating a **different category** of
common JS error, with the correct diagnosis written as a trailing comment after each call:

- **`snip1`**: `x = "TCA"` (no `const`/`let` — yet another instance of the accidental
  global pattern seen several times in earlier modules, here used *deliberately* to set
  up the bug) assigns the **string** `"TCA"` to `x`. Then `x()` tries to **call** `x` as
  if it were a function — but `x` holds a string, not a function. This throws
  `TypeError: x is not a function` — exactly matching the error-types table in
  `js_learning_notes.md` ("called a non-function — typo, bad import"). The comment
  correctly identifies: "x is string and we try to access as function."
- **`snip2`**: `console.log(x)` here refers to `x` with **no prior declaration or
  assignment anywhere reachable** (this `x` is a completely separate thing from
  `snip1`'s accidental global, scoped only inside `snip2`'s own attempt to read it — since
  nothing inside `snip2` itself ever assigns `x`). This throws
  `ReferenceError: x is not defined` — matching the table's "name never declared" entry.
  The comment: "x is not there itself, so not defined."
- **`snip3`**: `console.log(x)` runs, THEN `const x = "..."` declares `x`, one line
  later, in the **same function**. This is the **Temporal Dead Zone (TDZ)** from Module
  15 (Hoisting) showing up as a real runtime error: `const`/`let` declarations ARE
  hoisted (JS already "knows" `x` will exist somewhere in this scope), but they're not
  usable until the actual declaration line runs — reading them before that point throws
  `ReferenceError: Cannot access 'x' before initialization`, a **different** kind of
  `ReferenceError` than `snip2`'s "never declared at all" case, even though both are
  technically `ReferenceError`s. The comment correctly distinguishes this: "x is defined
  but accessed in before hand."
- The real lesson of this file: **the exact same-looking symptom ("something's wrong with
  x") can have three completely different root causes**, and the specific wording of the
  error message (and its exact error *type* — `TypeError` vs the two different flavors of
  `ReferenceError`) is the first and most important clue for telling them apart.

---

## File: `debug_task3.js` — `console` beyond `.log`, and the classic missing-`await` bug

```js
const prs = [{id:"PR-001",dept:"IT",amount:5000},{id:"PR-002",dept:"HR",amount:2000}]

console.table(prs)
```
- `console.table(arrayOfObjects)` — instead of the usual cramped single-line object
  dump that `console.log` would produce, `console.table` renders a genuine, readable
  grid/table in the terminal — one row per array element, one column per shared object
  key (`id`, `dept`, `amount`) — much easier to scan than `console.log`'s nested-object
  text dump, especially for arrays of similarly-shaped records.

```js
const nested = { a: { b: { c: { d: "deep" } } } };
console.dir(nested, { depth: null });
```
- A deliberately deeply-nested object, four levels down. `console.log` has a default
  nesting depth limit — past a certain depth it collapses further nested objects down to
  a `[Object]` placeholder instead of printing their contents, which can hide exactly the
  value you need to inspect. `console.dir(obj, { depth: null })` — `{ depth: null }`
  explicitly means "no depth limit, show everything, no matter how deep" — so this
  correctly prints the full `{ a: { b: { c: { d: 'deep' } } } }` structure, all the way
  down to `"deep"`, with no truncation.

```js
console.time("work")
for(let i = 0; i<10;i++){

}
console.timeEnd("work")
```
- `console.time("work")` — starts an internal stopwatch, labeled `"work"` (the label is
  how `console` knows which `timeEnd` call pairs with which `time` call, if you ever had
  more than one running).
- An empty `for` loop — deliberately does nothing, just exists to have *something* to
  time (in real debugging, this gap would hold actual work you suspect is slow, like a
  DB query or a heavy computation).
- `console.timeEnd("work")` — stops the stopwatch for the `"work"` label and prints the
  elapsed time (e.g. `work: 0.042ms`) — useful for quickly checking "is this specific
  chunk of code actually the slow part?" without setting up a full profiler.

```js
const name = "kishore"
console.log({name})
```
- `console.log({name})` — object shorthand (`{name}` means `{name: name}`) wrapped
  around a single variable purely so the **printed output shows both the variable's name
  AND its value** together: `{ name: 'kishore' }`, instead of `console.log(name)`'s bare
  `kishore` with no label at all. A small habit that makes scanning a busy console log
  much easier when multiple values are being printed throughout a run.

```js
const getPr = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id, amount: 5000 }), 300));

// WRONG — no await
const wrong = getPr("PR-001");
console.log("without await:", wrong);       // Promise { <pending> }
console.log("its .id:", wrong.id);          // undefined (Promises have no .id)
```
- `getPr` — a standard Promise-wrapped-timeout function, same shape as every earlier
  module's examples.
- `const wrong = getPr("PR-001");` — calls `getPr` but captures the result **without
  `await`**. Since `getPr` always returns a Promise object immediately (the `new
  Promise(...)` object itself is created synchronously, it's only the *resolving* that
  takes 300ms), `wrong` is literally a `Promise` object, not the eventual `{id, amount}`
  value — this is THE single most common real-world async mistake, deliberately
  reproduced here on purpose to see its exact symptom.
- `console.log("without await:", wrong);` — prints something like
  `without await: Promise { <pending> }` — Node's own way of showing you "this is an
  unresolved Promise object," which is itself a strong visual clue something's wrong if
  you were expecting real data.
- `console.log("its .id:", wrong.id);` — `wrong` is a Promise object; Promises don't have
  an `.id` property at all (they're not the data, they're a *wrapper* around a future
  value) — so this reads `undefined`, a **silent** failure with no thrown error at all,
  exactly the "worse than a crash" case `js_learning_notes.md` warns about: nothing
  screams "you forgot await" here, you just quietly get `undefined` where real data was
  expected.

```js
// RIGHT — await inside an async function (await is only legal inside async)
async function main() {
  const pr = await getPr("PR-001");          // wait, then unwrap the value
  console.log("with await:", pr);            // { id: 'PR-001', amount: 5000 }
  console.log("its .id:", pr.id);            // "PR-001"
}
main();
```
The fix, shown immediately after the broken version for direct comparison: wrap the call
in an `async function`, and `await` it — this is only legal inside an `async` function
(trying to use a bare `await` at the top level of a plain script/function would itself be
a `SyntaxError`, a different, earlier-caught mistake than the silent-`undefined` one
above). With `await`, `pr` really is the resolved `{id, amount}` object, 300ms later, and
`pr.id` correctly reads `"PR-001"`.

---

## Gotchas worth remembering from this module

- **Silent wrong values (`NaN`, `undefined`) are more dangerous than a crash — they have
  no stack trace and quietly flow into everything downstream.** `debug_task1.js`'s
  originally-missing `||0` guard and `debug_task3.js`'s missing-`await` example are both
  deliberate demonstrations of exactly this: neither one throws anything at all; both
  just hand back a wrong, misleading value that *looks* like it might be fine until you
  specifically check it.
- **The exact wording and TYPE of an error is the first real diagnostic clue, and
  different-looking bugs can produce very similarly-worded messages.** `debug_task2.js`
  deliberately contrasts `TypeError: x is not a function` (wrong type called as a
  function), `ReferenceError: x is not defined` (never declared anywhere reachable), and
  `ReferenceError: Cannot access 'x' before initialization` (TDZ — declared, but read too
  early) side by side specifically so the differences stay distinguishable.
- **The crash site and the bug's true root cause are often different lines, sometimes in
  different functions entirely.** `debug_task1.js`'s own answer-key comments walk this
  exact chain: symptom (`NaN`) → where it's first visible (`total()`) → the actual false
  assumption that caused it (`pr.amount` assumed always present) — always keep walking
  backward rather than stopping at the first line that happens to show something's wrong.
- **`console.table` for arrays of similarly-shaped objects, `console.dir(obj, {depth:
  null})` for deeply nested objects `console.log` would otherwise truncate, and
  `console.time`/`console.timeEnd` for quick "is this part actually slow?" checks** —
  all three cover real gaps plain `console.log` has, each demonstrated directly in
  `debug_task3.js`.
- **`console.log({name})` (object-shorthand wrapping) prints both the variable's name and
  value together** — a small but genuinely useful habit for keeping a busy console log
  readable, shown in `debug_task3.js`.
- **The #1 practical async bug: forgetting `await` gives you the Promise object, not the
  data, with no error at all.** `debug_task3.js`'s side-by-side "WRONG"/"RIGHT" block is
  worth re-reading any time a value that should clearly be an object/number instead
  prints as `Promise { <pending> }` or comes back `undefined` where a field was expected.
- **The repeatable method, restated for memory:** read the full error message first; find
  the first stack-trace line that's actually *your* code (ignore Node internals); form
  exactly one hypothesis; test it with the smallest possible log or breakpoint; if wrong,
  walk one step further back; repeat. Always ask: **"what did I assume that isn't
  true?"**
