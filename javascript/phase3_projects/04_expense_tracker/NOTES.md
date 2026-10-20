# Project 4 — Expense Tracker

## What this project builds

A personal finance tracker: record income and expense "transactions," compute
total income, total expense, and balance, and — the new idea in this project —
group transactions **by month** into a report showing income/expense/net per
month. This is the first project to deal seriously with **dates as grouping keys**
rather than just as data sitting on an object.

### File structure

```
04_expense_tracker/
├── expenseTracker.js   ← data + rules + 3 custom errors
└── main.js              ← driver script
```

---

## File: `expenseTracker.js` — piece by piece

### Three custom error classes

```js
class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}

class InvalideAmount extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidAmount"
    }
}

class IdNotFound extends Error{
    constructor(message){
        super(message)
        this.name ="IdNotFound"
    }
}
```

Same by-now-familiar pattern: subclass `Error`, call `super(message)`, set `.name`.
Look closely at the middle one, though — the **class is named** `InvalideAmount`
(with an extra "e" — a typo for "Invalid"), but inside its constructor, `this.name`
is set to the *correctly spelled* `"InvalidAmount"`. So the class identifier you
`import`/`require` and check with `instanceof` is misspelled, while the string that
actually prints when the error is logged is spelled correctly. These are two
completely independent things in JS — a class's *name as a JS identifier* and the
string you choose to assign to `.name` inside its constructor have no required
relationship — but having them differ like this is a classic, easy-to-make
copy-paste/typo trap. See Gotchas for why this is worth flagging explicitly.

### `ExpenseTracker`

```js
class ExpenseTracker{

    #transaction = new Map()

    addIncome(id,amount,date){
        if(!this.#transaction.has(id)){
            if(amount <=0){
                throw new InvalideAmount("Amount must be positive")
            }
            this.#transaction.set(id,{id,amount,date, type: "income"})
        }
        else throw new DuplicateId(`id already exists`)
    }

    addExpense(id,amount,date){
        if(!this.#transaction.has(id)){
            if(amount <=0){
                throw new InvalideAmount("Amount must be positive")
            }
            this.#transaction.set(id,{id,amount,date, type: "expense"})
        }
        else throw new DuplicateId(`id already exists`)
    }
```

Both `addIncome` and `addExpense` store their entry in the **same** `#transaction`
Map — income and expenses aren't kept in two separate Maps, they're told apart
later by a `type: "income"` / `type: "expense"` field stamped onto the object when
it's created. `{id, amount, date, type: "income"}` is **object shorthand** mixed
with a regular key: `id`, `amount`, `date` are shorthand for
`id: id, amount: amount, date: date` (using the parameter names directly as both
key and value), while `type: "income"` is written the long way since there's no
variable named `type` to shorten.

Notice the guard order here is the *opposite* of Project 3's `restock`/`sell`: the
outer `if` checks `!this.#transaction.has(id)` (i.e., "this id does NOT exist yet"),
and *inside* that branch, it checks the amount. The duplicate-id check is in the
`else` at the very bottom. This means: if you call `addIncome("I-01", -500, ...)`
where `"I-01"` *already* exists, you'd get `DuplicateId`, not the amount error —
same "which guard fires first" consideration as Project 3, just arranged with the
nested branch structure flipped (existence check wraps around the amount check,
rather than sitting as a separate early guard clause).

```js
    remove(id){
        if(this.#transaction.has(id)){
            this.#transaction.delete(id)
        }
        else{
            throw new IdNotFound("id not found")
        }
    }

    list(){
        return[...this.#transaction.values()]
    }

    balance(){
        return this.totalIncome()-this.totalExpense()
        
    }
```

`remove` and `list()` are the same shapes seen in every project so far. `balance()`
is interesting mainly for what it *doesn't* do: it doesn't touch `#transaction`
directly at all — it calls the two methods below and subtracts their results. This
is a clean example of building a derived value entirely out of other already-correct
methods, rather than duplicating the summing logic a third time.

```js
    totalIncome(){
        return [...this.#transaction.values()]
        .filter(inc => inc.type ==="income")
        .reduce((sum,crr)=> sum+crr.amount,0)
    }

    totalExpense(){
        return [...this.list().values()]
        .filter(inc => inc.type ==="expense")
        .reduce((sum,crr)=> sum+crr.amount,0)
    }
```

