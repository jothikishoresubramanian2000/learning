# Module 31 — Why TypeScript

### What I learned today

Up to now every bug I'd written in JavaScript followed the same pattern: write the code,
run it, and only THEN find out something was wrong — sometimes not even by an error, just
a silently broken number (`NaN`) or an `undefined` showing up somewhere it shouldn't.
JavaScript never stops you before you run the code. It has no concept of "this variable
is supposed to always be a number" — a variable is just a label that can point at
literally anything, any time.

TypeScript's whole pitch is: let me add that missing rule back in, but only while you're
writing the code — the instant you save the file, before you ever press run. The flow
changes shape:

```
JS:  write → RUN the code → 💥 bug shows up (maybe only in production, on a real user)
TS:  write → ❌ red squiggle in the editor → fix it → THEN compile → run clean
```

The core idea: TypeScript is JavaScript PLUS a type-checking layer bolted on top. It is
not a different language that runs differently — a `.ts` file gets its types stripped
out and becomes a completely ordinary `.js` file before Node or the browser ever sees it.
The checking only happens in between: while you're editing, and again when you compile.
Once it's `.js`, TypeScript is gone, and all its promises are gone with it (more on that
danger in later modules — `as` and `!` especially).

### File: `firstTypes.ts` — line by line

```ts
const addGst=(price: number):number=>{
    return price + price * 0.18
}
```
This is an arrow function, same shape as any JS arrow function I've written before, but
with two new pieces of text added:
- `price: number` — this says "the parameter named `price` must be a `number`." Before
  TypeScript, `price` could have been anything someone passed in — a string, an object,
  `undefined`. Now the compiler will refuse to let anyone call this function with
  anything that isn't a number.
- `:number` right after the closing `)` of the parameter list — this is the function's
  **return type**. It says "whatever this function gives back, it will be a number."
  TypeScript actually checks the body against this promise: if my `return` statement
  returned a string, TypeScript would flag that as an error too, even before calling it.

```ts
console.log(addGst(5000));
```
This line runs fine — `5000` is a real number, satisfies the parameter type, nothing to
complain about.

```ts
//console.log(addGst('string')); observed the error
```
This is commented out because when I typed it live, before even running anything, the
editor put a red squiggly line under `'string'` and told me it's not assignable to
`number`. I never got to see what WOULD have happened at runtime (probably
`"string" + "string" * 0.18` turning into garbage like `"stringNaN"`), because TypeScript
refused to let the file compile with this line active.

### File: `types_task2.ts` — line by line

```ts
let age: number
let name: string
let isAdult: boolean
```
Three variables declared with **no starting value**, only a type annotation. This is the
case the concise notes call out explicitly: when there's no assignment for TypeScript to
infer a type FROM, I have to write the type myself, otherwise TypeScript would treat the
variable as implicitly `any` (meaning "anything goes," which defeats the entire point).

```ts
// age = 'JK' error noted red squiggle
// name = true
// isAdult = 1
```
These are the three "wrong type" experiments, left in as comments so I could see the
error without breaking the runnable part of the file. Each one tries to put the wrong
kind of value into an already-typed variable: a string into a `number` slot, a boolean
into a `string` slot, a number into a `boolean` slot. All three get flagged.

```ts
age = 10
name = "Jk"
isAdult = true
```
And these are the correct assignments — matching value to declared type, no complaints.

### File: `types_task3.ts` and `types_task3_plain.js` — the side-by-side comparison

This pair of files is the most important thing in this module, because it's the direct,
concrete proof of the "write → RUN → bug" vs "write → ❌ before running" difference from
my notes above.

`types_task3_plain.js` (plain JavaScript, no types at all):
```js
const addGst=(price) =>{
    console.log(price + price * 0.18)
}
addGst('hi')
```
Here `price` has no type — it's just a name. When this runs, `price` is the string
`'hi'`. `price * 0.18` tries to multiply a string by a number: JavaScript coerces `'hi'`
towards a number, fails, and the result is `NaN` ("Not a Number"). Then
`'hi' + NaN` glues them together as a string: the final printed output is literally the
text `"hiNaN"`. Nothing crashes. Nothing warns me. If this were buried inside a real app,
I might not notice for a long time that `addGst` has been quietly producing garbage.

`types_task3.ts` (same logic, now typed):
```ts
const addGst=(price: number):number=>{
    return price + price * 0.18
}
console.log(addGst('hi'))// refused to compile
```
Same intention, but `price: number` is now a promise the function makes about its input.
Calling `addGst('hi')` tries to break that promise, and TypeScript simply refuses to
compile the file at all — the comment "refused to compile" is literally what happened:
this never got the chance to produce `"hiNaN"`, because it never got the chance to run.

### Gotchas worth remembering from this module

- **TypeScript checking disappears completely once compiled to `.js`.** The `.ts` file
  is a development-time safety net; the file that actually runs (plain `.js`, after
  `tsc` strips the types) behaves exactly like `types_task3_plain.js` would if you
  bypassed the type checker. This matters a lot later (Module 32b) once `as` and `!`
  show up — those are ways to tell TypeScript "trust me," and TypeScript will trust you
  all the way into a runtime crash if you're wrong, because there's no type information
  left at runtime to catch the mistake.
- **No starting value means you must annotate.** `types_task2.ts`'s `let age: number`
  pattern — if I'd written `let age` with nothing else, TypeScript would've silently
  treated it as `any`, silently letting go of exactly the safety I was trying to add.
- **A parameter type is a two-way promise.** It restricts what callers can pass in
  AND (with a return type) what the function itself is allowed to give back. Both ends
  get checked, not just the input side.
- **`tsconfig.json`** is the compiler's settings file (saw it sitting next to every
  task file) — things like `strict` (turns on the stricter rules, which I want), `outDir`
  (where the compiled `.js` goes), and `target` (which JS version to compile down to)
  live there. I haven't had to hand-edit it yet, but I now know what it's for.
