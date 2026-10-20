# Project 6b — JWT Simulation

## What this project builds

A simulation of **JSON Web Tokens (JWTs)** — the mechanism real backends use so a
user only has to log in *once* (with a password) and then prove who they are on
every later request using a compact **token** instead of resending credentials.
This project picks up exactly where Project 6 (Auth Simulation) left off:
Project 6's `login()` proved identity once; this project builds the thing you'd
actually hand back from that login and have the client send on every future
request.

This folder is unusual compared to the rest of Phase 3: it has **two versions of
everything** — a short, deliberately **incomplete "practice" pair**
(`tokenService.js` + `main.js`) meant to be filled in as an exercise, and a
**complete "reference" pair** (`tokenService_reference.js` + `main_reference.js`)
showing the full, working JWT flow including the two things that actually make JWTs
useful for security: **signature verification** and **expiry checking**. Reading the
practice files side by side with the reference files is the point of this project —
seeing exactly what's missing is as instructive as seeing what's there.

### File structure

```
06b_jwt_simulation/
├── tokenService.js            ← PRACTICE: stub version, createToken works, decode is incomplete
├── main.js                    ← PRACTICE driver — has a real variable-name bug (see below)
├── tokenService_reference.js  ← REFERENCE: full create/decode/verify, with tamper + expiry protection
└── main_reference.js          ← REFERENCE driver — demonstrates a tampering attack and an expired token
```

---

## What a JWT actually is, in one paragraph

A JWT is just **two pieces of text joined by a dot**: `payload.signature`. The
`payload` is a JSON object (like `{username, role, exp}`) that's been base64-encoded
— which is **NOT encryption**, just a reversible text encoding anyone can decode
without any secret at all (try pasting any JWT's first part into any online base64
decoder). The `signature` is what actually protects the token: it's computed by
hashing the payload together with a **secret key** that only the server knows. When
the server later receives a token back, it recomputes the signature from the
payload it was just given and compares it to the signature attached to the token —
if they don't match, *something* about the payload was changed after it was issued,
because only someone who knows the secret could have produced a signature that
matches a modified payload. This is the entire mental model both files below
implement, at different levels of completeness.

---

## File: `tokenService_reference.js` — the complete version, piece by piece

(Reading this one first makes the incomplete practice version much easier to
understand by contrast.)

```js
class InvalidSignature extends Error {
  constructor(message) { super(message); this.name = "InvalidSignature"; }
}
class TokenExpired extends Error {
  constructor(message) { super(message); this.name = "TokenExpired"; }
}
```

Two custom errors, same `extends Error` pattern as every other project, just
written compactly on single lines. `InvalidSignature` means "this token was
tampered with" (or forged). `TokenExpired` means "this token was once valid but its
time ran out."

```js
class TokenService {
  #secret = "mysecret";

  // a deterministic fake hash (real code: HMAC-SHA256 via a crypto lib)
  #fakeHash(str) {
    let h = 0;
    for (const c of str) h = h + c.charCodeAt(0) * 31;
    return `sig${h}`;
  }
```

`#secret` is a **private field** holding the server's signing key — in a real
system this would be a long random string kept in an environment variable, never
committed to source code; here it's a plain literal for the sake of the exercise.

`#fakeHash(str)` is a **private method** (the `#` works on methods too, not just
fields — same rule: only code inside the class can call it). It's a small
hand-rolled, deterministic hashing algorithm: walk every character in the string,
convert each to its numeric character code (`c.charCodeAt(0)`), multiply by 31 (a
common small prime used in simple hash functions to spread values out), and keep a
running sum `h`. The result is prefixed with `"sig"` and returned as a string. Two
important properties this has, which is all that's actually needed for the
exercise: (1) the **same input string always produces the same output** (so a
signature can be recomputed and compared later), and (2) changing *any* character
of the input changes the numeric sum, so a different input very likely produces a
different signature. It is **not cryptographically secure** — a real system uses
something like HMAC-SHA256 — but it behaves correctly for teaching the concept.

