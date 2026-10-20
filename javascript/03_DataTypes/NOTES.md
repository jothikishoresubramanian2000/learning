# Module 3 — Data Types — NOTES

### What I learned today

JS splits every value into one of two big families, and the difference between them is
*the single most important concept in the whole language* for avoiding bugs later.

**Primitives** — a single, standalone value: `Number`, `String`, `Boolean`, `Null`,
`Undefined`, `Symbol`, `BigInt`. When I copy a primitive, I get a totally independent copy.

**Reference types** — a value that's really a *container* holding many things:
`Object`, `Array`, `Function`. When I copy a reference type the "naive" way (`b = a`), I
don't get a new container — I get a **second label pointing at the exact same container**.
Change it through one label and the other label sees the change too, because there's only
ever one container.

Coming from Python, this maps almost exactly onto Python's own primitive-vs-object
distinction (`int`/`str`/`bool` vs `list`/`dict`), so the concept itself wasn't new — but
JS makes it bite a lot sooner because object literals (`{ }`) are used constantly, even for
things that feel like they should be simple values.

JS also only has **one number type** — there's no separate int vs float like in Python or
C. `500` and `500.5` are both just `Number`.

### File: `data_types.js` — line by line

```js
let amount = 500;
```
A `Number` primitive, declared with `let` (not reassigned later in this file, so arguably
could have been `const`, but `let` isn't wrong either).

```js
let supplier = null;
```
`null` is a special primitive value meaning **"deliberately empty — a human explicitly set
this to nothing."** It's a real value I choose to assign, not something JS does on its own.

```js
let isActive = true;
```
A `Boolean` primitive — one of exactly two values, `true` or `false`.

```js
let department = 'IT'
```
A `String` primitive, using single quotes this time (single vs double quotes behave
identically in JS — pick one style and stay consistent).

```js
const employee ={
    name : 'kishore',
    salary : 10000,
    department : 'IT',
    isActive : true
}
```
An **object literal** — curly braces containing `key: value` pairs separated by commas.
This is the reference type in action: `employee` is a single container holding four
key-value pairs. `const` here locks the *binding* (the name `employee` will always point
to this one container) — it does **not** freeze the contents inside (see Gotchas).

```js
console.log(employee.name)
console.log(employee.salary)
```
**Dot notation** — `employee.name` reaches into the container and pulls out the value
stored under the key `"name"`. Prints `kishore`, then `10000`.

```js
console.log(typeof amount);      // number
```
`typeof` is an operator (not a function, though it's written with parentheses-free syntax
most of the time) that returns a string naming the type of whatever follows it. `amount`
holds `500`, so `typeof amount` is the string `"number"`.

```js
console.log(typeof department);  // string
```
`department` holds `'IT'` → `"string"`.

```js
console.log(typeof isActive);    // boolean
```
`isActive` holds `true` → `"boolean"`.

```js
console.log(typeof supplier);    // object  ← the quirk
```
`supplier` holds `null`, and this prints `"object"` — **not** `"null"`. This is a famous,
decades-old bug baked into the very first version of JavaScript in 1995 and never fixed
(fixing it would break too much existing code on the web), so every JS developer just has
to memorize it: `typeof null` is always `"object"`, even though `null` is conceptually a
primitive, not an object.

### File: `object_task2.js` — line by line

```js
const product = {
    name: "kishore",
    price: 10000,
    inStock: true
}
```
Another object literal, three keys: a string, a number, a boolean — showing that an
object's values can be mixed types freely, unlike (say) a typed array in C.

```js
product.price = 20000
```
This **changes a value inside** the object. This is allowed even though `product` is
`const` — I'm not replacing the container (`product = {...}` would be blocked), I'm just
reaching inside the existing container and overwriting one of its stored values. `const`
only locks the *name-to-container* binding, never the container's internal contents.

```js
product.category = "IT"
```
This **adds a brand new key** that didn't exist in the original literal. Objects in JS are
dynamic — you can add (or `delete`) keys at any time after creation, there's no fixed
schema enforced by the language itself.

```js
console.log(product)
```
Prints the whole object now: `{ name: 'kishore', price: 20000, inStock: true, category:
'IT' }` — showing both the price change and the new key.

```js
console.log(typeof product)
```
Prints `"object"` — this one is *not* a quirk, a plain object really is type `"object"`.

### File: `object_task3.js` — line by line (the reference-sharing trap)

```js
user1 = {name: "Vicky", role: "admin" }
```
**This line has no `const`/`let`/`var` in front of `user1`.** That means it is not really
declaring a new variable at all — it's silently creating an **accidental global
variable**. JS doesn't error here; it just quietly leaks `user1` into the outer/global
scope. This is one of the most notorious beginner traps in the language (see Gotchas).

```js
const user2 = user1;
```
This does **not** create a second, independent object. `user1` is a reference type, so
`user2` is just a second label pointing at the *exact same* object in memory that `user1`
points to. There is only one container; now it has two names.

```js
user2.role = "guest"
//user1 role = guest
```
Changing `.role` through the `user2` label changes the *one shared object* — and since
`user1` points at that same object, reading it through `user1` would show the change too.
The comment I left (`//user1 role = guest`) was me noting the surprising outcome in
advance.

```js
console.log(user1.role)
console.log(user2.role)
```
Both print `"guest"` — proof that `user1` and `user2` were never two separate objects,
just two names for the same one.

### Gotchas worth remembering from this module

- **`typeof null === "object"`.** Permanent historical bug, never fixed, just memorize it.
  If I need to actually check for `null`, compare directly: `value === null`.
- **`const` locks the binding, not the contents.** `const emp = {...}` lets me freely do
  `emp.field = newValue` or add new keys — what `const` blocks is only `emp = {...}`
  (pointing the name at a *different* object entirely). This surprised me at first coming
  from the mental model of "const = frozen," but `const` in JS is really about the
  variable *name*, not the value's mutability.
- **Reference sharing is the single biggest bug source with objects.** `const user2 =
  user1;` (or the plain-object/array equivalent) does **not** copy — it just hands out a
  second label to the same container. Mutating through one name mutates "both," because
  there was only ever one thing. To get a real, independent copy I need `{...user1}`
  (shallow copy) or, for anything with nested objects inside, `structuredClone(user1)`
  (true deep copy).
- **`object_task3.js` has a real, live instance of the accidental-global bug**:
  `user1 = {...}` with no keyword. It happens to "work" in this small file because nothing
  else collides with the name `user1`, but in a bigger program this is exactly the kind of
  mistake that creates a variable nobody can find the declaration for, and that silently
  leaks state across functions that were never supposed to share anything. The fix is
  always the same: **every** variable gets `const` or `let` in front of it, with zero
  exceptions.
- **Primitives don't have this problem.** `let a = 5; let b = a; b = 9;` leaves `a` as `5`
  — primitives really do copy by value. The reference-sharing trap is specifically an
  object/array/function thing.
