# Module 30 — Best Practices — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of the actual refactor
> exercise, explained in the simplest possible words, so that months from now you can
> open this file cold and rebuild full understanding without needing to ask anyone
> anything again.

---

## What I learned this module

This module isn't about new syntax at all — every feature used here was already known
(arrow functions, `.filter`, `.map`, template literals, object shorthand). It's about
**judgment**: how to write code that's easy for someone else (or future-you) to read,
trust, and safely change. The concrete exercise in this folder is a single refactor task:
take working-but-badly-written code and rewrite it to be clean, **without changing its
behavior at all** — same inputs must produce exactly the same outputs, every time.

The key practices this module is built around (fully listed in `js_learning_notes.md`):
clear naming, small single-purpose functions, DRY (don't repeat yourself), `const` by
default, fail-fast/guard-early, honest error handling, not leaking internal state,
comments that explain *why* not *what*, organizing by feature, and using tooling
(Prettier/ESLint) to catch mechanical issues automatically instead of manually policing
style.

---

## File: `refactor_me.js` — the refactor exercise itself

```js
// WORKING but bad. Refactor it. Behavior must stay identical.
function highValueGstPrs(prs, amountLimit) {


  return prs
        .filter(pr => pr.amount > 0)
        .map(pr => ({id: pr.id, gstTotal: pr.amount +pr.amount *0.18})) // t hear is amount inclusive gst, so changing it into gstTotal
        .filter(pr => pr.gstTotal > amountLimit)
}
const result = highValueGstPrs([{id:"PR-001",amount:5000},{id:"PR-002",amount:0},{id:"PR-003",amount:20000}], 5000)
console.log(result)
// Output: [ { id: 'PR-001', gstTotal: 5900 }, { id: 'PR-003', gstTotal: 23600 } ]
```
Interestingly, the function body here is actually **already** written in the clean,
"after" style this module teaches — a **pipeline** of `.filter().map().filter()` calls,
each doing exactly one clear job, instead of a single messy `for` loop with manual
index bookkeeping and nested `if`s and a growing array built with `.push`. This file
seems to capture the exercise at the point the refactor was being finished/reviewed,
rather than the original "bad" starting version — so the real value here is in reading
*why* this shape is the "good" one, line by line:

- `function highValueGstPrs(prs, amountLimit) { ... }` — the function name itself follows
  the naming rule directly from `js_learning_notes.md`: "functions = verbs... reveal
  intent." `highValueGstPrs` reads almost like a sentence describing exactly what comes
  back: "the high-value [purchase requests], by GST[-inclusive total]." Both parameters
  are clear nouns too (`prs`, `amountLimit`), not single letters like `a`/`b`.
- `return prs.filter(pr => pr.amount > 0)` — **step 1, one job**: keep only PRs with a
  genuinely positive amount, dropping anything zero or negative. A `.filter` call reads
  almost like plain English: "keep the ones where amount is greater than 0" — compare
  this to the "bad" alternative of a manual loop with an `if (pr.amount > 0) { ... }`
  wrapped around everything else, where this one condition would get buried inside a
  much bigger block instead of standing alone as its own readable step.
- `.map(pr => ({id: pr.id, gstTotal: pr.amount +pr.amount *0.18}))` — **step 2, one
  job**: transform each surviving PR into a brand-new, smaller, purpose-built object with
  only two fields, `id` and `gstTotal` — note this does **not** mutate the original `pr`
  objects at all (no `pr.gstTotal = ...` anywhere) — it builds and returns fresh objects
  instead, which is the "pure function, same input in → same output out, no side
  effects" principle from the best-practices list. `pr.amount +pr.amount *0.18` computes
  the amount plus 18% tax (operator precedence means `*` runs before `+`, so this is
  `pr.amount + (pr.amount * 0.18)`, correctly, even without the explicit parentheses other
  modules' files tend to use). The trailing comment, `// t hear is amount inclusive gst,
  so changing it into gstTotal` (a typo for "there"), is exactly the kind of **comment
  explaining WHY** the best-practices list asks for — it records a real decision (why the
  new field is named `gstTotal` and not just `amount`: because it now represents a
  *different, tax-inclusive* number than the original `amount`), not a comment that just
  restates what the code already visibly does.
- `.filter(pr => pr.gstTotal > amountLimit)` — **step 3, one job**: from the
  GST-converted list, keep only the ones whose tax-inclusive total actually exceeds the
  caller-supplied limit. Because this runs on the *already-mapped* objects (which have
  `.gstTotal`, not `.amount`), it's correctly comparing against the right, final field.
- The whole pipeline reads top to bottom almost like a sentence: "take the PRs, keep the
  positive-amount ones, convert each to its GST total, keep the ones above the limit" —
  with **no manual index variable, no `push`, no nested `if` blocks** at all. This is the
  refactor lesson from `js_learning_notes.md` stated directly: a nested
  `for`+`if`+`push` version achieving the exact same result would require you to track
  an output array, an index, and multiple conditions all intertwined in one block; here
  each concern (filter by amount, compute gst, filter by limit) is its own separate,
  independently-readable line.

```js
const result = highValueGstPrs([{id:"PR-001",amount:5000},{id:"PR-002",amount:0},{id:"PR-003",amount:20000}], 5000)
console.log(result)
// Output: [ { id: 'PR-001', gstTotal: 5900 }, { id: 'PR-003', gstTotal: 23600 } ]
```
Tracing the actual data through all three pipeline steps, to confirm the comment's
claimed output is correct:
- Input: `PR-001` (amount 5000), `PR-002` (amount 0), `PR-003` (amount 20000).
- **Step 1** (`amount > 0`): `PR-002` is dropped (amount is exactly `0`, not `> 0`).
  Remaining: `PR-001`, `PR-003`.
- **Step 2** (compute gst total): `PR-001` → `5000 + 5000*0.18 = 5000 + 900 = 5900`.
  `PR-003` → `20000 + 20000*0.18 = 20000 + 3600 = 23600`. Now holding
  `{id:"PR-001", gstTotal:5900}` and `{id:"PR-003", gstTotal:23600}`.
- **Step 3** (`gstTotal > 5000`): `5900 > 5000` → kept. `23600 > 5000` → kept. Both
  survive this time, since the limit is only `5000` and both totals clear it easily.
- Final printed result: `[ { id: 'PR-001', gstTotal: 5900 }, { id: 'PR-003', gstTotal:
  23600 } ]` — matching the comment exactly, confirming the pipeline's correctness by
  hand.
- `console.log(result)` — a plain log of the final array, used here just to visually
  verify the refactor produced the expected, documented output — exactly the kind of
  manual "does behavior still match" check the task's own opening comment
  (`// Behavior must stay identical`) calls for.

---

## Gotchas worth remembering from this module

- **A `.filter().map().filter()` chain reads like a sentence and needs no manual index
  bookkeeping — prefer this shape over a hand-rolled `for`+`if`+`push` loop whenever the
  job is "transform/narrow down a list."** `refactor_me.js` is the direct, lived example:
  three completely independent concerns (validity, computation, threshold) are each their
  own separate, single-purpose line rather than tangled together inside one loop body.
- **Comments should explain WHY, not WHAT — and a real decision worth recording is a good
  candidate.** The file's own
  `// t hear is amount inclusive gst, so changing it into gstTotal` comment is a genuine
  (if typo-ridden) example of exactly this: it tells you *why* the field got renamed
  (because its meaning changed — it's now tax-inclusive, not the raw amount), which a
  comment just restating "this adds gst" would never capture.
- **Good naming removes the need for a comment in the first place.** `highValueGstPrs`,
  `amountLimit`, and `gstTotal` are all self-explanatory nouns/compound-names; none of
  them need an explanatory comment sitting next to them the way a name like `x` or `temp`
  would.
- **A pure transformation function (`.map` building brand-new objects, never mutating the
  originals) is safer to trust and re-call than one with side effects.** `refactor_me.js`
  never writes `pr.gstTotal = ...` onto the original `pr` objects passed in from the
  caller — it always returns fresh `{id, gstTotal}` objects instead, meaning calling
  `highValueGstPrs` again on the same input array is guaranteed to produce the same
  result every time, with zero risk of the input data having been silently altered by an
  earlier call.
- **"Behavior must stay identical" is the actual constraint of refactoring — a refactor
  that changes output, even subtly (off-by-one in the `amountLimit` comparison, or `>=`
  vs `>`), is not a successful refactor, it's a bug introduced while refactoring.**
  Tracing the three sample inputs by hand against the documented expected output (as done
  above) is exactly the kind of verification step worth doing any time you touch working
  code — the cheapest possible regression check before trusting a change.
- **`const` by default, never `var`, is used consistently here** — `const result = ...`
  — matching the Module 30 rule directly: use `const` unless a variable genuinely needs
  reassigning later (then `let`), and never `var` at all.
