# Module 33 — Interfaces & Types

### What I learned today

Modules 31-32 were about typing primitives (strings, numbers, arrays). This module is
about typing the shape of an OBJECT — describing what properties it must have, what
types they must be, and whether any are optional or locked. TypeScript gives me two ways
to do this: `interface` and `type`. They overlap a lot for plain object shapes, but
`interface` is specifically the tool for describing "things with properties" (models,
DTOs — data transfer objects, i.e. the shape of data moving between parts of a system),
while `type` can do everything `interface` does for objects PLUS things an interface
flatly cannot express, like unions (`"a" | "b"`) or tuples. The single biggest surprise
of the module was discovering that TypeScript checks object literals MORE strictly than
it checks variables holding the same data — a rule called excess property checking.

### File: `iface_task1.ts` — line by line

```ts
interface Employee{
    readonly id: string
    name: string
    salary: number
    department?: string
}
```
This declares a NAMED shape. Reading it property by property:
- `readonly id: string` — `id` must be a string, and `readonly` means once an object of
  this shape is created, `id` can never be reassigned again (I confirmed this myself in a
  comment further down — `c.id = "EMP-001"` gets flagged as "cannot reassign ...
  read-only property").
- `name: string` and `salary: number` — ordinary required properties.
- `department?: string` — the `?` makes this property OPTIONAL. An object can satisfy
  `Employee` with or without a `department` field at all.

```ts
const a : Employee ={
    id : "EMP-001",
    name : "JK",
    salary: 10,
}
```
This object has no `department` — allowed, because `department` was marked optional.

```ts
const b: Employee={
    id : "EMP-002",
    name: "Kishore",
    salary: 20,
    department : "IT"
}
```
This one does include it — also fine, since `department` being present is just as valid
as it being absent.

```ts
// const c: Employee ={
//     id: "EMP-003",
//     name: "Thalapathy Vetri Kondan",
// }  //Property 'salary' is missing in type '{ id: string; name: string; }' but required in type 'Employee'.//iface_task1.ts(4, 5): 'salary' is declared here.
```
This is the opposite experiment: leaving out `salary`, which is NOT optional. TypeScript
rejects it outright, and the error message is worth noticing in full — it doesn't just
say "wrong," it names exactly which property is missing AND points back at the exact line
in the interface where that property was declared required. That's a genuinely helpful
error message, much more specific than a typical runtime "undefined is not a function."

```ts
// why it says c is decalred and it's property is never read?
//c.id = "EMP-001" it says cannot reassign for read-only property
```
Two separate observations bundled in this comment. First: because the `const c = {...}`
assignment itself is a compile error (missing `salary`), TypeScript ALSO separately warns
that the variable `c` is "declared but its value is never read" — this is a different,
weaker kind of warning (the concise notes call this out: unused-variable warnings are
tidiness complaints, not real type errors, and they don't block compilation the way a
missing-property error does). Second: trying to reassign `c.id` afterwards hits the
`readonly` rule from the interface — consistent with what `readonly id` promised.

### File: `iface_task2.ts` — line by line

```ts
interface Address{
    city: string,
    pincode: number
}

interface Person{
    name: string,
    age: number
}

interface Manager extends Person{
    teamSize: number,
    address: Address
}
```
Three interfaces here, and the interesting one is `Manager extends Person`. `extends`
means `Manager` INHERITS every property `Person` has (`name`, `age`) and then adds its
own on top (`teamSize`, `address`). So a value typed as `Manager` must satisfy ALL FOUR
properties — the two inherited plus the two new ones. `address: Address` is also a
**nested interface reference** — `Manager`'s `address` property isn't just "some object,"
it's specifically required to match the `Address` shape (a `city` string and a `pincode`
number).

```ts
const manager: Manager ={
    name : "Jk",
    age: 25,
    teamSize: 90,
    address: {city: "coimbatore", pincode: 641062}
}
```
All four required properties present, and the nested `address` object itself matches
`Address`'s shape exactly.

