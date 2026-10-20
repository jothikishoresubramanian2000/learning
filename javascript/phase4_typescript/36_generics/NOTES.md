# Module 36 — Generics (a/b/c)

### What I learned today

This module was split into three parts (a, b, c) and together they build up to one of
the most useful ideas in all of TypeScript: a **generic** is a type PARAMETER — written
`<T>` — that gets filled in differently every time a function, interface, or class is
used, but is still fully checked at compile time. The core problem generics solve: `any`
also "works for everything," but it throws away type safety entirely (Module 32's
warning). A generic keeps the safety AND works for everything, because the specific type
gets carried through from input to output and locked in for that one particular call or
instance, rather than being thrown away.

## Part A — Generic functions

### File: `gen_a_task1.ts`

```ts
const lastOf= <item>(n: item[]): item =>{
    return n[n.length -1]!;
}
```
`<item>` right after the `=` and before the parameter list declares a type parameter
named `item` (lowercase here — the convention is usually `T`, but any name works; it's
just a placeholder label). `n: item[]` says "takes an array of whatever `item` turns out
to be," and `: item` as the return type says "returns one single value of that same
type." The `!` at the end of `n[n.length - 1]` is the non-null assertion from Module 32b
— indexing an array doesn't statically guarantee there's something at that position, so
`!` tells TypeScript to trust that the array isn't empty.

```ts
const toFix = (num: number): void =>{
    console.log(num.toFixed(2), typeof num)
}

const nresult = lastOf([10,20,30])
const sresult = lastOf(["hi","hi"]) 
```
No `<...>` was written at either call site — TypeScript INFERS what `item` is from the
argument actually passed in. `lastOf([10,20,30])` passes an array of numbers, so `item`
becomes `number` for that call, and `nresult` ends up typed `number`. `lastOf(["hi",
"hi"])` passes an array of strings, so `item` becomes `string` for THAT call, and
`sresult` ends up typed `string`. This is the key generic behavior: ONE function
definition, but the actual type used is decided fresh, per call, from what's passed in.

```ts
//toFix(sresult) //- here it caputures = Argument of type 'string' is not assignable to parameter of type 'number'. but how?, we at compile it know the return type of the function?
toFix(nresult)
```
My own question in the comment is worth answering directly: yes — because `item` was
resolved to `string` specifically for the `lastOf(["hi","hi"])` call, TypeScript already
knows, at compile time, that `sresult`'s type is `string`, not some vague "whatever
`lastOf` returns." The generic type flows all the way through: argument → `item` →
return type → the variable holding the result. That's the entire value generics add over
`any`: with `any`, `sresult` would just be `any`, and passing it to `toFix` (which wants a
`number`) would compile fine and then crash or misbehave at runtime. With the generic,
the mismatch is caught before the code ever runs. `toFix(nresult)` works because
`nresult` really is a `number`.

### File: `gen_a_task2.ts`

```ts
const pair = <t>(item: t): t[]=>{
    const data: [t,t] = [item,item]
    return data
}

console.log(pair(5))
console.log(pair('hi'))
```
`item: t` takes one value of whatever type `t` resolves to; `const data: [t,t]` is a
TUPLE (Module 32) made of exactly two elements, both forced to be the SAME type `t` —
notice `t` appears twice in the tuple annotation, both referring to the one type
parameter resolved for this call. Returning `data` as `t[]` (an array, not specifically a
tuple) is fine because a 2-element tuple of `t`s is perfectly compatible with "an array of
`t`s" — a tuple IS an array underneath, just with extra position/length guarantees that
get relaxed when returned as the plainer `t[]` type. `pair(5)` resolves `t` to `number`
and returns `[5, 5]`; `pair('hi')` resolves `t` to `string` and returns `['hi', 'hi']`.

### File: `gen_a_task3.ts`

```ts
const firstOrNull = <T>(arr: T[]): T | null => {
    return arr[0] ?? null;
}

console.log(firstOrNull([{id:1},{id:2}])?.id)
console.log(firstOrNull([]))
```
`T | null` is a union return type (Module 35) combined with a generic — "either an
element of type `T`, or literally `null`." `arr[0] ?? null` uses the nullish coalescing
operator: if `arr[0]` is `undefined` (empty array), fall back to `null`. For
`firstOrNull([{id:1},{id:2}])`, `T` is inferred as `{id: number}`, so the result is typed
`{id: number} | null` — which is exactly why `?.id` (optional chaining) is used right
after it: TypeScript knows the result MIGHT be `null`, so it won't let me write `.id`
directly without either narrowing it or using `?.` to safely short-circuit to `undefined`
if it is null. `firstOrNull([])` — an empty array literal — has TypeScript infer `T` as
essentially unconstrained here (no elements to infer FROM), and the whole call correctly
produces `null` at runtime.