```js
  // sign header helper: base64 the JSON, then hash (payload + secret) → signature
  #sign(encodedPayload) {
    return this.#fakeHash(encodedPayload + this.#secret);
  }
```

`#sign` is a second private helper, built on top of `#fakeHash`: it hashes the
*already-base64-encoded* payload string **concatenated with the secret**. This
concatenation is exactly why someone without the secret can't forge a valid
signature for a payload they choose: even if they know the hashing algorithm
itself (it's not secret — the algorithm never needs to be secret, only the key
does), they can't reproduce `#fakeHash(payload + secret)` without knowing what
`secret` actually is.

```js
  // ── CREATE: payload object → "P.S" token ──────────────────────────────────
  createToken(payload) {
    const json = JSON.stringify(payload);                       // object → text
    const encodedPayload = Buffer.from(json).toString("base64url"); // P (readable)
    const signature = this.#sign(encodedPayload);               // S = hash(P + secret)
    return `${encodedPayload}.${signature}`;                    // token = P.S
  }
```

Three steps, exactly matching the "what a JWT actually is" explanation above:
1. `JSON.stringify(payload)` turns the JS object into a JSON text string.
2. `Buffer.from(json).toString("base64url")` — `Buffer` is Node's built-in tool for
   working with raw bytes; `Buffer.from(json)` treats the JSON string as a sequence
   of bytes, and `.toString("base64url")` re-encodes those bytes as base64 text
   using the **URL-safe** variant of base64 (`base64url` swaps out the `+`, `/`,
   and `=` characters that regular base64 uses, which aren't safe to put directly
   into a URL — real JWTs always use this URL-safe variant for exactly that reason).
3. `this.#sign(encodedPayload)` computes the signature over the encoded payload.

The final token is just these two pieces joined with a literal dot:
`"<encodedPayload>.<signature>"`.

```js
  // ── DECODE: read the payload WITHOUT verifying (proves it's readable) ──────
  decode(token) {
    const [encodedPayload] = token.split(".");                  // take P (left of dot)
    const json = Buffer.from(encodedPayload, "base64url").toString(); // base64 → text
    return JSON.parse(json);                                    // text → object
  }
```

`token.split(".")` splits the token string on its dot into `["<payload>", "<signature>"]`;
destructuring `const [encodedPayload] = ...` takes just the first piece, ignoring
the signature entirely. `Buffer.from(encodedPayload, "base64url").toString()` does
the reverse of encoding: treats the string as base64url text, decodes it back into
raw bytes, then converts those bytes back into a readable string (JSON text) using
the default encoding (UTF-8). `JSON.parse(json)` turns that text back into a real JS
object. The comment is doing real work here: this method is deliberately named and
commented to make a point — **`decode` never touches the signature at all**. Anyone
holding a token, with no secret, no login, nothing, can run exactly this logic and
read every field inside the payload. This is why you should never put a genuine
secret (a real password, a credit card number) inside a JWT payload — it is only
*ever* readable text, dressed up to look opaque.

```js
  // ── VERIFY: check signature, then expiry, then trust the claims ───────────
  verifyToken(token) {
    const [encodedPayload, signature] = token.split(".");       // P and S

    // 1) recompute the signature over the RECEIVED payload, compare
    const expected = this.#sign(encodedPayload);
    if (expected !== signature) throw new InvalidSignature("invalid signature");

    // 2) decode the payload and check expiry
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
    if (payload.exp < Date.now()) throw new TokenExpired("token expired");

    // 3) all good → return the trusted claims
    return payload;
  }
}

module.exports = { TokenService, InvalidSignature, TokenExpired };
```

This is the method that actually makes a JWT *safe* to trust, in exactly two checks,
done **in this specific order**, and the order matters:

1. **Signature check first.** `this.#sign(encodedPayload)` recomputes what the
   signature *should* be for the payload text as it currently stands (whatever was
   received, possibly tampered with), and compares it (`!==`) against the signature
   that was actually attached to the token. If someone changed even one character
   of the payload after it was issued, recomputing the signature over the *new*
   payload text gives a *different* result than the *old* signature still attached
   to the token — mismatch, reject immediately with `InvalidSignature`.
