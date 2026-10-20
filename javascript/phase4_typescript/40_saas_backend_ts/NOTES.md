# Module 40 — Rebuild the SaaS Backend in TS (3-part project)

### What I learned today — the big picture

This whole module is a single, continuous project in three parts, and it's the first
time all of Modules 31-39 get combined into something that actually resembles a real
backend's shape, not just an isolated concept demo. The three parts build on each other
directly:

1. **Part 1 — Models (`model_task1-3.ts`):** define the data shapes (`Tenant`, `Org`,
   `User`) the way a real multi-tenant SaaS app would — each entity referencing its
   parent by a plain string id, mirroring a database foreign key — plus a
   runtime-checkable way to validate role strings.
2. **Part 2 — Store (`store_task1-3.ts`):** one generic, reusable CRUD (Create/Read/
   Update/Delete) engine (`Store<T>`) instead of hand-writing three nearly-identical
   manager classes, with proper custom error types and parent-existence checks.
3. **Part 3 — Validate (`validate_task1-3.ts`):** functions that take totally untrusted,
   `unknown`-typed input (exactly what a real HTTP request body looks like before it's
   checked) and either produce a fully-typed, guaranteed-valid object, or throw a
   specific validation error.

My own notes call this out directly: `Store<T>` mirrors a real backend's
`*.repository.ts` files (the Repository pattern), and `parseXInput` mirrors what a
framework like NestJS does automatically with a DTO (data transfer object) and a global
validation pipe (Module 44 territory) — this project is doing BY HAND, and understanding
fully, something a framework will later do FOR me automatically.

---

## Part 1 — Typed Models

### File: `model_task2.ts` (read first — `model_task1.ts` depends on it)

