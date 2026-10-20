# Module 32b — Type Assertions & Operators

### What I learned today

Everything in Module 32 was about TypeScript PROVING something is true (`typeof x ===
"string"`) before letting me use it as that type. This module is the opposite side of
that coin: sometimes I know something about a value that TypeScript genuinely cannot
figure out on its own, and I need a way to say "trust me" instead of proving it with a
runtime check. TypeScript gives me a handful of operators to do exactly that — `!`, `as`,
`as const`, and `satisfies` — and the single most important thing to understand about all
of them is that **none of them do anything at runtime**. They are pure compile-time
instructions to the type checker. If I'm wrong when I assert something, there's no
safety net left — the program just crashes, because by the time it's running, TypeScript
isn't watching anymore (same lesson as Module 31's "types vanish after compile," now
applied to assertions specifically).

### File: `assert_task.ts` — line by line

```ts
const nums = [5,10,15];

const last = nums.at(-1)!
const dec = last.toFixed(2)
```
`nums.at(-1)` returns the last element of the array — but TypeScript's type for `.at()`
is `number | undefined`, because `.at()` has no way to guarantee the array isn't empty
(an empty array's `.at(-1)` really would be `undefined`). The `!` at the end of
`nums.at(-1)!` is the **non-null assertion operator**: it tells TypeScript "I personally
guarantee this isn't `undefined`, strip that possibility from the type and trust me."
After the `!`, `last` is typed as plain `number`, which is why `last.toFixed(2)` (a
number-only method) is allowed on the very next line without any `typeof` check.
The catch: if `nums` had actually been empty, `last` would be `undefined` at runtime, `!`
would have done NOTHING to stop that (it's erased during compilation), and
`last.toFixed(2)` would crash with "Cannot read properties of undefined." The `!` only
silences the TYPE CHECKER's complaint — it adds no actual protection.

```ts
const config = {
    env: "prod",
    retry: 3
} as const
```
Without `as const`, TypeScript would look at this object literal and WIDEN its property
types: `env` would become the general type `string` (not the specific value `"prod"`),
and `retry` would become `number` (not specifically `3`). `as const` tells TypeScript the
opposite: "lock every property to its EXACT literal value, and make the whole object (and
all its properties) `readonly` while you're at it." That's two effects bundled into one
keyword — exact literal types, plus immutability.

```ts
//config.retry = 9 - Cannot assign to 'retry' because it is a read-only property.
```
This is the `readonly` half of `as const` in action. Reassigning `retry` is now a
compile error, something that would have been completely legal on a plain object literal
without `as const`.

```ts
interface id{id: string}

const raw1 = `{"id": "PR-001"}`
const raw2 = `{"amount": 500}`

const raw1obj = JSON.parse(raw1) as Partial<id>
const raw2obj = JSON.parse(raw2) as Partial<id>
```
`JSON.parse()` always returns the type `any` — TypeScript has genuinely no way to know
what shape of data is hiding inside a parsed JSON string, since the string itself could
contain anything. `as Partial<id>` is a type assertion: it tells TypeScript "treat this
as a `Partial<id>` from now on" — i.e., an object that MIGHT have an `id: string`
property, but might not (that's what `Partial` means — every property becomes optional).

Crucially, the choice of `Partial<id>` instead of plain `id` is deliberate and important
(this is straight out of the concise notes' reasoning): if I'd asserted `as id` instead,
I'd be telling TypeScript "this definitely, 100% has a string `id`" — a LIE for `raw2`,
which has no `id` field at all. TypeScript would believe that lie, compile cleanly, and
then crash or misbehave at runtime the moment code actually relied on `.id` existing.
`Partial<id>` is the "loosest HONEST" assertion — true for both `raw1obj` (which happens
to have an `id`) and `raw2obj` (which doesn't), because "maybe has an `id`" is accurate
for both.

```ts
const detect =(obj: Partial<id>):void=>{
    if(typeof obj.id === "string"){
        console.log(obj.id)
    }
    else console.log("invalid")
}

detect(raw1obj)
detect(raw2obj)
```
This is the second half of the "assert loosely, then verify" pattern: having honestly
typed the parsed JSON as "might have an id," I now actually PROVE whether it does, with a
real `typeof` check, before using `obj.id` as a string. `detect(raw1obj)` passes the
check and prints `"PR-001"`; `detect(raw2obj)` fails the check and prints `"invalid"` —
exactly the safe behavior that would have been silently skipped if I'd asserted the
confident-but-dishonest `as id` instead and never checked.

```ts
type prmObj = Record<string, string[]>

const pr = {admin: ["create","delete"],viewer: ["view"]} satisfies prmObj

console.log(pr.admin)
```
`Record<string, string[]>` describes "an object where any string key maps to an array of
strings" — a generic shape. `satisfies` is different from both `as` and a plain `:`
annotation: it VALIDATES that `pr` matches `prmObj`'s shape (so a typo or wrong value type
would still get caught), but unlike writing `const pr: prmObj = {...}`, it does NOT widen
`pr`'s type down to the generic `Record<string, string[]>` afterwards. TypeScript keeps
remembering that `pr` specifically has an `admin` key and a `viewer` key. That's exactly
why `pr.admin` on the next line is allowed and known to exist — if `pr` had actually been
widened to `Record<string, string[]>`, TypeScript would only know "some string key maps
to some string array," and would have no specific memory of an `admin` key at all (the
concise notes' `routes.xyz` example shows the same gap for a plain `:` annotation, where
accessing a key that doesn't actually exist isn't caught).

### Gotchas worth remembering from this module

- **`!` and `as` give ZERO runtime safety.** Both are compile-time-only instructions —
  by the time the code actually runs, there is no leftover check happening anywhere. If
  the assertion is wrong, the program just breaks (`undefined` has no `.toFixed()`,
  wrong-shaped data crashes downstream code) with none of the graceful "invalid" handling
  that a real `typeof`/`in` check (narrowing, Module 32) would have given me.
- **Never assert the full confident type on untrusted data — assert the loosest HONEST
  type instead, then verify.** `JSON.parse(...) as Partial<id>` + a `typeof` check is the
  safe pattern; `JSON.parse(...) as id` with no check is a crash waiting to happen the
  moment real-world data doesn't match my assumption.
- **`as const` does two things at once: locks literal values AND makes things readonly.**
  Easy to forget the readonly half exists until I actually try to mutate the object and
  get the "Cannot assign... read-only property" error, as happened with `config.retry`.
- **`satisfies` checks a shape without throwing away the specific, narrower type
  afterwards** — unlike a `:` type annotation, which can widen the variable down to the
  general type and make TypeScript "forget" the exact keys/values that are actually
  there. Reach for `satisfies` on things like config objects or permission maps
  (exactly `pr` here) where I want both the validation AND to keep using the precise
  shape afterwards.
- **General rule of thumb from this whole module: prefer PROVING (`typeof`, `in`,
  narrowing) over ASSERTING (`as`, `!`) whenever there's a real way to prove it.**
  Reach for an assertion only when TypeScript genuinely has no way to know better —
  parsed JSON, DOM queries, and similar "came from outside the type system" situations.
