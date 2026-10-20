# Module 8 — Functions — NOTES

### What I learned today

JS has **three different ways to write a function**, and they're not just stylistic
alternatives — they behave differently in one important way: whether they can be *called
before the line where they're written* (hoisting). On top of that, this module introduced
two symmetrical but opposite ideas that both use the same `...` syntax: **rest** (gather
many arguments into one array) and **spread** (expand one array into many arguments) — and
the idea of a **callback**, a function passed into another function as a plain value, which
is the foundation for almost everything else coming later (array methods, promises, event
handlers).

### File: `func_revision.js` — line by line

```js
const gstAmount =(amount) =>{
    return amount +(amount * 0.18);
}

console.log(gstAmount(10000))
```
An **arrow function** assigned to a `const`. `(amount) => { ... }` — `amount` is the
**parameter** (a placeholder name); when called with `gstAmount(10000)`, `10000` is the
**argument** (the real value) that fills that placeholder for this one call. The body
computes `amount + (amount * 0.18)` — the original amount plus 18% GST on top — and
`return` sends that computed value back out to whoever called the function. `gstAmount
(10000)` → `10000 + 1800 = 11800`, printed.

```js
const totalAmount = (...amount) =>{
    let total = 0;
    for (const amt of amount){
        total +=amt;
    }
    return total;
}

console.log(totalAmount(1200,8000,450));
```
`...amount` is the **rest parameter** — instead of a fixed single value, it gathers *any
number* of arguments the function is called with into one real array named `amount`.
Calling `totalAmount(1200, 8000, 450)` means, inside the function, `amount` is the array
`[1200, 8000, 450]`, even though the caller never wrote an array literal themselves — JS
collects the loose arguments into one automatically. The `for...of` loop then walks over
each value in that array, adding it onto a running `total` (starting at `0`), and returns
the sum: `1200 + 8000 + 450 = 9650`, printed.

```js
const funcApprove = (pr, checkfn)=>{
    return checkfn(pr);

}

console.log(funcApprove({ amount: 24000 }, pr => pr.amount<25000))
console.log(funcApprove({ amount: 30000 }, pr => pr.amount<25000))
```
This is a **callback** in action: `funcApprove` takes two things — `pr` (an object) and
`checkfn` (**a function**, passed in as if it were any ordinary value like a number or
string). Inside the body, `checkfn(pr)` calls whatever function was handed in, passing it
`pr`, and returns whatever that call produces. The caller decides *what rule* to check by
supplying a different little arrow function each time:
- First call: `pr => pr.amount < 25000` is the `checkfn`, and `pr` here is `{ amount:
  24000 }`. `24000 < 25000` → `true` → `funcApprove` returns `true`, printed.
- Second call: same rule, but `pr` is `{ amount: 30000 }`. `30000 < 25000` → `false` →
  printed `false`.

The key idea: `funcApprove` itself never hardcodes the `< 25000` rule — it just knows "call
whatever function I was given, with the data I was given." The actual rule lives entirely
in the function that gets *passed in* at the call site. This is the pattern that later
becomes `.filter()`, `.map()`, `.then()`, event handlers, etc.

### File: `func_task1.js` — line by line (three ways to write the "same" function)

```js
function dprice(amount){
    return amount + (amount/100 * 18)
}
```
A **function declaration** — starts with the keyword `function`, has a name (`dprice`)
right in the definition. Computes amount-plus-18%, same formula shape as `gstAmount`
above, just written with `/100 * 18` instead of `* 0.18` (mathematically identical).

```js
const eprice = function(amount){
    return amount + (amount/100 * 18)
}
```
A **function expression** — the function itself has no name of its own (it's
*anonymous*); instead, it's created as a value and immediately stored into the constant
`eprice`. The *only* way to call it afterward is through that constant name (`eprice(...)`)
— the function doesn't have an independent name the way `dprice` does.

```js
const aprice = amount => ((amount/100) * 18)
```
An **arrow function** — the shortest of the three forms. Single parameter (`amount`), so
the parentheses around it can be dropped entirely. The body is a single expression
(`(amount/100) * 18`), so the curly braces *and* the `return` keyword can both be dropped —
whatever that one expression evaluates to is automatically returned. **Important
difference from the other two:** this formula computes *only* `(amount/100) * 18` — just
the 18% GST portion by itself, **not** `amount + that GST`. This is almost certainly an
unintentional inconsistency (see Gotchas) rather than a deliberate design choice, since the
variable is named `aprice` ("a-price," suggesting it's meant to parallel `dprice`/`eprice`
as "the final price including GST").

```js
console.log(dprice(1000))
console.log(eprice(1000))
console.log(aprice(1000))
```
`dprice(1000)` → `1000 + 180 = 1180`. `eprice(1000)` → same formula, same result, `1180`.
`aprice(1000)` → `(1000/100) * 18 = 180` **only** — not `1180`. Three functions that look
like they should be interchangeable actually produce two different answers.

### File: `func_task2.js` — line by line (default params and rest)

```js
const greet = (name = "Guest") =>{
    console.log("Hi " + name)
}
```
`name = "Guest"` is a **default parameter** — if the function is called *without* an
argument for `name`, JS automatically falls back to `"Guest"` instead of leaving it
`undefined`.