2. **Expiry check second**, and only reached if the signature was valid. Decode the
   now-trusted payload and compare its `exp` field (a timestamp, same units as
   `Date.now()` — milliseconds since 1970) against the current time. If the token's
   expiry time has already passed, reject with `TokenExpired`.
3. Only if **both** checks pass does the method return the actual payload object —
   at which point, and only at that point, the caller can treat the claims inside
   (`username`, `role`, etc.) as trustworthy, because they're now known to be
   exactly what the server itself originally signed, and still within their
   validity window.

Checking the signature *before* trusting anything decoded from the payload (like
`exp`) is essential: if expiry were checked first, using a value pulled from an
unverified payload, an attacker could simply edit the `exp` field itself to some far
future date, and the (not-yet-checked) signature mismatch would never even get a
chance to catch it. Verify trust in the data *before* using any of that data to make
decisions.

---

## File: `main_reference.js` — the complete demo, piece by piece

```js
const { TokenService, InvalidSignature, TokenExpired } = require("./tokenService_reference");

const tokens = new TokenService();

function run(label, action) {
  try {
    console.log(label, "→", action());
  } catch (err) {
    if (err instanceof InvalidSignature || err instanceof TokenExpired) {
      console.log(label, "→ REJECTED:", err.message);
    } else throw err;
  }
}
```

Same error-boundary `run()` pattern as the rest of the folder, with one addition: it
now takes a `label` argument too, so each call can print a readable tag alongside
its result — useful here since this file is specifically about *comparing* several
different outcomes (valid, tampered, expired) side by side.

```js
// 1. create a valid token (expires 1 minute from now)
const valid = tokens.createToken({ username: "kishore", role: "admin", exp: Date.now() + 60000 });
console.log("token:", valid);

// 2. decode without verifying — anyone can read the payload (base64 only)
console.log("decoded (no verify):", tokens.decode(valid));

// 3. verify the valid token → returns the claims
run("verify valid  ", () => tokens.verifyToken(valid));
```

`Date.now() + 60000` sets the expiry 60,000 milliseconds (1 minute) in the future.
Step 2 proves the "decode is not secure" point directly: `decode()` is called with
no secret, no verification, and still successfully reads the full payload. Step 3
is the expected success path: a freshly created, untampered, unexpired token
verifies cleanly and the claims come back.

```js
// 4. TAMPER: change payload to superadmin, keep the OLD signature
const [, oldSig] = valid.split(".");
const fakePayload = Buffer.from(
  JSON.stringify({ username: "kishore", role: "superadmin", exp: Date.now() + 60000 })
).toString("base64url");
const tampered = `${fakePayload}.${oldSig}`;      // new payload, old signature
run("verify tampered", () => tokens.verifyToken(tampered));
```

This is the demonstration of **why the signature matters at all**. `valid.split(".")`
splits the real token; `const [, oldSig] = ...` uses a **destructuring hole** — the
empty slot before the comma (`[, oldSig]`) deliberately skips the first element
(the real payload) and only keeps the second (the real signature). Then a brand new,
attacker-crafted payload is built from scratch — same username, but role upgraded
from `"admin"` to `"superadmin"` — encoded the same way `createToken` would encode
it. The attack is: stitch this *new* payload onto the *old, original* signature
(`${fakePayload}.${oldSig}`), hoping the server won't notice. When `verifyToken` runs
on this tampered token, it recomputes the signature over the new (tampered) payload
text — which produces a completely different hash than `oldSig` (since the payload
bytes changed) — so the signature check fails immediately and `InvalidSignature` is
thrown. This is the entire reason JWTs are considered "tamper-evident": you can't
change the payload without invalidating the attached signature, because the
signature is a function of the payload's exact content plus a secret the attacker
never had.

```js
// 5. EXPIRED token (exp in the past)
const expired = tokens.createToken({ username: "kishore", role: "admin", exp: Date.now() - 1000 });
run("verify expired ", () => tokens.verifyToken(expired));
```

