# Module 11 — Objects (full) — NOTES

### What I learned today

This module goes deeper into objects than Module 3's introduction: object **methods**
(functions stored as object values, with `this` referring to "the object I was called
on"), **destructuring** (pulling fields out into standalone variables in one line),
**spread** for copying/merging objects, and the built-in `Object.keys/values/entries`
helpers for working with an object generically. The one idea that comes up again and again,
and that I now have three separate real examples of in my own code, is: **spreading an
object (`{...obj}`) only copies one level deep.** Anything nested inside (an object inside
an object) is still shared by reference between the "copy" and the original.

### File: `object_revision.js` — line by line

```js
const pr = { id: "PR-001", dept: "IT",
               supplier: { name: "Cisco", city: "Chennai" } }
```
An object with a **nested object** inside it — `supplier` is itself a whole object, not a
primitive value. This is the realistic shape of data that comes from a database join or a
nested JSON API response (a purchase request that embeds its supplier's details).

```js
console.log(pr.supplier.city)
```
Chained dot notation — `pr.supplier` gets the nested object, `.city` then reaches into
*that* object. Prints `"Chennai"`.

```js
console.log(pr.supplier?.pin ?? "N/A");
```
`?.` (optional chaining, from Module 4) protects against `supplier` being missing —
not needed here since `supplier` does exist, but it's a safe habit regardless. `pin` simply
doesn't exist as a key on `supplier` at all, so `pr.supplier?.pin` evaluates to
`undefined`. Then `?? "N/A"` (nullish coalescing) kicks in because `undefined` qualifies as
"nullish," replacing it with the fallback string `"N/A"`. Prints `"N/A"`.

```js
const pr2 = {...pr, status: "Approved"}
```
`{...pr, status: "Approved"}` **spreads** every key from `pr` into a new object literal,
then adds (or would overwrite, if it already existed) a `status` key on top. This is both
"copy an object" and "merge in extra/overriding fields" in one expression. `pr2` now has
`id`, `dept`, `supplier`, and the new `status` field.

```js
console.log(pr2)
console.log(pr);
```
`pr2` shows all four fields including `status: "Approved"`. `pr` still shows only its
original three fields — spreading into a *new* object literal doesn't touch the original at
all (this part of the copy genuinely is independent).

```js
console.log(Object.keys(pr))
```
`Object.keys(obj)` returns an **array of the object's key names** (as strings), ignoring
the values entirely. Prints `["id", "dept", "supplier"]`.

```js
pr2.supplier.city = "Mumbai"
console.log((pr.supplier.city));
```
This is the key demonstration of the module. `pr2` was built with `{...pr, ...}` — a
**shallow copy**. At the top level, `pr2` is a genuinely separate object from `pr` (adding
`status` to `pr2` didn't touch `pr`, as shown above). But `pr2.supplier` was never given its
*own* copy of the supplier object — spread only copies the *reference* to `supplier`, not a
new independent supplier object. So `pr2.supplier` and `pr.supplier` are **the same
object** in memory, under two different parent objects. Changing `pr2.supplier.city`
therefore also changes what `pr.supplier.city` reports — even though I never touched `pr`
directly. Printing `pr.supplier.city` here shows `"Mumbai"`, not the original `"Chennai"`,
proving the nested object was shared all along.

### File: `object_task1.js` — line by line

```js
let emp = { name: "Kishore", age: 24, dept: "IT" ,greet(){return `Hi ${this.name}`}};
```
`greet(){ ... }` inside the object literal is **method shorthand** — a compact way of
writing `greet: function() { ... }`. Inside the method body, **`this` refers to the object
the method was called *on***, so `this.name` means "whatever object is to the left of the
dot when `greet()` gets called" — here, that will be `emp`, so `this.name` resolves to
`"Kishore"`.

```js
console.log(emp.greet())
```
Calling `emp.greet()` — `this` inside the method becomes `emp`, so `this.name` is
`"Kishore"`, and the method returns `"Hi Kishore"`, which gets printed.

```js
const {name, dept} = emp;
console.log(`${name} ${dept}`)
```
**Destructuring** — instead of writing `const name = emp.name; const dept = emp.dept;`
separately, this single line pulls both fields out at once into two brand-new standalone
variables, matched by name against the object's keys. Prints `"Kishore IT"`.

```js
let dkey = "dept"
console.log(emp[dkey])
```
Bracket notation with a **variable** holding the key name — `emp[dkey]` looks up whatever
key `dkey` currently contains (`"dept"`), equivalent to `emp.dept` but computed
dynamically rather than written literally. Prints `"IT"`. (This only works with brackets;
`emp.dkey` would incorrectly look for a literal property named `"dkey"`, which doesn't
exist.)

```js
emp[age]++
console.log(emp.age)
```
**This line has a real bug.** `emp[age]` uses bracket notation with `age` written as a bare
identifier — meaning JS looks for a *variable* named `age` to use as the key, not the
literal text `"age"`. But no variable called `age` was ever declared anywhere in this file
(only `name` and `dept` were pulled out by the earlier destructuring — `age` was left
behind, still only a key inside `emp`, never its own standalone variable). Since `age` was
never declared, this line throws `ReferenceError: age is not defined` the moment it runs,
and the script stops there — `console.log(emp.age)` on the next line is never reached. What
was almost certainly intended here is `emp.age++` or `emp["age"]++` (incrementing the
actual `age` field inside `emp`, from `24` to `25`), using the literal key, not an
undeclared variable.

### File: `object_task2.js` — line by line

```js
let user = { name: "Kishore", address: { city: "Chennai" } }

let cuser = {...user};

cuser.role = "admin";
```
Same shallow-copy pattern again: `cuser` is a new top-level object (adding `role` to
`cuser` doesn't touch `user`), but `cuser.address` and `user.address` are still the exact
same nested object under the hood (this file doesn't happen to mutate `address` through
either copy, so the sharing stays invisible here — but it's there, same as in
`object_revision.js`).

```js
console.log(user)
console.log(cuser)
```
`user` prints with just `name` and `address`. `cuser` prints with `name`, `address`, *and*
the new `role: "admin"` field — proving the top-level copy genuinely added a field
independently.

```js
console.log(Object.keys(user))
console.log(Object.values(user))
```
`Object.keys(user)` → `["name", "address"]` (just the key names). `Object.values(user)` →
`["Kishore", { city: "Chennai" }]` (the actual stored values, in the same key order —
note the second value is itself the whole nested object, not a flattened string).

```js
console.log(user?.address?.pin ?? "N/A")
```
Same optional-chaining-plus-nullish-fallback pattern as `object_revision.js`: `pin` doesn't
exist on `address`, so this safely resolves to `undefined`, then falls back to `"N/A"`.

### File: `object_task3.js` — line by line (shallow vs deep copy, explicitly tested)

```js
let a = {info: {count: 1}}

let b = {...a};

b.info.count = 99;
console.log(a.info.count) // swallow copy nested feilds address in stored not values, so they become shared across
```
(My comment has two small typos — "swallow" for "shallow" and "feilds" for "fields" — but
the actual understanding behind it is correct.) `b = {...a}` is a shallow copy: `b` is a new
top-level object, but `b.info` is the *same* nested object as `a.info` — spread copies the
*reference* to `info`, not a fresh independent `info` object. So setting `b.info.count =
99` mutates the one shared `info` object, and reading it back through `a` (`a.info.count`)
also shows `99`, not the original `1` — proving the nested object really was shared the
whole time, exactly as the comment describes.

```js
let d = structuredClone(a);
d.info.count = 500;

console.log(d.info.count)
console.log(a.info.count)
```
`structuredClone(a)` is the fix for the shallow-copy problem: it produces a **true, fully
independent deep copy** — every nested object/array inside gets its own brand-new copy too,
all the way down, not just the top level. `d` is cloned from `a` *after* `a.info.count` had
already become `99` (from the mutation above), so `d.info.count` starts at `99`, then gets
set to `500`. Printing `d.info.count` shows `500`. Critically, printing `a.info.count`
right after still shows `99` — completely unaffected by the change made through `d`,
because `structuredClone` genuinely broke the connection between the two objects, unlike
spread.

### Gotchas worth remembering from this module

- **Spread (`{...obj}`) only copies one level deep — this module has three separate,
  real demonstrations of the same trap** (`object_revision.js`'s `pr2.supplier.city`
  mutation leaking back into `pr`; `object_task2.js`'s shared-but-untested `address`; and
  `object_task3.js`'s explicit `b.info.count = 99` test). The fix whenever an object has
  nested objects/arrays inside that need genuine independence is `structuredClone(obj)`,
  not another layer of spread.
- **`object_task1.js`'s `emp[age]++` is a real, confirmed bug** — `age` is used as a bare
  identifier (an undeclared variable), not the literal key `"age"`, which throws
  `ReferenceError: age is not defined` and halts the script before the following
  `console.log` ever runs. The fix is `emp.age++` or `emp["age"]++`. This is the same class
  of mistake as Module 7's `for...in`-on-a-string bug: bracket notation with a bare word
  means "look up this variable," not "use this literal text" — only a quoted string
  (`emp["age"]`) or dot notation (`emp.age`) uses the literal key name directly.
- **`this` inside a method refers to whatever object the method was called *through*, not
  where the method was defined.** `emp.greet()` works because `this` becomes `emp` at the
  moment of the call — this is a Module 16 topic in more depth, but the basic version
  (method called with `object.method()` syntax → `this` is that object) is exactly what's
  used here.
- **Bracket notation with a variable vs. a literal key are visually similar but mean
  opposite things.** `emp[dkey]` (where `dkey` holds `"dept"`) correctly does a *dynamic*
  lookup. `emp[age]` (where `age` is an undeclared bare word) tries to do the same dynamic
  lookup but fails because there's no variable to look up — this distinction is exactly
  what separates the working `dkey` line from the broken `age` line in the same file.
- **Destructuring only creates the variables you explicitly ask for.** `const {name, dept}
  = emp` does *not* also create an `age` variable, even though `emp` has an `age` field —
  this is likely part of why `object_task1.js`'s later `emp[age]` bug happened: `age` was
  simply never brought into scope as its own variable the way `name` and `dept` were.
