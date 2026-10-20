# Project 2 — Employee Management System

## What this project builds

Same shape as Project 1 (manager class + Map + custom errors + driver script), but
with real **querying** added on top of plain CRUD: filter employees by department,
sort them by salary, total up salary per department, and compute an average salary
for a department. This is the first project where the manager does more than
store/retrieve — it starts *computing things* from the stored data using array
methods like `.filter()`, `.sort()`, and `.reduce()`.

### File structure

```
02_employee_management/
├── employeeManager.js   ← data + rules + custom errors + queries
└── main.js              ← driver script, wraps every call in a shared run() helper
```

---

## File: `employeeManager.js` — piece by piece

### The two custom errors

```js
class DuplicateId extends Error{
    constructor(message){
        super(message),
        this.name = "DuplicateId"
    }
}
class IdNotFound extends Error{
    constructor(message){
        super(message),
        this.name = "IdNotFound"
    }
}
```

Identical pattern to Project 1's `DuplicateEntry` / `IdNotFound`: subclass `Error`,
call `super(message)` first (required before touching `this`), then set `.name` so
the error prints with a specific label instead of the generic "Error". (Same comma-
operator quirk as Project 1 — `super(message), this.name = ...` — still works, still
better written as two separate lines.)

### `EmployeeManager`

```js
class EmployeeManager{
    
    #employee = new Map()
```

Private field, same reasoning as Project 1's `#students`: only this class's own
methods can read or write it, forcing every mutation through validated methods.

```js
    add(emp){
        if(this.#employee.has(emp.id)){
            throw new DuplicateId("duplicate id")
        }
        else{
            this.#employee.set(emp.id,emp)
        }
    }
```

Guard-early: if the id already exists, throw before touching anything. Otherwise
store the whole employee object keyed by its `id`. Note `add` doesn't `return`
anything — unlike Project 1's `addStudent`, which (incidentally) returned the
Map from `.set()`. Neither return value is ever used by the driver, so this
difference has no real effect, but it shows these two projects were written a few
exercises apart with slightly different habits.

```js
    find(id){
        if(!this.#employee.has(id)){
            throw new IdNotFound("not found")
        }
        else{
            
            return this.#employee.get(id)
        }
    }
```

Same guard-early-in-reverse as Project 1: if the id is *missing*, throw; otherwise
return the live object from the Map.

```js
    updateSalary(id,newSalary){
        if(!this.#employee.has(id)){
            throw new IdNotFound("not found")
        }
        else{
            this.#employee.get(id).salary = newSalary
            return this.#employee.get(id)
        }
    }
```

Fetches the stored object (a reference, not a copy — see Project 1's notes on why
`.get()` hands back the real object), overwrites its `.salary` field in place, and
then calls `.get(id)` a *second* time just to return the now-updated object. This
works, but it's doing one extra Map lookup it didn't need to — it could have saved
the first `.get(id)` result in a local variable and reused it for both the mutation
and the return. Not a bug, just a small missed opportunity to avoid repeating work
(see Gotchas).

```js
    remove(id){
        if(!this.#employee.has(id)){
            throw new IdNotFound("not found")
        }
        else{
            return this.#employee.delete(id)
        }
    }

    list(){
        return[...this.#employee.values()]
    }
```

`remove` is the same guard-and-delete pattern as every project so far.

`list()` here is subtly different from Project 1's `list()`. Project 1 spread the
whole Map (`[...this.#students]`), giving `[key, value]` pairs. Here it spreads
**`.values()`** only (`[...this.#employee.values()]`), giving a plain array of just
the employee *objects* themselves, with no key alongside each one. That's why
`main.js`'s loop over `list()` destructures plain objects (`for(const emp of result)`)
instead of `[key, {...}]` pairs like Project 1 did — the shape of what `list()`
returns directly shapes how it has to be consumed afterwards.

### The query methods — new in this project

```js
    byDept(department){
        return (this.list().filter((employee => employee.dept == department)))
    }
```

`this.list()` reuses the method above to get a plain array of employee objects
(note: it calls its *own* `list()` method rather than reaching into `#employee`
again directly — reusing your own methods instead of repeating logic is a good
habit). `.filter(callback)` walks the array and keeps only the elements where the
callback returns `true` — here, only employees whose `.dept` matches the one asked
for. The extra parentheses around the whole arrow function
`((employee => employee.dept == department))` are harmless but unnecessary —
`employee => employee.dept == department` alone would do the exact same thing.
One thing to flag: `==` (loose equality) is used here instead of `===` (strict
equality). For comparing two strings like `"IT" == "IT"` this makes no practical
difference, but `===` is the safer default habit since `==` can quietly convert
types in cases where you don't expect it (e.g. `0 == "0"` is `true`).

