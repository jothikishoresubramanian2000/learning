# Module 25 — JSON — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, so that months from now you can open this
> file cold and rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

**JSON (JavaScript Object Notation)** is a **text format** for representing data — it
looks a lot like a JS object literal, but it is NOT a JS object; it's a plain string,
following a few extra strict rules (double-quoted keys only, no trailing commas, only a
small fixed set of allowed value types). JSON is the universal "wire format" for
sending/receiving data over a network and for saving structured data to a file, because
a string can travel anywhere (over HTTP, into a text file) while a live JS object
(sitting in memory, possibly containing functions) cannot.

Two functions do all the conversion work, and they're each other's exact opposite:
- **`JSON.stringify(value)`** — turns a real JS value (object/array/etc.) into its JSON
  **string** representation.
- **`JSON.parse(jsonString)`** — turns a JSON **string** back into a real, live JS value.

---

## File: `json_task1.js` — the basic round trip

```js
const pr={
    id: "PR-001",
    amount: 5000,
    approved: true
}

const json = JSON.stringify(pr)
const back = JSON.parse(json)
console.log(json)
console.log(back.amount)
```
- `pr` — an ordinary JS object with three fields: a string, a number, and a boolean (all
  types JSON natively supports).
- `JSON.stringify(pr)` — converts the live object into a **string** that *looks* similar
  to the object but is really just text:
  `'{"id":"PR-001","amount":5000,"approved":true}'`. Every key is forced into
  double-quotes (JSON requires this, even though `pr`'s own keys were written unquoted in
  the source code — that unquoted style is only legal in actual JS syntax, not in JSON
  text).
- `JSON.parse(json)` — takes that string and rebuilds a brand-new, real JS object from
  it — `back` is a completely separate object from `pr` (same field values, but not the
  same object in memory) — this is the full round trip: object → text → object again.
- `console.log(json)` — prints the actual JSON **string**, visibly showing the quoted
  keys: `{"id":"PR-001","amount":5000,"approved":true}`.
- `console.log(back.amount)` — `back` is a real object again by this point, so normal
  property access works — prints `5000`.

---

## File: `json_task2.js` — `JSON.parse` throws on malformed input

```js
const pr = `{
    "id":"PR-002",
    "amount":8000
}`
const bjson =`{
broken json
}`
try{

    console.log(JSON.parse(pr).id)
    JSON.parse(bjson)
}
catch(err){
    console.log(`Invalid JSON`)
}
```
- `pr` — a template literal (backticks) containing text that happens to already be
  **valid JSON** (double-quoted keys, proper structure) — spread across multiple lines
  just for readability; whitespace/newlines inside JSON text don't matter.
- `bjson` — a template literal containing text that is **not valid JSON** at all — `broken
  json` is bare, unquoted text, not a proper `"key": value` pair, so this string could
  never successfully be parsed as JSON.
- `try{ ... }` wraps both parse attempts:
  - `JSON.parse(pr).id` — parses the *valid* JSON string, immediately reads `.id` off the
    resulting object (chaining the property access right onto the result, no need for a
    separate variable) → this would print `"PR-002"` ... except—
  - `JSON.parse(bjson)` — parsing the broken string **throws a `SyntaxError`** the
    moment it's attempted. Because this line comes right after the first one, inside the
    *same* `try` block, the throw here means execution jumps straight to `catch`
    immediately — **the previous line's `console.log(...).id` output never actually gets
    a chance to print**, because the whole `try` block is abandoned the instant any line
    inside it throws. (This is an important, slightly subtle detail: it's not that
    `JSON.parse(pr).id` is wrong or broken — it's that `try/catch` aborts the *entire*
    block on the *first* throw, no matter how many successful lines came before it in the
    same block.)
- `catch(err){ console.log(\`Invalid JSON\`) }` — catches the `SyntaxError` from the
  broken parse, and prints a clean, friendly message rather than dumping the raw
  parser error — this is the Module 21 lesson (log something clean/useful, not the raw
  error object) applied specifically to JSON parsing, which is one of the most common
  real places a `SyntaxError` shows up in everyday backend code (malformed request
  bodies, corrupted config files, etc.).

