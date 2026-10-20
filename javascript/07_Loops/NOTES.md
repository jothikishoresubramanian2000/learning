# Module 7 — Loops — NOTES

### What I learned today

The classic `for`/`while`/`do-while` loops map almost directly onto what I already know
from C and Python (Python's `while` is the same; its `for` is really closer to JS's
`for...of`). The genuinely new thing JS has is **two different "for-each" style loops that
look almost identical but iterate completely different things**: `for...of` walks over
**values**, `for...in` walks over **keys**. Mixing these up is an easy, silent mistake —
and, as it turns out, I actually made exactly that mistake in one of my own files below,
which makes it a perfect real example rather than a hypothetical one.

### File: `loop_revision.js` — line by line

```js
const pr = { id: "PR-001", dept: "IT", amount: 24000, approved: false };

for(let key in pr){
    console.log(`${key} = ${pr[key]}`);
    
}
```
`for...in` on an **object** iterates over its **keys** (property names) — exactly the
right tool here, since `pr` is an object, not an array. Each pass, `key` holds one property
name as a string (`"id"`, then `"dept"`, then `"amount"`, then `"approved"`). Inside the
loop, `pr[key]` uses **bracket notation** to look up the value for whatever key the
variable currently holds — this only works with brackets, not dot notation, because `key`
is a variable, not a literal property name (`pr.key` would look for a literal property
*called* `"key"`, which doesn't exist). The template literal `` `${key} = ${pr[key]}` ``
prints lines like `id = PR-001`, `dept = IT`, `amount = 24000`, `approved = false`.

```js
const amounts = [1200, 8000, 450, 15000]

for (const amt of amounts){
    if(amt > 10000)
        break;
    if (amt>1000){
        console.log(amt)
    }
}
```
`for...of` on an **array** iterates over its **values** directly — each pass, `amt` *is*
one of the numbers itself (`1200`, then `8000`, then `450`, then `15000`), not an index.
- First pass: `amt = 1200`. Not `> 10000`, so no break. Is `> 1000` → prints `1200`.
- Second pass: `amt = 8000`. Not `> 10000`. Is `> 1000` → prints `8000`.
- Third pass: `amt = 450`. Not `> 10000`. **Not** `> 1000` → nothing printed.
- Fourth pass: `amt = 15000`. **Is** `> 10000` → `break` fires, and the loop stops
  immediately — it never even gets to the second `if` for this value, and there are no
  more values left anyway since this was the last one.

So the printed output is `1200` then `8000`, and `450` and `15000` never get logged (`450`
because it fails the `> 1000` check, `15000` because `break` exits before reaching that
check).

### File: `loop_task1.js` — line by line

```js
for(let i =1; i<= 10; i++){
    console.log(i)
}
```
A classic counting `for` loop — three parts in the parentheses: `let i = 1` (runs once,
sets the starting value), `i <= 10` (checked *before* every pass — loop keeps going while
this is true), `i++` (runs *after* every pass, increments `i` by 1). Prints `1` through
`10`, one per line. Using `<=` with `10` (rather than `< 11`) is the natural way to write
"up to and including 10."

```js
console.log("")

for(let j =1; j<= 10; j++){
    if(j%2 === 0)
    console.log(j)
}
```
`console.log("")` just prints a blank line as a visual separator between the two loops'
output. The second loop counts `1` to `10` again, but only prints when `j % 2 === 0` — `%`
is the **remainder/modulo operator**: `j % 2` gives `0` for even numbers and `1` for odd
numbers, so this condition is true only for even `j`. Prints `2, 4, 6, 8, 10`.

### File: `loop_task2.js` — line by line

```js
for (let i =0; i<3; i++){
    for (let j = 0; j<5; j++){
        process.stdout.write("*"); 
    }
    console.log()
}
```
**Nested loops** — for every single pass of the outer loop (`i` goes `0, 1, 2`, three
times), the *entire* inner loop runs to completion (`j` goes `0` through `4`, five times).
`process.stdout.write("*")` prints a `*` with **no newline after it** (unlike
`console.log`, which always adds one) — so five of these in a row print `*****` all on one
line. After the inner loop finishes all five stars, `console.log()` (called with no
arguments) just prints a newline, moving to the next line before the outer loop's next
pass starts the inner loop over again. Net result: a 3-row, 5-column rectangle of stars:
```
*****
*****
*****
```

```js
for(let i = 1; i <=5; i++){
    if (i === 3){
        continue;
    }
    if(i===5){
        break;
    }
    console.log(i)
}
```
This loop walks `i` from `1` to `5`, demonstrating `continue` and `break` side by side.
- `i = 1`: neither `if` matches → prints `1`.
- `i = 2`: neither matches → prints `2`.
- `i = 3`: `i === 3` is true → `continue` fires, which means **skip the rest of this pass
  and jump straight to the next iteration** — so `console.log(i)` for `i = 3` never runs,
  and nothing is printed for `3`.
- `i = 4`: neither `if` matches → prints `4`.
- `i = 5`: `i === 5` is true → `break` fires, which means **exit the loop entirely, right
  now** — `console.log(i)` for `i = 5` never runs, and the loop doesn't continue to check
  any further values even though the `i <= 5` condition would technically still allow more
  passes if `i` could go higher.

So the full printed sequence here is `1, 2, 4` — `3` is skipped (via `continue`) and `5` is
never reached (via `break`). This is the cleanest possible illustration of the difference:
`continue` skips just the current lap, `break` ends the race.

### File: `loop_task3.js` — line by line

```js
const studant = {
    name : "JK",
    role: "admin",
    age: 24
}

for(const oop in studant){
    console.log(oop + ' = ' + studant[oop])
    console.log()
}
```
Same `for...in`-on-an-object pattern as `loop_revision.js`, just with a differently-named
loop variable (`oop`, probably a quick typo/placeholder name for "object or property" —
worth renaming to something clearer like `key` in future code, since `oop` doesn't
communicate what it actually holds). Prints `name = JK`, then a blank line (from the
second `console.log()` with no arguments), then `role = admin`, blank line, then `age =
24`, blank line.

```js
const str = "hello";

for(let char in str){
    process.stdout.write(char)
}
```
This line is where `for...in` is used on a **string** instead of an object or array —
and this is exactly the trap called out in my concise notes: `for...in` always iterates
**keys**, never values, regardless of what it's iterating over. For a string, the "keys"
are the numeric **indexes**: `0`, `1`, `2`, `3`, `4` (as strings: `"0"`, `"1"`, `"2"`,
`"3"`, `"4"`) — not the characters `h`, `e`, `l`, `l`, `o`. So even though the variable is
named `char` (suggesting I expected a character each time), it actually holds an index
string on every pass. Running this prints `01234`, **not** `hello` — the opposite of what
the variable name implies I intended. The fix would be to use `for...of` instead:
`for (const char of str)`, which correctly walks over the string's actual characters.

### Gotchas worth remembering from this module

- **`for...in` = keys, `for...of` = values — and `loop_task3.js` has a live, un-noticed
  bug that proves how easy this is to get backwards.** The variable is literally named
  `char`, strongly suggesting I expected each pass to hand me a character of `"hello"`, but
  `for...in` on a string only ever gives index numbers. The output (`01234`) silently
  doesn't match the apparent intent, and nothing in JS flags this as an error — it just
  quietly does something different from what the code reads like it should do. This is
  exactly the kind of mistake worth testing for (print the loop variable and actually look
  at it) rather than assuming the code does what it looks like it does.
- **`continue` skips the current pass; `break` exits the whole loop.** `loop_task2.js`'s
  second loop is a clean minimal example: `3` is skipped (loop keeps going afterward) but
  `5` stops the loop completely (no further passes happen even though the loop's own
  condition would otherwise have allowed one, since `5 <= 5` is true).
- **Infinite loop risk.** Every loop needs a condition that's guaranteed to eventually
  become false, or a `break` that's guaranteed to eventually fire. All the `for` loops here
  are safe because their counter (`i`, `j`) is incremented every pass and the condition
  checks against a fixed, reachable limit — but it's worth deliberately checking this every
  time I write a loop, since a mistyped increment direction, or a condition that can never
  become false, hangs the whole program with no error message at all.
- **`process.stdout.write` vs `console.log`.** `console.log` always appends a newline;
  `process.stdout.write` does not. `loop_task2.js`'s star-rectangle only works because
  `write` is used for each `*` (so they land on the same line) and `console.log()` (no
  arguments) is used once per row specifically to add the newline that `write` doesn't
  give.
- **Bracket access for a dynamic key inside a `for...in` loop is mandatory, not optional.**
  `pr[key]` (where `key` is a loop variable holding a property name) only works with
  brackets — `pr.key` would look for a property literally named `"key"`, which isn't what's
  intended at all.