```js
const add = (...num) =>{
    let total = 0
    for(const nums of num){
        total += nums
    }
    return total
}
```
Same rest-parameter pattern as `totalAmount` earlier: `...num` collects every argument
passed in into a real array called `num`, then the loop sums them up.

```js
greet("JK")
```
Called *with* an argument, so the default is irrelevant — `name` becomes `"JK"`. Prints
`"Hi JK"`.

```js
greet()
```
Called with **no** argument at all — this is exactly the case the default parameter exists
for. `name` falls back to `"Guest"`. Prints `"Hi Guest"`.

```js
console.log(add(1,2,3))
```
`num` becomes `[1, 2, 3]` inside `add`, summed to `6`, printed.

### File: `func_task3.js` — line by line (callbacks + hoisting, three ways)

```js
const applyDiscount = (price, discountFn) => {
    return discountFn(price)
}

console.log(applyDiscount(1000, p => p- p * 0.10));
console.log(applyDiscount(1000, p => p - 50));     
```
Another callback example, same shape as `funcApprove`: `applyDiscount` doesn't know or
care *how* the discount is calculated — it just calls whatever `discountFn` it's handed,
passing in `price`. First call: `p => p - p * 0.10` is a 10%-off rule → `1000 - 100 = 900`,
printed. Second call: `p => p - 50` is a flat ₹50-off rule → `1000 - 50 = 950`, printed.
Same outer function, two completely different pricing rules, decided entirely by what gets
passed in at the call site.

```js
greetDecl();                     
function greetDecl() { console.log("declaration works early"); }
```
This calls `greetDecl()` **before** its definition appears in the file, and it works
without error, printing `"declaration works early"`. This is **hoisting**: function
*declarations* (the `function name() {}` form) are fully lifted to the top of their scope
by JS *before* any code runs — both the name and the entire function body are available
from line one, so calling it "early" in the source is completely safe.

```js
greetArrow();                        
const greetArrow = () => console.log("arrow");
```
This is the deliberate opposite experiment: calling `greetArrow()` before the `const
greetArrow = ...` line. Unlike the declaration above, **this does not work** — `const`
(and `let`) variables are hoisted in name only, but they sit in something called the
**Temporal Dead Zone (TDZ)** until the line that actually initializes them is reached.
Trying to access them before that point throws a real runtime error: `ReferenceError:
Cannot access 'greetArrow' before initialization`. So, if this file is actually run
top-to-bottom, **it crashes at this exact line** — the two `applyDiscount` outputs and
`"declaration works early"` print fine, and then the program stops here with an error,
never reaching the final `const greetArrow = ...` line at all. That crash isn't a mistake
in the file — it's the whole point of putting this experiment right next to the working
`greetDecl()` version: proving hands-on, not just by reading a rule, exactly how
differently the two function forms behave when called early.

### Gotchas worth remembering from this module

- **`func_task3.js` genuinely throws when run, and that's intentional.** `greetArrow()`
  called before its `const` definition is a live demonstration of the Temporal Dead Zone —
  calling a `const`/`let` arrow function before its declaration line is not just "returns
  undefined" or "silently does nothing," it's a hard `ReferenceError` that halts the whole
  script. Function *declarations* don't have this problem; arrow/expression functions
  stored in `const`/`let` always do. **Best practice: define a function before you use it,
  every time, regardless of which form it is** — don't rely on hoisting as a crutch.
- **`func_task1.js`'s `aprice` looks like it should match `dprice`/`eprice` but doesn't.**
  All three are visually similar ("compute GST-inclusive price"), but `aprice` only
  computes the GST *portion* (`(amount/100) * 18`), missing the `amount +` part the other
  two have. This is exactly the kind of bug that's invisible by reading the function name
  alone — the only way to catch it is to actually run all three with the same input and
  compare the outputs, which is precisely what `func_task1.js` does by calling all three
  with `1000` back to back.
- **Rest parameter (`...num`) is not the same as an array literal argument.** Calling
  `add(1, 2, 3)` with three separate loose arguments is what triggers JS to *collect* them
  into the array `[1, 2, 3]` inside the function — the caller never constructs an array
  themselves. This is the "many arguments in → one array inside" direction; spread (seen
  in Module 10 with `Math.max(...nums)`) is the exact reverse: one array → many separate
  arguments out.
- **Callbacks are "just passing a function as a value."** Nothing magical happens at the
  point `checkfn`/`discountFn` is passed in — it's exactly like passing a number or a
  string as an argument, except the value happens to be callable. The receiving function
  decides *when* and *how many times* to call it; the calling code decides *what logic* that
  callback actually contains.
- **Default parameters only kick in for a *missing* argument, not a falsy one.** `greet()`
  with zero arguments uses the default `"Guest"` — but calling `greet(undefined)`
  explicitly would also trigger the default (since the parameter is `undefined`), while
  calling `greet("")` or `greet(0)` would **not** trigger the default, because an argument
  genuinely *was* supplied, even if it's falsy. (Not shown directly in this file, but worth
  remembering since it's a natural follow-on question from Module 5's truthy/falsy rules.)
