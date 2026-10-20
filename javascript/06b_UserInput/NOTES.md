# Module 6b — User Input (Node) — NOTES

### What I learned today

Node has no built-in equivalent of Python's `input()`. The browser has `prompt()` for
pop-up dialogs, but that only exists inside a browser tab, not in Node. To read something
typed into the terminal in Node, I need an external package — `prompt-sync` — installed
with `npm install prompt-sync`. The single biggest thing to internalize here, carried
straight over from Module 5 (Type Conversion): **whatever the user types always arrives as
a string**, no matter how number-ish it looks, so I must explicitly convert it before doing
any math with it.

### File: `input_task.js` — line by line

```js
const prompt = require("prompt-sync")();
```
This line is doing two things at once. `require("prompt-sync")` loads the `prompt-sync`
package (installed via npm) and gives back a *factory function* — a function whose whole
job is to build and hand back the actual `prompt` tool, already configured with default
settings. The `()` immediately after `require(...)` **calls that factory function right
away**, and the thing it returns (the real, usable prompt function) is what gets stored in
the constant named `prompt`. So after this one line, `prompt` is a function I can call like
`prompt("some question: ")` to pause the program and wait for terminal input.

```js
const name = prompt("Enter your name: ");
```
Calling `prompt(...)` with a string argument: that string is printed to the terminal as
the question/label, then the program **pauses** until I type something and press Enter.
Whatever I typed comes back as the return value — always as a **string**, regardless of
what I typed — and gets stored in `name`.

```js
console.log("Welcome " + name);
```
Plain string concatenation with `+` — glues the literal text `"Welcome "` together with
whatever I typed, e.g. typing `Kishore` prints `"Welcome Kishore"`.

```js
const number1 = Number(prompt("Enter the number1: "));
const number2 = Number(prompt("Enter the number2: "));
```
Same `prompt(...)` call as before, but this time the whole thing is immediately wrapped in
`Number(...)`. This matters a lot: `prompt(...)` *always* returns a string — even if I type
`42`, I get back the string `"42"`, not the number `42`. Wrapping it in `Number(...)`
explicitly converts that string into an actual number right at the point I receive it,
so `number1` and `number2` are guaranteed to be real numbers before anything else touches
them.

```js
console.log("Total = " , (number1 + number2));
```
Two things worth noticing: first, `number1 + number2` is now genuine numeric addition
(because both were converted with `Number()` above) — if I'd skipped the conversion, this
would have been string concatenation instead (`"3" + "4"` → `"34"`, not `7`). Second,
`console.log` is called here with **two separate arguments** separated by a comma, not one
concatenated string — `console.log` will print each argument it's given, space-separated,
on the same line. So this prints something like `Total =  7`, built from two pieces
handed to `console.log` rather than one glued-together string.

```js
const age = Number(prompt("Enter your age: "));
```
Same pattern again: read as a string, immediately convert to a number before storing it.

```js
if (age >= 18)
    console.log("adult")
else
    console.log("minor")
```
Ordinary conditional from Module 6, now operating on real user-entered data instead of a
hardcoded constant — this is the first file in my notes so far where the branch taken
actually depends on something typed at runtime rather than a fixed value written in the
source code.

### Gotchas worth remembering from this module

- **Everything `prompt(...)` returns is a string, with no exceptions.** Typing `25` still
  gives back the string `"25"`. If I forget `Number(...)` and do `age + 1` on the raw
  prompt result, I don't get `26` — I get the string `"251"` (concatenation, not addition),
  exactly the Module 5 string/number `+` trap, except now it's hidden behind user input
  instead of a hardcoded string literal, which makes it easier to miss while coding.
- **Convert immediately at the point of input, not later.** The pattern used throughout
  this file — `Number(prompt(...))` as a single combined expression — is the safest habit:
  convert the moment the raw string comes in, so every other line in the file can just
  trust that `number1`, `number2`, and `age` are already real numbers. Converting "later,
  right before I need it" is riskier because it's easy to forget by the time I actually use
  the value in a calculation.
- **These files can't be run the same way as other exercises.** Because `prompt(...)`
  genuinely blocks and waits for real keyboard input, this file has to be run interactively
  in an actual terminal (`node input_task.js`, then type answers) — it can't be
  auto-tested by piping input into it the way some other small scripts can, and it won't
  produce any output at all if run in a non-interactive environment that can't supply
  terminal input.
- **`console.log` with multiple comma-separated arguments vs one concatenated string are
  different habits, both valid.** `console.log("Total = ", number1 + number2)` (used here)
  prints the pieces space-separated; `console.log("Total: " + total)` (used back in
  `operators_task1.js`, Module 4) builds one single string first. Either works for
  debugging output, but they're not literally the same mechanism — one is "log several
  things," the other is "log one already-combined string."