```ts
// const manager1: Manager ={
//     name : "Jk",
//     age: 25,
//     teamSize: 90,
//     address: {city: "coimbatore", pincode: "641062"}
// }

//error fr above - Type 'string' is not assignable to type 'number'.The expected type comes from property 'pincode' which is declared here on type 'Address'
```
Same object, but `pincode` is now the STRING `"641062"` instead of the number `641062`.
The type checking reaches all the way down into nested objects — it's not just checking
the top-level shape of `Manager`, it's recursively checking that `address` itself is a
valid `Address`, and `Address.pincode` demands a number specifically.

### File: `iface_task3.ts` — line by line

```ts
type ID = string
type Status = "active"|"inactive"

type Product = {
    id: ID,
    name: string,
    status: Status
}
```
This is where `type` does something `interface` genuinely cannot: `type ID = string` is
an alias for a PRIMITIVE (not an object shape at all), and `type Status = "active" |
"inactive"` is a **union of literal values** (covered properly in Module 35, but already
showing up here). `Product` then reuses both: `id` must be the `ID` alias (just a
string, renamed for readability/intent), and `status` must be exactly one of the two
allowed literal strings — not any arbitrary string.

```ts
const p1 :Product= {
    id : "P-001",
    name: "Iphone",
    status: "active"
}
```
Valid — `status: "active"` is one of the two allowed values.

```ts
// const p2 :Product= {
//     id : "P-001",
//     name: "Iphone",
//     status: "delete"
// } //Type '"delete"' is not assignable to type 'Status'.The expected type comes from property 'status' which is declared here on type 'Product'
```
`"delete"` isn't one of `Status`'s two allowed values, so TypeScript rejects it — this is
a small preview of Module 35's bigger idea: a literal union gives compile-time protection
against invalid string values, something that in plain JS would need a manual runtime
check (`if (!["active","inactive"].includes(status))`) to catch, and only at runtime.

```ts
// interface mId: string - this cannot be done, this is only doable with type
```
This comment is the direct, hands-on confirmation of "interface = object shapes only."
`interface mId: string` isn't valid syntax at all — an interface can only ever describe
an object's properties, never stand in as an alias for a primitive the way `type ID =
string` can.

### Gotchas worth remembering from this module

- **⭐ Excess property checking — the single biggest gotcha of this module (seen directly
  in the concise notes, worth re-deriving here since none of the three files above
  happened to trip it, but it's central to how `interface`/`type` objects actually
  behave):** passing or assigning an object LITERAL directly, in-place, gets checked
  strictly — any extra property not declared on the interface is an error ("object
  literal may only specify known properties"). The exact same data, if first stored in a
  variable and THEN passed, is NOT checked that strictly, because TypeScript's structural
  typing only asks "does this have AT LEAST the required shape?" once it's behind a
  variable. Example shape of the rule: `getId({id, name, extra})` errors inline, but
  `const u = {id, name, extra}; getId(u)` does not. The strict inline check exists
  specifically to catch typos (e.g. `{ timeut: 3000 }` instead of `timeout`) — it assumes
  a literal written right there at the call site was probably meant to match exactly,
  while a variable might legitimately be a wider type being passed around.
- **`readonly` blocks reassignment, not nested mutation.** It stopped `c.id =` cold, but
  it only protects the property it's attached to — it says nothing about whether nested
  objects inside a property could still be mutated through their own methods.
- **Missing a required property is a hard compile error with a very specific,
  traceable message** (naming the exact property AND the exact line it's declared on) —
  very different from a JS runtime bug where a missing property just silently becomes
  `undefined` somewhere downstream.
- **`interface` can only describe object shapes — it cannot alias a primitive, a union,
  or a tuple.** `type` covers all of interface's object-shape territory PLUS those
  extra cases. Rule of thumb from the concise notes: reach for `interface` for
  models/DTOs, and `type` specifically when a union, primitive alias, or tuple is needed.
- **"Declared but never read" vs a real type error are different severities.** The
  unused-variable complaint on `c` is just tidiness noise — it doesn't block anything.
  The missing-`salary` complaint on the same `c` IS a real, blocking type error. Easy to
  conflate the two if skimming warnings quickly.
