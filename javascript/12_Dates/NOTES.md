# Module 12 — Dates — NOTES

### What I learned today

A JS `Date` object is really wrapping a single number underneath — the number of
milliseconds that have passed since January 1st, 1970 (called "the epoch"). All the
friendly-looking methods (`getFullYear()`, `getMonth()`, etc.) are just different ways of
reading pieces out of that one underlying number. The single biggest trap in this whole
module, flagged with a warning in my concise notes as "the #1 Date bug," is that **months
are zero-indexed**: January is `0`, not `1`, all the way up to December being `11`. Every
file in this module has to work around that one fact somewhere.

### File: `date_task1.js` — line by line

```js
const date = new Date(2026,6,7)
```
`new Date(year, monthIndex, day)` — this is the **"build a date from parts"** constructor
form. The year (`2026`) and day (`7`) are written exactly as a human would say them, but
the month is a **zero-based index**: `6` here means "the 7th month," i.e. **July**, not
June. This is the exact gotcha — to build "July 7th, 2026" I have to write the human month
(`7`) minus one (`6`), not the number `7` itself.

```js
console.log(date.getFullYear())
```
`.getFullYear()` reads the year back out as a normal 4-digit number — no off-by-one
weirdness here, years are represented the way you'd expect. Prints `2026`.

```js
console.log(date.getMonth() + 1)
```
`.getMonth()` reads the month back out, but — consistently with how it was *built* —
it also comes back zero-indexed: `6` for July, not `7`. The `+ 1` here is the
**"reading" side of the same workaround**: to display the month the way a human expects
(July = 7), I have to add 1 back on. So this prints `7`, not `6`. The rule that's forming
in my head: **building a date → subtract 1 from the human month; reading a date → add 1
back.**

```js
console.log(date.getDate())
```
`.getDate()` returns the **day of the month** (1–31), not zero-indexed at all — unlike
month, this one matches normal human counting directly. Prints `7`.

### File: `date_task2.js` — line by line

```js
const start = new Date("2026-01-01"), end = new Date("2026-01-11");
```
This time, dates are built from an **ISO date string** (`"YYYY-MM-DD"`) instead of
separate year/month/day numbers. Inside an ISO string, the month is written the normal
human way (`"01"` really does mean January) — the zero-indexing only applies to the
*numeric* constructor form (`new Date(year, monthIndex, day)`), not to parsing a string.
Two separate `const` declarations on one line, comma-separated — legal shorthand for two
statements.

```js
let diffMs = end - start;
```
Subtracting one `Date` object from another doesn't error out or concatenate like strings
would — JS automatically converts each `Date` to its underlying millisecond-since-epoch
number first, then does ordinary numeric subtraction. The result, `diffMs`, is the
**difference in milliseconds** between the two dates.

```js
let diffDays = diffMs/(1000*60*60*24);
console.log(diffDays)
```
Converting milliseconds into days requires dividing by: 1000 (ms → seconds) × 60 (seconds →
minutes) × 60 (minutes → hours) × 24 (hours → days) — written out as one multiplication,
`1000*60*60*24`, which equals the number of milliseconds in a single day. `start` is
January 1st, `end` is January 11th — a 10-day gap — so `diffDays` comes out to `10`.

### File: `date_task3.js` — line by line (correct age calculation)

```js
const birth = new Date("2000-01-01"), today = new Date("2026-01-11");
```
Two dates from ISO strings — a birthdate and a reference "today" date (hardcoded here
rather than using `new Date()` for the real current date, so the calculation is
reproducible and testable regardless of when the file is actually run).

