# Project 1 — Student Management System

## What this project builds

A tiny in-memory "database" of students, with add / find / update-mark / remove /
list operations. No file, no real database — just a `Map` living in memory while the
script runs. This is the very first "real backend" project after finishing plain JS
syntax, so the point isn't the student data itself — it's practicing the **shape**
almost every backend project in this folder repeats afterwards:

- a **manager class** that owns the data and the rules (`StudentManager`)
- a separate **driver script** that uses the manager and decides what to print
  (`main.js`)
- **custom error classes** instead of generic `Error`, so calling code can tell
  *which* problem happened
- **private fields** (`#students`) so nobody outside the class can reach in and mess
  with the data directly

### File structure

```
01_student_management/
├── studentManager.js   ← the "backend": data + rules + custom errors
└── main.js             ← the "caller": uses StudentManager, handles errors, prints
```

This split (logic file vs. driver file) is the same split real backend code uses
between a *service/repository* and whatever calls it (a route handler, a controller,
a test). Nothing here talks to the network or a disk — it's the same idea, shrunk
down so the idea itself is visible.

---

## File: `studentManager.js` — piece by piece

### The two custom error classes

```js
class DuplicateEntry extends Error{
    constructor(message){
        super(message),
        this.name = "DuplicateEntry"
    }
}

class IdNotFound extends Error{
    constructor(message){
        super(message),
        this.name = "IdNotFound"
    }
}
```

`extends Error` means "this class IS an Error, plus whatever extra I add." Built-in
JS already has one error type, `Error`, and normally when something goes wrong you'd
`throw new Error("some message")`. The problem: if every failure in a program throws
a plain `Error`, the code that catches it can only read the *message string* to figure
out what kind of failure it was — which is fragile (what if the message wording
changes later?).

So instead, we make our own error **types**. `DuplicateEntry` and `IdNotFound` are
both still "an Error" (so `try/catch` catches them the same way, and `err.message`
still works), but they are also *distinguishable* types, checkable with
`instanceof` — see `main.js` below for why that matters.

Inside the constructor:
- `constructor(message)` — when you write `new DuplicateEntry("id already exists")`,
  that string arrives here as `message`.
- `super(message)` — calls the **parent class's** constructor, i.e. `Error`'s own
  constructor, passing the message along. This is what makes `err.message` work
  afterwards — `Error`'s constructor is the one that actually stores `.message`.
  You cannot use `this` in a subclass constructor before calling `super()` — JS
  enforces that the parent gets to set itself up first.
- `this.name = "DuplicateEntry"` — overwrites the default `.name` (which would just
  say `"Error"`) with something more specific. This only affects things like
  `console.log(err)` printing `DuplicateEntry: id already exists` instead of
  `Error: id already exists` — it's cosmetic, not what `instanceof` checks use.

One small style quirk worth noticing: `super(message), this.name = ...` uses a
**comma**, not two separate statements on two lines with semicolons. The comma here
is the **comma operator** — it runs the left expression, throws its result away, and
evaluates the right one. It works, but it's unusual; the much more common (and
clearer) way to write this is just two lines:

```js
super(message);
this.name = "DuplicateEntry";
```

Both do exactly the same thing. Worth knowing it exists since you'll see it in your
own early code, but prefer the two-statement form going forward.

### The `StudentManager` class

```js
class StudentManager{

    #students = new Map()
```

`#students` is a **private class field**. The `#` prefix is what makes it private —
it means *only code written inside this class* can read or write `this.#students`.
Code outside (like `main.js`) literally cannot type `students.#students` — that's a
syntax error from outside the class. This matters because it forces every change to
go through the class's own methods (`addStudent`, `update`, `remove`...), which is
where the validation rules live. If the field were public (`this.students`), outside
code could do `students.students.delete("SU-001")` directly and skip every check.

It's initialized right there, `= new Map()`, so every new `StudentManager` starts
with its own empty Map. A `Map` is a built-in key→value collection, similar in
spirit to a Python dict, but it keeps insertion order and its keys can be *any*
value, not just strings. Here the key is the student's `id` string, and the value is
the whole student object `{id, name, mark}`.

```js
    addStudent(student){
        if(this.#students.has(student.id))
            throw new DuplicateEntry("id already exists")
        else
            return this.#students.set(student.id,student)
    }
```

- `this.#students.has(student.id)` — `Map.has(key)` returns `true`/`false` for
  whether that key already exists. This is the **guard-early** pattern: check for
  the bad case first, and bail out immediately with `throw` if it's true.
- `throw new DuplicateEntry(...)` — this doesn't "return" an error like some
  languages do; it immediately stops the function and unwinds the call stack
  upward until something catches it with `try/catch`. If nothing catches it, the
  whole program crashes.