`Date.now() - 1000` sets the expiry 1 second in the **past**, so this token is
"born expired." Its signature is perfectly valid (it was created honestly by
`createToken`, never tampered with), so the signature check in `verifyToken` passes
— but the expiry check then catches it and throws `TokenExpired`. This demonstrates
that signature validity and expiry are two genuinely separate concerns, both
necessary: a signature proves "this payload hasn't been altered," not "this payload
is still supposed to be usable right now."

---

## File: `tokenService.js` — the incomplete practice version

```js
class InvalidSignature extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidSignature"
    }
}

class TokenErrors extends Error{
    constructor(message){
        super(message)
        this.name = "TokenErrors"
    }
}
class UserContext{

    #user = new Map()
    #secret = "mysecret"
    fakeHash = (str) => {return str}

    createToken(payload){
        const jsonPayload = JSON.stringify(payload)
        const encodedPayload = Buffer.from(jsonPayload).toString("base64");
        const signature = this.fakeHash(encodedPayload +this.#secret)
        return encodedPayload+"."+signature
    }

    decode(token){
        const [encodedPayload, signature] = token.split(".")
    }
}

module.exports = {UserContext,TokenErrors,InvalidSignature}
```

This is the exercise scaffolding, intentionally left partly unfinished to practice
on, and it's worth being precise about exactly what is and isn't done:

- `fakeHash = (str) => {return str}` is **the identity function** — it just hands
  back whatever string it was given, completely unchanged. Compare this to the
  reference's `#fakeHash`, which actually does a character-code-based computation.
  Here, "signing" a payload with this hash means the "signature" ends up being
  literally `encodedPayload + secret` pasted together — not scrambled at all. This
  is a much weaker (though still technically "deterministic," satisfying the bare
  minimum needed for `createToken` to run without error) stand-in than the
  reference version. It's also **public** (no `#`), unlike the reference's private
  `#fakeHash` method.
- `createToken` here is actually **complete and correct** — same three steps as the
  reference (stringify, base64-encode, sign, join with a dot), just using plain
  `"base64"` instead of `"base64url"` (a minor difference: plain base64 can include
  `+`, `/`, `=` characters that aren't safe to drop directly into a URL, whereas
  `base64url` avoids them — functionally fine for this exercise since the token is
  never actually put in a URL anywhere).
- `decode(token)` is **the unfinished part**. It destructures `encodedPayload` and
  `signature` out of the split token — but then the method body simply **ends**
  there. No `Buffer.from(...)`, no `JSON.parse(...)`, and critically, **no `return`
  statement at all**. Calling `decode(someToken)` would run without throwing any
  error, but would always evaluate to `undefined` — the whole point of `decode` (to
  hand back a readable payload object) isn't implemented.
- There's also **no `verifyToken` method anywhere in this file** — the entire
  signature-check-then-expiry-check logic that makes the reference version actually
  *secure* doesn't exist yet in the practice version. Only create and (an
  incomplete) decode exist.
- The custom error classes `InvalidSignature` and `TokenErrors` are defined and
  exported, but since there's no `verifyToken` method, neither error is ever
  actually thrown anywhere in this file — they're scaffolding for logic that hasn't
  been written yet.

---

## File: `main.js` — the practice driver, and a real bug worth studying closely

```js
const {UserContext,TokenErrors,InvalidSignature} = require("./tokenService")

const userData = new UserContext()

function run(action){

    try{
        action()
    }
    catch(err){
        if(err instanceof TokenErrors||err instanceof InvalidSignature){
            console.log(err.message)
        }
        else throw err
    }
}

const myToken = null
run(()=>{mytoken = userData.createToken({ username: "kishore", role: "admin" ,exp:Date.now() + 60000 })})
run(()=>{userData.decode(myToken)})
```

The first two-thirds of this file is the standard pattern seen everywhere else in
this folder. The last three lines contain a genuine, worth-understanding-deeply bug:

```js
const myToken = null
run(()=>{mytoken = userData.createToken({ ... })})
run(()=>{userData.decode(myToken)})
```

