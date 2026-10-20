# Module 10 — Arrays — NOTES

### What I learned today

Arrays are JS's main list type, and this module split cleanly into two halves. The first
half is **basic mutation and search** — adding/removing elements, copying vs. mutating,
checking membership. The second half is the **"power methods"** — `map`, `filter`, `find`,
`reduce`, `sort`, and friends — which all take a **callback function** as their argument
(straight from Module 8) and are the backbone of how real backend code transforms lists of
data (think: an array of database rows). Arrays are also a **reference type**, exactly like
plain objects from Module 3, so the same copy-vs-reference trap applies here too — and one
of my own files demonstrates it directly.

### File: `array_task1.js` — line by line (the four "door" methods)

```js
let fruits = ["apple", "banana"]
```
An **array literal** — square brackets, comma-separated values. `fruits` starts as
`["apple", "banana"]`.

```js
fruits.push("mango")
```
`.push(value)` adds a value to the **end** of the array, mutating it in place (no new
array is created). Now `fruits` is `["apple", "banana", "mango"]`.

```js
fruits.unshift("grape")
```
`.unshift(value)` adds a value to the **start** of the array — the mirror-image of
`push`. Now `fruits` is `["grape", "apple", "banana", "mango"]`.

```js
fruits.pop()
```
`.pop()` removes and returns the **last** element (here, `"mango"` is removed; its return
value isn't captured anywhere in this file, so it's just discarded). Now `fruits` is
`["grape", "apple", "banana"]`.

```js
console.log(fruits)
console.log(fruits.length)
```
Prints `["grape", "apple", "banana"]`, then `3`. These four methods (`push`/`pop` for the
back, `unshift`/`shift` for the front — `shift` isn't used in this file but is `unshift`'s
remove-counterpart) are the basic "doors" for adding/removing single elements, and all four
mutate the original array directly.

### File: `array_task2.js` — line by line (`slice` vs `splice`)

```js
let nums = [1,2,3,4,5];

let cnums = nums.slice(1,4)
console.log(cnums)
console.log(nums)
```
`.slice(start, end)` returns a **copy** of a range — from index `start` up to but **not
including** index `end`. `nums.slice(1, 4)` grabs indexes `1, 2, 3` → `[2, 3, 4]`, stored in
`cnums`. Critically, `nums` itself is **completely untouched** by `.slice()` — printing
`nums` right after still shows the full original `[1, 2, 3, 4, 5]`.

```js
nums.splice(1,2)
console.log(nums)
```
`.splice(start, deleteCount)` is the opposite kind of operation — it performs **surgery
directly on the original array**, removing `deleteCount` elements starting at index
`start`. `nums.splice(1, 2)` removes 2 elements starting at index 1 (that's `2` and `3`),
and this time `nums` *itself* changes: it becomes `[1, 4, 5]`.

The one-letter difference between `slice` and `splice` hides a completely opposite
behavior — `slice` is safe and non-destructive (a copy), `splice` mutates the real array in
place. This pairing is directly back-to-back in this file specifically to make that
contrast obvious.

### File: `array_task3.js` — line by line (reference sharing, again)

```js
let a = [10,20,30];

let b = a;

b.push(40);
console.log(a);
```
Exactly the Module 3 reference-type trap, now with arrays instead of plain objects: `b = a`
does **not** copy the array — `b` becomes a second label pointing at the *same* array `a`
points to. Calling `.push(40)` through `b` mutates that one shared array, so `console.log
(a)` (reading through the *other* label) also shows the new element: `[10, 20, 30, 40]`.

```js
let c = [...a];

c.push(50);
console.log(a)
console.log(c)
```
`[...a]` is the **spread operator** used to build a genuinely new, independent array —
copying `a`'s current elements (`[10, 20, 30, 40]`, since the previous push already
happened) into a brand new array `c`. This time, `.push(50)` on `c` does **not** affect
`a` at all, because `c` is a real, separate array now. `console.log(a)` still shows `[10,
20, 30, 40]`, while `console.log(c)` shows `[10, 20, 30, 40, 50]` — proof that spread
actually broke the reference-sharing, unlike plain `=`.