- the `else` branch: `this.#students.set(student.id, student)` stores the whole
  object under its `id`. `Map.set` returns the Map itself (so you *could* chain
  `.set().set()`), which is why `return` here doesn't give back anything
  meaningful — `main.js` never uses the return value of `addStudent`, it just
  checks whether it threw.

```js
    find(id){
        if(!this.#students.has(id)){
            throw new IdNotFound("id not found")
        }
        else{
            return this.#students.get(id)
        } 
    }
```

Same guard-early shape, flipped: if the id does **not** exist (`!this.#students.has(id)`),
throw. Otherwise, `Map.get(key)` returns the value stored at that key — here, the
actual student object (not a copy — see Gotchas below for why that matters).

```js
    update(id,mark){
        if(!this.#students.has(id)){
            throw new IdNotFound("id not found")
        }
        else{
            return this.#students.get(id).mark = mark
        }
    }
```

`this.#students.get(id)` fetches the stored object, then `.mark = mark` sets a new
value on its `mark` property directly. Because `get()` doesn't hand you a copy — it
hands you a reference to the *actual* object sitting inside the Map — mutating it
through that reference immediately changes what's stored. No need to `.set()` it
back in. The whole expression `obj.mark = mark` is itself an assignment
*expression*, and in JS an assignment expression evaluates to the value that was
just assigned — so `return (...).mark = mark` returns `mark` itself. That's a minor
side effect of how assignment works in JS, not something deliberately being
"returned" for a reason; `main.js` never uses this return value either.

```js
    remove(id){
        if(!this.#students.has(id)){
            throw new IdNotFound("id not found")
        }
        else{
            return this.#students.delete(id)
        }
    }
```

`Map.delete(key)` removes the entry and returns `true`/`false` for whether
something was actually removed. Same guard pattern as everywhere else in this file.

```js
    list(){
            return [...this.#students]
    }
    
}
```

`[...this.#students]` spreads the Map into a plain array. Spreading a `Map`
directly (not `.values()` or `.keys()`) gives you an array of `[key, value]` pairs —
e.g. `[["SU-001", {id:"SU-001", name:"JK", mark:90}], ["SU-002", {...}]]`. This is
why `main.js`'s `getStudent` destructures each entry as `[key, { id, name, mark }]` —
the outer array-destructure pulls apart `[key, value]`, and the inner
object-destructure pulls apart the student object itself in the same line.

Returning `[...this.#students]` instead of `this.#students` directly matters: it
hands back a **new, independent array** containing the *same student objects* (the
objects themselves are still shared references — mutating a student object you got
from `list()` would still affect the stored one — but you can't accidentally
replace or delete entries in the real internal Map through the returned array,
since arrays and Maps don't share delete/set mechanics). This "return a copy of the
container, not the container itself" habit shows up in every project in this
folder.

```js
module.exports={DuplicateEntry,StudentManager,IdNotFound};
```

Node's module system: this file is treated as its own private scope by default
(nothing inside it is visible elsewhere unless explicitly exported). `module.exports`
is an object that Node hands back to whoever does `require("./studentManager")`.
Here it's shorthand object syntax — `{DuplicateEntry,StudentManager,IdNotFound}`
means `{DuplicateEntry: DuplicateEntry, StudentManager: StudentManager, IdNotFound: IdNotFound}`.

---

## File: `main.js` — piece by piece

```js
const {DuplicateEntry,StudentManager,IdNotFound, MarkNotFound} = require("./studentManager")
```

`require("./studentManager")` runs that file and returns whatever it exported (the
object above). The `{...}` on the left is **destructuring** — pulling specific named
properties straight out of that returned object into their own variables, instead of
doing `const mod = require(...); const StudentManager = mod.StudentManager;` etc.
`MarkNotFound` is also listed here — see Gotchas, this one doesn't actually exist.

```js
const addStudents = (student)=>{
    try{
        students.addStudent(student)
        console.log(`Student added`)
    }
    catch(err){
        if(err instanceof DuplicateEntry){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}
const students = new StudentManager
```

`addStudents` is an arrow function that wraps a call to the manager in a
`try/catch`. This is the core error-handling pattern used across the whole folder:
1. **Try** to do the real work.
2. If it throws, **catch** the error.
3. Check **which kind** of error it is with `instanceof` — `err instanceof DuplicateEntry`
   is `true` only if `err` was built with `new DuplicateEntry(...)` (or a subclass
   of it). This is exactly why custom error *classes* were worth creating instead
   of plain `Error` — you can branch on error type, not on message text.
4. If it's an **expected**, "normal" failure (duplicate id), just print the message
   and move on — the program keeps running.
5. If it's **anything else** — a bug, a typo, something nobody anticipated —
   `throw err` re-throws it, letting the program crash loudly instead of silently
   swallowing a real bug. This re-throw-if-unknown branch is the most important line
   in the whole pattern: without it, *every* error (including genuine bugs) would
   get silently printed and ignored.

`const students = new StudentManager` — note: **no parentheses** after
`StudentManager`. In JS, `new ClassName` (no `()`) is legal when the constructor
takes no arguments — it's exactly equivalent to `new ClassName()`. It's valid, but
most style guides (and most other files in this project) always include the `()`
for clarity; you'll see `new StudentManager()` with parens elsewhere and this is the
one inconsistency in this file.

Also notice `students` is declared *after* `addStudents` uses it inside the arrow
function body. That's fine here because of **closures** and **hoisting**: the arrow
function doesn't actually look up `students` until it's *called*, by which point the
`const students = ...` line further down has already run (the whole file runs
top-to-bottom before any of these functions are invoked at the bottom). If
`addStudents` were called *before* line 20 executed, this would throw a
"Cannot access 'students' before initialization" error instead.

```js
const findById = (id)=>{
    try{
        const result = students.find(id)
        console.table(result)
    }
    catch(err){
        if(err instanceof IdNotFound){
            console.log(err.message)
        }
        else{
            throw err
        }
    }
}
```

Same try/catch/instanceof shape as `addStudents`, this time guarding against
`IdNotFound`. `console.table(result)` prints an object as a neat little table in the
terminal — nicer than `console.log` for a flat object like `{id, name, mark}`.

```js
const updateStudent = (id,mark)=>{ ... }   // same pattern, catches IdNotFound
const removeStudent = (id)=>{ ... }        // same pattern, catches IdNotFound
```

Both repeat the identical try/catch/instanceof shape, just calling a different
manager method.

```js
const getStudent = ()=>{
    const studentList = students.list()
    for (const [key, { id, name, mark }] of studentList) {
        console.log(`${key}: ${id}, ${name}, ${mark}`);
    }
}
```

`students.list()` returns the array of `[key, studentObject]` pairs described
above. The `for...of` loop walks that array one pair at a time, and the loop
variable itself is destructured in two layers at once:
- `[key, {...}]` pulls apart the pair into `key` (the Map key, e.g. `"SU-001"`) and
  the student object.
- `{ id, name, mark }` then immediately pulls those three fields out of that object.

So in one line, `key` is the map key, and `id`, `name`, `mark` come straight from the
object's own fields (here `id` happens to equal `key` since the student's own `id`
field was used as the Map key when it was added).

