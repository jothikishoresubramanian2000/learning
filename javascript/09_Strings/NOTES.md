# Module 9 — Strings — NOTES

### What I learned today

JS has three ways to write a string (`'...'`, `"..."`, and backtick `` `...` ``
**template literals**), and template literals are genuinely new and genuinely better than
anything Python gives me without an f-string prefix — `` `${expression}` `` lets me drop
any JS expression straight into a string with no manual `+` gluing. The other core idea,
and the one that causes the most confusion if I forget it: **strings in JS are
immutable** — every string method (`.toUpperCase()`, `.replace()`, `.slice()`, etc.)
*returns a brand new string* rather than changing the original in place, and trying to
change a single character directly (`str[0] = "X"`) does absolutely nothing, silently.

### File: `string_task1.js` — line by line

```js
const name = "Kishore"; const salary = 50000;
```
Two `const` declarations on one line, separated by a semicolon — perfectly legal, just a
compact way to write two statements.

```js
console.log(`${name} earns ${salary} per month`)
```
A **template literal** — the backticks let me embed `${name}` and `${salary}` directly
inside the string; JS evaluates each `${...}` expression and splices its value into the
final string. Prints `"Kishore earns 50000 per month"`. Compare this to the old way,
`name + " earns " + salary + " per month"` — the template literal version is far easier to
read because the text and the data stay visually separated by the `${}` markers instead of
being chopped up by `+` signs everywhere.

