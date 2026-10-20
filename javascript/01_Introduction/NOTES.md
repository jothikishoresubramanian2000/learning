# Module 1 — Introduction — NOTES

### What I learned today

This was the very first contact with JavaScript, so the goal wasn't to write anything
clever — it was to understand *where JS actually runs* and get one file executing. Coming
from Python and C, I already know what a "run a program" workflow looks like (`python
file.py`, or compile-then-run for C). JS has the same idea but with a twist: the same
language can run in two completely different homes.

**The engine.** Every JS statement I write is eventually executed by something called
**V8** — Google's JavaScript engine, written in C++. V8 is the thing that actually reads
my code and does the work. It's not JS-specific magic floating in the air; it's a real
program, and it gets embedded in two different hosts:

- **The browser** — V8 is baked into Chrome (and Chromium-based browsers). This is what
  runs JS when a webpage does something interactive (a button click, a form validation).
- **Node.js** — V8 pulled *out* of the browser and given extra abilities: reading files,
  talking to a database, listening on a network port. No browser involved at all. This is
  the "JS as a backend language" story, which is why I'm learning it — it's the same
  language I'd use for frontend, but run through Node instead of a browser tab.

So "learning JavaScript" really means: learn the language once, then learn that *Node*
gives me the backend-flavored toolbox on top of it (files, HTTP servers, etc. — that's
coming in later modules).

**Running a file.** With Node installed, a `.js` file is executed from the terminal with:
```
node hello_world.js
```
That's the direct equivalent of `python hello_world.py` — no compile step, Node reads the
file top to bottom and runs it immediately.

### File: `hello_world.js` — line by line

```js
console.log("Hello JavaScript");
```
`console` is a built-in object Node (and the browser) always makes available — think of it
as the terminal/output channel. `.log(...)` is a method on that object whose job is: take
whatever I hand it and print it to the screen, followed by a newline. This is the direct
JS equivalent of Python's `print(...)`. `"Hello JavaScript"` is a **string** — text wrapped
in quotes — being passed in as the argument to print.

```js
console.log("Python, C");
```
Same exact mechanism, second string. This line (and the one below) was me literally
answering "what's your background" inside the code, as a first "hello world plus a little
bit more" exercise — nothing structurally new here, just repetition to get comfortable
with calling `console.log` more than once in a file.

```js
console.log("To work in backend for projects");
```
Third call, same pattern — stating the goal (backend work) as the third printed line. Each
`console.log` call is independent: they run one after another, top to bottom, each
producing its own line of output. Running the file prints three lines:
```
Hello JavaScript
Python, C
To work in backend for projects
```

### Other Module 1 concepts (not in this file, but part of the module)

- **Comments.** `// this is a single-line comment` — anything after `//` on that line is
  ignored by Node; it's a note to a human reader, not an instruction. `/* this is a
  multi-line block comment */` — everything between `/*` and `*/` is ignored, even across
  several lines. Comments don't affect what the program does at all; they exist purely for
  explaining code to yourself or someone else later.
- **Semicolons.** JS has a feature called **ASI — Automatic Semicolon Insertion**. If I
  forget a `;` at the end of a line, JS usually figures out where the statement was
  supposed to end and quietly inserts the semicolon for me at parse time. That's why code
  without semicolons still runs. It is still the convention (and safer in a few edge
  cases) to type the `;` explicitly rather than rely on JS guessing correctly every time.

### Gotchas worth remembering from this module

- **`console.log` is not the same object as Python's `print`, but it behaves the same way
  for basic use** — the mental model "pass it a value, it prints a line" transfers
  directly, so there's nothing new to unlearn here.
- **ASI is a convenience, not a guarantee.** There are a handful of known cases (a line
  starting with `(` or `[` right after a line with no semicolon, for example) where ASI
  guesses wrong and silently joins two lines into one broken statement. Since this bites
  people rarely but confusingly, the safe habit from day one is: always type the `;`
  myself rather than depend on JS inserting it correctly.
- **"JavaScript" is really two runtimes wearing one name.** Code that works in Node won't
  automatically work in a browser console and vice versa, because each host exposes
  different extra objects (`document`, `window` in the browser; `require`, `process`,
  file-system access in Node). The *language* (variables, functions, loops, etc.) is
  identical in both — only the surrounding toolbox differs. Since my goal is backend, from
  here on "running JS" effectively means "running it through Node."