```ts
// const simple = (arr: any[]): any => {
//     return arr[0] ?? null;
// }

// //console.log(firstOrNull(["Hi","Hi"]).toFixed()) // error this caught because of our type checking thing
// console.log(simple(["Hi","Hi"]).toFixed(2)) // no error danger
// //console.log(firstOrNull([])?.foo) // this is interfered and error says no exists // but in simple function it doesn't capture at compile time
```
This comment block is the direct, deliberate `any` vs generic comparison, and it's worth
sitting with. `firstOrNull(["Hi","Hi"]).toFixed()` is caught at compile time — `T` gets
inferred as `string` from the array of strings, so the result is `string | null`, and
`.toFixed()` (a number method) doesn't exist on that type; TypeScript stops me before
running. The `any[]`-based `simple` function offers NO such protection — `simple(["Hi",
"Hi"]).toFixed(2)` compiles cleanly (because `any` opts out of checking entirely) and
would crash at runtime instead, since strings don't actually have `.toFixed()`. Same bug,
caught at two very different times depending on whether `any` or a generic was used.

## Part B — Constraints and generic interfaces

### File: `gen_b_task1.ts`

```ts
const giveBonus = <T extends {salary: number}>(item: T):number =>{
    return item.salary + item.salary * 0.10;
}

console.log(giveBonus({ name: "K", salary: 50000 })  );
console.log(giveBonus({ id: "E-1", salary: 40000, dept:"IT"}) );

//giveBonus({ name: "K" })   error
```
`<T extends {salary: number}>` is a **generic constraint** — critically, this `extends`
does NOT mean class inheritance (that's a totally different use of the same keyword,
covered in Module 37). Here it means "`T` can be ANY shape, but whatever it is, it must
AT LEAST have a `salary: number` property." This is why `giveBonus` happily accepts an
object with `name` + `salary`, and separately accepts a completely different-shaped
object with `id` + `salary` + `dept` — both satisfy the constraint, even though they
don't match each other at all. `giveBonus({ name: "K" })` fails because it's MISSING the
one thing the constraint actually demands: `salary`.

### File: `gen_b_task2.ts`

```ts
interface Container<T>{
    data: T
}

const nContainer : Container<number> = {data: 90}
const sContainer : Container<string> = {data : "Hi"}
const arrContainer: Container<number[]> = {data: [90,90]}

console.log(nContainer.data.toFixed(2))
console.log(sContainer.data.toUpperCase())
console.log(arrContainer.data.length)
```
This is a **generic interface** — the interface itself takes a type parameter, just like
a function can. `Container<T>` doesn't commit to what `data` holds until it's actually
used: `Container<number>` makes `data` a `number` for that specific usage, `Container
<string>` makes it a `string`, `Container<number[]>` makes it an array of numbers. Unlike
the function calls in Part A, here `<...>` is written explicitly at each usage (`:
Container<number>`) — this matches the concise notes' rule: when it's a TYPE ANNOTATION
(not a function call TypeScript can infer the argument from), there's nothing for
TypeScript to infer `T` FROM, so I have to supply it myself. `nContainer.data.toFixed(2)`
works because TypeScript knows `data` is specifically `number` for that container;
likewise `.toUpperCase()` for the string one and `.length` for the array one.

### File: `gen_b_task3.ts`

```ts
interface Results<T>{
    ok: boolean,
    value: T,
    message?: string
}

const uObj : Results<{id:number,name:string}> = {ok: true,value:{id:101,name:"JK"}}
const lObj : Results<number[]> = {ok: true,value:[10,20,30]}
const sObj : Results<string> = {ok: true,value:"hellojs"}
```
Same generic-interface idea as `Container<T>`, but with extra fixed fields (`ok`,
optional `message`) alongside the generic one (`value: T`). This is the realistic shape
of an API-response wrapper: the "envelope" (`ok`, `message`) stays the same regardless of
what data is inside, while `value`'s actual type changes per use — an object shape for
`uObj`, a number array for `lObj`, a plain string for `sObj`. My own comment in the file
nails exactly why this matters: "works for all above three... because `<T>`, it detects
type in compile, so we can use for different data types, instead of writing different
interface dup for each" — that's correct. Without the generic, I'd need `ResultsObj`,
`ResultsNumberArray`, `ResultsString` as three separate, nearly-identical interfaces.

