# Module 27 — Node.js Basics — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

Everything up to now has been "pure" JavaScript — the language itself, usable anywhere
(browser or server). **Node.js** is a *runtime* that takes the V8 JS engine (the same
engine Chrome uses) out of the browser and gives it access to things a browser
deliberately blocks for safety: the file system, OS info, environment variables, raw
network sockets. This module tours Node's core built-in modules: `process`, `fs`
(filesystem), `path`, `os`, and `events` (`EventEmitter`).

A recurring theme across every file here: **modern Node file operations
(`fs/promises`) return real Promises**, so everything learned in Modules 19-20 (await,
try/catch, sequential vs parallel) applies directly and immediately to real disk I/O —
this is the first module where Promises aren't just a `setTimeout`-based simulation
anymore, they're wrapping genuinely slow, real-world work.

---

## File: `process_task1.js` — `process.argv` and `process.env`

```js
const args = process.argv
const approvalLimit = process.env.APPROVAL_LIMIT || 10000
const gstAmount = Number(args[3]) + Number(args[3])*0.18
console.log(args[2])
console.log(gstAmount)
console.log(`within limit: ${Number(args[3])<approvalLimit}`)
```
- `const args = process.argv` — `process.argv` is an array Node automatically fills in,
  containing: `[0]` the path to the `node` executable itself, `[1]` the path to this
  script file, and from `[2]` onward, whatever extra arguments were typed after the
  script name on the command line (e.g. running `node process_task1.js PR-001 5000`
  would make `args[2] === "PR-001"` and `args[3] === "5000"`).
- `const approvalLimit = process.env.APPROVAL_LIMIT || 10000` — `process.env` holds
  **environment variables** (set outside the script, e.g. `APPROVAL_LIMIT=4000 node
  process_task1.js ...`). `|| 10000` supplies a default: if that environment variable was
  never set (`undefined`, which is falsy), fall back to the plain number `10000`.
  **Important subtlety:** if `APPROVAL_LIMIT` WAS set, `process.env.APPROVAL_LIMIT` is
  always a **string** (e.g. `"4000"`), never a real number — environment variables and
  command-line args are always text, no exceptions.
- `const gstAmount = Number(args[3]) + Number(args[3])*0.18` — `args[3]` is a string
  (e.g. `"5000"`); `Number(args[3])` explicitly converts it to a real number before doing
  any math — skipping this conversion (`args[3] + args[3]*0.18`) would do string
  concatenation instead of addition for the first `+`, producing garbled text instead of
  a number. `Number(...)` is called twice here (once in each term) rather than stored in
  a variable once — works fine, just slightly repetitive.
- `console.log(args[2])` — prints whatever the first real command-line argument was
  (e.g. `"PR-001"`).
- `console.log(gstAmount)` — prints the computed amount-plus-tax.
- `console.log(\`within limit: ${Number(args[3])<approvalLimit}\`)` — compares the
  **converted-to-number** `args[3]` against `approvalLimit`. This comparison only behaves
  correctly because `Number(args[3])` was explicitly converted — if `approvalLimit` ended
  up being the *string* fallback default from `process.env` (when the env var IS set) and
  the left side were left as a string too, this comparison would silently become a
  **text** comparison instead of a numeric one (where, famously, `"900" < "1000"` is
  `false`, because `"9"` sorts after `"1"` character-by-character) — exactly the trap
  called out in `js_learning_notes.md`'s Module 27 section. This file protects the left
  side by converting it, which is the right habit.

---

## File: `fs_task2.js` and `fs_task2_reference.js` — `fs/promises`, sequential writes
and reads

