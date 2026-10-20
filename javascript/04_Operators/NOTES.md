# Module 4 — Operators — NOTES

### What I learned today

Operators themselves (`+ - * /`, comparisons, `&&`/`||`) are familiar from Python/C, but
JS has a handful of operators that either behave differently than I'd expect, or don't
exist in those languages at all: the two different equality checks (`==` vs `===`), the
nullish coalescing operator (`??`), and optional chaining (`?.`). These three are flagged
as "⭐" in my concise notes because they're the ones that actually cause bugs if I use the
wrong one.

### File: `operators_task1.js` — line by line

```js
const salary = 50000
```
A plain number, `const` because it never changes in this file.

```js
let bonus = (salary / 10)
```
Division. Important JS fact that's different from some languages: **`/` never truncates**
— `50000 / 10` happens to come out even here (`5000`), but in general `/` always gives the
full decimal result (e.g. `1234 / 10` is `123.4`, not `123`). If I wanted a whole number I
would need `Math.floor()` or `Math.trunc()`. `let` is used here even though `bonus` isn't
reassigned later — technically this could have been `const`, a small missed optimization
but not a bug.

```js
let total = bonus + salary
```
Both operands are numbers, so `+` does ordinary numeric addition: `5000 + 50000 = 55000`.

```js
console.log(total)
```
Prints `55000` — a plain number.

```js
console.log("Total: " + total)
```
Here `+` has a **string** on the left (`"Total: "`), so JS switches `+` into **string
concatenation mode**: it converts `total` (the number `55000`) into the string `"55000"`
and glues the two strings together, printing `"Total: 55000"`. This is `+`'s dual
personality in JS — numeric addition between two numbers, but concatenation the instant
either side is a string.

### File: `operators_task2.js` — line by line

```js
const role = "admin";

console.log(role === "admin");
```
`===` is **strict equality** — it checks both the *value* and the *type* match, with zero
type conversion happening behind the scenes. `role` is the string `"admin"`, compared
against the string `"admin"` — same value, same type → prints `true`.

```js
console.log(role == "admin");
```
`==` is **loose equality** — before comparing, JS is allowed to silently convert one or
both sides to try to make the types match ("type coercion"). Here both sides already
happen to be strings, so the result is the same (`true`) — but that's a coincidence of this
specific example, not a guarantee. The famous danger case is something like `5 == "5"`
being `true` even though one is a number and one is a string — `==` doesn't care, `===`
would correctly say `false`. **Rule I'm building: always use `===`/`!==`, never `==`/`!=`.**

```js
const age = 16;

permission = age >= 18 ? "allowed":"denied"
```
`age >= 18` is a comparison producing a boolean (`false`, since `16 < 18`). The `? :` is
the **ternary operator** — a compact one-line if/else: `condition ? valueIfTrue :
valueIfFalse`. So `permission` gets `"denied"`.

⚠️ Notice `permission` has **no `const`/`let`/`var` keyword** in front of it. Exactly like
the `user1` bug in Module 3, this silently creates an accidental global variable instead of
a properly scoped local one. It happens to still "work" and print correctly in this small
file, but it's the exact anti-pattern I need to stop doing — it should have been `const
permission = ...` (or `let`, if I needed to reassign it later).

```js
console.log(permission)
```
Prints `"denied"`.

```js
const isActive = true;

isActive && console.log("welcome")
```
`&&` is the **logical AND**, and in JS it doesn't just produce `true`/`false` — it
**short-circuits**: it evaluates the left side first, and only evaluates (runs) the right
side if the left side is truthy. Here `isActive` is `true`, so JS *does* evaluate the right
side, which is a function call (`console.log("welcome")`) — so `"welcome"` gets printed. If
`isActive` had been `false`, `console.log(...)` on the right would never even run; `&&`
would stop at the left side and short-circuit the rest of the line away. This is a common
JS idiom for "only do this thing if that condition holds," used as a shorter alternative to
`if (isActive) { console.log("welcome") }`.

### File: `operators_task3.js` — line by line

```js
const stock = 0;

//consider 0 as empty
console.log(stock||100)
```
`||` is the **logical OR**, and like `&&` it short-circuits and returns an actual value,
not just `true`/`false`: it evaluates the left side, and if that's **falsy**, it moves on
and returns the right side instead. `0` is one of JS's falsy values, so `stock || 100`
evaluates to `100` — the comment captures the intent exactly: "treat `0` as if it were
empty/missing, and fall back to a default."

```js
//consider 0 as value
console.log(stock??100)
```
`??` is the **nullish coalescing operator** — it looks similar to `||` but is stricter
about what counts as "missing": it only falls back to the right side when the left side is
specifically `null` or `undefined`. `0` is neither of those — `0` is a perfectly valid,
intentional number — so `stock ?? 100` evaluates to `0` itself, not `100`. This is exactly
the difference the two comments are demonstrating side by side: `||` treats `0` as if it
needs replacing, `??` respects `0` as a real, deliberate value and only replaces actual
"nothing was set" cases.

```js
const user = { name: "jk" };

console.log(user?.address?.city)
```
`?.` is **optional chaining** — safe property access that doesn't crash if something along
the chain is missing. `user` has no `address` key at all, so plain `user.address.city`
would throw a `TypeError` ("cannot read property 'city' of undefined"). With `?.`, JS
checks at each step: "does `user` exist? does `user.address` exist?" — the moment it finds
something missing (`user.address` is `undefined`), it stops immediately and the whole
expression evaluates to `undefined`, no crash, no error. Prints `undefined`.

### Gotchas worth remembering from this module

- **`||` vs `??` — the single most important operator distinction in this module.** `||`
  replaces *any* falsy value (`0`, `""`, `false`, `null`, `undefined`, `NaN`). `??`
  replaces *only* `null`/`undefined`. If `0` or `""` are legitimate, meaningful values in
  my data (a price of `0`, an empty-but-valid string), using `||` for a "default value"
  fallback will silently destroy that real data. `operators_task3.js` is a direct,
  side-by-side demonstration of exactly this difference using the same variable (`stock =
  0`) against both operators.
- **`==` vs `===` — always use `===`.** `==` performs type coercion that can produce
  surprising `true` results across different types (the classic `5 == "5"` trap). There is
  essentially never a good reason to reach for `==` over `===` in new code.
- **Accidental global strikes again.** `permission = ...` in `operators_task2.js` has no
  declaration keyword, same bug pattern as `user1` in Module 3's `object_task3.js`. This is
  clearly a recurring habit to watch for — the fix is always: every assignment that
  introduces a new name needs `const` or `let` in front of it.
- **`&&`/`||` return *values*, not just booleans.** This is different from Python/C where
  logical operators conceptually just produce `True`/`False`. In JS, `isActive &&
  console.log(...)` only makes sense once you know `&&` evaluates and returns the actual
  right-hand expression when the left side is truthy — it's not coincidence, it's the
  operator's real behavior, and it's a common shorthand for conditional execution.
- **`/` never truncates.** Unlike C's integer division, JS division between two numbers
  always gives the full decimal result. Need a whole number? Reach for `Math.floor()` /
  `Math.trunc()` / `Math.round()` explicitly — JS won't do it for you.