```js
    sortBySalary(order) {
    return this.list().sort((a, b) =>
        order === "desc" ? b.salary - a.salary : a.salary - b.salary);
    }
```

`.sort(compareFn)` sorts an array **in place** and also returns it. The compare
function's return value decides order: if it returns negative, `a` comes first; if
positive, `b` comes first. `b.salary - a.salary` gives a negative number when `b` has
the smaller salary and `a` the bigger one — which puts the bigger salary first, i.e.
descending order. `a.salary - b.salary` is the mirror image — ascending order. The
ternary `order === "desc" ? ... : ...` just picks which of those two subtraction
directions to use based on the `order` argument passed in.

Important subtlety: because `this.list()` already returns a **fresh array** (built
fresh by `[...this.#employee.values()]` every time it's called), sorting it in place
doesn't touch the actual stored employees or their order inside the real `#employee`
Map — it only reorders this temporary array copy. If `list()` had instead returned
the live Map's values directly without the spread, sorting could have side effects
on the Map's own internal iteration order. This is exactly why `list()` returning a
copy (established in Project 1) matters again here, for a brand-new reason.

```js
    depTotal(){
        let depttotals = new Map()
        for(let [key,values] of this.#employee){
            depttotals.set(values.dept,(depttotals.get(values.dept)||0)+values.salary)
        }
        
        return depttotals
    }
```

Builds a brand-new `Map` — `depttotals` — where each key is a department name and
each value is the running total salary for that department.

`for(let [key,values] of this.#employee)` iterates the *raw* `#employee` Map
directly (not through `list()`), destructuring each `[id, employeeObject]` pair as
`[key, values]` (the names are a little confusing here — `key` is the employee id,
`values` is the whole employee object, singular despite the plural name).

The accumulation line is the one worth slowing down on:
```js
depttotals.set(values.dept, (depttotals.get(values.dept) || 0) + values.salary)
```
- `depttotals.get(values.dept)` — look up the running total for this department so
  far. The *first* time a department is seen, nothing has been stored yet, so this
  returns `undefined`.
- `(... || 0)` — the "default value" trick: `undefined || 0` evaluates to `0`
  because `undefined` is falsy, so `||` falls through to its right-hand side. On
  every later encounter of the same department, the stored number (even `0`, which
  is also falsy — a subtle edge case, see Gotchas) gets used instead... except `0`
  itself would also trigger the fallback, which is a latent bug if a department's
  running total could legitimately become exactly 0. Here that never happens since
  salaries are positive, but it's a pattern worth knowing has this corner case.
- `+ values.salary` — add this employee's salary onto whatever total was found.
- `.set(...)` — store the updated total back under the same department key.

By the end of the loop, `depttotals` has one entry per department with the sum of
every salary in it. Note `depTotal()` returns the Map **directly**, not a copy via
spread — unlike every `list()` method so far. Since `depttotals` was built fresh
inside this method and nothing else holds a reference to it, returning it directly
is safe here (there's no shared internal state to protect), but it's a different
habit from the rest of the file.

```js
    averageSalary(dept){
        let avgSalary = [...(this.#employee.values())].filter(emp => emp.dept === dept)
        const length = avgSalary.length
        if (length === 0)
            return 0

        const average = avgSalary.reduce((sum,crr) => sum + crr.salary,0)
        return average/length
        
        
    }
}
module.exports = {EmployeeManager,IdNotFound,DuplicateId}
```

`[...(this.#employee.values())].filter(...)` builds an array of employee objects
directly from the private Map (instead of calling `this.list()` like `byDept` did —
same end result, just reached a slightly different way) and filters it down to only
the employees in the requested department. This time the comparison uses `===`
(strict equality) rather than the `==` used in `byDept` — another small
inconsistency between two very similar methods in the same file.

- `length === 0` guards against dividing by zero — if no employee is in that
  department, return `0` immediately instead of computing `0/0`, which in JS would
  produce `NaN` ("Not a Number") rather than throwing an error. This guard is what
  prevents a `NaN` from silently leaking out.
- `.reduce((sum, crr) => sum + crr.salary, 0)` walks the filtered array, carrying
  an accumulator (`sum`, starting at `0`, the second argument to `reduce`) and
  adding each employee's `.salary` onto it (`crr` = "current" employee being
  visited). By the end, `average` holds the total salary for that department.
- `average / length` divides that total by the count of employees — the actual
  mean.

`module.exports` exports the class and both error types, same pattern as Project 1.

---

## File: `main.js` — piece by piece

```js
const {IdNotFound,DuplicateId,EmployeeManager} =require("./employeeManager")

const employees = new EmployeeManager

const run=(action)=>{

    try{
        action();
    }
    catch(err){
        if(err instanceof DuplicateId || err instanceof IdNotFound){
            console.log(err.message)
        }
        else{
            throw err
        }
    }

}
```

This is a slightly more compact version of Project 1's repeated `try/catch` wrapper
functions. Instead of writing a separate named wrapper (`addStudents`, `findById`,
`updateStudent`, ...) for every single operation, this project writes **one generic**
`run(action)` function that takes *any* zero-argument function (`action`), calls it
inside a `try`, and catches both `DuplicateId` and `IdNotFound` with a single
`instanceof` check (`||` combines the two conditions — "is it either of these
types"). Anything else still gets re-thrown. This is a nice simplification over
Project 1's style: one reusable error boundary instead of five near-identical ones.

```js
run(()=>{employees.add({id: "E-01",name: "Kishore",dept:"IT",salary:50000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-02",name: "JK",dept:"HR",salary:40000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-03",name: "Ravi",dept:"IT",salary:70000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-04",name: "SK",dept:"HR",salary:45000});console.log(`Employee added`)})
run(()=>{employees.add({id: "E-01",name: "SK",dept:"HR",salary:30000});console.log(`Employee added`)})
```

Each call wraps an inline arrow function — `()=>{ ... }` — as the `action` passed
into `run`. Inside, it calls `employees.add(...)` and then logs a success message
*in the same arrow function*. Because the `console.log` sits after `.add(...)` on
the same line, it only runs if `.add(...)` didn't throw — if it throws, control
jumps straight to `run`'s `catch` block and the success message never prints. The
5th call re-adds `"E-01"`, which triggers `DuplicateId`, caught and printed as a
message instead of crashing the whole script.

```js
run(()=>{console.table(employees.find("E-01"))})
run(()=>{console.table(employees.find("E-99"))})
```

`find("E-99")` doesn't exist, so this throws `IdNotFound`, caught by `run` and
printed as a plain message — `console.table` is never reached for that call since
the error happens while evaluating the *argument* to `console.table`, before
`console.table` itself is invoked.

```js
run(()=>{employees.updateSalary("E-01",10);console.log(`Employee salary updated`)})
run(()=>{employees.remove("E-04");console.log("Employee removed")})

run(()=>{console.table(employees.byDept("IT"))})
run(()=>{console.table(employees.sortBySalary("desc"))})
run(()=>{
    for(const [keys,values] of employees.depTotal()){
        console.log(`${keys}: ${values}`)
    }
})
run(()=>{console.log(`Average salary is: ${employees.averageSalary("IT")}`)})
run(()=>{
    const result = employees.list()
    for(const emp of result){
        console.table(emp)
    }
    console.log("Total employees:",result.length);
})
```

The rest of the script exercises every query method: department filter, descending
salary sort, department totals (note the `for(const [keys,values] of employees.depTotal())`
loop — this works *because* `depTotal()` returns an actual `Map`, which is directly
iterable as `[key, value]` pairs with `for...of`, no conversion needed), average
salary for IT, and a final full listing with a running count.

---

## Gotchas worth remembering

- **`updateSalary` calls `.get(id)` twice** when it could call it once, store the
  result in a variable, mutate that variable's `.salary`, and return the same
  variable. Not a bug — Maps are fast — but it's the kind of small redundancy worth
  noticing and cleaning up once you're comfortable with the basics: do the lookup
  once, reuse the reference.

- **`byDept` uses `==`, `averageSalary` uses `===`**, in the same file, for
  conceptually the same kind of comparison (comparing a string to another string).
  They happen to behave identically for plain strings, but mixing the two styles in
  one codebase is a habit worth tightening up — default to `===` everywhere unless
  you have a specific reason to allow type coercion.

- **The `(... || 0)` default-value trick in `depTotal` has a blind spot**: if a
  running total were ever legitimately `0`, `||` would treat that `0` as "nothing
  stored yet" and silently reset to `0` again rather than keeping the real `0`. It
  never bites here because salaries are always positive, but the safer version of
  this pattern (seen more explicitly in later projects) is
  `depttotals.has(key) ? depttotals.get(key) : 0`, which only falls back to `0` when
  the key is truly absent, never when the stored value happens to be falsy.

- **`list()` changed shape between Project 1 and Project 2** — Project 1 spread the
  whole Map (`[key, value]` pairs), this one spreads only `.values()` (plain
  objects). Neither is "more correct" — they're just different design choices that
  ripple into how every caller has to destructure the results. Worth remembering
  that a method's return *shape* is a contract the rest of the code depends on, and
  changing it later means updating every caller too.

- **`depTotal()` returns the live Map it just built, not a spread copy**, unlike
  every `list()`-style method elsewhere in the project. It's safe here (nothing else
  references that Map), but it breaks the "always return a copy" habit the rest of
  the file otherwise follows — worth being deliberate about when you do and don't
  need to make a defensive copy, rather than it happening by accident.