`fs_task2.js` (the attempt actually run):
```js
const fs = require("fs/promises")

async function read () {
    await fs.writeFile("data.json","PR-001 submitted")

    const first = await fs.readFile("data.json","utf8")
    console.log(first)
    await fs.appendFile("data.json","PR-002 submitted")
    const both = await fs.readFile("data.txt", "utf8");
    console.log(both)
}

read()
```
- `const fs = require("fs/promises")` — Node's built-in file system module, specifically
  the **Promise-based** version (`fs/promises`, as opposed to the older plain `fs`, which
  uses callbacks, or `fs`'s `...Sync` functions, which block). Every method here
  (`writeFile`, `readFile`, `appendFile`) returns a real Promise.
- `await fs.writeFile("data.json","PR-001 submitted")` — writes (and **overwrites** if
  the file already existed) the file `data.json` with that exact text. `await` here
  matters: without it, the next line could start running before the write has actually
  finished landing on disk, which would be a real race condition (not a hypothetical one
  — disk I/O genuinely isn't instant).
- `const first = await fs.readFile("data.json","utf8")` — reads the file back. The
  `"utf8"` second argument tells `readFile` to decode the raw bytes into a normal text
  **string** — without it, you'd get back a raw `Buffer` object instead of readable text.
  `await` ensures `first` holds the actual string, not a pending Promise.
- `console.log(first)` → prints `PR-001 submitted`.
- `await fs.appendFile("data.json","PR-002 submitted")` — adds more text onto the
  **end** of the existing file content (unlike `writeFile`, which replaces everything).
  Because there's no `\n` (newline) in either the original write or this append, the two
  lines actually end up jammed together with no space, as visible in the real
  `27_NodeBasics/data.json` file in this repo: `PR-001 submittedPR-002 submitted` — one
  continuous run of text, not two separate lines. That's a real, observable effect of the
  missing newline here, left exactly as the code produced it.
- `const both = await fs.readFile("data.txt", "utf8");` — this line reads from
  `"data.txt"` — a **different filename** than the one actually being written to
  (`"data.json"`) earlier in the same function. Since `data.txt` was never created by this
  script, this `readFile` call fails (rejects) with a "file not found" error. **There is
  no `try/catch` anywhere in this function**, so that rejection becomes an unhandled
  promise rejection — the script crashes at this point rather than failing gracefully,
  and `console.log(both)` on the next line never actually runs.

`fs_task2_reference.js` is the corrected, fully-working version of the same exercise,
kept side-by-side as a worked reference:
```js
const fs = require("fs/promises");

async function run() {
  await fs.writeFile("data.txt", "PR-001 submitted\n");
  const first = await fs.readFile("data.txt", "utf8");
  process.stdout.write(first);
  await fs.appendFile("data.txt", "PR-002 submitted\n");
  const both = await fs.readFile("data.txt", "utf8");
  process.stdout.write(both);
}

run();
```
Same four-step shape, but fixing both issues from the attempt above: (1) every
`readFile`/`writeFile`/`appendFile` call consistently targets `"data.txt"`, the one real
file being built up, never a typo'd different filename; (2) each written line ends with
`"\n"` (a newline character), so that the appended second line lands on its own separate
line instead of running directly into the first. `process.stdout.write(...)` is used
instead of `console.log(...)` here specifically because the string already ends in
`"\n"` (from the write itself) — `console.log` would add yet another trailing newline on
top of that, producing an extra blank line; `process.stdout.write` prints exactly the
string given, with no automatic extra newline. The reference file's own trailing comment
spells out the expected final output: `PR-001 submitted` printed once (after the first
read), then both lines (`PR-001 submitted` and `PR-002 submitted`) printed together
(after the second read, which sees the fully appended file).

---

## File: `fs_json_task3.js` — `fs/promises` + `JSON.parse`/`stringify` together

```js
const { log } = require("console")
const fs = require("fs/promises")
const pr = [ { id: "PR-001", amount: 5000 }, { id: "PR-002", amount: 8000 } ]


async function run(){



    try{
        await fs.writeFile("jdata.json",JSON.stringify(pr,null,2))
        const jPr = await fs.readFile("jdata.json","utf8")

        const jsonPr = JSON.parse(jPr)

        const total = jsonPr.reduce((sum,n)=> sum+n.amount,0)
        console.log("saved");

        console.log(`total:`,total);
        //await JSON.parse(fs.readFile("data.json","utf8")) - fail path
    }
    catch(err){
        console.log("Invalid JSON")
    }

}

run()
```
- `const { log } = require("console")` — destructures the `log` function straight out of
  Node's built-in `console` module (the exact same function as the global `console.log`
  you've always used — this is just importing it explicitly). Imported but never actually
  called anywhere below (`console.log` the global is used instead throughout) — a harmless
  unused import.
- `const pr = [...]` — an array of two plain objects to save.
- `await fs.writeFile("jdata.json",JSON.stringify(pr,null,2))` — this combines Module 25
  (JSON) directly with this module's `fs`: `JSON.stringify(pr,null,2)` first turns the
  live array into pretty-printed JSON **text** (2-space indented), and `writeFile` saves
  that text string to disk as `jdata.json` — which is exactly the real
  `27_NodeBasics/jdata.json` file visible in this repo, matching this formatting exactly.
- `const jPr = await fs.readFile("jdata.json","utf8")` — reads that same file straight
  back as a text string.
- `const jsonPr = JSON.parse(jPr)` — converts the text back into a real, live JS array of
  objects again — the full save/load round trip.
- `const total = jsonPr.reduce((sum,n)=> sum+n.amount,0)` — sums up every `.amount`
  field across the array, starting the accumulator at `0` — `5000 + 8000 = 13000`.
- `console.log("saved")` then `console.log(\`total:\`,total)` — two separate log calls;
  the second passes TWO arguments to `console.log` (a label string, then the number) —
  `console.log` happily prints multiple arguments space-separated on one line:
  `total: 13000`.
- The commented-out line `//await JSON.parse(fs.readFile("data.json","utf8")) - fail
  path` is a deliberately-left note: this would be a genuine bug if uncommented —
  `fs.readFile(...)` returns a **Promise**, and `JSON.parse` would need that Promise's
  resolved *value* (a string), not the Promise object itself — so `JSON.parse` would need
  to be the thing that's `await`ed, i.e. `JSON.parse(await fs.readFile(...))`, not
  `await JSON.parse(fs.readFile(...))`, which awaits the wrong part. Kept as a comment
  specifically as a reminder of a mistake once made/considered, not deleted.
- The whole thing is wrapped in `try/catch`, so if the JSON anywhere in this round trip
  had been malformed, `catch(err){ console.log("Invalid JSON") }` would print a friendly
  message instead of crashing — same defensive habit as `json_task2.js` (Module 25),
  now protecting a real file-based JSON flow instead of a hardcoded string.

---

## File: `path_task4.js` — `path.join`, `fs.mkdir`, and reading `path` metadata

```js
const fs = require("fs/promises")
const path = require("path")
const pr =[{
    id: "PR-001",
    amount: 5000
}]


async function main() {
    const folderPath = path.join(__dirname,"store")
    await fs.mkdir(folderPath,{recursive: true})
    const filePath = path.join(__dirname,"store","odata.json")
    await fs.writeFile(filePath,JSON.stringify(pr))
    console.log(`Saved`)
    const read = JSON.parse(await fs.readFile(filePath,"utf8"))
    console.log(read[0].amount)
    console.log(path.basename(filePath))
    console.log(path.extname(filePath))

}
main()
```
- `const path = require("path")` — Node's built-in `path` module, for building file paths
  correctly regardless of operating system (Windows uses `\`, Mac/Linux use `/` — `path`
  abstracts that away).
- `const folderPath = path.join(__dirname,"store")` — `__dirname` is a special Node
  (CommonJS-only) variable always equal to the absolute folder path containing the
  **current file itself** — not wherever the terminal happened to be when `node` was run
  (that's `process.cwd()` instead, a genuinely different thing). `path.join(...)` glues
  path segments together with the correct separator for the current OS, so
  `folderPath` becomes something like `/home/.../27_NodeBasics/store`, always correct no
  matter where the command was launched from.
- `await fs.mkdir(folderPath,{recursive: true})` — creates that folder.
  **`{recursive: true}` matters a lot here**: a plain `fs.mkdir` would **throw** if the
  folder already exists, or if a parent folder in the path is missing; `recursive: true`
  makes it silently succeed if the folder's already there (and would create any missing
  parent folders too, though none are needed here). Looking at the actual repo, the
  `27_NodeBasics/store/` folder already exists with `odata.json` inside it — proof this
  line has already run successfully before.
- `const filePath = path.join(__dirname,"store","odata.json")` — builds the full path to
  the actual file this time, three segments joined together correctly.
- `await fs.writeFile(filePath,JSON.stringify(pr))` — saves the array as (non-pretty,
  single-line) JSON text at that exact path.
- `console.log(\`Saved\`)` — simple confirmation log.
- `const read = JSON.parse(await fs.readFile(filePath,"utf8"))` — reads the file back and
  parses it in one combined expression: `await fs.readFile(...)` is evaluated first
  (giving the raw JSON string), and **that** is what gets passed into `JSON.parse(...)` —
  this is the *correct* ordering the commented-out line in `fs_json_task3.js` was warning
  about avoiding the mistake of.
- `console.log(read[0].amount)` — `read` is the parsed array again; `[0]` grabs the first
  (only) object, `.amount` reads its field → prints `5000`.
- `console.log(path.basename(filePath))` — `path.basename(...)` extracts just the final
  filename portion of a full path, dropping all the folder segments → prints
  `odata.json`.
- `console.log(path.extname(filePath))` — `path.extname(...)` extracts just the file
  extension (including the dot) → prints `.json`.
- Both `basename`/`extname` are called on the **`filePath` variable**, not a
  freshly-retyped string — this matters because it guarantees they're always derived
  from whatever the real, correctly-built path actually is, rather than risking a typo'd
  duplicate string drifting out of sync with the real path later.

---

## File: `os_task5.js` — reading machine info with `os`

```js
const os = require("os")

console.log(`platform: ${os.platform()}`)
console.log(`cores: ${os.cpus().length}`)
console.log(`Free memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`);
```
- `const os = require("os")` — Node's built-in `os` module, for reading info about the
  physical machine the Node process is running on.
- `os.platform()` — **a function call** (note the `()`), returns a short string
  identifying the operating system (e.g. `"linux"`, `"win32"`, `"darwin"`).
- `os.cpus()` — returns an **array**, one entry per logical CPU core, each entry
  containing detailed info (model, speed, etc.) — `.length` on that array just counts how
  many cores exist, without caring about the details inside each entry.
- `os.freemem()` — returns the amount of free system memory, but **in raw bytes**, a
  huge, not-very-human-readable number. `/ 1024 / 1024` converts bytes → kilobytes →
  megabytes (dividing by 1024 twice, since 1024 bytes = 1 KB and 1024 KB = 1 MB).
  `.toFixed(2)` formats the resulting number as a string with exactly 2 decimal places
  (e.g. `"3421.57"`), which is why the whole expression is wrapped in `( )` before the
  `${...}` template-literal interpolation — `toFixed` needs to be called on the already-
  divided number, not on the raw byte count.
- All three of `os.platform()`, `os.cpus()`, and `os.freemem()` are genuinely
  **functions that must be called with `()`** to get their real value — this is
  specifically flagged in `js_learning_notes.md` because Node's `os` module has an unusual
  quirk where forgetting the `()` and writing something like `${os.freemem}` directly
  inside a template literal can still print *something* (the function's source code gets
  coerced to a string) without throwing an error, which can mask the mistake — no other
  common library behaves this way, so it's worth remembering `os`'s functions specifically
  need deliberate `()` calls.

---

## File: `events_task6.js` — `EventEmitter`, `.on` vs `.once`

```js
const EventEmitter = require("events")



class PurchaseRequestService extends EventEmitter{
    submitPr(pr){

        this.emit("pr-submitted",pr)
    }
}

const service = new PurchaseRequestService()

const prs =["PR-001","PR-002"]

service.on("pr-submitted",pr=>{console.log(`email-sent for ${pr}`)})
service.on("pr-submitted",pr=>{console.log(`audit logged for ${pr}`)})
service.once("pr-submitted",pr=> console.log(`first PR of the day: ${pr}`))

for (const pr of prs){
    service.submitPr(pr)
}
```
- `const EventEmitter = require("events")` — Node's built-in `events` module exports the
  `EventEmitter` class directly (not as a named property — this `require` call returns
  the class itself).
- `class PurchaseRequestService extends EventEmitter{ ... }` — this is Module 23's
  `extends` applied to a built-in class: `PurchaseRequestService` inherits everything
  `EventEmitter` can do (`.on`, `.once`, `.emit`, `.off`, etc.) just by extending it.
- `submitPr(pr){ this.emit("pr-submitted",pr) }` — `.emit(eventName, payload)` is how an
  `EventEmitter` **announces** that something happened — it doesn't call any specific
  function directly by name; it just broadcasts an event named `"pr-submitted"` carrying
  `pr` as data, and whoever happens to be listening for that exact event name reacts. This
  is the core idea of **decoupling**: `submitPr` has no idea how many listeners exist, or
  what they do — it just announces the event and moves on.
- `const service = new PurchaseRequestService()` — a real instance.
- `service.on("pr-submitted",pr=>{...})` (called twice, with two different callbacks) —
  `.on(eventName, callback)` registers a callback to run **every single time** that event
  is emitted, for as long as the program runs (or until explicitly removed with `.off`).
  Registering `.on` twice for the same event name is completely valid — both callbacks
  run, every time, independently (one logging "email-sent," one logging "audit logged").
- `service.once("pr-submitted",pr=> console.log(...))` — `.once` is like `.on`, except it
  automatically removes itself after firing **exactly one time** — useful for "only react
  to the very first occurrence" logic (here, flagging "the first PR of the day").
- `for (const pr of prs){ service.submitPr(pr) }` — loops over `["PR-001","PR-002"]`,
  calling `submitPr` once per id.
- Tracing the actual output: for `"PR-001"` (the first emit), **all three** listeners
  fire, in the order they were registered: `email-sent for PR-001`,
  `audit logged for PR-001`, `first PR of the day: PR-001` — and after this, the `.once`
  listener is automatically removed. For `"PR-002"` (the second emit), only the two `.on`
  listeners remain and fire: `email-sent for PR-002`, `audit logged for PR-002` — the
  "first PR of the day" message does **not** print again, because `.once` only ever
  fires once, total, across the whole program's lifetime.

---

## Gotchas worth remembering from this module

- **`argv`/`env` values are always strings — convert with `Number(...)` before any math
  or numeric comparison.** `process_task1.js` correctly wraps `args[3]` in `Number(...)`
  everywhere it's used numerically; skipping that conversion anywhere would silently
  produce string concatenation instead of addition, or a wrong (lexicographic) comparison
  result instead of a numeric one.
- **Every `fs/promises` call must be `await`ed when a later step depends on it finishing
  — unawaited calls race.** `fs_task2.js`'s broken attempt and its
  `fs_task2_reference.js` fix both correctly `await` every single `fs` call; the
  difference between the two files is really about the **filename consistency and
  missing newline**, not missing `await`s — but it's worth remembering both failure modes
  are possible with `fs/promises`.
- **Reading/writing the WRONG filename (a typo) fails silently in the sense that it's not
  a syntax problem — it's a runtime "file not found" rejection with no `try/catch` to
  catch it.** `fs_task2.js`'s `fs.readFile("data.txt", ...)` after only ever writing to
  `"data.json"` is a real, observable bug in that file, left in as a learning example —
  always double check every filename argument matches the one actually being written.
- **`fs.mkdir` throws if the folder already exists — `{recursive: true}` is the fix, and
  it's needed almost every time you create a folder in real code.** `path_task4.js` uses
  it correctly; omitting it would make re-running this script a second time crash.
- **Always anchor real file paths with `path.join(__dirname, ...)` — never assume the
  current working directory.** `path_task4.js` does this correctly for both the folder
  and the file; `__dirname` is tied to where the *file itself* lives on disk, completely
  independent of where the `node` command happened to be run from (`process.cwd()` is the
  different, run-location-dependent thing).
- **`os`'s info methods are genuine function calls — `()` is required.** `os_task5.js`
  calls `os.platform()`, `os.cpus()`, and `os.freemem()` all correctly with parentheses;
  per `js_learning_notes.md`, forgetting `()` on `os` functions specifically can silently
  "look like it worked" rather than throwing, which makes this an easy mistake to miss.
- **An `EventEmitter`'s `"error"` event with no listener crashes the whole Node process —
  always attach an error listener on anything that can emit one.** `events_task6.js`
  doesn't emit an `"error"` event itself, but this is the single most important safety
  rule to remember about `EventEmitter` generally, straight from `js_learning_notes.md`.
- **`.once` listeners are consumed after their first firing — don't expect them to react
  to later events of the same name.** `events_task6.js` shows this directly: the
  "first PR of the day" message logs for `"PR-001"` only, never for the subsequent
  `"PR-002"` emit, because `.once` already unregistered itself.
