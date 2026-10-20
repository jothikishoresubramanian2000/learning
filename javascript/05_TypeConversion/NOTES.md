# Module 5 — Type Conversion — NOTES

### What I learned today

There are two ways a value's type changes in JS: **explicit** (I deliberately call
`Number(...)`, `String(...)`, etc.) and **implicit** (JS quietly converts a type behind the
scenes because an operator demands it — also called "coercion"). The explicit kind is
safe and predictable because I asked for it. The implicit kind is where most beginner bugs
come from, because the conversion rules aren't always intuitive. On top of that, JS has
the **truthy/falsy** system — every value, not just booleans, can be asked "if this were
a condition, would it count as true or false?" — and there are exactly six values that
count as false; everything else, no matter how "empty-looking" it seems, counts as true.

### File: `conversion_task1.js` — line by line

```js
const priceStr = '250';
```
A string that *looks* like a number but is still, as far as JS's type system is concerned,
text — not a number. This mirrors a very common backend situation: data coming in from a
web form or an API request body always arrives as strings, even if it "looks like" a
number.

```js
let price = Number(priceStr)
```
`Number(...)` is an **explicit conversion function** — I'm telling JS "turn this into a
number, strictly." It parses the *entire* string as a numeric value. `'250'` is cleanly
numeric throughout, so `price` becomes the actual number `250`.

```js
console.log(price + 50)
```
Both sides are now numbers → ordinary numeric addition → prints `300`.

```js
console.log(priceStr + 50)
```
`priceStr` is still the *original string* `'250'` (converting `priceStr` into `price` did
not change `priceStr` itself — `Number()` returns a new value, it doesn't mutate its
input). So this is `'250' + 50`: one side is a string, so `+` concatenates instead of
adding — prints the string `"25050"`, not the number `300`. This single pair of lines is
the clearest possible illustration of why "did I convert the string, or just read it
again by mistake?" matters enormously in real code.

```js
console.log(typeof price)
```
Prints `"number"` — confirms the conversion really did change the type, not just the
displayed value.

```js
console.log(typeof priceStr)
```
Prints `"string"` — confirms `priceStr` was never touched.

### File: `conversion_task2.js` — line by line

```js
const input = "42kg"
const bad = "hello"
```
Two strings: one has a number at the front followed by junk text, one is pure non-numeric
text.

```js
console.log(parseInt(input))
```
`parseInt(...)` is a **lenient** numeric parser — it reads from the *start* of the string,
grabs as many valid digit characters as it can, and stops the instant it hits something
that isn't part of a valid number. `"42kg"` → it reads `4`, `2`, then hits `k` and stops →
returns the number `42`, silently discarding the `"kg"`. This is different from `Number()`,
which is strict and demands the *entire* string be numeric.

```js
console.log(Number(bad))
```
`Number("hello")` — `Number()` requires the whole string to be numeric, and `"hello"` has
no numeric content anywhere. Rather than throwing an error, JS returns a special value:
`NaN` ("Not a Number"). `NaN` is itself technically of type `"number"` — it's JS's way of
saying "I tried to make this a number and failed," not an exception.

```js
console.log("5" - 2) //3
```
`-` (subtraction) only makes sense for numbers, so unlike `+`, it has no "string mode" —
JS always coerces both sides to numbers for `-`. `"5"` becomes `5`, `5 - 2 = 3`. My own
comment confirms I'd already worked out the expected output before running it.

```js
console.log("5" + 2) //"52"
```
`+` is the one exception — if either side is a string, `+` concatenates rather than adding.
`"5" + 2` → `"5" + "2"` → `"52"`. Same operator, completely different behavior depending on
whether it's `+` or `-`/`*`/`/`.

```js
console.log(true + true)
```
`+` between two booleans: JS converts `true` → `1` and `false` → `0` when numeric context
is forced, so `true + true` → `1 + 1` → `2`.

### File: `conversion_task3.js` — line by line (truthy/falsy survey)

```js
const value1 = 0
const value2 = ""
const value3 = "0"
const value4 = []
const value5 = null
const value6 = "false"
```
Six values deliberately chosen because each one "looks" like it might mean "nothing" or
"empty," which makes this a perfect test of what JS actually treats as falsy versus what
merely *looks* empty to a human.

```js
console.log(value1 ? "truthy":"falsy") //false
```
`0` is one of the six real falsy values → `"falsy"`. (My inline comment literally says
`//false` here, meaning "the value itself is falsy," not that the printed string is
literally `"false"` — the code prints the string `"falsy"`.)

```js
console.log(value2 ? "truthy":"falsy") // false
```
`""` (empty string) is also one of the six falsy values → `"falsy"`.

```js
console.log(value3 ? "truthy":"falsy") //true
```
`"0"` — this is a **string containing the character "0"**, not the number zero. A
non-empty string is always truthy, no matter what characters are inside it → `"truthy"`.
This is the single easiest truthy/falsy trap to fall into: `0` is falsy, but `"0"` (the
string) is truthy.

```js
console.log(value4 ? "truthy":"falsy") //true
```
`[]` — an empty array. Despite looking "empty," **every object and array, even an empty
one, is truthy** in JS. Only the six specific falsy values count as false; emptiness of a
container is irrelevant to truthy/falsy. → `"truthy"`.

```js
console.log(value5 ? "truthy":"falsy") // false
```
`null` is one of the six falsy values → `"falsy"`.

```js
console.log(value6 ? "truthy":"falsy") //true
```
`"false"` — a **string that spells out the word "false"**. Still just a non-empty string,
so still truthy → `"truthy"`. This is the second classic trap: the string `"false"` is not
the boolean `false`, and strings are truthy unless they're the exact empty string `""`.

### Gotchas worth remembering from this module

- **The six falsy values, memorized as a complete list** (nothing else is falsy, no
  matter how "empty" it looks): `false`, `0`, `""`, `null`, `undefined`, `NaN`. Everything
  else — including `"0"`, `"false"`, `[]`, `{}`, and even `-1` — is truthy.
- **`Number()` is strict, `parseInt()`/`parseFloat()` are lenient.** `Number("42kg")` gives
  `NaN` (the whole string must be numeric), while `parseInt("42kg")` gives `42` (reads from
  the front, stops at junk). Pick based on whether I want "fail loudly on garbage" or "best
  effort, ignore trailing junk."
- **`NaN` cannot be compared with `===`.** `NaN === NaN` is actually `false` — `NaN` is
  the one value in JS that isn't even equal to itself. To check for it, use
  `Number.isNaN(x)`, never `x === NaN`.
- **`+` concatenates when either side is a string; every other arithmetic operator
  (`- * / %`) forces both sides to numbers.** `conversion_task2.js`'s `"5" - 2` (→ `3`) vs
  `"5" + 2` (→ `"52"`) is the exact minimal example proving this asymmetry.
- **Backend-specific reason this whole module matters:** data arriving from an HTTP
  request body, a query string, or a form is *always* a string, even a field that's
  conceptually a number or a boolean. Forgetting to `Number()` it before doing math is how
  `"25" + 1` silently becomes `"251"` instead of `26`.