```js
console.log(name.toUpperCase())
```
`.toUpperCase()` is a string method — it **returns a new string** with every letter
uppercased, leaving `name` itself completely untouched. Prints `"KISHORE"`. (`name` still
holds `"Kishore"` afterward — this line doesn't reassign anything.)

```js
console.log(name.length)
```
`.length` is a **property**, not a method (no parentheses) — it holds the number of
characters in the string. `"Kishore"` has 7 characters, so this prints `7`.

### File: `string_task2.js` — line by line

```js
let firstName = "Kishore"; let id = "1"; 
```
`firstName` declared with `let` because it's about to be reassigned on the next line.
Note `id` is the **string** `"1"`, not the number `1` — deliberately, since it's about to
be used with a *string* method (`.padStart`).

```js
firstName = firstName.toUpperCase()
```
Reassignment: `firstName.toUpperCase()` computes a new, all-caps string, and that new
string is assigned *back onto* the same variable `firstName`. This is the correct pattern
for "mutating" a string in practice — you can't change a string's characters in place, but
you absolutely can replace what the *variable* points to with a new, transformed string.
After this line, `firstName` holds `"KISHORE"`.

```js
id = id.padStart(3, 0)
```
`.padStart(targetLength, padCharacter)` — pads the string on the **left** with the given
character until the string reaches `targetLength` total characters. `id` is `"1"` (length
1), target length is `3`, so it needs 2 more characters added on the left using `0` as
filler → becomes `"001"`. (The `0` here is technically the *number* `0`, but
`.padStart` converts it to the string `"0"` before using it as filler — it works correctly
either way.)

```js
const employeeId = `EMP-${firstName}-${id}`
```
Template literal again, this time combining a literal prefix (`"EMP-"`), the now-uppercase
`firstName`, a literal dash, and the now-padded `id`. Result: `"EMP-KISHORE-001"` — a
realistic example of exactly the kind of formatted ID a backend system would generate.

```js
console.log(employeeId)
console.log(employeeId.startsWith("EMP"))
```
First line prints `"EMP-KISHORE-001"`. `.startsWith("EMP")` checks whether the string
begins with the exact given substring — it does, so this prints `true`.

### File: `string_task3.js` — line by line

```js
let csvString = "kishore,admin,24";
let splitedString = csvString.split(",");
```
`.split(",")` breaks a string into an **array** of substrings, cutting at every `,`
character (and removing the commas themselves). `csvString` stays an untouched string;
`splitedString` becomes the new array `["kishore", "admin", "24"]`. (Minor naming note:
`splitedString` — the correct spelling would be `splitString` or `splitResult`, but it's
just a naming typo, doesn't affect behavior at all.)

```js
for(let chars of splitedString){
    console.log(chars)
}
```
`for...of` on the array — correctly iterates over the **values** (unlike the `for...in` on
a string mistake from Module 7's `loop_task3.js`). Prints each element on its own line:
`kishore`, `admin`, `24`.

```js
let myEmail = "kishore@gmail.com";
myEmail = myEmail.split("@")
console.log(myEmail[1]);
```
`myEmail` starts life as a string, then gets **reassigned** to the result of
`.split("@")` — which is an array: `["kishore", "gmail.com"]`. This is legal (`myEmail` was
declared `let`, so reassigning to a different *type* entirely, string to array, is
perfectly allowed — JS variables aren't locked to one type the way some other languages'
variables are). `myEmail[1]` then uses array indexing to grab the second element,
`"gmail.com"` — pulling out the domain part of the email by splitting on `@` and taking
what comes after it, rather than hardcoding how many characters to chop off (a much more
robust approach than, say, assuming every email's local part is a fixed length).

```js
let str = "hello";
str[0] = "H"
console.log(str)
```
This is the **direct, hands-on demonstration of string immutability**. `str[0] = "H"`
*looks* like it should replace the first character, the way it would on a mutable
character array in C. But strings in JS cannot be changed this way — this assignment is
simply ignored; no error is thrown, nothing happens. `console.log(str)` right after this
line still prints the original `"hello"`, completely unchanged — proving the assignment
had zero effect.

```js
str = str.replace("h","H") //replace the first instance of h to H, resturn new string not change in place
console.log(str)
```
The *correct* way to achieve the intended change: `.replace("h", "H")` finds the first
occurrence of `"h"` and swaps it for `"H"`, but — just like every other string method —
it **returns a brand new string** rather than modifying `str` in place. Reassigning that
new string back onto `str` (`str = str.replace(...)`) is what actually makes the change
"stick" on the variable. My own comment nails exactly why: *"replace the first instance of
h to H, resturn new string not change in place"* — I'd clearly already internalized the
immutability rule by the time I wrote this line, right after proving the opposite approach
fails on the line above. After this, `str` holds `"Hello"`.

### Gotchas worth remembering from this module

- **Strings are immutable — `str[0] = "X"` is a real, silent no-op, demonstrated directly
  in my own code.** No error, no warning, just nothing happens. The only way to "change" a
  string is to build a new one (via a method like `.replace()`, `.slice()`, or template
  literals) and reassign it back to the variable.
- **Reassigning a `let` variable can change its type entirely, and JS allows it without
  complaint.** `myEmail` goes from a plain string to an array mid-file. This is legal and
  sometimes convenient, but it's also a readability risk — a variable named `myEmail` that
  later holds an array (not a string) can confuse a reader (or future me) who expects the
  name to always mean "an email string." Worth considering a second variable name (like
  `emailParts`) for the split result instead of overwriting the original.
- **`.split()` turns a string into an array; `.join()` (not used in these files, but the
  natural counterpart) turns an array back into a string.** `split("@")[1]` for pulling a
  domain, or `split(",")` for CSV parsing, are both real, practical backend patterns shown
  directly in `string_task3.js`.
- **Template literals vs `+` concatenation — prefer template literals for anything with
  more than one variable mixed into text.** `string_task1.js` and `string_task2.js` both
  use `` `${...}` `` consistently rather than chains of `+`, which keeps the literal text
  and the embedded values visually distinct and avoids accidentally breaking string
  concatenation with a missing quote or `+`.
- **`.padStart`/`.padEnd` take the *target total length*, not "how many characters to
  add."** `"1".padStart(3, "0")` → `"001"` because the target is 3 characters *total*, and
  JS adds however many pad characters are needed to reach that total — in this case 2, not
  3.
