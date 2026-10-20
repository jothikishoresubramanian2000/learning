# Module 6 — Conditionals — NOTES

### What I learned today

`if`/`else if`/`else` behaves exactly like Python's `if`/`elif`/`else` conceptually — the
first condition that evaluates to `true` wins, and everything else is skipped. The new
things for me here were `switch` (a construct Python doesn't have at all — Python only
recently got `match`, which works differently) and the ternary operator as a genuine
one-line if/else. The trickiest part of this whole module wasn't the syntax, it was two
very real logic bugs that are easy to write by accident: forgetting `break` in a `switch`,
and getting the *order* or *boundaries* of an if-chain wrong.

### File: `cond_task1.js` — line by line

```js
const age = 10

if (age >= 18){
    console.log("adult")
}
else {
    console.log("minor")
}
```
A plain if/else. `age >= 18` is `10 >= 18`, which is `false`, so the `else` branch runs,
printing `"minor"`.

```js
console.log(age < 18 ? "minor":"adult")
```
The **ternary operator** — `condition ? valueIfTrue : valueIfFalse` — written as a compact
replacement for a full if/else when I just need to pick between two values. `age < 18` is
`true` (`10 < 18`), so this evaluates to `"minor"` and prints it. Same logical outcome as
the if/else above, written two different ways, deliberately placed next to each other in
the file to compare the two styles.

### File: `cond_task2.js` — line by line (if-chain with boundaries)

```js
const grade = -150;
```
A deliberately invalid grade (negative and way out of any normal 0–100 range) — chosen on
purpose to exercise the "NA" (not-applicable/invalid) branch of the chain.

```js
if (grade >= 90 && grade <= 100)
    console.log("A");
```
`&&` requires *both* sides true. `-150 >= 90` is already `false`, so this whole condition
is `false` without even needing to check the second half — skipped.

```js
else if(grade >= 80 && grade <= 89)
    console.log("B");
```
Same story, `false`, skipped.

```js
else if(grade >= 70 && grade <= 79)
    console.log("C");
```
Also `false`, skipped.

```js
else if(grade > 100 || grade < 0)
    console.log("NA");
```
`||` requires only *one* side true. `grade < 0` is `true` (`-150 < 0`), so this whole
condition is `true` → `"NA"` is printed, and the chain stops here (`else if`/`else` chains
always stop at the first match).

```js
else
    console.log("F");
```
Never reached for this particular `grade` value.

**Why the bounds matter here:** every grade band in this chain checks *both* a lower bound
*and* an upper bound (`grade >= 90 && grade <= 100`, not just `grade >= 90`). That's an
important detail — if the upper bound were missing, a grade like `150` would wrongly
satisfy `grade >= 90` and print `"A"` before ever reaching the "is this out of range at
all?" check further down the chain. Writing both bounds on every band, like this file does,
is exactly what prevents that specific bug. The general lesson (from the wider notes) is:
**in an if-chain, validate out-of-range/invalid input as early and as precisely as
possible** — either by checking invalid cases first, or, as done here, by making every
legitimate band airtight with both a floor and a ceiling so an invalid value can't
accidentally slip into the wrong bucket.

### File: `cond_task3.js` — line by line (`switch` and fall-through)

```js
const role = "editor";

switch (role){
```
`switch` compares `role` against a list of `case` values using **strict equality**
(`===` semantics) — same strictness as `===`, no type coercion.

```js
    case "admin":
        console.log("full");
        break;
```
If `role` were `"admin"`, this block runs, then `break` exits the `switch` entirely,
skipping everything below. Not the matching case here since `role` is `"editor"`.

```js
    case "editor":
        console.log("write")
        //break; // fall through if no break and end up in next case
```
`role === "editor"` is `true`, so this *is* the matching case — `"write"` is printed. But
notice: **the `break` is commented out, on purpose**, with a note explaining exactly why:
to demonstrate **fall-through**. In JS, a `case` label is just an entry point, not a
repeated condition check — once JS finds the matching case, it keeps running every line
underneath, in order, regardless of their `case` labels, until it either hits a `break` or
runs out of code. Since there's no `break` here, execution doesn't stop after printing
`"write"` — it falls straight into the next case's body too.

```js
    case "viewer":
        console.log("read")
        break;
```
Because of the missing `break` above, this code runs even though `role` is `"editor"`, not
`"viewer"` — `"read"` gets printed as well. *Then* this `break` is hit, so execution finally
stops here. So the full output for this file is both `"write"` **and** `"read"` printed, one
after another — a deliberately constructed example of exactly how a missing `break`
causes unintended cases to execute.

```js
    default:
        console.log("no access")
        break;
}
```
`default` is the fallback when none of the `case` values match. Never reached in this run
since `"editor"` matched directly, but it's good practice to still `break` after `default`
even though it's the last block — protects against bugs later if someone adds more cases
below `default` (unusual, but possible).

### Gotchas worth remembering from this module

- **`switch` fall-through is real and this file deliberately demonstrates it.** Forgetting
  one `break` doesn't just skip printing something — it causes the *next* case's code to
  run too, silently, with no error. The comment left in `cond_task3.js`
  (`// fall through if no break and end up in next case`) is my own note-to-self proving I
  understood this was happening on purpose, not an accident I failed to notice.
- **If-chain boundaries need both a floor and a ceiling.** `cond_task2.js` does this
  correctly (`grade >= 90 && grade <= 100` rather than just `grade >= 90`), which is exactly
  what prevents an out-of-range value like `150` from being miscategorized as a valid grade
  band before the invalid-range check ever runs.
- **`>` vs `>=` at a boundary value is worth testing explicitly.** `cond_task1.js` uses
  `age >= 18` for "adult" and `age < 18` for "minor" — these two conditions are each
  other's exact logical opposite (no value of `age` satisfies neither or both), which is
  the correct way to split a boundary: pick one side to use `>=`/`<=` and make sure the
  other side uses the strict opposite (`<`/`>`), so there's no gap and no overlap at the
  cutoff value itself (here, exactly `18`).
- **Ternary is for picking a *value*, not for running multiple statements.** `age < 18 ?
  "minor" : "adult"` works because both branches are a single expression. The moment a
  branch needs more than one line of logic, that's a sign to switch to full `if`/`else`
  instead of forcing a ternary.