```ts
export const ROLES = ["admin","member","viewer"] as const
export type Role = typeof ROLES[number];
```
This is the single most important pattern in the whole project, and it's worth slowing
down for. The GOAL is: I want `Role` to be the literal union `"admin" | "member" |
"viewer"` (Module 35's literal union, for compile-time safety), but I ALSO want a real,
runtime-checkable list of the valid roles, because at some point real, untrusted DATA
(like a string from a request body) needs to be checked AGAINST that list — and a `type`
alone leaves NOTHING behind at runtime to check against (Module 35's gotcha: literal
unions vanish entirely once compiled).

`as const` (Module 32b) is what solves this. Without it, `["admin","member","viewer"]`
would just be inferred as `string[]` — a general array of strings, with no memory of
WHICH strings specifically. With `as const`, TypeScript locks `ROLES` to the exact tuple
type `readonly ["admin", "member", "viewer"]` — each element remembers its own literal
value, and the whole array becomes read-only (can't `.push()` a fourth role onto it later
without this breaking).

`typeof ROLES[number]` is an **indexed access type** (the same mechanism from Module 36's
`gen_keyof_task.ts`, where `T[K]` meant "the type at key `K`"). Breaking it down:
`typeof ROLES` recovers the TYPE of the `ROLES` value (the locked tuple type from the line
above), and `[number]` means "the type you'd get by indexing into this with ANY number" —
which, for a tuple, produces the UNION of every element's type. So `typeof ROLES[number]`
becomes exactly `"admin" | "member" | "viewer"` — NOT the tuple type itself
(`["admin","member","viewer"]`), but the UNION of its elements. This is explicitly called
out as a thing to get right, since it's easy to misread it as somehow producing the array
type.

The payoff: `Role` (the type) and `ROLES` (the value) are now mathematically guaranteed to
never drift apart — `Role` is DERIVED directly from `ROLES`, so if I ever add a fourth
role to the `ROLES` array, `Role` automatically includes it too, with zero chance of the
two silently going out of sync (which WOULD happen if I'd hand-written `type Role =
"admin" | "member" | "viewer"` as a totally separate, unconnected line).

```ts
export const isValidRole=(role: string):role is Role=>{
    return (ROLES as readonly string[]).includes(role)
}
```
`role is Role` is a **type predicate** — a special return type for a function whose whole
job is to narrow a type. It tells TypeScript: "if this function returns `true`, then
treat the argument as the narrower `Role` type from that point on, at every call site."
This is Module 35's `typeof`-narrowing idea, but as a REUSABLE, named function instead of
an inline check repeated everywhere.

`(ROLES as readonly string[]).includes(role)` — the actual runtime check: does the
`ROLES` array (cast to `readonly string[]` so `.includes()` accepts a plain `string`
argument like `role`, rather than demanding `role` already be narrowed to the literal
union) contain this string? `role` here is just a general `string` (someone's raw,
unverified input) being checked against the array of allowed values — exactly like the
concise notes' comparison: this REPLACES the hand-written
`Object.values(Role).includes(role)` pattern from Module 35's plain-JS enum comparison,
except now it's caught at compile time too, anywhere `isValidRole` narrows a value.

```ts
// console.log(isValidRole("admin"))     
// console.log(isValidRole("member"))  
// console.log(isValidRole("superuser")) 
```
Commented-out manual tests — the first two would return `true`, the third `false`,
confirming the function does what it claims before it gets relied on elsewhere (it's
actually used for real validation later, in `validate_task3.ts`).

### File: `model_task1.ts` — the entity interfaces, line by line

```ts
import { ROLES } from "./model_task2";
type Role = typeof ROLES[number];
```
A small inconsistency worth noticing myself: `model_task1.ts` re-derives its OWN local
`Role` type here, by importing `ROLES` and repeating the `typeof ROLES[number]` pattern,
rather than simply importing the already-exported `Role` type directly from
`model_task2.ts` (which does export it). Functionally this works fine — it produces the
identical type — but it's duplicated logic that could have been one clean `import { Role }
from "./model_task2"` instead.

```ts
export interface Tenant{
    id: string,
    name: string
}

export interface Org{
    id: string,
    tenantId: string
    name: string
}

export interface User{
    id: string
    name: string,
    orgId: string
    role: Role
}
```
This is the heart of Part 1's design decision, and my concise notes spell out exactly WHY
it's shaped this way: `Org` doesn't contain a nested `tenant: Tenant` object — it holds
`tenantId: string`, a plain reference, mirroring a real database FOREIGN KEY. Same for
`User.orgId`. The alternative (nesting the full parent object inside the child) would
duplicate the parent's data inside every child record, and the moment the real parent
record changes (say, a tenant's `name` is updated), every nested copy sitting inside
`Org` objects would be stale and wrong. A plain id reference means there's exactly ONE
place the parent's real data lives, and anyone who needs it looks it up by that id
(exactly what `Store<T>`'s `getById()` in Part 2 is for).

`User.role: Role` ties back directly to Part 1's other half — a `User`'s role isn't a
general `string`, it's constrained to exactly the literal union `isValidRole` checks
against.

```ts
const t: Tenant = { id: "T-01", name: "Acme" };
const o: Org = { id: "O-01", tenantId: "T-01", name: "Engineering" };
const u: User = { id: "U-01", orgId: "O-01", name: "Kishore", role: "admin" };
```
Three sample objects proving each interface's shape works as intended — note `o.tenantId`
is just the string `"T-01"`, matching `t.id`, not an embedded copy of `t` itself.

### File: `model_task3.ts` — the first (throwaway) store sketch

```ts
import{Tenant,Org,User} from "./model_task1"

class TenantStore{
    #tenantData : Map<string,Tenant> = new Map()
}

class OrgStore{
    #orgData: Map<string,Org> = new Map()
    constructor(private readonly tenantData: TenantStore){}
}

class UserStore{
    #userData: Map<string,User> = new Map()
    constructor(private readonly orgData: OrgStore){}
}

const tenants = new TenantStore();
const orgs = new OrgStore(tenants);
const users = new UserStore(orgs);
console.log(orgs);
```
This file is an early, exploratory sketch — each store holds its own data in a `#private`
field (Module 23's real runtime-private syntax, not just the compile-time `private`
keyword) backed by a `Map<string, T>` (Module 36's generic `Map`, keyed by id). Each
store that depends on a PARENT's existence takes that parent store as a constructor
parameter property (`private readonly tenantData: TenantStore` — Module 37's shortcut).
Notice this version has NO actual methods yet (no `add`, no `getById`) — it's purely
sketching the three-level shape (`Tenant` → `Org` → `User`) and the constructor wiring
between them, before Part 2 replaces this entirely with one shared, generic, properly
behaved `Store<T>` base class instead of three separate, still-duplicated classes.

---

## Part 2 — The Generic CRUD Store

### File: `store_task1.ts` — custom errors and the abstract base class

```ts
export class DuplicateIdError extends Error{
    constructor(message: string){
        super(message);
        this.name = "DuplicateIdError"
    }
}

export class NotFoundError extends Error{
    constructor(message: string){
        super(message);
        this.name = "NotFoundError"
    }
}
```
Both classes `extends Error` — real inheritance (Module 37) from JavaScript's built-in
`Error` class, not just an interface shape check. `super(message)` passes the message up
to `Error`'s own constructor (standard error-subclassing pattern). `this.name =
"DuplicateIdError"` overwrites the default `name` property (`Error` instances default to
`name: "Error"`) so that catching one of these later and checking `.name`, or using
`instanceof`, reliably identifies WHICH specific kind of error occurred — exactly what
makes the `run()` helper function below able to distinguish them.

```ts
export abstract class Store<T extends {id: string}>{
    protected data: Map<string,T> = new Map()
```
`Store<T extends {id: string}>` — a generic class with a CONSTRAINT (Module 36): `T` can
be any shape, but it must at least have an `id: string`, because the store's whole job is
keying things by their id. `protected data` — NOT `private`, and this choice matters a
lot: `protected` allows SUBCLASSES (like `OrgStore` in Part 2's next file) to reach `data`
directly, while still fully blocking outside code from touching it; `private` would have
blocked subclasses too, breaking the design the moment a subclass needed to filter `data`
itself (which `listByTenant`/`listByOrg` do, in `store_task2.ts`).

```ts
    create(item: T):T{
        if (this.data.has(item.id)){
            throw new DuplicateIdError("Id already exists")
        }
        else{
            this.data.set(item.id,item)
            return item
        }
    }
```
Checks for a collision BEFORE inserting — if an item with this id already exists, throw
`DuplicateIdError` rather than silently overwriting it. Otherwise, store it keyed by its
own `item.id` and return it back to the caller (a common pattern — confirms what was
actually stored).

```ts
    getById(id: string):T{
        if(!this.data.has(id)){
            throw new NotFoundError("id not found")
        }
        return this.data.get(id)!
    }
```
Return type is plain `T`, not `T | undefined` — DELIBERATELY, because this method
GUARANTEES either a real result or a thrown error, never a silent `undefined`. The `!`
at the end (Module 32b's non-null assertion) is honest here, not reckless: by the time
that line executes, the `if` check immediately above has already PROVEN the key exists
(if it didn't, the function already threw and returned early) — so `.get(id)!` isn't
blindly trusting an unchecked assumption, it's telling TypeScript what's already been
verified by the preceding real runtime check. This is a much safer use of `!` than
Module 32b's `nums.at(-1)!`, which had no such prior verification.

```ts
    list():T[]{
        return [...this.data.values()]
    }
```
Spreads the `Map`'s values into a plain array — same pattern as Module 36's `Store<T>`.

```ts
    update(id: string, patch: Partial<T>): T {
        const existing = this.getById(id);

        const { id: _, ...updates } = patch;

        const updated = {
            ...existing,
            ...updates
        };

        this.data.set(id, updated);

        return updated;
    }
```
`patch: Partial<T>` (Module 38) — the CORRECT use of `Partial`: an update genuinely only
needs to supply the fields being CHANGED, so making every field of `T` optional is
honest, not dishonest, here. `const { id: _, ...updates } = patch` is destructuring
(from the JS fundamentals) that deliberately PULLS `id` out and discards it (renamed to
the throwaway variable `_`, a common convention for "I need to remove this but won't use
it"), keeping everything else in `updates` — this stops a caller's patch from accidentally
changing an item's own id through an update call. `{ ...existing, ...updates }` is a
spread-merge: start with everything `existing` already has, then overlay whatever
`updates` actually supplies — since `updates` only contains fields the caller explicitly
set, this correctly leaves every field NOT mentioned in the patch untouched, and
overwrites only the ones that were.

```ts
    delete(id:string){
        if(!this.data.has(id)){
            throw new NotFoundError("id not found")
        }
        else
            return this.data.delete(id)
    }
}
```
Checks existence first (consistent with `getById`'s pattern — throw a clear error rather
than silently doing nothing), then calls the `Map`'s own built-in `.delete()`, whose
return value is ALREADY a boolean (`true` if something was removed) — no extra work
needed to produce that boolean, `Map#delete` just naturally returns exactly what's wanted
here.

```ts
// class TestStore extends Store<{ id: string; label: string }> {}
// const s = new TestStore();
// s.create({ id: "X-01", label: "first" });
// console.log(s.getById("X-01"));
// console.table(s.list());

// const run = (action:() => void)=> {
//     try{
//         action()
//     }
//     catch(err){
//         if(err instanceof NotFoundError|| err instanceof DuplicateIdError){
//             console.log(err.name)
//         }
//         else{
//             throw err
//         }
//     }
// }

// run(()=>{s.create({ id: "X-01", label: "dup" });})
// run(()=>{s.getById("X-099")})
```
These commented-out lines are a self-test: `TestStore` proves `Store<T>` works for an
ARBITRARY shape satisfying the `{id: string}` constraint, even one invented purely for
testing. The `run()` helper shows the intended error-handling pattern for calling code:
wrap an action, catch anything, and specifically check `instanceof NotFoundError` or
`instanceof DuplicateIdError` — if it's one of THOSE specific custom error types, handle
it gracefully (just log the name here); if it's some OTHER, unexpected error, `throw err`
again to let it propagate, rather than silently swallowing a bug. This exact `run()`
pattern gets reused, almost verbatim, in Part 3's `validate_task1.ts`.

### File: `store_task2.ts` — concrete stores with parent-existence checks

```ts
import {Store} from "./store_task1"
import{Tenant,Org,User} from "./model_task1"

class TenantStore extends Store<Tenant> {}
```
`TenantStore` needs NO extra behavior beyond what `Store<Tenant>` already provides — it
has no parent to check against (tenants are the top of the hierarchy), so the class body
is completely empty; it simply specializes the generic `Store<T>` to `T = Tenant`.

```ts
class OrgStore extends Store<Org>{
    constructor(private readonly tenantData: TenantStore){super()}

    override create(item: Org): Org {
        this.tenantData.getById(item.tenantId)
        return super.create(item)
    }
    listByTenant(tenantId: string): Org[]{
        this.tenantData.getById(tenantId)
        return [...this.data.values()].filter(id => id.tenantId === tenantId)
    }
}
```
`constructor(private readonly tenantData: TenantStore){super()}` — a parameter property
(Module 37) storing the parent store, PLUS a mandatory `super()` call (Module 23/37's
rule: a subclass constructor must call its parent's constructor — here `Store`'s default,
parameter-less constructor — before the object is fully usable).

`override create(item: Org): Org` — Module 37's override rule: same signature
(`(item: Org): Org`), different body. The body does something `Store<T>`'s generic
`create` couldn't possibly know how to do: `this.tenantData.getById(item.tenantId)`
checks that the PARENT tenant genuinely exists before allowing this org to be created at
all — if it doesn't, `getById` throws `NotFoundError` and `create` never proceeds.
`return super.create(item)` — Module 37's `super.method()` pattern applied to an ordinary
method, not just a constructor: DELEGATE to the base class's real `create` logic (the
duplicate-check-then-insert behavior from `store_task1.ts`) rather than copy-pasting it
here. This is the clean way to "add one extra check, then do everything the parent
already does" — check first, then hand off.

`listByTenant` — a method that exists ONLY on `OrgStore`, not inherited from `Store<T>` at
all (the generic base has no concept of "tenant," only `OrgStore` does). It reuses
`this.data` directly — made possible specifically because `data` was declared
`protected`, not `private`, in the base class. `[...this.data.values()].filter(id =>
id.tenantId === tenantId)` spreads the map's values into an array and filters down to only
the orgs belonging to the requested tenant (the loop variable is named `id` here, which is
slightly confusing since it's actually a whole `Org` object, not just an id string — a
small naming inconsistency worth noticing).

```ts
class UserStore extends Store<User>{
    constructor(private readonly orgData: OrgStore){super()}

    override create(item: User): User {
        this.orgData.getById(item.orgId)
        return super.create(item)
    }
    listByOrg(orgId: string): User[]{
        this.orgData.getById(orgId)
        return [...this.data.values()].filter(id => id.orgId === orgId)
    }
}
```
The EXACT same pattern as `OrgStore`, one level deeper in the hierarchy: `User` checks
its parent `Org` exists via `orgData.getById`, then delegates to `super.create`.
`listByOrg` mirrors `listByTenant` exactly, just for the user→org relationship instead of
org→tenant. This repetition across `OrgStore` and `UserStore` is itself worth noting —
it's the SAME shape twice, which is a natural place a more advanced refactor (outside this
module's scope) might eventually generalize further.

```ts
export const tenants = new TenantStore();
export const orgs = new OrgStore(tenants)
export const users = new UserStore(orgs)
```
The actual, shared store INSTANCES get created here and exported — every other file in
this project that needs to create/read tenants, orgs, or users imports these same three
instances, rather than each file creating its own separate, disconnected stores (which
would mean data created in one file wouldn't be visible from another).

```ts
// tenants.create({ id: "T-01", name: "Acme" });
// console.log(orgs.create({ id: "O-01", tenantId: "T-01", name: "Engineering" }));

// try {
//   orgs.create({ id: "O-02", tenantId: "T-99", name: "Ghost" });
// } catch (e) {
//   console.log((e as Error).name, (e as Error).message);
// }
```
A commented-out manual test proving the parent-existence check actually works:
`orgs.create({..., tenantId: "T-99", ...})` tries to create an org pointing at a tenant
that was never created — `this.tenantData.getById("T-99")` would throw `NotFoundError`
inside `OrgStore.create` BEFORE `super.create` is ever even reached, catching the broken
reference immediately. `(e as Error)` here is a type assertion (Module 32b) needed
because a `catch` block's error variable is typed `unknown` by default in strict
TypeScript — asserting `as Error` is reasonable here since both custom error classes do
extend `Error`, giving access to `.name`/`.message`.

### File: `store_task3.ts` — exercising the whole store layer

```ts
import {Store} from "./store_task1"
import {tenants,orgs,users} from "./store_task2"

tenants.create({ id: "T-01", name: "Acme" });
orgs.create({ id: "O-01", tenantId: "T-01", name: "Engineering" });
orgs.create({ id: "O-02", tenantId: "T-01", name: "Sales" });

console.log(orgs.listByTenant("T-01").map(o => o.name));
console.log(orgs.update("O-01", { name: "Platform Engineering" }).name);
console.log(orgs.delete("O-02"));
console.log(orgs.listByTenant("T-01").map(o => o.name));
```
This is the real, working end-to-end exercise of everything Part 2 built: create a
tenant, create two orgs under it (both pass the parent-existence check since `"T-01"`
really exists), list all orgs for that tenant (both show up), UPDATE one org's name
(only `name` changes — the spread-merge logic in `Store.update` leaves `id`/`tenantId`
untouched), DELETE the other (`orgs.delete("O-02")` returns `true`, confirming
`Map#delete`'s boolean return flows all the way up), and list again to confirm only the
updated, surviving org remains. The `.map(o => o.name)` calls just pull out names for
readable console output.

---

## Part 3 — Validating Untrusted Input

### File: `validate_task1.ts` — the `ValidationError` class and the `run` test helper

```ts
import {Tenant} from "./model_task1"

export class ValidationError extends Error{
    constructor(message: string){
        super(message)
        this.name = "ValidationError"
    }
}
```
Same custom-error pattern as `DuplicateIdError`/`NotFoundError` from Part 2 — a third,
distinct error type specifically for "the shape of this input data is wrong," kept
separate from "this id doesn't exist" (`NotFoundError`) and "this id already exists"
(`DuplicateIdError`), because each represents a genuinely different FAILURE CATEGORY that
calling code might want to react to differently (and, per my concise notes, this maps
directly to HTTP status codes a real API would return: a `ValidationError` → 400, a
`NotFoundError` → 404, a `DuplicateIdError` → 409 — the exact mapping built by hand back
in earlier phases).

```ts
const parseTenantInput = (item: unknown):Tenant =>{
    const data = item as Partial<Tenant>

    if(typeof data != "object" || data === null){
        throw new ValidationError("Invalid input")
    }
    if(typeof data.id != "string" || !data.id){
        throw new ValidationError("id required")
    }
    if(typeof data.name != "string" || !data.name){
        throw new ValidationError("Name required")
    }
    return {id: data.id, name: data.name}
}
```
This function's SIGNATURE itself tells the whole story: `(item: unknown): Tenant`. It
takes something whose type is COMPLETELY UNKNOWN (Module 32's safest type for "could be
anything, from outside" — this is the honest type for raw, unverified input, like a
parsed HTTP request body) and promises to hand back a fully-valid, guaranteed `Tenant` —
or throw trying.

`const data = item as Partial<Tenant>` — the exact "loosest-honest assertion" pattern
from Module 32b: NOT asserting the confident, complete `Tenant` (which would be a lie,
since `item` hasn't been checked at all yet), but the honest "maybe has these fields, all
optional" `Partial<Tenant>`. This assertion alone adds no safety by itself — it just lets
me WRITE the following checks without TypeScript complaining that `data.id` might not
exist on a bare `unknown`.

Then come the actual REAL, runtime checks — three of them, each one narrowing a bit
further and throwing a SPECIFIC, descriptive `ValidationError` the moment something's
wrong:
- `typeof data != "object" || data === null` — guards against `item` not even being an
  object at all (a string, a number, `null` — note `typeof null === "object"` in
  JavaScript, which is why `data === null` needs its OWN explicit check, not just a
  `typeof` check).
- `typeof data.id != "string" || !data.id` — checks `id` is actually a string AND not an
  empty string (`!data.id` catches `""`, which `typeof` alone would accept as valid).
- `typeof data.name != "string" || !data.name` — same pattern, for `name`.

`return {id: data.id, name: data.name}` — only NOW, after every check has passed, is it
actually HONEST to build and return a real `Tenant` object — this is explicitly the
point my concise notes make: "only now is the FULL type honest." Before this line, every
`data.X` access was still technically typed via `Partial<Tenant>` (so `data.id` was
`string | undefined`); building the final object pulls those narrowed, now-verified
values together into something TypeScript recognizes as a genuine, complete `Tenant`.

```ts
export const run = (action: ()=>void)=>{
    try{
        action()
    }
    catch(err){
        if(err instanceof ValidationError){
            console.log(err.name)
        }
        else
            throw err
    }
}
```
This is the SAME `run()` helper sketched in a comment back in `store_task1.ts`, now
actually implemented and exported for real use. `action: ()=>void` is a function-type
parameter (Module 34) — any no-argument, no-return callback. Inside, wrap the call in
`try`/`catch`: if what goes wrong is specifically a `ValidationError`, handle it gracefully
(log its name); anything else gets RE-THROWN (`throw err`) rather than silently
swallowed — exactly the same "only catch what I expect, let genuine surprises propagate"
discipline as Part 2's commented-out version.

```ts
run(()=>{console.log(parseTenantInput({id:"T-01",name:"Acme"}))})
run(()=>{parseTenantInput(null)})
run(()=>{parseTenantInput("not an object")})
```
Three real exercises of the whole pipeline: a genuinely valid tenant input passes every
check and gets logged as a real `Tenant` object; `null` fails the very first check
(`data === null`); the string `"not an object"` fails the first check too (`typeof data
!= "object"` — a string's `typeof` is `"string"`, not `"object"`). Both failing cases get
caught by `run` and logged as `"ValidationError"` rather than crashing the whole program.

### File: `validate_task2.ts` — reusing the pattern for `Org`

```ts
import {Org} from"./model_task1"
import {ValidationError,run} from "./validate_task1"

const parseOrgInput =(raw: unknown):Org =>{
    const data = raw as Partial<Org>

    if(typeof data != "object" || data === null){
        throw new ValidationError("Invalid input")
    }
    if(typeof data.id != "string" || !data.id){
        throw new ValidationError("id required")
    }
    if(typeof data.name != "string" || !data.name){
        throw new ValidationError("Name required")
    }

    if(typeof data.tenantId != "string" || !data.tenantId){
        throw new ValidationError("tenantid required")
    }
    return {id: data.id, tenantId: data.tenantId,name: data.name}
}
```
The IDENTICAL pattern as `parseTenantInput`, just extended with one more field-check for
`tenantId` (since `Org` has one more required property than `Tenant` does) — and notice
it REUSES the shared `ValidationError` class and `run` helper by IMPORTING them from
`validate_task1.ts` rather than redefining them. This is the reuse principle my concise
notes call out explicitly for Part 3: don't reimplement shared logic, reuse what already
exists.

```ts
run(()=>{ console.log(parseOrgInput({ id: "O-01", tenantId: "T-01", name: "Engineering" }))})
run(()=>{ parseOrgInput({ id: "O-01", name: "Engineering" })})
```
First call: fully valid, all three fields present — succeeds. Second call: missing
`tenantId` entirely — fails specifically at the `tenantId` check (having already passed
the `id` and `name` checks), demonstrating the checks run in sequence and stop at the
FIRST thing that's wrong.

### File: `validate_task3.ts` — the most complete validator, reusing `isValidRole`

```ts
import{User} from "./model_task1"
import { isValidRole } from "./model_task2"
import { ValidationError } from "./validate_task1"
import { tenants,orgs,users } from "./store_task2"
import { run } from "./validate_task1"

const parseUserInput = (raw:unknown): User =>{
    const data = raw as Partial<User>

    if(typeof data != "object" || data === null){
        throw new ValidationError("Invalid input")
    }
    if(typeof data.id != "string" || !data.id){
        throw new ValidationError("id required")
    }
    if(typeof data.name != "string" || !data.name){
        throw new ValidationError("Name required")
    }

    if(typeof data.orgId != "string" || !data.orgId){
        throw new ValidationError("Org required")
    }
    if(!data.role || !isValidRole(data.role)){
        throw new ValidationError("Invalid role")
    }

    return {id: data.id, orgId: data.orgId,name: data.name, role: data.role}
}
```
This file ties ALL THREE parts of the module together in one function. The `id`/`name`/
`orgId` checks follow the exact same proven pattern as the previous two files. The role
check is the interesting new piece: `!data.role || !isValidRole(data.role)` — first
confirms `data.role` isn't falsy (missing/empty), then calls `isValidRole` (built all the
way back in Part 1's `model_task2.ts`) to check it's actually one of the real, allowed
role strings. This is explicitly the reuse the concise notes flag: "`parseUserInput`'s
role check calls `isValidRole`... it doesn't reimplement the role check inline" — instead
of hand-rolling another `.includes()` check here, Part 3 calls back into Part 1's
already-correct, already-tested validator.

Because `isValidRole` is a type predicate (`role is Role`), the final `return` statement's
`role: data.role` is ALSO correctly typed as the narrow `Role` union by this point, not a
general `string` — TypeScript tracked the narrowing all the way through the `if` check.

```ts
tenants.create({ id: "T-01", name: "Acme" });
orgs.create({ id: "O-01", tenantId: "T-01", name: "Engineering" });

const goodInput: unknown = { id: "U-01", orgId: "O-01", name: "Kishore", role: "admin" };
console.log(users.create(parseUserInput(goodInput)));

const badInput: unknown = { id: "U-02", orgId: "O-01", name: "Ghost", role: "superuser" };
try { users.create(parseUserInput(badInput)); } catch (e) { console.log((e as Error).name); }
```
This is the full, real pipeline, end to end, all three parts working together in one
flow: set up a tenant and org using the Part 2 stores, then take `goodInput` — typed as
plain `unknown`, exactly as a real HTTP request body would arrive — run it through
`parseUserInput` (Part 3's validation, which ALSO calls into Part 1's `isValidRole`), get
back a guaranteed-valid `User`, and hand that straight to `users.create()` (Part 2's
generic store, which ALSO checks the parent `Org` exists via its own `override create`).
`badInput` has `role: "superuser"`, which `isValidRole` correctly rejects, so
`parseUserInput` throws a `ValidationError` before `users.create` is ever even reached —
caught here directly with a plain `try`/`catch` and `(e as Error).name` (same assertion
pattern as `store_task2.ts`'s commented-out test).

---

### Gotchas worth remembering from this whole module

- **`as const` + indexed access type (`typeof ROLES[number]`) is the pattern that keeps a
  literal union and its runtime-checkable array from ever drifting apart.** A type alone
  (`type Role = "admin" | ...`) is invisible at runtime; `as const` on a real array keeps
  something to `.includes()` against, and deriving the type FROM that array (rather than
  writing it separately) means they can never disagree. Misreading `typeof ROLES[number]`
  as "the type of the whole tuple" instead of "the union of its element types" is an easy
  mistake — it specifically produces the UNION.
- **`protected` vs `private` is the difference between `OrgStore`/`UserStore` working or
  not.** `Store<T>`'s `data` field has to be `protected`, not `private`, purely because
  `listByTenant`/`listByOrg` (defined on the SUBCLASSES) need direct access to it — this
  is the real, concrete case (not just a hypothetical) where the Module 37 distinction
  actually decides whether the code compiles.
- **`abstract class Store<T>` blocks `new Store()` directly, but that's ONLY because it's
  meaningless with no concrete `T` filled in — it's not because any of its methods are
  left unimplemented** (unlike Module 37's `Notification`, which genuinely had one
  unimplemented `abstract send()` method, EVERY method on `Store<T>` already has a full
  body; `abstract` here exists purely to prevent a pointless, type-less instantiation).
- **`override create()` + `super.create(item)` is "check the extra thing, then delegate" —
  never "copy the parent's logic and modify it."** Both `OrgStore` and `UserStore` do the
  parent-existence check FIRST, then hand off entirely to `super.create`, instead of
  re-implementing the duplicate-id check and the `Map.set` themselves — this is what keeps
  the duplicate/insert logic living in exactly ONE place (`Store<T>`) even though three
  different concrete classes use it.
- **The `!` in `getById`'s `return this.data.get(id)!` is a RARE example of a genuinely
  safe non-null assertion** — safe specifically because the `if(!this.data.has(id)) throw`
  check immediately above it has ALREADY proven the key exists by the time `!` is reached.
  Compare this to Module 32b's `nums.at(-1)!`, which had no such prior proof — the
  difference between a justified assertion and a risky one is whether a REAL check
  happened first.
- **Assert the loosest-honest type (`Partial<T>`), run real checks, and ONLY construct the
  final, fully-typed object after every check passes.** All three `parseXInput` functions
  in Part 3 follow this exact shape, and it's the complete, working version of what
  Module 32b only demonstrated in miniature — this really is "the real, reusable boundary
  function" the concise notes describe, standing between untrusted `unknown` data and the
  rest of a type-safe system.
- **Reuse existing validators instead of re-checking the same thing by hand in multiple
  places.** `parseUserInput`'s role check calling `isValidRole` (rather than writing
  another `.includes()` check inline) is the module's clearest example of this — the same
  spirit as Part 2 reusing `Store<T>`'s `create` via `super.create` instead of
  duplicating it.