## Part C — Multiple type parameters and real-world generics

### File: `gen_c_task1.ts`

```ts
const toEntry=<T,K>(key: T,val:K):{key:T,value:K}=>{
    return {key: key,value: val}
}

console.log((toEntry("role", "admin")).value.toLocaleUpperCase())
console.log((toEntry("age", 24)).value.toFixed(1))
```
Two INDEPENDENT type parameters, `T` and `K` — they don't have to match each other (unlike
`gen_a_task2.ts`'s `pair`, where both tuple slots were forced to be the same `t`). For
`toEntry("role", "admin")`, `T` is inferred as `string` (from `"role"`) and `K` is
inferred as `string` (from `"admin"`) — just happens both are strings here, but they're
still tracked as separate parameters, which is why `.value.toLocaleUpperCase()` (a string
method) works: TypeScript knows `value`'s type is specifically whatever `K` resolved to.
For `toEntry("age", 24)`, `K` resolves to `number` this time, so `.value.toFixed(1)` (a
number method) is legal on THAT result instead.

### File: `gen_c_task2.ts`

```ts
type ScoreCard = Record<"math"|"science",number>

const myScoreboard: ScoreCard = {
    math: 70,
    science: 93
    //history: 90 it does not exists
}
```
`Record<K, V>` is a BUILT-IN generic type (not one I wrote) — "an object whose keys are
exactly the set `K` and whose values are all type `V`." Here `K` is the literal union
`"math" | "science"` and `V` is `number`, so `ScoreCard` demands an object with EXACTLY
those two keys, both mapping to numbers — no more, no fewer. Trying to add `history: 90`
would be rejected, since `"history"` isn't part of the `K` union at all — this is Record
combined with a literal union (Module 35) to get a fully closed, typo-proof key set.

```ts
interface HasId{
    id: string,
    price: number,
}

type gData<T extends HasId> = Map<string,T>;

const myMap: gData<{ id: string; price: number }> = new Map([
    ["PR-001", { id: "PR-001", price: 10 }]
]);

myMap.set("PR-002",{ id: "PR-002", price: 100 })
console.log(myMap)
```
`type gData<T extends HasId> = Map<string, T>` is a **generic type alias** — it defines a
reusable pattern ("a `Map` from string keys to some `T`-shaped value") where `T` is
constrained to at least have `HasId`'s shape (`id` and `price`). `gData<{id: string;
price: number}>` fills `T` in explicitly with an object type matching that constraint,
producing the concrete type `Map<string, {id: string; price: number}>`. `Map` itself is
ALSO a generic — a built-in one — taking two type parameters: the key type and the value
type, exactly the same pattern as my own `gData` alias, just with two slots (`K`, `V`)
instead of one.

### File: `gen_c_task3.ts` — the generic repository class

```ts
interface HasId{
    id: string
}

class Store<T extends HasId>{
    private myItems = new Map<string,T>

    add(item:T):T{
        this.myItems.set(item.id,item)
        return item
    }

    get(id:string):T|undefined{
        return this.myItems.get(id)
    }

    all():T[]{
        return [...this.myItems.values()]
    }
}
```
This is the module's big payoff — a generic CLASS, where `<T extends HasId>` means: this
class can manage ANY entity type, as long as that entity at least has an `id: string`
property (the constraint is what lets `item.id` be used safely inside `add()` — without
the constraint, TypeScript would have no idea whether a generic `T` even HAS an `.id` at
all). `private myItems = new Map<string, T>` stores items keyed by their own id. `add`
takes a `T`, stores it keyed by `item.id`, and returns it. `get` looks one up by id,
returning `T | undefined` (because a `Map.get()` on a potentially-missing key honestly
might find nothing — same `| undefined` shape seen with `.at()` in Module 32b). `all()`
spreads the Map's values into a plain array.

```ts
type User = {id: string,name:string}
type Books = {id: string,title: string}

const myUsers = new Store<User>();
const myBooks = new Store<Books>();

myUsers.add({id:"U-001",name:"Kishore"})
myUsers.add({id:"U-002",name:"Jk"})
myBooks.add({id:"B-001",title: "what is js"})

