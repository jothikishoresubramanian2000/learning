# Project 5 — Library Management System

## What this project builds

A small library: add books, issue a book to a member with a due date, return a book
and compute a late fine based on how many days overdue it was, and list
available/issued/all books. The new ideas here are **linked entity state**
(a book isn't just data — it has a *status*, "available" vs. "issued," tracked via
two fields that are either both `null` or both filled in together) and **real date
arithmetic** (subtracting two dates to find out how many days passed).

### File structure

```
05_library_management/
├── library.js   ← data + rules + 2 custom errors
└── main.js      ← driver script
```

---

## File: `library.js` — piece by piece

### Two custom error classes

```js
class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}


class BookStateErrors extends Error{
    constructor(message){
        super(message)
        this.name="BookStateErrors"
    }
}
```

Same `extends Error` / `super(message)` / set `.name` pattern as every previous
project. Notice this project only has **two** error classes, where you might expect
three (one for "book not found," separate from "book already issued"). Instead, both
"book doesn't exist" and "book exists but is in the wrong state to do this action"
(already issued, or not issued when trying to return it) are lumped under the single
`BookStateErrors` class — see the `notfound` helper below and the Gotchas section for
what that choice costs.

### `LibraryManager`

```js
class LibraryManager{

    #booksInventory = new Map()

    notfound(id){
        throw new BookStateErrors("book not found")
    }
```

`notfound(id)` is a small **helper method** whose entire job is to throw a
consistent error. It takes an `id` parameter but never actually uses it anywhere in
its body — the parameter is accepted but ignored, presumably left over from an
earlier version that might have included the id in the message (it's harmless, just
unused). Centralizing "throw the not-found error" into one method means every place
that needs to report a missing book calls `this.notfound(id)` instead of repeating
`throw new BookStateErrors("book not found")` by hand each time — a small bit of
duplication-avoidance.

```js
    addBook(id,title){
        if(this.#booksInventory.has(id)){
            throw new DuplicateId("duplicate id")
        }
        else{
            this.#booksInventory.set(id,{id,title,issuedTo:null,dueDate:null})
        }
    }
```

Every new book is stored with **four** fields, not just `id` and `title`:
`issuedTo` and `dueDate` both start as `null`. This is the "linked entity state"
idea — rather than tracking "is this book issued?" as a separate boolean flag, the
code uses `issuedTo === null` to *mean* "available," and a non-null `issuedTo` to
mean "issued to that member." The two fields (`issuedTo` and `dueDate`) are meant to
always be set or cleared **together** — there's no explicit code anywhere enforcing
that invariant beyond careful hand-written discipline in `issue()` and `return()`
below always touching both at once.

```js
    issue(id,member,dueDate){

        if(this.#booksInventory.has(id)){
            if(this.#booksInventory.get(id).issuedTo !=null){
                throw new BookStateErrors("book already issued")
            }
            this.#booksInventory.get(id).issuedTo = member
            this.#booksInventory.get(id).dueDate = dueDate
        }
        else this.notfound(id)
    }
```

Two layers of checks, same nesting style as Project 3's `restock`/`sell`: first
confirm the book exists at all, *then* (nested inside) confirm it's not already
issued (`issuedTo != null` — using loose inequality, which works fine here since
`issuedTo` is only ever exactly `null` or a string, never `undefined`). If both
checks pass, it sets `issuedTo` and `dueDate` directly on the live object returned
by `.get(id)` — the same "mutate the object you got back from the Map, no need to
`.set()` it again" pattern used throughout every project so far.

