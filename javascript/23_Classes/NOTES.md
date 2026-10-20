# Module 23 — Classes — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line of every task file,
> explained in the simplest possible words, with Python comparisons since that's the
> strongest existing background, so that months from now you can open this file cold and
> rebuild full understanding without needing to ask anyone anything again.

---

## What I learned this module

A **class** is a blueprint for creating objects that all share the same shape (same
property names) and the same behavior (same methods). This is conceptually identical to
Python classes, with some JS-specific vocabulary and rules on top:

| Python | JavaScript |
|---|---|
| `def __init__(self, ...)` | `constructor(...)` |
| `self` | `this` |
| `class C(Parent):` | `class C extends Parent {` |
| `super().__init__(...)` | `super(...)` |
| `@property` | `get propName() {...}` |
| `@staticmethod` | `static methodName() {...}` |
| `self.__x` (name-mangled, soft-private) | `this.#x` (actually enforced private) |
| instantiate with `C(...)` | **must** use `new C(...)` — omitting `new` is an error |

This module's three files build up from a plain class, to inheritance (`extends`/
`super`), to the more advanced features: `static`, `#private` fields, and `get`.

---

## File: `class_task1.js` — a basic class with a constructor and methods

```js
class PurchaseRequest{
    constructor(id,amount){
        this.id = id,
        this.amount = amount
    }

    gst(){
        return this.amount + this.amount * 0.18;
    }
    summary(){
        return(`${this.id}:${this.amount}`)
    }
}
```
- `class PurchaseRequest{ ... }` — declares a new class/type named `PurchaseRequest`.
- `constructor(id,amount){ ... }` — a special method that runs automatically every time
  `new PurchaseRequest(...)` is called. Its parameters (`id`, `amount`) are whatever
  arguments get passed to `new`.
- `this.id = id,` — note the **comma** at the end of this line instead of a semicolon.
  This is legal JS (a comma can chain expressions), and here it happens to work fine
  because of how `this.id = id` and `this.amount = amount` are two separate assignment
  expressions joined by a comma — but it's an easy typo to make (meant to type `;`), and
  it's worth noticing rather than copying as a style choice. `this` inside a constructor
  refers to the brand-new object being built (same role as Python's `self`, but never
  written explicitly as a parameter — JS provides `this` automatically).
- `this.amount = amount` — stores the second argument onto the new object too.
- `gst(){ return this.amount + this.amount * 0.18; }` — a regular **method**. Notice
  there's no `function` keyword and no comma separating it from the next method — that's
  just class method syntax. Reads `this.amount` off whichever instance called `.gst()`,
  adds 18% tax, returns the total.
- `summary(){ return(\`${this.id}:${this.amount}\`) }` — another method, returns a
  formatted string combining `id` and `amount` with a template literal. (The parentheses
  around the template literal are optional/harmless here — `return (expr)` and
  `return expr` are equivalent.)

```js
const pr1 = new PurchaseRequest("PR-001",5000)
console.log(pr1.gst())
console.log(pr1.summary())
```
- `new PurchaseRequest("PR-001",5000)` — **`new` is mandatory** in JS (unlike Python,
  where `PurchaseRequest(...)` alone constructs). This runs the constructor with
  `id="PR-001"`, `amount=5000`, producing a real object `{id: "PR-001", amount: 5000}`
  (with `gst`/`summary` available on it via the class, not copied onto each instance).
- `pr1.gst()` → `5000 + 5000*0.18` = `5900`.
- `pr1.summary()` → `"PR-001:5000"`.

---

## File: `class_task2.js` — inheritance with `extends` and `super`

```js
class Document{
    constructor(id){
        this.id = id
    }
    describe(){
        return `Document: ${this.id}`
    }
}
```
A simple base/parent class: stores an `id`, and a `describe()` method that returns a
generic description string.