```js
const arr = [10,20,30];
console.log(arr.includes(20))
console.log(arr.indexOf(30))
```
A fresh, separate array for two search methods. `.includes(value)` returns a plain
boolean — is this value present anywhere in the array? `20` is present → `true`.
`.indexOf(value)` returns the **position** of the first match, or `-1` if not found. `30`
is at index `2` → `2`.

### File: `array_task4.js` — line by line (`map` and `filter`)

```js
let prices = [100,250,80,400]

let gstPrices = prices.map(p => (p*0.18) + p);

console.log(gstPrices)
```
`.map(callback)` builds a **brand new array**, same length as the original, where each
element is the result of running the callback on the corresponding original element. For
every price `p`, this computes `p + 18%` of itself. `100 → 118`, `250 → 295`, `80 → 94.4`,
`400 → 472`. Printed: `[118, 295, 94.4, 472]`. `prices` itself is untouched — `map` never
mutates the original array, it only ever produces a new one.

```js
let highAmount = prices.filter(a => a> 100);

console.log(highAmount)
```
`.filter(callback)` also builds a new array, but instead of transforming every element, it
**keeps only the ones where the callback returns true**, dropping the rest — so the result
can be shorter than the original (or the same length, or even empty). `100 > 100` is
`false` (`100` itself doesn't survive), `250 > 100` is `true`, `80 > 100` is `false`, `400 >
100` is `true`. Result: `[250, 400]`.

### File: `array_task5.js` — line by line (`find`, `reduce`, `sort`)

```js
let nums = [40, 10, 30, 20];

let number1 = nums.find(a => a > 25);

console.log(number1)
```
`.find(callback)` scans the array **in order** and returns the **first** element where the
callback is true (or `undefined` if nothing matches) — not an array of all matches, just
one value. Going through `40, 10, 30, 20`: `40 > 25` is already `true`, so `find` stops
immediately and returns `40` — it never even checks `10`, `30`, or `20`, even though `30`
would also have matched.

```js
let sum = nums.reduce((acc,n)=>acc+n,0);
console.log(sum);
```
`.reduce((accumulator, currentValue) => ..., startingValue)` boils the whole array down to
a single value. `acc` starts at `0` (the second argument to `reduce`); each pass adds the
current element onto it: `0+40=40`, `40+10=50`, `50+30=80`, `80+20=100`. Final result: `100`,
printed.

```js
nums.sort((a,b)=> a-b); 
console.log(nums)
```
`.sort(compareFunction)` with `(a, b) => a - b` sorts the array **numerically in ascending
order**, and — unlike `map`/`filter`/`find`/`reduce` — `.sort()` **mutates the original
array in place**. Before: `[40, 10, 30, 20]`. After: `[10, 20, 30, 40]`, and that's also
what gets printed.

```js
console.log(nums.sort())// sort as text normal sort
```
This line calls `.sort()` **with no comparison function at all** — my own comment flags
that this is meant to demonstrate "sort as text." By default, JS's `.sort()` converts every
element to a **string** and sorts those strings alphabetically, which usually does not
match numeric order. However, in this *specific* case, `nums` is already `[10, 20, 30,
40]` — and because every one of these numbers happens to have exactly two digits, sorting
them as text (`"10"`, `"20"`, `"30"`, `"40"`) still lands in the same order as sorting them
numerically, so the printed result here is still `[10, 20, 30, 40]` — no visible difference
from the line above. The comment's *intent* is correct (default `.sort()` really does sort
as text), but this particular data doesn't happen to reveal the bug, because it needs
numbers with different digit counts to actually show a mismatch — e.g. `[10, 2, 1].sort()`
gives the wrong-looking `[1, 10, 2]` (because as text, `"1" < "10" < "2"`), which *would*
visibly differ from numeric order. Worth remembering that "my test passed" doesn't always
mean "my understanding is confirmed" — the data has to be chosen carefully to actually
expose the behavior being tested.

### File: `array_task6.js` — line by line (method chaining on an array of objects)

```js
let orders = [
          { item: "pen",    amount: 50  },
          { item: "laptop", amount: 800 },
          { item: "book",   amount: 120 },
          { item: "mouse",  amount: 90  }
        ]
```
An **array of objects** — the shape that real backend data almost always comes in (think:
rows returned from a database query, or items in an API response body). Each element has
two fields, `item` and `amount`.

```js
const total = orders
  .filter(o => o.amount > 100)   // keep big orders
  .map(o => o.amount)            // pull amounts
  .reduce((acc, n) => acc + n, 0); // sum
console.log(total);   
```
A **method chain** — because `.filter()` returns a new array, I can immediately call
another array method (`.map()`) directly on *that* result, and then another (`.reduce()`)
on *that* result, all in one connected expression, without ever creating intermediate
named variables. Step by step:
1. `.filter(o => o.amount > 100)` keeps only orders with `amount > 100`: `pen` (50, dropped),
   `laptop` (800, kept), `book` (120, kept), `mouse` (90, dropped) → produces
   `[{item:"laptop",amount:800}, {item:"book",amount:120}]`.
2. `.map(o => o.amount)` pulls just the `amount` field out of each surviving object →
   produces `[800, 120]`.
3. `.reduce((acc, n) => acc + n, 0)` sums those amounts starting from `0` → `800 + 120 =
   920`.

So `total` is `920`, printed. The callback parameter name `o` (short for "order") is
chosen by me each time I write the callback — it's not special syntax, it's just the local
name I'm giving to "whichever element the method is currently handing me."

### Gotchas worth remembering from this module

- **`slice` copies, `splice` mutates — a single letter hides opposite behavior.**
  `array_task2.js` shows this directly: `.slice(1,4)` leaves `nums` fully intact,
  `.splice(1,2)` permanently removes elements from `nums` itself.
- **Arrays are reference types, exactly like objects.** `array_task3.js`'s `let b = a;`
  followed by `b.push(40)` changing what `a` sees is the array version of the Module 3
  `user1`/`user2` object trap. The fix is the same: use `[...a]` (spread) for a real,
  independent copy — which the same file then demonstrates actually works (`c = [...a]`
  genuinely breaks the shared reference).
- **Default `.sort()` sorts as text, and `array_task5.js`'s own test data doesn't actually
  reveal it.** Comparing elements as strings means `"100" < "25"` (because `"1" < "2"` as
  the very first character), which is backwards from numeric order — but this bug only
  shows up with numbers of different digit-lengths. Always pass an explicit comparator —
  `(a,b) => a-b` for ascending, `(a,b) => b-a` for descending — any time sorting numbers,
  regardless of whether the specific data in front of me happens to "look" sorted already.
- **`.sort()` mutates in place; `.map()`/`.filter()`/`.find()`/`.reduce()` do not.** This
  is an important split to remember: the "transform into something new" methods are all
  non-destructive (safe to chain, safe to call repeatedly), while `.sort()` and `.reverse()`
  change the original array and return that same mutated array, not a fresh copy.
- **`.find()` stops at the *first* match, not all matches.** `array_task5.js`'s `nums.find
  (a => a > 25)` returns `40` and never even looks at `30`, even though `30` also satisfies
  the condition — this is different from `.filter()`, which would have returned *every*
  matching element as an array (`[40, 30]`).
- **`reduce`'s starting value (`0` in every example here) genuinely matters.** Leaving it
  out, or picking the wrong starting value (e.g. starting a sum accumulator at `1` instead
  of `0`), silently shifts every result — it's not optional boilerplate, it's the seed the
  whole calculation builds from.
