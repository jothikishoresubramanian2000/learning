# Module 28 — NPM — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file and
> config file, explained in the simplest possible words, so that months from now you can
> open this file cold and rebuild full understanding without needing to ask anyone
> anything again.

---

## What I learned this module

**npm (Node Package Manager)** is two things combined: a giant public registry of
reusable, already-written JS code ("packages"), and a command-line tool for pulling those
packages into your own project and keeping track of exactly which versions you're using.

Three files work together as a project's "package system":
- **`package.json`** — the project's recipe card: its name, version, which packages it
  needs, and shortcut commands (`scripts`).
- **`node_modules/`** — the folder where the actual downloaded package code physically
  lives, after running `npm install`. Large, never committed to git, fully rebuildable
  from `package.json` at any time.
- **`package-lock.json`** — an exact, locked-down record of every version actually
  installed (including every package's own internal dependencies) — guarantees that
  running `npm install` on a different machine installs the *identical* versions, not
  just "something compatible."

---

## File: `package.json` — the project's configuration

```json
{
    "app": "purveo",
    "version": "0.1.0",

    "dependencies": {
        "dayjs": "1.11.21"

    },
    "devDependencies": {
        "prettier": "3.9.6"
    },

    "scripts": {
        "task1": "node npm_task1.js",
        "check": "prettier --check *.js"
    }
}
```
- `"app": "purveo"` — a project identifier field (the standard field name is actually
  `"name"` in a real `package.json`, but npm doesn't strictly enforce exact field names
  for a file you're not actually publishing to the registry — this still works fine as a
  learning exercise and local project marker).
- `"version": "0.1.0"` — the project's own version number, following semantic versioning
  (semver): `MAJOR.MINOR.PATCH`. `0.1.0` conventionally signals "early, pre-1.0,
  still-changing" software.
- `"dependencies": { "dayjs": "1.11.21" }` — packages needed to actually **run** the
  project (not just while developing it). `"dayjs": "1.11.21"` here is an **exact,
  pinned** version — no `^` or `~` prefix — meaning npm will install precisely version
  `1.11.21`, never anything newer, even a patch release. (`js_learning_notes.md` notes
  that npm normally *fills in* a `^` for you by default when you run `npm install
  somepkg` — this file's exact pin was written by hand rather than left at npm's default,
  a deliberate choice worth noticing, not a mistake, though it does mean this project
  won't automatically pick up dayjs bugfixes without manually bumping the version.)
- `"devDependencies": { "prettier": "3.9.6" }` — packages needed only **while
  developing** (formatting, testing, build tooling) — never required at runtime in
  production. Prettier is an auto-formatter, not something the running app itself calls.
- `"scripts": { "task1": "node npm_task1.js", "check": "prettier --check *.js" }` — named
  shortcuts for common commands:
  - `"task1": "node npm_task1.js"` — running `npm run task1` in the terminal is exactly
    equivalent to typing `node npm_task1.js` yourself; scripts exist so you (and anyone
    else on the project) don't need to memorize/retype the full real command.
  - `"check": "prettier --check *.js"` — running `npm run check` runs Prettier in
    "check" mode (reports which files aren't correctly formatted, without changing them)
    against every `.js` file in this folder.

---

## File: `npm_task1.js` — actually importing and using an installed package

```js
const dayjs = require("dayjs");

const today = dayjs().format("DD/MM/YYYY");

let dueDate = dayjs().add(30, "day").format("DD/MM/YYYY");
console.log(today);console.log(dueDate);
```
- `const dayjs = require("dayjs");` — this is the key lesson of the whole module:
  **importing an installed package uses its bare name, with no path at all** —
  `require("dayjs")`, never `require("./node_modules/dayjs")` or anything with a `./`
  in front. A bare name (no `./` or `/` prefix) tells Node "don't look for a local file
  next to me — search `node_modules` instead" (and if not found there, walk up through
  parent folders' `node_modules`, Node's actual lookup algorithm). This is exactly the
  opposite convention from Module 22's local-file imports (`require("./commonjs_math")`),
  and it's worth keeping that contrast clear: `./` means "my own file," a bare name means
  "an installed package (or a Node built-in like `fs`/`path`)."
- `dayjs()` — calling the imported `dayjs` function with no arguments creates an object
  representing **the current date/time, right now**. This isn't something you'd know to
  do without reading dayjs's own documentation — which is exactly the real point of this
  exercise, per `js_learning_notes.md`: "looking up docs is the real skill, not
  memorizing."
- `.format("DD/MM/YYYY")` — a method dayjs objects provide, converting the internal
  date/time value into a formatted **string**, following the exact pattern given: two
  digits for the day, two for the month, four for the year, separated by slashes (e.g.
  `20/10/2026`).
- `let dueDate = dayjs().add(30, "day").format("DD/MM/YYYY");` — this is **method
  chaining**: `dayjs()` creates today's date object, `.add(30, "day")` returns a **new**
  date object 30 days further in the future (today's date is not mutated — dayjs objects
  are immutable, a detail you'd only know from reading its docs or testing it), and
  `.format(...)` turns that future date into the same formatted string shape.
- `console.log(today);console.log(dueDate);` — two separate statements written on one
  line, separated by a semicolon — perfectly legal, just visually compact; prints today's
  formatted date, then the due date 30 days out.

---

## File: `npm_task2.js` — empty

This file exists in the folder but is completely empty (0 bytes) — presumably a
placeholder started for a second npm exercise that was never filled in. Nothing to
explain here; flagged just so it's clear this isn't a mistake in these notes, it's
genuinely blank in the real file.

---

## `node_modules/` and `package-lock.json`

Looking at what's actually on disk in this folder: `node_modules/` contains two
subfolders, `dayjs/` and `prettier/` — exactly matching the two packages declared in
`package.json` (one real dependency, one dev dependency) — proof that `npm install` was
run and both packages' actual code got downloaded and placed here.

`package-lock.json` records the exact installed versions (and the exact versions of any
packages *those* packages themselves depend on, several layers deep if needed) so that
running `npm install` again later — on this machine or a teammate's — reproduces this
*exact* same `node_modules` folder, not just "some version that technically satisfies
`package.json`."

---

## Gotchas worth remembering from this module

- **Import installed packages by bare name — never type out a path into `node_modules`.**
  `npm_task1.js`'s `require("dayjs")` is the correct pattern; manually writing
  `require("./node_modules/dayjs")` would be fragile (breaks if the folder structure
  ever changes) and is never how real code imports packages.
- **`node_modules/` is rebuildable and must never be committed to git** — it's large,
  fully derived from `package.json` + `package-lock.json`, and committing it bloats the
  repo for no benefit. `.gitignore` should always exclude it.
- **`package-lock.json` should be committed, and never hand-edited** — it's the thing
  that guarantees identical installs across machines/teammates; editing it by hand
  defeats that guarantee and risks corrupting it.
- **Semver prefixes change what `npm install` is allowed to upgrade to, and this
  project's `dayjs` version has none at all (an exact pin).** Recall from
  `js_learning_notes.md`: `^4.18.0` allows minor+patch updates, `~4.18.0` allows only
  patch updates, and a bare `4.18.0` (like this file's `"dayjs": "1.11.21"`) allows
  **no** automatic updates whatsoever — every future bump has to be a deliberate, manual
  edit to `package.json`.
- **`dependencies` vs `devDependencies` genuinely changes what ships to production** — a
  production install (`npm install --omit=dev` / `npm ci --omit=dev`, common in deploy
  pipelines) skips `devDependencies` entirely, so anything the *running app* actually
  needs (like `dayjs` here) must be a real `dependency`, never accidentally left in
  `devDependencies` — this project correctly keeps `prettier` (a dev-only tool) separate
  from `dayjs` (a runtime necessity).
- **`npm run <name>` is required for custom script names; only a couple of names
  (`start`, `test`) get to skip the word `run`.** This project's two scripts, `task1` and
  `check`, both need the full `npm run task1` / `npm run check` — typing just `npm task1`
  would not work.
- **Reading a package's own README/docs is the real skill — dayjs's `.format(...)`
  pattern string and `.add(n, unit)` signature aren't guessable from JS fundamentals
  alone**, and every third-party package will have its own equally un-guessable API
  surface; the lesson of `npm_task1.js` is really "go find and read the docs," not
  "memorize dayjs specifically."
