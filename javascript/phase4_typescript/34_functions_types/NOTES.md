# Module 34 — Functions with Types

### What I learned today

Module 31 already typed a simple function's parameter and return value. This module
widens that out to every shape a JS function parameter list can take — default values,
optional parameters, and "rest" parameters (the `...args` pattern) — and adds something
new: the idea that a FUNCTION itself can have a type, separate from any specific function
that implements it. That's the piece that makes typed callbacks possible, and it's the
seed of what an `interface` method signature is really doing (Module 33's note that "an
interface only cares the return type is `Promise<...>`" is the same idea one level up).

### File: `fn_task1.ts` — line by line

```ts
const makeGst = (price: number):number =>{
    return price + price * 0.18;
}
```
Same pattern as Module 31 — nothing new here, just a warm-up repeat.

```ts
const greet = (name: string, greets:string= "Hi"): string =>{
    return `${greets} ${name}`
}
```
`greets:string= "Hi"` is a parameter with BOTH a type annotation and a default value.
Reading it carefully: `greets` must be a `string` (the annotation), and if the caller
doesn't pass anything for it, it defaults to `"Hi"`. Giving a default automatically makes
a parameter optional to the CALLER — nobody is forced to pass a second argument.

```ts
console.log(greet('Kishore'))
console.log(greet('Kishore','Hello'))
```
Both calls are valid: the first relies on the default (`greets` becomes `"Hi"`), the
second overrides it (`greets` becomes `"Hello"`).

```ts
//makeGst('Hi')//Argument of type 'string' is not assignable to parameter of type 'number'.
```
The expected type-mismatch error, consistent with everything in Modules 31-32.

### File: `fn_task2.ts` — line by line

```ts
const total = (...amounts: number[]):number =>{
    return amounts.reduce((acc,n)=> acc + n,0)
}
```
`...amounts: number[]` is a **rest parameter** — it collects any number of leftover
arguments into a real array called `amounts`, and the type annotation says every one of
those collected arguments must be a `number`. Inside the function, `amounts` behaves like
an ordinary `number[]`, which is why `.reduce(...)` with the accumulator pattern
(`acc + n`, starting at `0`) works exactly as it would on any array.

```ts
const logPr =(id: string): void=>{
    console.log(`PR: ${id}`)
}
```
`: void` as a return type means "this function doesn't return a meaningful value" — it's
used here for a function whose entire job is a side effect (`console.log`), not producing
data to hand back to the caller. This is different from `undefined` as a value;
`void` specifically communicates INTENT — "don't expect anything useful back from
calling this."

```ts
console.log(total(10,20,30))
logPr("PR-001")
```
`total(10,20,30)` — three separate arguments all get swept into the `amounts` array as
`[10,20,30]`, and `reduce` adds them to `60`. `logPr("PR-001")` just logs the formatted
string.

### File: `fn_task3.ts` — line by line

```ts
type numMath=(price: number)=>number
```
This is the new, central idea of the module: a **function type signature**. It isn't a
function — it's a TYPE that any function matching this shape can be checked against:
"takes one `number` parameter, returns a `number`." This type has a name
(`numMath`) I can now use anywhere I want to say "I need a function shaped like this."

```ts
const tenPercent :numMath = (price) => price * 0.9
const flat50: numMath =(price)=> price - 50
```
Both of these are ACTUAL functions, but notice neither one has to write `price: number`
or `: number` explicitly on itself — because the variable is already annotated
`: numMath`, TypeScript already knows the shape expected, and infers `price`'s type FROM
that annotation (this is a different direction of inference than Module 32's "infer from
the initial value" — here TypeScript infers a parameter's type by matching it against an
already-known function type). This is the TypeScript equivalent of implementing an
interface's method body (echoing Module 33's note: "interface declares the contract with
types; implementation provides the body with inferred types").

```ts
const applyDiscount = (price: number, fn: numMath): number =>{
    return fn(price)
}
```
Here's the actual payoff: `applyDiscount` takes a `price` AND a `fn` parameter typed as
`numMath` — meaning `applyDiscount` will accept ANY function matching that shape, not
just `tenPercent` or `flat50` specifically. This is a **typed callback** — the function
being passed in is itself type-checked, just like any other parameter.

```ts
console.log(applyDiscount(1000,tenPercent))
console.log(applyDiscount(1000,flat50))
```
Passing `tenPercent` gives `1000 * 0.9 = 900`; passing `flat50` gives `1000 - 50 = 950`.
Two completely different functions, both accepted by `applyDiscount` because both satisfy
the `numMath` shape — this is what makes `numMath` genuinely useful: it describes a
CATEGORY of functions, not one specific implementation.

### Gotchas worth remembering from this module

- **`?` (optional) and `= default` (default value) cannot be combined on the same
  parameter.** A default value already implies the parameter is optional (the caller
  doesn't have to supply it), so adding `?` on top is redundant and TypeScript disallows
  it. The meaningful difference between the two: a plain `?` parameter, if omitted,
  becomes `undefined` inside the function body and the code has to handle that; a
  `= default` parameter, if omitted, is auto-filled with a real, usable value — never
  `undefined` inside the body.
- **All parameters must be typed; only the return type is optional** (though writing it
  explicitly on any function meant to be called from elsewhere, i.e. a "public" function,
  is good practice — it documents the contract and catches a wrong `return` statement
  even if nobody passes bad arguments).
- **A function type signature (`type numMath = (price: number) => number`) describes a
  SHAPE, and multiple unrelated function implementations can all satisfy that same
  shape** — this is exactly how typed callback parameters work (`fn: numMath` inside
  `applyDiscount`), and it's the same underlying mechanism an interface method signature
  uses to let many different classes "implement" the same method contract differently
  (a preview of Module 37's `implements`).
- **Rest parameters (`...amounts: number[]`) type the COLLECTED ARRAY, not each
  individual argument separately** — the annotation goes on the array type, since by the
  time the function body sees `amounts`, the individual arguments have already been
  gathered into one real array.
