# Module 35 — Union, Literal & Enums

### What I learned today

So far every type I've written has meant exactly one shape. This module is about values
that can legitimately be MORE than one shape — a union type (`string | number`) says "one
of these, could be either" — and the special, narrower case of a union made of specific
VALUES rather than general types, called a literal union (`"admin" | "member" |
"viewer"`), which gives compile-time protection for things like roles or statuses for
free, without writing a single line of runtime validation code. I also met `enum`, which
is TypeScript's older, heavier alternative to a literal union — and discriminated unions,
where a shared "tag" field on otherwise-different object shapes lets TypeScript figure out
which shape I'm holding just from checking that tag.

### File: `union_task1.ts` — line by line

```ts
const format = (id: string| number):string=>{
    if(typeof id === "string"){
        return id.toUpperCase()
    }
    return id.toFixed(2)
}
```
`id: string | number` is a **union type** — `id` is allowed to be EITHER a string OR a
number, nothing else. The `|` reads as "or." Inside the function body, I can't
immediately call `.toUpperCase()` or `.toFixed()` on `id` directly, because TypeScript
doesn't yet know which of the two it actually is at that point — those methods only exist
on one of the two possibilities each. The `if(typeof id === "string")` check is
**narrowing**: it's a real runtime check that also teaches TypeScript, for the code
INSIDE that `if` block, "treat `id` as definitely a `string` here" — which is why
`.toUpperCase()` is legal on that line. Past the `if` block (the `return id.toFixed(2)`
line), TypeScript has ruled out the string branch via the earlier `return`, so by
elimination it treats `id` as `number` there, making `.toFixed(2)` legal.

```ts
console.log(format("pr-001"))
console.log(format(59))
```
Both calls are valid — one supplies the string half of the union, the other the number
half.

### File: `literal_task2.ts` — line by line

```ts
type Role = "admin" | "member"|"viewer"
```
This looks similar to `string | number` but is fundamentally narrower: instead of unioning
general TYPES, this unions specific VALUES. `Role` isn't "any string" — it's EXACTLY one
of these three strings and nothing else, not even another perfectly reasonable-looking
string like `"administrator"`.

```ts
const setRole = (role: Role):void =>{
    console.log(role)
}

setRole("admin")
setRole("viewer")

//setRole("superuser") //Argument of type '"superuser"' is not assignable to parameter of type 'Role'.
```
`"superuser"` isn't one of the three allowed literals, so TypeScript catches it at
compile time, before the program ever runs.

```ts
// In js
// const Role = Object.freeze({
//         ADMIN: "admin",
//         EDITOR: "editor",
//         VIEWER: "viewer"
//     })
// const setRole = (role)=>{
// if(Object.values(Role).includes(role)) // this whole if part is ripped out by TS, and even caught at compile time
//        console.log(role)
// }
```
This commented-out block is the "what I would have had to write in plain JS" comparison —
and it's the real point of the module. In plain JS, to get the same protection, I'd have
to write an actual runtime `if` check that inspects `Object.values(Role)` EVERY time
`setRole` runs, and an invalid role would only be caught once the code actually executed
with that bad value. The literal union version gets the SAME protection, for free, purely
at compile time — no runtime check needed at all, and the mistake is caught before the
program is even run, not during it.

### File: `enum_task3.ts` — line by line

```ts
enum Status{
    Active = "active",
    Inactive = "inactive"
}

const status: Status = Status.Active

console.log(status)
```
`enum` is TypeScript's other way to express "one of a fixed set of named values." Unlike
a literal union, which disappears entirely once compiled to plain JS, an `enum` compiles
into a REAL JavaScript object that exists at runtime — `Status.Active` is an actual
property lookup on an actual object (`Status`), not just a type-only label. This matters
because it means I can do things with an enum that a literal union genuinely cannot do:
iterate over all its values (`Object.values(Status)`), or reference a member by name
(`Status.Active`) rather than having to type the raw string `"active"` by hand everywhere.

```ts
//-----------part B -------------//

type Success = {status: "ok", data: string}
type Failure = {status:"error",message: string}
type ApiResult = Success | Failure
```
This is a **discriminated union** — two object shapes that are otherwise completely
different (`Success` has `data`, `Failure` has `message`), but both share one property in
common, `status`, and that shared property is itself a literal type (`"ok"` vs
`"error"`). That shared literal field is called the **discriminant** — it's the "tag"
that lets TypeScript tell the two shapes apart.

```ts
const handle =(r: ApiResult) =>{
    if (r.status === "ok"){
        console.log(r.data)
    }
    else{
        console.log(r.message)
    }
}
```
This is where the discriminant pays off. Checking `r.status === "ok"` isn't just an
ordinary runtime `if` — TypeScript uses that exact check to NARROW `r`'s type: inside the
`if` block, TypeScript now knows `r` must specifically be the `Success` shape (the only
one where `status` could equal `"ok"`), so `r.data` is legal there even though `Failure`
has no `data` property at all. In the `else` branch, by elimination, `r` must be
`Failure`, so `r.message` is legal there instead. Without the shared discriminant field,
TypeScript would have no clean way to know which of the two shapes `r` actually is at any
given point.

```ts
handle({status: "ok",data: "Welcome JS"})
handle({status: "error",message: "not found"})
```
Two calls, one for each branch of the union — both type-check because each object
literal exactly matches one of the two allowed shapes (and note: this IS one of those
inline object literal cases from Module 33's excess-property-checking gotcha — if I'd
added an extra property here that wasn't part of either `Success` or `Failure`,
TypeScript would flag it immediately since these are literals passed directly, not stored
in a variable first).

### Gotchas worth remembering from this module

- **A union type requires narrowing before using type-specific behavior** — exactly like
  `unknown` did in Module 32, except here there are exactly two (or more) KNOWN
  possibilities instead of "anything." `typeof` narrowing on `string | number` and
  discriminant-field narrowing on an object union (`r.status === "ok"`) are the same idea
  applied to two different situations.
- **Literal union = compile-time-only protection, zero runtime cost, but can't be
  iterated.** There's no real array or object behind `type Role = "admin" | "member" |
  "viewer"` once compiled — it exists purely for the type checker, which is exactly why
  it can't do `Object.values(Role)` the way an enum can.
- **`enum` is a REAL runtime object, which is the one thing a literal union genuinely
  can't replace** — use `enum` specifically when I need to loop over all possible values
  or reference a member by name (`Status.Active`) rather than typing the raw string by
  hand. Otherwise, per the concise notes, a literal union is the "modern default" because
  it's lighter weight (nothing shipped into the compiled JS output at all).
- **The discriminant field in a discriminated union MUST itself be a literal type, not a
  general one.** If `status` had been typed as plain `string` instead of the literal
  `"ok"` / `"error"`, TypeScript would have no way to narrow on it — checking
  `r.status === "ok"` would tell TypeScript nothing useful about which shape `r` actually
  is, because any string could theoretically equal `"ok"` as far as the type system is
  concerned.