```js
let age = today.getFullYear() - birth.getFullYear();
```
The naive first step: just subtract the birth year from today's year. `2026 - 2000 = 26`.
But this alone can be **wrong** — if today's date falls *before* the birthday has occurred
this year, the person is actually still a year younger than this simple subtraction
suggests (e.g. someone born December 31st isn't "26" on January 1st of the year they turn
26 — their birthday hasn't happened yet that year).

```js
const notYet =
  today.getMonth() < birth.getMonth() ||
  (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
```
This checks whether this year's birthday hasn't happened yet, as of `today`. It's an `||`
of two cases:
- `today.getMonth() < birth.getMonth()` — today's month is *earlier in the year* than the
  birth month (e.g. today is March, birthday is in July → birthday clearly hasn't come yet
  this year).
- `(today.getMonth() === birth.getMonth()) && (today.getDate() < birth.getDate())` — same
  month as the birthday, but an earlier day within that month (e.g. birthday is July 20th,
  today is July 5th → still hasn't happened yet).

Both halves compare **month first, then day** — the bigger unit is checked before the
smaller one, same logical ordering as comparing a multi-digit number from its most
significant digit down. The year is deliberately not part of this comparison at all — it's
already been accounted for in the simple subtraction above; this check only answers "within
*this* year, relative to the birth month/day, has the anniversary passed yet?" Also notice:
both `today` and `birth` use `.getMonth()`, so even though month is zero-indexed, both sides
of every comparison are zero-indexed the same way — the `+1` correction isn't needed here
because it would cancel out on both sides anyway.

In this file's actual values: `birth` is January 1st (month `0`, day `1`), `today` is
January 11th (month `0`, day `11`). `today.getMonth() < birth.getMonth()` → `0 < 0` is
`false`. Second half: `today.getMonth() === birth.getMonth()` → `0 === 0` is `true`, AND
`today.getDate() < birth.getDate()` → `11 < 1` is `false`. So the whole `||` expression is
`false` — the birthday (January 1st) has *already* passed by January 11th this year.
`notYet` is `false`.

```js
if (notYet) age--;
console.log(age)
```
Since `notYet` is `false`, `age` is **not** decremented — it stays at the simple
subtraction result, `26`. Printed: `26`. (If `today` had instead been, say, December 25th,
2025 — one week *before* the January 1st birthday — `notYet` would have been `true`, and
this `age--` line is exactly what would correct the naive year-subtraction down by one.)

### Gotchas worth remembering from this module

- **Months are zero-indexed only in the numeric constructor and in `.getMonth()` — not in
  ISO date strings.** `new Date(2026, 6, 7)` means July (index 6), but
  `new Date("2026-07-07")` written as a string means July *the normal human way* (`"07"`).
  Mixing up which form is in play is an easy way to end up a month off. `date_task1.js`
  uses the numeric form and has to add 1 back when *reading* the month out; `date_task2.js`
  and `date_task3.js` both use ISO strings, which sidesteps the issue entirely for
  construction — though `.getMonth()` still returns zero-indexed values once you *read*
  from any `Date`, regardless of how it was built.
- **`.getDate()` vs `.getDay()` are easy to confuse by name alone.** `.getDate()` returns
  the day-of-month (1–31, as used in `date_task1.js`); `.getDay()` (not used in these
  files, but worth remembering) returns the day-of-*week* (0–6, where 0 is Sunday) — two
  completely different pieces of information behind very similarly spelled method names.
- **Subtracting two `Date` objects gives milliseconds, not days.** `date_task2.js`'s
  `end - start` only becomes a meaningful "10 days" after an explicit division by
  `1000*60*60*24`. Forgetting that conversion factor (or getting one of the four numbers
  wrong) silently produces a number that looks plausible but is off by an order of
  magnitude.
- **Correct age calculation needs more than a year subtraction.** `date_task3.js`'s
  `notYet` check — comparing month first, then day, only within the current year — is the
  right general pattern for "has this annual date already occurred this year as of today?"
  and generalizes beyond ages to things like subscription renewal dates or contract
  anniversaries.
- **Backend convention:** dates should generally be *stored* as ISO strings or raw
  timestamps (`toISOString()` / `getTime()`), and only converted to a human-friendly format
  (`toLocaleDateString()`, etc.) right before they're actually displayed to a user — doing
  calculations on an already-formatted display string is a common source of bugs.
