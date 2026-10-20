# Module 32 — Basic Types

### What I learned today

Module 31 showed me the basic shape of typing a function parameter. This module is about
the actual vocabulary of types TypeScript gives me for everyday values: the primitives
(`string`, `number`, `boolean`), arrays, and the special "fixed-length, fixed-order"
array called a **tuple**. It's also where I ran into **inference** properly for the first
time — TypeScript doesn't need me to write a type EVERY time; if I give it a starting
value, it can usually figure the type out on its own, and once it has, it locks that
variable to that type forever (no more reassigning to something else). And it's where I
met the two "types for things I don't know yet" — `any` (give up entirely) and `unknown`
(stay safe, but prove it before using it).

### File: `types_task1.ts` — line by line

```ts
let Aname: string = "kishore"
let Asalary: number = 10
let AisActive = true
```
The first two have an explicit type annotation (`: string`, `: number`) even though
TypeScript could have figured both out from the value on the right. The third,
`AisActive`, has NO annotation at all — I just assigned `true` straight away. This is
**inference**: TypeScript looks at the value being assigned, sees it's a boolean, and
silently decides "this variable is a `boolean`" without me spelling it out. From this
point on `AisActive` behaves exactly as if I'd written `let AisActive: boolean = true` —
TypeScript remembers the inferred type and will still reject a wrong-type reassignment
later.

```ts
let Bname = "JK"
let Bsalary = 10
let BisActive = false
```
Same thing, but now ALL THREE rely purely on inference — no explicit annotation
anywhere. This is deliberate: the comment underneath explains what I was testing.

```ts
//Bname = 10 error noted, so the inline assignement is taken as type, if not any, so if incline type is given
// we cannot assign wrong type afterwards!
```
This is the actual discovery of the module: even though `Bname` never got an explicit
`: string`, the moment I wrote `let Bname = "JK"`, TypeScript locked it in as a string
type behind the scenes. Trying `Bname = 10` afterwards is just as much an error as it
would be if I'd explicitly annotated it `string`. Inference isn't "no type" — it's
"TypeScript worked the type out itself instead of me telling it," and the enforcement is
identical either way.

### File: `types_task2.ts` — line by line

```ts
let marks: number[] = [40,55,77]
```
`number[]` means "an array where every single element must be a `number`." The `[]`
after a type is the array-of syntax (the notes mention `Array<number>` as an equivalent
alternative form — same meaning, different spelling).

```ts
marks.push(90,60)
```
Pushing two more numbers onto the array — totally fine, matches the declared element
type.

```ts
//marks.push('100') // error noted, we said array as number of arrays, but it resolved to error when I assign string
```
Trying to push the STRING `'100'` (not the number `100`) gets flagged, because
`number[]` means every element, including ones added later with `.push()`, must stay a
number. The type isn't just checked at the moment of the initial assignment — it's
enforced for the whole lifetime of the array.

```ts
let departments: string[] =['IT','HR','FINANCE']
```
Same array-of-a-type idea, now with strings.

```ts
let users : [string,number]= ['jk',25]
```
This is a **tuple**, not a plain array — notice the annotation is `[string, number]`
with square brackets containing a comma-separated LIST of specific types, not a single
type followed by `[]`. A tuple fixes both the LENGTH and the ORDER: position 0 must
always be a `string`, position 1 must always be a `number`. A plain `string[]` wouldn't
care how many elements there are or what's at which index, as long as every element is a
string; a tuple cares about both.

```ts
//users = [25,"PK"] // error says we are assigning wrong types
```
Swapping the order (`number` first, `string` second) breaks the tuple's fixed
positions — TypeScript checks index 0 against `string` and finds `25`, a mismatch.

```ts
//users.push(90,'SK) // this actually works beneath, since it extends array?
```
This comment is me noticing a real, slightly surprising TypeScript gotcha: pushing EXTRA
elements onto a tuple via `.push()` is not blocked the same strict way reassigning the
whole tuple is. That's because under the hood, at runtime, a tuple IS just a regular
JS array — TypeScript's tuple typing mostly protects the shape you declared and read
through index access, but `.push()` was historically looser about extending that array
past its declared length. (Note the typo in my own comment — a missing closing quote on
`'SK` — which is itself a small reminder that commented-out exploratory code should still
be written carefully, since it's part of the permanent record of what I tried.)

### File: `types_task3.ts` — line by line

```ts
let name 

name = 'jk';
name = 80

function getsomething(){
    return "hi"
}
name = getsomething();
```
`name` is declared with NO type annotation and NO initial value. Because there's nothing
for TypeScript to infer from at the point of declaration, `name` ends up as the implicit
`any` type — meaning literally anything can be assigned to it, and it will happily accept
a string, then a number, then the return of a function, with zero complaints. This is
the exact danger Module 31 warned about: `any` isn't "a type TypeScript picked for me,"
it's "type-checking switched OFF for this variable."

```ts
let nameU :unknown = getsomething()
```
This is the safe alternative to `any`. `unknown` says "this could be anything — I'm not
pretending to know what, the way `any` does — but I'm not giving up safety either."

```ts
//nameU.toUpperCase()// error says it is unknown
```
This is the whole point of `unknown` made concrete: even though I KNOW in this file that
`getsomething()` returns a string, TypeScript does not let me call `.toUpperCase()`
(a string-only method) on something typed `unknown`, because as far as the type system
is concerned, it could be a number, an object, anything — and calling a string method on
a non-string would crash at runtime. `unknown` forces me to prove the type before I'm
allowed near it.

```ts
if(typeof nameU == "string"){
    nameU = nameU.toUpperCase()
}

console.log(nameU)
```
This `if` with `typeof` is called **narrowing** — proving to TypeScript, with an actual
runtime check, exactly what type a value is before using type-specific behavior on it.
Inside this `if` block, TypeScript has observed the `typeof nameU == "string"` check and
temporarily treats `nameU` as a `string` just for the code inside the braces, which is
why `.toUpperCase()` is suddenly legal here but wasn't two lines above.

### Gotchas worth remembering from this module

- **Inference locks in a type just as hard as an explicit annotation does.** `Bname`
  never got a `: string`, but reassigning it to `10` is still an error — "no annotation"
  does not mean "no type," it means "TypeScript figured the type out for you."
- **No type + no initial value = implicit `any`.** `types_task3.ts`'s bare `let name`
  is the trap: `any` isn't a deliberate choice here, it's what happens by DEFAULT when
  TypeScript has nothing to infer from and nothing was annotated. This is exactly why the
  concise notes say to annotate "empty declarations" — variables declared with no value
  yet — even when the value will obviously be some specific type later.
- **Tuples enforce position and length on direct assignment, but `.push()` can sneak
  past the length check.** `users.push(90, 'SK')` would add elements beyond index 1
  without the same strict rejection a full reassignment gets. Don't rely on a tuple type
  to stop array-mutation methods from growing the array past its declared shape.
- **`unknown` is deliberately unusable until narrowed.** That's a feature, not an
  annoyance — it's what makes it the "safe `any`": you're forced to write a real check
  (`typeof`, later `in`, `instanceof`, etc.) before touching the value, so a wrong
  assumption gets caught by that check instead of crashing deep inside some method call.