Both methods **chain** three operations: spread into an array (or reuse `list()`),
`.filter()` down to just the matching `type`, then `.reduce()` to sum up `.amount`
across whatever survived the filter. This chaining style — one array method feeding
directly into the next — is a very common and readable pattern once you're
comfortable with arrays, as an alternative to writing a manual `for` loop with an
`if` inside it.

Worth comparing the two methods closely: `totalIncome` spreads `#transaction.values()`
directly (`[...this.#transaction.values()]`), while `totalExpense` does
`[...this.list().values()]` — calling `this.list()` (which *already* returns a
plain array, via its own spread) and then calling `.values()` *on that array* and
spreading *that*. Arrays do have a `.values()` method (it returns an array
iterator), so this doesn't error — but it's doing an extra, unnecessary round trip:
`list()` already gives you a ready-to-use array, so `totalExpense` could simply have
written `this.list().filter(...)...` with no spreading or `.values()` at all. This
is a good "simpler way exists" catch: `totalIncome`'s direct-from-Map approach and
`totalExpense`'s go-through-`list()`-then-redundantly-spread-it approach both land
on the same correct result, but the first is more direct, and neither needs the
`[...x.values()]` wrapping that `totalExpense` adds around something that was
already a plain array.

```js
monthlySummary() {
    const monthlyReport = new Map();

    for (const reps of this.list()) {
        const key = reps.date.slice(0, 7)

        if (!monthlyReport.has(key)) {
            monthlyReport.set(key, {
                income: 0,
                expense: 0
            });
        }

        const report = monthlyReport.get(key);

        if (reps.type === "income") {
            report.income += reps.amount;
        } else {
            report.expense += reps.amount;
        }

        report.net = report.income - report.expense
    }

    return[...( monthlyReport)];
}

}

module.exports = {InvalideAmount,DuplicateId,ExpenseTracker,IdNotFound}
```

This is the project's centerpiece method, and the new idea it teaches is
**grouping records by a derived key** — here, grouping transactions by their month.

- `reps.date.slice(0, 7)` — dates in this project are stored as plain strings like
  `"2026-07-10"` (`YYYY-MM-DD`). `.slice(0, 7)` takes characters from index 0 up to
  (not including) index 7, which for a string in that exact format gives
  `"2026-07"` — year and month, dropped the day. This is a string-slicing trick
  that only works *because* the dates are consistently formatted this way; it would
  silently give nonsense for a date string shaped any differently (e.g. `"7/10/2026"`).
- `monthlyReport.has(key)` / `.set(key, {income:0, expense:0})` — the first time a
  given month is seen, create a fresh `{income: 0, expense: 0}` bucket for it.
  Every later transaction from the same month reuses that same bucket instead of
  creating a new one.
- `const report = monthlyReport.get(key)` — fetch the (possibly just-created)
  bucket object for this transaction's month. Just like `.get()` on the main
  `#transaction` Map in other projects, this returns a *live reference* to the
  object stored inside `monthlyReport` — so mutating `report` below mutates the
  real stored bucket, no `.set()` needed afterward.
- `if (reps.type === "income") { report.income += reps.amount } else { report.expense += reps.amount }`
  — adds this transaction's amount onto the correct side of the bucket, depending
  on its type.
- `report.net = report.income - report.expense` — recomputed on **every single
  transaction visited**, not just once at the end. This is harmless (each
  recomputation overwrites the previous one with an equally correct number, since
  `income` and `expense` are always fully up to date at that point in the loop) but
  it's doing more work than necessary — the net could instead be computed once per
  month, after all transactions are tallied, in a separate pass (or even lazily,
  only when a caller actually asks for `.net`).
- `return [...(monthlyReport)]` — spreads the whole Map into `[key, value]` pairs,
  same mechanic as Project 1's `list()`. The extra parentheses around
  `monthlyReport` are unnecessary (`[...monthlyReport]` alone does the same thing)
  but harmless.

---

## File: `main.js` — piece by piece

```js
const{DuplicateId,ExpenseTracker,InvalideAmount,IdNotFound}=require("./expenseTracker")

const myExpenses = new ExpenseTracker()
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId||err instanceof InvalideAmount||err instanceof IdNotFound){
            console.log(err.message);
        }
        else{
            throw err
        }
    }
}
```