One subtlety worth noticing: the `else this.notfound(id)` branch has **no `return`**
in front of it — just `this.notfound(id)` on its own. This works correctly only
because `notfound()` **always throws** — it never returns normally. If `notfound()`
ever changed to sometimes return instead of always throwing, this code would
silently fall through to whatever comes after `issue()` returns (which here is
nothing, since it's the last line in the method) — but as written, since
`notfound()` unconditionally throws, execution never continues past that call
regardless of whether `return` is written in front of it.

```js
    return(id,returnDate){
        const book = this.#booksInventory.get(id)
        if(this.#booksInventory.has(id)){
            if(this.#booksInventory.get(id).issuedTo ===null){
                throw new BookStateErrors("book not issued")
            }
            
            const diffMs= new Date(returnDate)- new Date(this.#booksInventory.get(id).dueDate) 
            const overDueDays = diffMs/(1000*60*60*24)
            
            book.issuedTo = null;
            book.dueDate = null;
            return overDueDays > 0 ? overDueDays * 10 : 0;

        }
        else this.notfound(id)
    }
```

Naming a method `return` is fine in JS — `return` is only a reserved keyword when
used as a statement (`return someValue;`), not when used as a **property/method
name** (`obj.return(...)` or, inside a class, `return(id, returnDate) {...}`). It
reads a little oddly next to the actual `return` *statements* inside the method
body, but it's legal and does work.

- `const book = this.#booksInventory.get(id)` — fetched once, up front, into a
  local variable, *before* even checking `.has(id)`. This is subtly risky: if `id`
  doesn't exist, `.get(id)` returns `undefined`, and `book` is just `undefined` for
  the rest of the method — harmless *as long as* `book` is never touched before the
  `.has(id)` check below confirms it's real, which the code does correctly avoid
  doing. Still, fetching before checking existence is a slightly fragile ordering
  compared to checking first, fetching second (the style every earlier project used).
- `this.#booksInventory.get(id).issuedTo === null` — checks the *other* direction
  from `issue()`'s check: here, `null` means "not currently issued," so trying to
  return a book that was never issued throws `"book not issued"`.
- **The date math**, the new mechanic in this project:
  `new Date(returnDate) - new Date(dueDate)` — subtracting two `Date` objects in JS
  doesn't error; it implicitly converts both to numbers first (milliseconds since
  January 1, 1970) and subtracts those numbers, giving a plain number:
  `diffMs`, the difference in **milliseconds**.
  `diffMs / (1000*60*60*24)` converts milliseconds into days: 1000 ms per second,
  60 seconds per minute, 60 minutes per hour, 24 hours per day — multiplying all
  four together gives "milliseconds per day," and dividing the total diff by that
  gives how many days passed (a decimal number if the times aren't exactly aligned
  at midnight, though here the inputs are date-only strings so it generally comes
  out as a whole number).
- `book.issuedTo = null; book.dueDate = null;` — this runs on the `book` variable
  captured earlier at the top of the method (the live Map object), returning the
  book to "available" state. Crucially, this happens **after** `diffMs` is computed
  — if the reset happened first, `dueDate` would already be `null` by the time the
  date-math line ran, and `new Date(null)` would give the Unix epoch
  (`1970-01-01`), producing a wildly wrong (and enormous) overdue calculation. The
  order here — compute first, then clear — is correct and deliberate.
- `return overDueDays > 0 ? overDueDays * 10 : 0;` — the fine is 10 (currency
  units) per day overdue, or `0` if returned on time or early (`overDueDays` would
  be zero or negative in that case).

```js
    find(id){
        if(this.#booksInventory.has(id)){
            return this.#booksInventory.get(id)
        }
        else this.notfound(id)
    }

    available(){
        return ( [...this.#booksInventory.values()].filter(bk => bk.issuedTo === null))
    }
    issued(){
        return ( [...this.#booksInventory.values()].filter(bk => bk.issuedTo != null))
    }
    list(){
        return ([...this.#booksInventory.values()])
    }
}

module.exports ={DuplicateId,BookStateErrors,LibraryManager}
```

`find` is the standard guard-and-fetch pattern, using the shared `notfound` helper
instead of inlining its own `throw`. `available()` and `issued()` are a matched
pair, filtering on exactly opposite conditions (`=== null` vs `!= null`) over the
*same* underlying `issuedTo` field — a clean example of deriving two different
"views" of the same data from one consistent piece of state, rather than keeping two
separate lists that could drift out of sync with each other. `list()` is the usual
spread-into-an-array pattern seen everywhere else.

---

## File: `main.js` — piece by piece

```js
const{LibraryManager,DuplicateId,BookStateErrors} = require("./library")

const librarian = new LibraryManager()
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId||err instanceof BookStateErrors){
            console.log(err.message)
        }
        else throw err
    }
}
//--------add-------------
run(()=>{librarian.addBook("B-01","Clean code");console.log(`Book added`)})
run(()=>{librarian.addBook("B-02","You don't know JS");console.log(`Book added`)})
run(()=>{librarian.addBook("B-03","Refactoring");console.log(`Book added`)})
run(()=>{librarian.addBook("B-01","Clean code");console.log(`Book added`)})
```

Same generic `run(action)` error-boundary style as Projects 2–4. Three books added,
then a duplicate `"B-01"` triggers `DuplicateId`.

```js
//---------issue-------------
run(()=>{librarian.issue("B-01","kishore","2026-07-10");console.log(`Book issued`)})
run(()=>{librarian.issue("B-01","Jk","2026-07-10");console.log(`Book issued`)})
run(()=>{librarian.issue("B-99","Jk","2026-07-10");console.log(`Book issued`)})
```

`"B-01"` is issued to `"kishore"` with due date `"2026-07-10"`. Trying to issue the
same book again (`"B-01"` to `"Jk"`) triggers `"book already issued"`. Trying to
issue a nonexistent book (`"B-99"`) triggers `"book not found"` via `notfound()`.

