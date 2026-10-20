# Project 3 — Inventory System

## What this project builds

A product inventory: add products, restock them, sell them (decreasing stock),
compute a price-with-GST (a tax), find low-stock items, and total up the whole
inventory's value. The new idea in this project, compared to Projects 1 and 2, is
**business rules that protect a number from going somewhere impossible** — you can't
sell a negative quantity, and you can't sell more stock than exists ("no
overselling"). This is also the project the concise notes file flags as the one
where a **read-with-side-effect bug** around mutating stored numbers directly was
first discussed — see the Gotchas section for exactly where that risk lives in this
code, even though the current version avoids it.

### File structure

```
03_inventory_system/
├── inventoryManager.js   ← data + rules + 3 custom errors
└── main.js               ← driver script
```

---

## File: `inventoryManager.js` — piece by piece

### Three custom error classes

```js
class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}

class InvalidQuantity extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidQuantity"
    }
}

class IdNotFound extends Error{
    constructor(message){
        super(message)
        this.name = "IdNotFound"
    }
}
```

Same subclass-of-`Error` pattern as Projects 1 and 2 (`super(message)` first, then
set `.name`), but note these use **separate statements with semicolons implied by
newlines**, not the comma-operator trick from the earlier two files — a small sign
this file was written slightly more carefully, or just later, than the first two.
Three error types this time instead of two, because this project has a genuinely new
kind of failure: a *quantity* can be wrong (zero, negative, or more than what's in
stock) even when the product id itself is perfectly valid.

### `InventoryManager`

```js
class InventoryManager{
    #inventory = new Map()

    addProduct(prod){

        if(this.#inventory.has(prod.id)){
            throw new DuplicateId("id already exists")
        }

        this.#inventory.set(prod.id,prod)
    }
```

Same private-Map pattern as the previous two projects. Note the style here skips the
`else` keyword — since `throw` always stops execution, there's no need for an
`else` around the line that follows; the code "falls through" to
`this.#inventory.set(...)` naturally only when the `if` above didn't throw. This is
functionally identical to writing `if (...) { throw ... } else { ...set... }` — just
one less level of nesting, which is a cleaner habit than the `if/else` style
Projects 1–2 used everywhere.

```js
    find(id){
        if(this.#inventory.has(id)){
            return this.#inventory.get(id)
        }
        else throw new IdNotFound("id not found")
    }

    remove(id){
        if(this.#inventory.has(id)){
            return this.#inventory.delete(id)
        }
        else throw new IdNotFound("id not found")
    }

    list(){
        return [...this.#inventory.values()]
    }
```

