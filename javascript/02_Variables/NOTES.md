# Module 2 — Variables — NOTES

### What I learned today

A variable is just a named box that holds a value, same idea as Python. The difference is
JS gives me **three different keywords** to make that box (`const`, `let`, `var`), and
each one has different rules about whether the box's contents can be swapped out later.
Python doesn't make me choose — every name can always be reassigned. JS forces the choice
up front, which turns out to be a feature: it documents intent. If I see `const` in code,
I immediately know "this name will never point to something else," without reading any
further.

**The three keywords:**

| Keyword | Can I reassign it? | When to use it |
|---------|---------------------|-----------------|
| `const` | No | Default choice — use this unless you have a reason not to |
| `let`   | Yes | Only when I know the value will change later |
| `var`   | Yes | Never — it's the old way, has scoping bugs, avoid entirely |

The rule I'm trying to build as a habit: **start with `const`. Only switch to `let` if
the code genuinely needs to reassign that name. Never type `var`.**

### File: `variables.js` — line by line

```js
const emp_name = new Set();
```
`const` declares a variable that can never be *reassigned* — `emp_name` will always point
to this same Set object for the rest of the file; I can't later write `emp_name = 5`.
`new Set()` creates a brand-new, empty **Set** — a collection type built for storing a
group of values where every value is guaranteed unique (no duplicates allowed). That's a
Module 24 topic really, but the point for *this* module is just: `const` locks the name to
this one Set object, not to what's inside it.

```js
// const dept = `Software`;
// let salary = 10000;
// let isLoggedIn = false;
```
These three lines are commented out (prefixed with `//`, so Node ignores them entirely —
they exist only as a record of what I was originally practicing before I moved on to the
Set experiment below). They show the three building blocks of variable declaration:
- `const dept = \`Software\`;` — a **template literal** (backtick string) holding a
  department name, declared as `const` because a department name read from input generally
  wouldn't need to change in this toy example.
- `let salary = 10000;` — declared with `let` specifically *because* the very next
  commented line reassigns it. If I never planned to reassign `salary`, it should have
  been `const`.
- `let isLoggedIn = false;` — a boolean flag, also `let` because its whole purpose is to
  flip from `false` to `true` later (a login state changing).

```js
// salary = 11000;
// isLoggedIn = true;
```
This is the *reassignment* step — proof of why `salary` and `isLoggedIn` needed `let`.
Notice: no `let` or `const` keyword here, just `name = newValue`. That's the correct way
to reassign an *existing* `let` variable — you declare it once with the keyword, then
every later change is just `name = value` with no keyword in front.

```js
// console.log(emp_name);
// console.log(dept);
// console.log(salary);
```
These would have printed the values out, confirming the reassignment worked. All
commented out because the file's focus shifted to the Set exercise below.

```js
emp_name.add('kishore')
```
`.add(...)` is a method on a Set — it's how you put a value *into* a Set (Sets don't use
`push` like arrays do, because a Set isn't ordered the same way an array is). After this
line, the Set holds one value: `'kishore'`.

```js
emp_name[1] = 'p'
```
This line looks like array-style indexing (`something[1] = value`), but `emp_name` is a
**Set**, not an **array** — and Sets don't support index-based access or assignment the
way arrays do. Under the hood, every object in JS (and a Set is a special kind of object)
can have arbitrary named properties attached to it, even numeric-looking ones like `"1"`.
So this line doesn't add `'p'` as a *member of the Set's collection* — it just bolts on an
ordinary property called `"1"` directly onto the `emp_name` object, completely separate
from the Set's actual stored values. This is a real trap (see Gotchas below).

```js
console.log(emp_name);
```
Prints the Set. Node's console formats a Set as something like `Set(1) { 'kishore' }` —
it shows the *actual Set contents* (just `'kishore'`), not the stray `"1"` property I
bolted on in the previous line. That property still exists and is reachable via
`emp_name[1]` (which would give back `'p'`), but it's invisible in the normal Set print-out
because it isn't part of the Set's real element collection.

### Other Module 2 concepts (not directly in this file, but part of the module)

- **Declaring without a value:** `let x;` creates the variable but it holds `undefined`
  until something is assigned to it. `const x;` with no value is **not allowed** — JS
  throws a syntax error, because `const` means "this name is permanently bound to a value
  starting right now," so it must be given one immediately.
- **No redeclaring in the same scope:** `let a; let a;` (using `let` twice for the same
  name in the same block) is an error — JS won't let you declare the same name twice in
  the same scope with `let`/`const`.
- **Naming rules:** a variable name must start with a letter, `_`, or `$` (never a digit),
  and JS is case-sensitive (`empName` and `empname` are different variables). The
  convention is **camelCase** for ordinary variables (`empName`, `isActive`) and
  **UPPER_SNAKE_CASE** for values that are meant to be fixed configuration/constants that
  never change (`MAX_RETRIES`).

### Gotchas worth remembering from this module

- **Mixing collection types and index syntax.** `emp_name[1] = 'p'` in this file is a
  real example of a subtle trap: it *looks* like valid code (no error is thrown) and
  *compiles and runs fine*, but it does not do what plain-array intuition suggests. On a
  Set, bracket assignment just attaches a stray property to the object — it does **not**
  add to the Set's actual element list. The only correct way to put something into a Set
  is `.add(value)`. This is exactly the kind of bug that's silent (no crash, no warning)
  and only shows up later when the Set doesn't contain what you expected.
- **Accidental global variable** — not shown in this exact file, but the single most
  important variable-related trap in JS: if I ever write `total = 5;` *without* `const`,
  `let`, or `var` in front, JS will not stop me — it will happily create a hidden global
  variable that leaks outside the function/block it was written in. This is a classic
  source of very confusing bugs (a value changing somewhere I never expected). The fix is
  simple and absolute: **always** declare with `const` or `let`, never leave the keyword
  off.
- **Reassignment of `let` must never repeat the keyword.** The pattern is: declare once
  with `let x = 1;`, then every later change is `x = 2;` with no keyword. Writing `let x =
  2;` a second time for the same name in the same scope is a redeclaration error, not a
  reassignment.
- **Default to `const`, not `let`.** Because `const` gives a hard guarantee ("this name
  will not be rebound"), using it everywhere you can makes code easier to reason about —
  you can trust that a `const` name means the same thing on line 50 as it did on line 5.
  Only reach for `let` the moment you know, up front, that reassignment is actually needed.