`myToken` is declared with `const` and initialized to `null`. `const` means this
*exact binding* (the name `myToken`) can never be reassigned — `myToken = something`
later in the same scope would throw a `TypeError: Assignment to constant variable.`

But look very closely at the second line: it assigns to `mytoken` — **lowercase
"t"**, not `myToken` — a **completely different identifier** that was never declared
anywhere with `let`, `const`, or `var`. In non-strict JS, assigning to a name that
was never declared doesn't throw an error — it silently creates an **accidental
global variable**. (If this code were running inside an ES module, inside a
function declared with `"use strict"`, or inside a class, this same line would
instead throw a `ReferenceError: mytoken is not defined` — whether this silently
"works" or crashes outright depends on exactly which strictness mode the file is
running under. As a plain CommonJS script run directly with `node main.js`, which is
what this file is, it is **not** strict by default, so the typo creates a global
rather than crashing.)

The practical effect: `userData.createToken(...)` **does** run and **does** produce
a real token string — but that string gets stored into the accidental global
`mytoken`, never into the `const myToken` declared one line above. The very next
call, `userData.decode(myToken)`, reads the *original* `myToken`, which is **still
`null`** — it was never touched by the previous line at all, because the previous
line was quietly writing to a different variable the whole time. So `decode(null)`
runs, calling `null.split(".")` inside `decode` — which throws a `TypeError: Cannot
read properties of null (reading 'split')`. This TypeError is **not** an
`InvalidSignature` or `TokenErrors`, so `run`'s `catch` block's `instanceof` check
fails to match it, and the `else throw err` branch re-throws it, crashing the whole
script.

This single typo is a genuinely excellent, realistic bug to have in a practice file:
it's completely invisible by reading quickly (`myToken` vs `mytoken` look almost
identical), it doesn't fail at the point where the mistake actually is (the typo'd
assignment line runs "successfully," silently creating a global), and the crash
happens one line later, somewhere that *looks* innocent, making the real cause easy
to misdiagnose as "`decode` is broken" rather than "the wrong variable got the
token."

---

## Gotchas worth remembering

- **The `myToken`/`mytoken` typo in `main.js` is the single most important lesson
  in this project.** Always declare every variable with `let`/`const`, and treat
  any assignment to an undeclared name as a red flag rather than something that
  "just works" — in non-strict scripts it silently creates a global, which is
  almost never actually wanted and is exactly how bugs like this one slip through
  unnoticed. Modern JS (ES modules, `"use strict"`, code inside classes) turns this
  same mistake into an immediate, loud `ReferenceError` instead — one more reason
  those stricter modes exist.

- **`tokenService.js`'s `decode()` is missing its `return` statement entirely** —
  it destructures the token's two halves and then does nothing further. Calling it
  always yields `undefined`, silently, with no error raised to signal that anything
  is incomplete.

- **There is no `verifyToken` in the practice version at all.** `createToken` and
  `decode` only cover *creating* and *reading* a token — the actual security
  guarantee of a JWT (detecting tampering, rejecting expired tokens) lives entirely
  in `verifyToken`, which only exists in `tokenService_reference.js`. A token that
  can be created and read but never verified provides no protection whatsoever —
  anyone could construct their own arbitrary payload, base64-encode it by hand, and
  there would be nothing in this file to ever reject it.

- **`decode()` never needs — and never should use — the secret.** It's tempting to
  think "reading" a token should require some kind of permission check, but by
  design, the payload half of a JWT is just base64, not encryption, and decoding it
  requires nothing secret at all. The real security boundary is entirely in
  `verifyToken`'s signature comparison, not in `decode`. Never put information in a
  JWT payload that shouldn't be readable by literally anyone holding the token.

- **Checking the signature before trusting any field from the decoded payload (like
  `exp`) is the one ordering rule in `verifyToken` that cannot be swapped.** If
  expiry were checked using a payload that hadn't yet been verified, an attacker
  could simply forge a far-future `exp` value and have it checked before the
  (still-pending) signature mismatch ever gets a chance to reject the token.