`find` and `remove` both check for *existence* first this time (rather than
"does-not-exist" like Projects 1–2's guard clauses), throwing in the `else` branch
instead. Logically equivalent either way — just flipped which branch holds the
happy path. `list()` spreads `.values()` into a fresh array, same as Project 2.

```js
    restock(id,qty){
        if(this.#inventory.has(id)){
            if(qty <=0){
                throw new InvalidQuantity("invalid quatity")
            }
            this.#inventory.get(id).stock += qty
        }
        else{
            throw new IdNotFound("id not found")
        }
    }
```

Two layers of guarding, nested: first check the product exists at all (outer `if`),
*then*, only once we know it exists, check the quantity is sensible (inner `if`).
This ordering matters — if it checked `qty <= 0` before confirming the product
exists, a call like `restock("P-99", -5)` (bad id *and* bad quantity) would report
"invalid quantity" even though the more fundamental problem is that the product
doesn't exist at all. Checking existence first gives a more accurate error.

`this.#inventory.get(id).stock += qty` is the key new mechanic in this project:
`.get(id)` returns the actual stored product object (a reference, not a copy — as
established in Project 1), and `.stock += qty` mutates that object's `stock`
property **directly, in place**. Because the Map is storing object *references*,
not snapshots of values, this one line really does update the one-and-only stored
copy of that product — there's no need to `.set()` it back into the Map afterward.
This is the exact mechanic the Gotchas section below expands on.

```js
    sell(id,qty){
        if(this.#inventory.has(id)){
            if(qty <=0){
                throw new InvalidQuantity("invalid quatity")
            }
            if(qty > this.#inventory.get(id).stock){
                throw new InvalidQuantity("no overselling")
            }
            this.#inventory.get(id).stock -= qty
        }
        else{
            throw new IdNotFound("id not found")
        }
    }
```

Same structure as `restock`, but with an *extra* guard layer: after confirming the
quantity itself is positive, it also checks `qty > ...stock` — you cannot sell more
than what's currently in stock. This "no overselling" rule is the actual **business
rule** the project is meant to teach: a constraint that isn't about data correctness
in the abstract (like "ids must be unique") but about a real-world rule specific to
this domain (inventory can't go negative). Both guard checks reuse
`this.#inventory.get(id)` as a fresh lookup each time rather than storing it once in
a local variable — three separate `.get(id)` calls total inside this one method
(the two guard checks plus the final mutation line) when one lookup saved to a
variable would have done the same job with less repetition.

```js
    priceWithGst(id){
        if(this.#inventory.has(id)){
            return this.#inventory.get(id).price +this.#inventory.get(id).price*0.18
        }
        else{
            throw new IdNotFound("id not found")
        }
    }
```

GST (Goods and Services Tax) here is modeled as a flat 18% added on top of the
product's price: `price + price * 0.18` — the same as `price * 1.18`, just spelled
out the long way. This is a **read-only computed value** — unlike `restock`/`sell`,
nothing here is stored or mutated; it's purely "take the stored price, compute
something derived from it, hand back the result." `.get(id)` is called twice here
too (once for each `price` reference) — again, one lookup into a local variable
would have avoided repeating the Map access.

```js
    lowStock(threshold){
        return this.list().filter(prd => prd.stock < threshold)
    }

    totalInventoryValue(){
        const totalValue = this.list().reduce((sum,crr)=> sum + crr.price *crr.stock,0)
        return totalValue
    }
}

module.exports ={DuplicateId,IdNotFound,InventoryManager,InvalidQuantity}
```

`lowStock(threshold)` reuses `this.list()` (not raw `#inventory` access — a better
habit than some of the double-`.get()` calls above) and filters down to products
whose `stock` is strictly less than the given threshold — e.g. `lowStock(20)` finds
everything with fewer than 20 units left.

`totalInventoryValue()` uses `.reduce()` to walk every product and accumulate
`price * stock` for each one — i.e., "if I sold every unit of every product at its
current price, what would the total be worth." `sum` is the running accumulator
(starts at `0`, the second argument to `reduce`), `crr` is the "current" product
being visited on each step.

---

## File: `main.js` — piece by piece

```js
const {DuplicateId,IdNotFound,InventoryManager,InvalidQuantity} =require("./inventoryManager")

const inventory = new InventoryManager

function run(action){

    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId || err instanceof IdNotFound|| err instanceof InvalidQuantity){
            console.log(err.message)
        }
        else throw err
    }
}
```

Same generic `run(action)` wrapper style as Project 2, extended to catch a third
error type (`InvalidQuantity`) with one more `||`. Note this is written as a
`function run(...)` declaration rather than an arrow-function `const run = ...`
(Project 2's version) — functionally identical, just a different way of writing a
function in JS. Function declarations are **hoisted** (usable even before the line
they're defined on, within the same scope), while `const run = () => {}` is not —
though here it doesn't matter since `run` is always called after this point in the
file anyway.

```js
//-------add-----------
run(()=>{inventory.addProduct({id:"P-01",name:"Pen",price:10,stock:100});console.log(`Product added`)})
run(()=>{inventory.addProduct({id:"P-02",name:"Laptop",price:50000,stock:5});console.log(`Product added`)})
run(()=>{inventory.addProduct({id:"P-03",name:"Mouse",price:500,stock:3});console.log(`Product added`)})
run(()=>{inventory.addProduct({id:"P-01",name:"Pen",price:10,stock:100});console.log(`Product added`)})

//--------restock-------
run(()=>{inventory.restock("P-03",10);console.log(`Restocked`)})

//--------sell----------
run(()=>{inventory.sell("P-01",30);console.log(`Product selled`)})
run(()=>{inventory.sell("P-02",10);console.log(`Product selled`)})
run(()=>{inventory.sell("P-03",0);console.log(`Product selled`)})

//---------pricegst-----------

run(()=>{console.log(`Gst amount: ${inventory.priceWithGst("P-02")}`)})
run(()=>{console.table(inventory.lowStock(20))})
run(()=>{console.table(inventory.list());console.log(inventory.list().length)})
run(()=>{console.log(inventory.totalInventoryValue())})

run(()=>{inventory.find("P-99")})
```

Walking through the interesting cases: adding `"P-01"` twice triggers `DuplicateId`
on the second attempt. Restocking `"P-03"` by 10 bumps its stock from 3 to 13.
Selling 30 pens (stock was 100) succeeds, leaving 70. Selling 10 laptops when only 5
exist (`sell("P-02", 10)`) triggers the `"no overselling"` `InvalidQuantity` — this
is the key "business rule" check actually getting exercised. Selling 0 mice
(`sell("P-03", 0)`) triggers the *other* `InvalidQuantity` branch (`qty <= 0`), a
different bad-input case than overselling but the same error class — both print the
same way from `main.js`'s perspective since it only checks `err instanceof InvalidQuantity`,
not the specific message. The comment labels (`//-------add-----------`) group
related calls visually, a simple but useful habit for a long flat script like this.

---

## Gotchas worth remembering

- **`.get(id).stock += qty` only works correctly because the Map stores object
  references, not copies.** This is the single most important thing to understand
  about this project, and it's the exact mechanic behind the "read-with-side-effect
  bug" mentioned in the concise notes for this project. If a method ever did
  something like:
  ```js
  const product = { ...this.#inventory.get(id) };   // spread = a NEW, disconnected copy
  product.stock += qty;                              // only changes the copy
  ```
  the stored product in `#inventory` would never actually update — the real total
  would quietly drift away from reality, with no error thrown anywhere, because
  nothing in this code checks "did the real stored value actually change." The
  current code never does this (it always mutates `.get(id)` directly without
  spreading it first), so it's correct as written — but it's worth deliberately
  noticing *why* it's correct: because `.get()` hands back the live object, and
  mutating a live object's property changes the one-and-only copy that exists.
  The opposite trap — spreading an object when you actually *wanted* to keep
  mutating the original — is just as real a bug as forgetting to spread when you
  *did* want an independent copy. Both directions require knowing which one you
  actually have in hand.

- **`sell` and `priceWithGst` both call `.get(id)` multiple times** inside a single
  method when the result doesn't change between calls. Harmless for a Map this
  small, but the better habit — once comfortable with basics — is to look something
  up once, store it in a local variable, and reuse that variable for every
  subsequent read or mutation in the same method.

- **Guard-check ordering changes the error message you get.** `restock`/`sell`
  check "does this product exist" *before* "is this quantity valid" — so a call
  with both a bad id and a bad quantity reports the missing-product error, not the
  bad-quantity one. This is a deliberate, sensible choice (existence is the more
  fundamental precondition), but it's worth noticing that guard-clause *order* is a
  design decision with real consequences for what error message a caller actually
  sees.

- **`"no overselling"` and `"invalid quatity"` (note: misspelled "quantity" in the
  source, both occurrences) are both `InvalidQuantity` errors.** The driver's
  `instanceof InvalidQuantity` check can't tell these two very different situations
  apart — only reading `err.message` could. If the project ever needed to react
  differently to "you asked for 0" versus "you asked for more than exists," it
  would need either two separate error classes or a structured error (e.g. an error
  with a `.code` property), not just two different message strings under the same
  class.