---

## File: `json_task3.js` — what `JSON.stringify` silently drops

```js
const obj ={
    id:"PR-001",
    add(){},
    name: undefined, // undefined and funtion will be ignored in json, because those are not it's type
    amount: 2000
}

console.log(JSON.stringify(obj,null,2))
```
- `obj` — deliberately built with a mix of JSON-friendly and JSON-unfriendly field types:
  `id` (a string, fine), `add(){}` (a method — a function value), `name: undefined`
  (the JS-only `undefined` value), `amount` (a number, fine).
- `JSON.stringify(obj,null,2)` — three arguments this time:
  - 1st argument: the value to stringify (`obj`).
  - 2nd argument (`null`): the "replacer" — an optional function or array that can filter
    or transform fields during stringification; `null` means "no special
    filtering/transforming, include everything normally."
  - 3rd argument (`2`): the "indent" amount — pretty-print the output with 2 spaces of
    indentation per nesting level, instead of cramming it all onto one line. This is
    purely cosmetic (for readable logs/files), it doesn't change what data survives.
- The actual output, because of what JSON *can't* represent:
  ```json
  {
    "id": "PR-001",
    "amount": 2000
  }
  ```
  Both `add` (a function) and `name` (whose value is `undefined`) are **completely
  omitted** from the result — not turned into `null`, not turned into an empty string,
  just silently dropped as if they were never there at all. This is a real, important
  rule: **JSON has no way to represent a function or the specific value `undefined`**
  (JSON's "nothing" value is `null`, a different, JSON-native concept), so `stringify`
  leaves them out entirely rather than erroring.

---

## Gotchas worth remembering from this module

- **JSON text requires double-quoted keys, no trailing commas, and only specific value
  types** — `json_task1.js`'s `JSON.stringify` output shows real JSON text
  (`"id":"PR-001"`, every key double-quoted) even though the *original* JS object literal
  used unquoted keys — these are two different notations that happen to look visually
  similar, and it's worth remembering they're not interchangeable (you can't hand-paste a
  JS object literal somewhere expecting it to be read as JSON if it has single quotes,
  unquoted keys, or a trailing comma).
- **Always wrap `JSON.parse` of external/untrusted input in `try/catch`.**
  `json_task2.js` exists specifically to prove `JSON.parse` **throws** (a `SyntaxError`)
  rather than returning something like `null` on bad input — any time you're parsing data
  that came from outside your own code (a request body, a file read from disk, a
  database text field), assume it might be malformed and guard accordingly.
- **A `try` block aborts entirely on its first throw — later lines in the same block never
  run, even "successful-looking" ones before the failure.** `json_task2.js`'s
  `console.log(JSON.parse(pr).id)` line is perfectly valid on its own, but because it
  sits in the same `try` block as the line that throws, its output is lost the moment the
  second line fails — a good reminder to think about what order risky calls are grouped
  in, and whether a given `try` block should really be two smaller ones if you need
  partial progress to survive a later failure.
- **Functions and `undefined` values vanish silently during `JSON.stringify` — no error,
  no placeholder, just gone.** `json_task3.js` demonstrates this directly on `add(){}`
  and `name: undefined`. This same rule is *why* a `Map` or `Set` "doesn't survive JSON"
  (mentioned in `js_learning_notes.md`) — `JSON.stringify` doesn't know how to represent
  them either and effectively serializes them as `{}` instead of their real contents,
  which is a common real-world gotcha if you ever try to save a Map by just stringifying
  it directly.
- **`JSON.stringify(value, null, 2)`'s middle argument is a powerful "replacer" you can
  use later, not just a placeholder for "nothing."** This module always passes `null`
  there (meaning "no filtering"), but worth remembering the slot exists — real backend
  code sometimes passes a function there to strip sensitive fields (like a password hash)
  before ever sending an object out as JSON.