```js
addStudents({id: "SU-001",name: "JK", mark:90})
addStudents({id: "SU-001",name: "JK", mark:90})
addStudents({id: "SU-002",name: "SK", mark:30})
findById("SU-002")
findById("SU-003")
updateStudent("SU-002",69)
getStudent()
removeStudent("SU-002")
getStudent()
```

This is the actual "script" part — a straight-line sequence of calls that exercises
every code path: add, add the same id again (triggers `DuplicateEntry`), add a
different one, find an existing id, find a missing one (triggers `IdNotFound`),
update a mark, list everyone, remove one, list again to see it's gone. Reading this
block top to bottom with the expected console output in mind is a good way to trace
through exactly what each manager method does.

---

## Gotchas worth remembering

- **`MarkNotFound` is imported but never defined.** `main.js` destructures
  `MarkNotFound` out of `require("./studentManager")`, but `studentManager.js` never
  declares a `MarkNotFound` class and never exports one. Destructuring a property
  that doesn't exist on an object doesn't throw in JS — it just silently gives you
  `undefined`. So `MarkNotFound` in `main.js` is `undefined` the whole time. This
  doesn't crash *only* because the code never actually uses `MarkNotFound` anywhere
  (no `instanceof MarkNotFound` check exists). If it had been used in an
  `instanceof` check, that check would be comparing against `undefined`, which
  throws a `TypeError` ("Right-hand side of 'instanceof' is not callable"). Lesson:
  a missing import doesn't announce itself immediately — it only blows up the moment
  it's actually used.

- **`new StudentManager` with no parentheses still works.** Only true when the
  constructor takes zero arguments. The instant `StudentManager`'s constructor
  needed a parameter, this same line would need `new StudentManager(someArg)` —
  dropping the `()` entirely is only ever safe for no-arg constructors, and it's
  clearer to always write the `()`.

- **`get()` returns a live reference, not a copy.** `find(id)` hands back the exact
  object stored in the Map. If calling code did
  `const s = students.find("SU-002"); s.mark = 0;` *without* going through
  `update()`, the stored student's mark would silently change too — bypassing
  whatever validation `update()` might someday grow (e.g. "mark must be 0–100").
  `update()` itself actually relies on this same behavior on purpose
  (`this.#students.get(id).mark = mark` mutates the stored object directly) — so
  it's not a bug here, but it's exactly the kind of implicit object-reference
  sharing that causes real bugs once more code starts reading student objects
  without going through the manager's own methods.

- **The comma operator in the error constructors (`super(message), this.name = ...`)**
  works, but reads like a typo to anyone expecting two statements. Prefer writing it
  as two lines with semicolons — same result, much clearer intent.