```js
//-------------return----------------//

run(()=>{const result = librarian.return("B-01","2026-07-15");if(result===0){console.log(`Book returned`)};console.log(`Book returned, fine amount: ${result}`)})
run(()=>{const result = librarian.return("B-02","2026-07-15");if(result===0){console.log(`Book returned`)};console.log(`Book returned, fine amount: ${result}`)})
```

`"B-01"` was due `"2026-07-10"`, returned `"2026-07-15"` — 5 days late, so the fine
is `5 * 10 = 50`. Here's the important detail: `if(result===0){console.log(...)}`
has **no `return` statement inside its block**, so after that `if` finishes (whether
or not it ran its body), execution continues straight on to the *next* line,
`console.log(\`Book returned, fine amount: ${result}\`)`, which **always** runs
regardless of whether the fine was `0`. Since `result` here is `50` (not `0`), the
first `if` doesn't even fire, and only the second line prints — so no visible
problem for `"B-01"`. But this is a real, latent bug in the driver script: the
intention clearly was "print one message if it's free, a different message if
there's a fine" (an if/else choice), but because there's no `return;` or `else`
after the first `console.log`, both messages would print back-to-back whenever
`result` actually was `0`. The second `run(...)` call here (`"B-02"`, also returned
5 days late) has the exact same structure and the exact same latent issue, just
also not triggered because its fine isn't `0` either.

```js
//--------on time--------//
run(()=>{librarian.issue("B-02","Ravi","2026-07-20");console.log(`Book issued`)})
run(()=>{const result = librarian.return("B-02","2026-07-18");if(result===0){console.log(`Book returned`);return};console.log(`Book returned, fine amount: ${result}`)})
```

This later block re-issues `"B-02"` to `"Ravi"` with a due date of `"2026-07-20"`,
then returns it early on `"2026-07-18"` — 2 days *before* the due date, so
`overDueDays` is negative, and the ternary in `return()` gives `0` (no fine). This
time, notice the `if` block **does** include `return;` right after its
`console.log` — `if(result===0){console.log(\`Book returned\`);return}` — which
correctly stops the arrow function before it reaches the second `console.log` line.
This is the fix for the bug described just above, applied here but not earlier in
the file — a clear sign the driver script was written incrementally and the earlier
calls were never gone back and corrected to match.

```js
//--------------------------------//
run(()=>{console.log(`Available books`);console.table(librarian.available())})
run(()=>{console.log(`Issued books`);console.table(librarian.issued())})
run(()=>{console.log(`All books`);const result = librarian.list();console.table(result);console.log(`length:`,result.length)})
```

Final block: print available books (should be `"B-01"`, `"B-02"`, `"B-03"` — all
returned by this point — wait: `"B-03"` was never issued at all, and `"B-01"` and
`"B-02"` were both returned, so at this point in the script *all three* books are
available, and `issued()` should come back empty), then issued books, then
everything with a count.

---

## Gotchas worth remembering

- **The missing `return`/`else` after the first `"B-01"`/`"B-02"` return-driver
  calls is a real double-print bug**, just one that happens not to fire in this
  particular run because neither of those two returns actually has a `0` fine. The
  very next block in the same file (`"on time"`) shows the *fixed* version of the
  identical pattern side by side — comparing the two is a good lesson in exactly
  how a missing `return` inside an `if` silently falls through to whatever code
  comes next, rather than stopping there, unless you explicitly stop it.

- **`BookStateErrors` covers three different real situations** — "book not found,"
  "book already issued," and "book not issued" (when trying to return something
  available) — all under one error class. The driver can catch "something about
  book state went wrong," but can't distinguish *which* of the three happened
  without reading `err.message` as a string. Project 3 split a conceptually similar
  situation ("bad quantity" vs. "overselling") the same consolidated way, and
  Project 8 later goes the *other* direction, giving `NotFound` its own dedicated
  class separate from validation/conflict errors — worth noticing both approaches
  exist in this body of work and comparing their trade-offs.

- **`library.js`'s `return(id, returnDate)` fetches `book` via `.get(id)` *before*
  confirming the id exists with `.has(id)`.** It happens to be safe here because
  `book` (possibly `undefined`) is never touched until after the `.has(id)` check
  passes — but it's a more fragile ordering than "check first, fetch second," and
  an easy thing to get wrong if the method were edited later without noticing the
  existing order was load-bearing.

- **Computing `diffMs` *before* clearing `dueDate` to `null` is essential, not
  incidental.** If the two lines `book.issuedTo = null; book.dueDate = null;` were
  moved above the date-math line, `new Date(null)` would silently evaluate to the
  Unix epoch (January 1, 1970) instead of throwing an error, producing a wildly
  wrong, enormous fine with no warning. Order-of-operations bugs like this — where
  resetting state too early corrupts a calculation that still needed the old state
  — are easy to introduce accidentally during a refactor and easy to miss in review
  since nothing "looks" broken syntactically.
