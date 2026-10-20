# Module 24 — Collections (Map & Set) — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

Arrays and plain objects are the data structures used so far, but JS has two more
built-in collection types for specific jobs:

- **`Set`** — holds a list of values where **duplicates are automatically dropped**.
  You don't access items by index; you only ever ask "is this value in here?"
  (`.has(x)`), add (`.add(x)`), or remove (`.delete(x)`). Use `.size` (not `.length` —
  that's arrays-only).
- **`Map`** — a key→value lookup table, like a plain object, but with two big upgrades:
  (1) keys can be **any type at all** (a number, an object, a function — not just
  strings), and (2) it reliably **remembers insertion order** when you iterate it.
  `.set(key, value)`, `.get(key)`, `.has(key)`, `.delete(key)`, `.size`.

Both are iterable with `for...of`, and both play nicely with the spread operator (`...`)
to convert back into a plain array when needed.

---

## File: `set_task1.js` — building a `Set` two different ways

```js
const listDept = ["IT", "HR", "IT", "FIN", "HR", "IT"];

const setListDept = [...new Set(listDept)]
console.log(setListDept)
console.log(setListDept.length);
console.log(setListDept.includes("HR"));
```
- `listDept` — a plain array with deliberate duplicates (`"IT"` appears 3 times, `"HR"`
  twice).
- `new Set(listDept)` — the `Set` constructor can take an iterable (here, the array)
  directly and builds a Set from it, automatically throwing away repeats — what remains
  is one of each unique value, in the order first seen: `"IT"`, `"HR"`, `"FIN"`.
- `[...new Set(listDept)]` — the **spread operator** inside array brackets unpacks every
  value out of the Set and collects them into a brand-new plain **array**. This
  "Set round-trip" (`[...new Set(arr)]`) is the single most common one-liner for
  "dedupe an array" in JS.
- `setListDept` is now a plain array `["IT", "HR", "FIN"]` — note it's an array again,
  not a Set, so ordinary array methods like `.length` and `.includes(...)` work on it
  directly.
- `console.log(setListDept)` → `[ 'IT', 'HR', 'FIN' ]`.
- `setListDept.length` → `3`.
- `setListDept.includes("HR")` → `true` (plain `Array.prototype.includes`, works because
  this is a real array by this point).

```js
const alistDept = ["IT", "HR", "IT", "FIN", "HR", "IT"];
const slist = new Set()
for (let lists of alistDept){
    slist.add(lists)
}

console.log(slist)
console.log(slist.size);
console.log(slist.has("HR"));
```
This is the **manual, longer-hand** version of exactly the same dedupe, shown to prove
you understand what the one-liner above is actually doing underneath:
- `new Set()` — start with an empty Set (no constructor argument this time).
- `for (let lists of alistDept){ slist.add(lists) }` — loop over every item in the
  original array (duplicates included) and `.add(...)` each one. `Set.add` silently does
  nothing extra if the value is already present — no error, no duplicate entry, it just
  stays a set of uniques.
- `console.log(slist)` — logs the actual `Set` object itself (Node prints it specially,
  something like `Set(3) { 'IT', 'HR', 'FIN' }`), **not** a plain array — this is a key
  difference from the first half of the file, where the spread (`[...]`) had already
  converted it.
- `slist.size` → `3` — **`.size`, not `.length`**. Sets/Maps use `.size`; only arrays and
  strings use `.length`. Mixing these up is a very easy and common mistake.
- `slist.has("HR")` → `true` — `Set`'s own direct membership check, no need to convert to
  an array first (unlike `.includes`, which only exists on arrays).

---

## File: `map_task2.js` — building and iterating a `Map`

```js
const purchaseRequest = new Map([    ["PR-001",5000],
    ["PR-002",8000],
["PR-003",2000]]
)
```
- `new Map([...])` — the `Map` constructor can take an array of **`[key, value]` pairs**
  (each a 2-element array) and builds the whole Map from them in one shot. So this
  creates a Map with three entries: `"PR-001" → 5000`, `"PR-002" → 8000`,
  `"PR-003" → 2000`. (The odd line-wrapping/indentation here is just how it was typed —
  doesn't change what the code does.)

```js
console.log(purchaseRequest.get("PR-002"))
for(let [keys,value] of purchaseRequest){
    console.log(`${keys}: ${value}`)
}
```
- `purchaseRequest.get("PR-002")` → looks up the value stored under the key `"PR-002"` →
  `8000`.
- `for(let [keys,value] of purchaseRequest){ ... }` — iterating a `Map` directly with
  `for...of` hands you each entry as a **2-element `[key, value]` array**, and
  `[keys,value]` **destructures** that pair straight into two separate loop variables in
  one step (no need to write `entry[0]`/`entry[1]`). This also demonstrates Map's
  **guaranteed insertion order** — the loop prints `PR-001: 5000`, `PR-002: 8000`,
  `PR-003: 2000`, in exactly the order the entries were originally added, which a plain
  object does not reliably promise.

---

## File: `collections_task3.js` — `Set` for uniques + `Map` for counting, together

```js
const pr =  [
  { user: "Kishore", dept: "IT" },
  { user: "Jk",      dept: "HR" },
  { user: "Kishore", dept: "FIN" },
  { user: "Kishore", dept: "HR" }
]

const unique = [...new Set(pr.map(pr => pr.user))]

console.log(unique)
```
- `pr.map(pr => pr.user)` — `.map` transforms the array of objects into a plain array of
  just the `.user` field from each one: `["Kishore", "Jk", "Kishore", "Kishore"]`. (Note
  the parameter is also named `pr`, shadowing the outer `pr` array inside this one
  arrow function — legal, but a little confusing to read; it refers to one *element*,
  not the whole array, inside that arrow.)
- `new Set([...])` then spread back into an array — the same dedupe pattern as
  `set_task1.js` — drops repeated names, leaving `["Kishore", "Jk"]`.
- Printed as `[ 'Kishore', 'Jk' ]`.

```js
let dupMap = new Map()

for(dups of pr){
    dupMap.set(dups.user, (dupMap.get(dups.user)||0)+1)
}

for (let [key,val] of dupMap){
    console.log(`${key}: ${val}`)
}
```
- `let dupMap = new Map()` — start an empty Map to use as a tally (count-per-key).
- `for(dups of pr){ ... }` — note: `dups` here has **no `let`/`const`** in front of it,
  which (same as the accidental global in `promise_task2.js`, Module 19) silently
  creates an implicit global variable rather than a properly scoped loop variable. It
  "works" in a plain script, but it's a habit to stop doing — the intended line would be
  `for (const dups of pr)`.
- `dupMap.set(dups.user, (dupMap.get(dups.user)||0)+1)` — this is the **tally pattern**,
  the single most important Map idiom of this module: `dupMap.get(dups.user)` reads the
  current count for that user (or `undefined` if never seen before); `|| 0` turns that
  `undefined` into `0` so the very first time a user appears, you're adding 1 to 0, not
  to `undefined` (which would produce `NaN`); `+1` bumps the count; `.set(...)` writes
  the new total back under the same key. Repeating this once per loop iteration, for
  every record, builds up a full per-user count with no `if/else "have I seen this
  before?"` branching needed at all — the `|| 0` does that job implicitly.
  Walking through the actual data: `Kishore` → first hit: `get` is `undefined`→`0`,
  `+1` = `1`, set. `Jk` → `0+1=1`, set. `Kishore` again → `get` is now `1`, `1+1=2`, set.
  `Kishore` a third time → `get` is `2`, `2+1=3`, set. Final map: `Kishore → 3`,
  `Jk → 1`.
- `for (let [key,val] of dupMap){ console.log(...) }` — iterate and destructure each
  `[key, value]` pair exactly like `map_task2.js`, printing `Kishore: 3` then `Jk: 1`
  (insertion order — `Kishore` was the first distinct key ever `.set()`, so it appears
  first even though its count kept changing after that).

---

## File: `collections_revise.js` / `collections_revise_reference.js` — Map as a
`reduce` accumulator, and the "reference" version solving the same problem fully

`collections_revise.js` contains a chunk of **commented-out exploratory code** (a
manual for-loop attempt building two separate Maps — `prCounts` for per-department
counts, `deptTotal` for per-department amount sums — plus a `Set`-based distinct-depts
line) left in place as working notes, followed by the actual, final, uncommented
solution:

```js
const prs = [
    { dept: "IT",  amount: 5000 },
    { dept: "HR",  amount: 2000 },
    { dept: "IT",  amount: 3000 },
    { dept: "FIN", amount: 8000 },
    { dept: "IT",  amount: 1000 }
]

const totals = prs.reduce((map, pr) => {
  map.set(pr.dept, (map.get(pr.dept) || 0) + pr.amount);
  console.log(map)
  return map;
}, new Map());

console.log(totals)
```
- `prs.reduce((map, pr) => { ... }, new Map())` — `.reduce` normally accumulates into a
  single number or array, but here the **accumulator itself is a `Map`** (the
  `new Map()` passed as the second argument to `.reduce` is the starting value, handed in
  as `map` on the very first call).
- Inside the callback: `map.set(pr.dept, (map.get(pr.dept) || 0) + pr.amount)` — the
  exact same tally pattern as `collections_task3.js`, except summing `pr.amount` instead
  of counting by `+1`. `console.log(map)` is a debugging leftover, logging the Map's
  state after every single update (useful while building/understanding the logic, noisy
  for final output — but kept here as it's genuinely what the file runs).
- `return map;` — **critical for `.reduce`**: whatever the callback returns becomes the
  accumulator for the *next* iteration. Since `map.set(...)` mutates and also returns the
  Map itself, returning `map` here just keeps passing the same, growing Map forward each
  time (rather than losing it and starting over).
- Final `totals` Map, after reducing over all five records: `IT → 5000+3000+1000=9000`,
  `HR → 2000`, `FIN → 8000`.

The companion reference file, `collections_revise_reference.js`, solves the SAME problem
(distinct depts, count per dept, total per dept) but with the clearer, simpler **plain
`for` loop + two separate Maps** approach instead of folding it all into one `reduce`:

```js
const counts = new Map();   // dept -> number of PRs
const totals = new Map();   // dept -> summed amount

for (const pr of prs) {
  counts.set(pr.dept, (counts.get(pr.dept) || 0) + 1);
  totals.set(pr.dept, (totals.get(pr.dept) || 0) + pr.amount);
}
```
Same tally pattern, applied twice in the same loop body — once building a **count** Map,
once building a **sum** Map, from the same single pass over `prs`. Having `|| 0` handle
the "first time seeing this dept" case means **no `if (counts.has(pr.dept)) {...} else
{...}` branching is needed at all** — exactly the simplification the commented-out block
at the top of `collections_revise.js` was still doing the long way (with explicit
`.has()` checks) before arriving at this shorter form.

```js
const distinct = [...new Set(prs.map((pr) => pr.dept))];
console.log(distinct);

for (const [dept, count] of counts) {
  console.log(`${dept}: ${count} PRs`);
}

for (const [dept, total] of totals) {
  console.log(`${dept} total: ${total}`);
}
```
- `distinct` — same `.map` + `Set` + spread dedupe pattern already seen twice this
  module, applied to `.dept` this time: `["IT", "HR", "FIN"]`.
- Two more `for...of` + destructuring loops, printing formatted lines for each Map —
  `IT: 3 PRs`, `HR: 1 PRs`, `FIN: 1 PRs`, then `IT total: 9000`, `HR total: 2000`,
  `FIN total: 8000` — matching the `// Expected:` comment block written at the bottom of
  the reference file for self-checking.

---

## Gotchas worth remembering from this module

- **`.size` for Map/Set, `.length` for arrays/strings — don't mix them up.**
  `set_task1.js` uses `slist.size` correctly; writing `slist.length` would silently give
  `undefined` instead of erroring, which can be a confusing bug to track down.
- **The tally pattern (`map.set(key, (map.get(key) || 0) + delta)`) replaces manual
  `if (map.has(key)) {...} else {...}` branching entirely.** `collections_revise.js`'s
  commented-out block shows the longer `has`/`else` version being worked out first; both
  the final `reduce` version and the `collections_revise_reference.js` file land on the
  shorter `|| 0` idiom — remember `|| 0` only works because `undefined` is falsy, so it
  correctly stands in for "haven't seen this key yet."
- **Map/Set keys that are objects are compared by reference, not by content** (noted in
  `js_learning_notes.md`, worth restating here): none of this module's files happen to
  use object keys, but if `collections_task3.js`'s tally had used a whole `pr` object as
  the Map key instead of `pr.user` (a string), two different objects with identical
  fields would count as two different keys — always tally/dedupe on a primitive field
  (string/number), not the object itself.
- **`.reduce` with a Map accumulator requires `return`ing the accumulator every
  iteration** — `collections_revise.js`'s `reduce` callback correctly ends with
  `return map;`. Forgetting that `return` would make the *next* call receive `undefined`
  instead of the Map, and immediately crash trying to call `.set` on `undefined`.
- **Missing `const`/`let` on a loop variable creates a silent accidental global** —
  `collections_task3.js`'s `for(dups of pr)` is the second occurrence of this exact
  pattern in the repo (after `promise_task2.js` in Module 19). It happens to run fine in
  a loose script, but in strict-mode/ESM code this throws, and it's generally worth
  training yourself to always write `for (const x of ...)`.
- **Map vs plain Object — choose Map specifically when keys are dynamic/runtime-decided
  or non-string, or order genuinely matters.** Every Map in this module (`dupMap`,
  `counts`, `totals`, `purchaseRequest`) is keyed by something only known once you're
  looping over real data (department names, ids) — exactly the "dynamic lookup table"
  case Map is built for, versus a plain object which is better suited to a fixed,
  known-in-advance shape like `{id, amount, dept}` itself.