Same generic `run(action)` error-boundary helper as Projects 2 and 3, this time
catching three error types with two `||`s. Note the destructuring import uses the
**misspelled** class name `InvalideAmount` here too — it has to, since that's the
actual name the class was exported under; the typo is "load-bearing" at this point
(fixing the spelling in `expenseTracker.js` without updating this line would break
the import).

```js
//-------add income--------
run(()=>{myExpenses.addIncome("I-01",5000,"2026-07-01");console.log(`Income added`)})
run(()=>{myExpenses.addIncome("I-02",3000,"2026-08-05");console.log(`Income added`)})
run(()=>{myExpenses.addIncome("I-02",3000,"2026-08-05");console.log(`Income added`)})
//-------add expenses-------
run(()=>{myExpenses.addExpense("E-01",1200,"2026-07-10");console.log(`Expense added`)})
run(()=>{myExpenses.addExpense("E-02",800,"2026-08-20");console.log(`Expense added`)})
run(()=>{myExpenses.addExpense("E-03",-800,"2026-08-20");console.log(`Expense added`)})
```

Two incomes added in July and August 2026, a duplicate `"I-02"` triggering
`DuplicateId`, two valid expenses, and one invalid expense (`-800`, a negative
amount) triggering `InvalideAmount`'s `"Amount must be positive"` message.

```js
run(()=>{console.log(`Income:`,myExpenses.totalIncome())})
run(()=>{console.log(`Expense:`,myExpenses.totalExpense())})
run(()=>{console.log(`Balance:`,myExpenses.balance())})

run(()=>{const result = myExpenses.list()
    console.table(result)
    console.log(result.length)
})

run(()=>{for(let [keys,{income,expense,net}] of (myExpenses.monthlySummary())){
    console.log(`Report of ${keys} is income: ${income}, expense: ${expense}, net: ${net}`)
}})

run(()=>{myExpenses.remove("E-01");console.log("removed")})
run(()=>{const result = myExpenses.list()
    console.table(result)
    console.log(result.length)
})
```

Prints totals and balance, lists all transactions, then loops the monthly summary —
`for(let [keys,{income,expense,net}] of (...))` destructures each `[monthKey, bucketObject]`
pair in one line, pulling `income`/`expense`/`net` straight out of the bucket at the
same time, the same two-layer destructuring trick seen in Project 1's `getStudent`.
Finally, it removes `"E-01"` and lists everything again to show it's gone.

---

## Gotchas worth remembering

- **`InvalideAmount` the class name vs. `"InvalidAmount"` the `.name` string.**
  These are two unrelated things in JS, and letting them drift apart (one
  misspelled, one not) is the exact kind of inconsistency that makes a codebase
  confusing to search through later — searching for `"InvalidAmount"` across the
  project would miss the class definition entirely, since the identifier itself is
  spelled differently. Worth a mental note to keep a class's name and the string
  assigned to its `.name` in sync, ideally matching exactly.

- **`totalExpense`'s `[...this.list().values()]` is a redundant double-wrap.**
  `this.list()` already returns a plain array. Calling `.values()` on an array and
  then spreading *that* produces the same array all over again, just via an extra,
  unnecessary detour — plain `this.list().filter(...)` would do the identical job
  more directly. `totalIncome`, right above it in the same file, does it the more
  direct way. This is a good example of two methods doing the same kind of
  computation with slightly different levels of unnecessary complexity.

- **`report.net` is recomputed on every loop iteration inside `monthlySummary`**
  instead of once after all amounts for a month are known. Not wrong — just
  repeated work. A cleaner version would finish accumulating `income`/`expense` for
  every transaction first, then do a single final pass (or compute `net` on demand)
  rather than overwriting it inside the hot loop every time.

- **Guard order in `addIncome`/`addExpense` nests the amount check inside the
  "doesn't exist yet" branch**, so a duplicate id combined with a bad amount always
  reports as a duplicate, never as an invalid amount — the opposite framing from
  Project 3's separate, sequential guard clauses. Both are valid designs; the
  lesson is that *how* guards are nested versus laid out sequentially changes which
  error a caller sees when multiple things are wrong at once.

- **`.slice(0, 7)` for extracting "year-month" only works because every date in
  this project is a string shaped exactly `"YYYY-MM-DD"`.** It's a very common
  real-world trick for ISO-formatted date strings, but it's silently wrong the
  moment a date arrives in any other shape — there's no validation anywhere in this
  file confirming the date strings are well-formed before slicing them.