```js
class PurchaseOrder extends Document{
    constructor(id,vendor){
        super(id),
        this.vendor = vendor
    }
    describe(){
        return`PO ${this.id} for ${this.vendor}`
    }
}
```
- `class PurchaseOrder extends Document{ ... }` — `extends` means `PurchaseOrder` IS-A
  `Document`: it inherits everything `Document` has, and can add more or override
  behavior. Equivalent to Python's `class PurchaseOrder(Document):`.
- `constructor(id,vendor){ super(id), this.vendor = vendor }` — again note the comma
  instead of a semicolon (same minor habit as task 1, harmless here but worth flagging).
  **`super(id)`** calls the *parent's* constructor (`Document`'s), passing `id` along —
  this is what actually sets `this.id = id` (that logic lives in `Document`, not
  repeated here). **The rule: `super(...)` must be called before using `this` anywhere
  in a subclass constructor** — JS won't even let `this` exist yet until the parent's
  constructor has run, because the parent is responsible for setting up the base shape
  first. After `super(id)` runs, `this.vendor = vendor` adds the extra field that's
  specific to `PurchaseOrder` and that `Document` doesn't have.
- `describe(){ return\`PO ${this.id} for ${this.vendor}\`; }` — this method name is the
  **same** as the parent's (`describe`), which means it **overrides** the parent's
  version: whenever `.describe()` is called on a `PurchaseOrder` instance, THIS version
  runs, not `Document`'s. (If this method wanted to also reuse the parent's wording, it
  could call `super.describe()` inside it — not done here, but worth knowing that's how
  you'd call "the parent's version of the method I'm overriding.")