console.log(myUsers.all())
```
ONE class definition, but `Store<User>` and `Store<Books>` behave as two completely
separate, fully type-safe stores: `myUsers.add()` only accepts `User`-shaped objects
(`id` + `name`), `myBooks.add()` only accepts `Books`-shaped objects (`id` + `title`).

```ts
// the above generic is used to two types id shape, where in project 8 managers, we can do the same,
// but we need to write two seperate class to do this, if one we can manage but we lose type, let's say Users objects accidentally sends title 
// instead of name, it stores , [ { id: 'U-001', name: 'Kishore' }, { id: 'U-002', title: 'Jk' } ]
```
This comment captures exactly the right insight: without generics, I'd face a choice
between (a) writing a SEPARATE manager class per entity (duplicated logic for every new
entity type — the exact problem this module solves) or (b) writing ONE untyped manager
(using `any`) that technically works for everything but loses all safety — my own example
shows the real danger: a `User`-manager that secretly accepts a `title` field instead of
`name` wouldn't be caught at all, and I'd end up with a silently inconsistent array of
objects, some with `name`, some with `title`, discovered only much later when something
tries to read `.name` and gets `undefined`.

### File: `gen_keyof_task.ts`

```ts
const pluck = <T,K extends keyof T>(obj:T,key:K):T[K] =>{
    return obj[key];
}

const book = { id: "B-01", title: "Clean Code", pages: 300 };

pluck(book, "title")   
pluck(book, "pages").toFixed(2) 
// pluck(book, "author") //Argument of type '"author"' is not assignable to parameter of type '"title" | "id" | "pages"'.

//pluck(book, "title").toFixed(2) //Property 'toFixed' does not exist on type 'string'.
```
This is the densest line in the whole module, worth unpacking piece by piece:
- `keyof T` — a built-in operator that produces a UNION of all of `T`'s property names as
  literal string types. For `book`, `keyof T` would be `"id" | "title" | "pages"`.
- `K extends keyof T` — a constraint saying `K` must be ONE of those actual key names, not
  just any string. This is why `pluck(book, "author")` is rejected — `"author"` isn't one
  of `book`'s real keys, so it's not assignable to the constraint.
- `T[K]` — an **indexed access type** (same mechanism the concise notes describe for
  `typeof ROLES[number]` in Module 40): "the type of property `K` on object `T`." Since
  `K` is resolved per-call, `T[K]` resolves differently too: for `pluck(book, "pages")`,
  `K` is `"pages"`, so `T[K]` becomes `number` — which is exactly why `.toFixed(2)` is
  legal right after that call. For `pluck(book, "title")`, `K` is `"title"`, so `T[K]`
  becomes `string`, which is why trying `.toFixed(2)` on THAT result is rejected (a
  string has no `.toFixed`).

### Gotchas worth remembering from this module

- **Generic constraint (`extends` on a type parameter) is NOT class inheritance.**
  `<T extends {salary: number}>` and `<T extends HasId>` both mean "must at least have
  this shape," never "must be a subclass of this class." Very easy to mentally collide
  this with Module 37's `extends` on classes, since it's the exact same keyword doing a
  different job.
- **A constraint narrows what's ALLOWED in, but a generic (unlike a plain parameter typed
  with the constraint directly) keeps the FULL, specific type flowing through.**
  `<T extends HasId>(x: T): T` still returns the caller's exact, specific type (e.g. the
  full `User` shape with all its extra fields intact); a plain `(x: HasId): HasId`
  signature would narrow the return value down to JUST the constraint's shape, discarding
  any extra properties the caller's real object had. This is why `Store<T extends
  HasId>` is written with a generic rather than just typing everything as `HasId`
  directly — it would lose `name`/`title`/every entity-specific field on the way out.
- **Explicit `<...>` is required when there's no function call argument for TypeScript to
  infer FROM** — generic interfaces, generic type aliases, and generic classes instantiated
  with `new` (`Store<User>`, `Container<number>`) all need the type spelled out, because
  unlike a function call, there's no argument sitting there for TypeScript to read a type
  off of.
- **`keyof T` + `K extends keyof T` + `T[K]` together give fully type-safe, generic
  property access** — this combo rejects nonexistent keys (`pluck(book, "author")`) at
  compile time AND correctly narrows the RETURN type based on which real key was asked
  for, so `.toFixed()` is legal after plucking a number-typed key but not after plucking
  a string-typed one.
- **`this.get(id)` vs `this.items.get(id)` is a real, easy-to-make mistake** (flagged
  explicitly in the concise notes for this module) — calling the class's OWN `get` method
  from inside itself recurses infinitely, instead of calling the underlying `Map`'s
  `.get()`. Worth double-checking which `get` is actually being called whenever a
  wrapper class exposes a method with the same name as the thing it wraps.