```js
const pr = new PurchaseOrder("D-01","Cisco")
console.log(pr.describe())
```
- `new PurchaseOrder("D-01","Cisco")` — runs `PurchaseOrder`'s constructor, which calls
  `super("D-01")` (setting `this.id = "D-01"` via `Document`'s constructor), then sets
  `this.vendor = "Cisco"`.
- `pr.describe()` — because `PurchaseOrder` overrides `describe`, this runs the
  `PurchaseOrder` version, not `Document`'s — prints `PO D-01 for Cisco`.

---

## File: `class_task3.js` — `#private` fields, `static`, and a `get` accessor

```js
class Budget{
    #balance
    static counter =0;
    constructor(balance){
        this.#balance = balance
        Budget.counter++
    }

    spend(amt) {
        if (this.#balance - amt < 0) throw new Error("insufficient");
            this.#balance -= amt;
        return this.#balance;
    }
    get left(){
        return this.#balance
    }
}
```
- `#balance` — declares a **private field** right in the class body (this declaration
  line is required — you can't just start using `this.#something` without first listing
  `#something` up here). The `#` makes this genuinely, enforced-by-the-language private:
  code outside this class literally cannot write `someInstance.#balance` — that's a
  `SyntaxError`, not just "rude but technically possible" the way `_balance` (an
  underscore-prefixed name, just a politeness convention) would be. This is the
  class-based equivalent of the closure-private-state trick from Module 13/Module 22's
  `cbudget` — real privacy, enforced by the engine.
- `static counter = 0;` — a **static** field. `static` means this value belongs to the
  **class itself**, not to any individual instance. There is only ever ONE `counter`,
  shared across every `Budget` ever created — not a separate counter per instance. (Like
  Python's class-level attributes, or `@staticmethod`/class variables combined.)
- `constructor(balance){ this.#balance = balance; Budget.counter++ }` — stores the
  starting balance into the private field, then increments the **shared** static
  counter. Note it's written `Budget.counter++`, referring to the class name directly
  (not `this.counter`) — that's the correct way to reach a static field from inside an
  instance method/constructor.
- `spend(amt) { if (this.#balance - amt < 0) throw new Error("insufficient");
  this.#balance -= amt; return this.#balance; }` — guard-clause style (Module 21/30):
  check first, throw immediately if the spend would go negative, otherwise update the
  private balance and return the new value. Notice this guard is **correct and strict**
  (unlike `budget.mjs`'s looser check from Module 22) — it genuinely blocks any spend
  that would take the balance below zero.
- `get left(){ return this.#balance }` — a **getter**. This defines `left` as something
  you read like a plain property (`b.left`, no parentheses!) even though it's actually
  running a method behind the scenes. This is the officially sanctioned way to let
  outside code **read** a private field's current value without letting it reach the
  `#balance` field directly or mutate it arbitrarily — read-only, controlled access.

```js
const b = new Budget(10000);
console.log(b.spend(3000));
console.log(b.spend(5000));
console.log(b.left);
const b2 = new Budget(5000);
console.log(Budget.counter);
```
- `new Budget(10000)` → `#balance = 10000`, `Budget.counter` becomes `1`.
- `b.spend(3000)` → `10000 - 3000 = 7000`, not negative, so no throw; `#balance` updated
  to `7000`, returned and printed.
- `b.spend(5000)` → `7000 - 5000 = 2000`, still not negative; `#balance` updated to
  `2000`, printed.
- `b.left` — reads the getter, **no parentheses** (`b.left`, not `b.left()` — writing
  `()` here would be a mistake since `left` is accessed like a property, not called like
  a method) — prints `2000`.
- `new Budget(5000)` → a completely separate instance, its own private `#balance` of
  `5000` — but `Budget.counter++` runs again on the **same shared** static field, now
  becoming `2`.
- `Budget.counter` — read directly off the class (not off `b` or `b2`) — prints `2`,
  proving both instances incremented the one shared counter.

---

## Gotchas worth remembering from this module

- **`new` is mandatory in JS; forgetting it is a real runtime error**, unlike Python
  where you'd never think to add anything before `ClassName(...)`. Every single
  instantiation in this module correctly uses `new` (`new PurchaseRequest(...)`,
  `new PurchaseOrder(...)`, `new Budget(...)`) — a muscle-memory habit worth locking in
  early since Python background makes it easy to forget.
- **`super(...)` must run before touching `this` in a subclass constructor.**
  `class_task2.js`'s `PurchaseOrder` constructor calls `super(id)` as its very first
  statement, before `this.vendor = vendor` — this isn't stylistic, it's enforced by JS;
  trying to use `this` before `super(...)` runs throws a `ReferenceError`.
- **Overriding a method just means reusing the exact same name in the child class** —
  `class_task2.js`'s `PurchaseOrder.describe()` silently replaces `Document.describe()`
  for `PurchaseOrder` instances. If you ever need the parent's original behavior *too*,
  call `super.describe()` from inside the override — not used in this file, but the
  mechanism to remember.
- **`#private` fields are real privacy; `_underscore` names are only a polite
  convention.** `class_task3.js`'s `#balance` cannot be read or written from outside the
  class at all (a true language-level lock); Module 22's closure-based privacy
  (`cbudget`'s captured `balance` variable) achieves something similar without classes,
  via closures instead. Either technique beats a plain public field like
  `class_task1.js`'s `this.amount`, which anyone can freely overwrite from outside.
- **`static` fields/counters belong to the class, shared across every instance** —
  `Budget.counter` in `class_task3.js` is incremented by every single `new Budget(...)`
  call and is read back off `Budget` itself (`Budget.counter`), never off an instance
  (`b.counter` would be `undefined` — static members don't appear on instances).
- **A `get` accessor is read like a property, with no `()`** — `b.left` in
  `class_task3.js`, not `b.left()`. This is the clean way to expose a *read-only* view of
  private state: outside code can see the current balance but has no way to set it
  directly (there's no matching `set left(...)` defined here, so attempting
  `b.left = 999` would silently do nothing in non-strict mode, or could be made to throw
  by adding a setter later if truly immutable behavior was wanted).
- **Stray commas instead of semicolons** (`class_task1.js`'s `this.id = id,` and
  `class_task2.js`'s `super(id),`) happen to work because JS allows comma-joined
  expression statements, but they're almost certainly typos for `;` — worth scanning your
  own code for this pattern since it can silently "work" while meaning something subtly
  different from what was intended.
