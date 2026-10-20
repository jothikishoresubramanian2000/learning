# Project 6 — Authentication Simulation

## What this project builds

A fake (simulated, not real) user authentication system: sign up a user with a
username/password/role, log in by checking a (fake) password hash, and check
whether a given user's role grants them a specific permission — i.e. a tiny
**role-based access control (RBAC)** system. Nothing here is cryptographically real
— the "hash" function is a see-through stand-in — but the *shape* of real auth
(hash passwords, never store them raw, map roles to a fixed set of permissions) is
all here. This project's natural continuation is Project 6b (JWT simulation), which
picks up right where this one's `login()` leaves off: proving *who* you are once,
then needing a way to prove it again on every later request without re-sending the
password.

### File structure

```
06_auth_simulation/
├── authService.js   ← data + rules + 2 custom errors + the fake-hash function
└── main.js          ← driver script
```

---

## File: `authService.js` — piece by piece

### Two custom error classes

```js
class UserError extends Error{
    constructor(message){
        super(message)
        this.name = "UserError"
    }
}

class InvalidRole extends Error{
    constructor(message){
        super(message)
        this.name = "InvalidRole"
    }
}
```

Same `extends Error` pattern as every previous project. `UserError` is a deliberately
**broad** error type here — it's reused for "user already exists," "user not found,"
and "invalid credentials" — three different failures that all get the same error
class. `InvalidRole` is separate and specific, for the one case where someone tries
to sign up with a role that doesn't exist.

### `UserManager`

```js
class UserManager{
    Role = Object.freeze({
        ADMIN: "admin",
        EDITOR: "editor",
        VIEWER: "viewer"
    })

    Permission = Object.freeze({
        CREATE: "create",
        DELETE: "delete",
        VIEW: "view",
        EDIT:"edit"
    })
```

`Role` and `Permission` are **public class fields** — plain object constants
attached to every instance of `UserManager`. `Object.freeze(...)` makes an object
**immutable**: after freezing, trying to add, remove, or change any property on it
is silently ignored in normal (non-strict) code, or throws in strict mode — either
way, `Role.ADMIN` can never accidentally become something else later in the
program. This is the standard way to simulate an "enum" in JS, since JS has no
built-in enum keyword — pick a fixed small set of string constants, group them in an
object, freeze it so nobody can tamper with it.

Worth flagging: `Role` and `Permission` are **instance** fields, not `static`. That
means every single `new UserManager()` creates its *own* separate frozen `Role`
object and its own separate frozen `Permission` object, even though the values are
identical every time and never depend on any particular instance's data. In a real
project, these would almost always be declared `static Role = Object.freeze({...})`
instead — one shared copy on the class itself, not duplicated per instance. It
works correctly as written (since only one `UserManager` is ever created in this
project's driver script), but it's wasteful in a way that would matter more at
scale, and it's a good first exposure to the instance-vs-static distinction for
class fields.

```js
    rolePermissions = {
        [this.Role.ADMIN]:  [this.Permission.CREATE, this.Permission.DELETE, this.Permission.VIEW, this.Permission.EDIT], 
        [this.Role.EDITOR]: [this.Permission.VIEW, this.Permission.EDIT],                                        
        [this.Role.VIEWER]: [this.Permission.VIEW],                                                         
    };
```

This is the RBAC "table": a plain object mapping each role string to the array of
permissions that role is allowed. The square brackets around `this.Role.ADMIN` are a
**computed property key** — without the brackets, `{this.Role.ADMIN: [...]}` would
be a syntax error, because a plain object key has to be a literal name or string,
not an expression. `[this.Role.ADMIN]` tells JS "evaluate this expression first,
then use *its result* (`"admin"`) as the key" — so the actual object ends up being
`{ admin: [...], editor: [...], viewer: [...] }`, built dynamically from the `Role`
constants instead of retyping the raw strings.

The subtle part worth understanding: **class field initializers run in the order
they're written**, top to bottom, and each one has access to `this` as it's being
built. By the time `rolePermissions`'s initializer runs, `this.Role` (declared
above it) has *already* been assigned — so `this.Role.ADMIN` correctly resolves to
`"admin"` at this point. If `rolePermissions` had been written *above* `Role` in the
class body, `this.Role` would still be `undefined` when `rolePermissions`'s
initializer ran, and `this.Role.ADMIN` would throw ("Cannot read properties of
undefined"). Field declaration order inside a class genuinely matters when one
field's initializer depends on another.

```js
    #userData = new Map()

    fakeHash = (password) => {return `hashed(${password})`;}
```

`#userData` is the usual private Map, keyed by username this time. `fakeHash` is a
class field holding an **arrow function** (rather than a regular method) — it takes
a password and returns a string that just wraps it in `hashed(...)`, with zero real
security. This is deliberately see-through so you can trace exactly what a "hash"
even is for the purposes of this exercise: a function that maps the same input to
the same output, used so the password itself is never the thing being stored or
compared directly.

```js
    signUp(username,password,role){

        if (this.#userData.has(username)) throw new UserError("user already exists");
        if (!Object.values(this.Role).includes(role)) throw new InvalidRole("Invalid role");
        const passwordHash = this.fakeHash(password); 
        this.#userData.set(username, { username, passwordHash, role });
    }
```

Three guard-style checks in sequence, each written as a single-line `if`
(no braces, no block — valid JS when the body is exactly one statement, though it's
a style some linters discourage since it's easy to misread if someone later adds a
second statement expecting it to be "inside" the `if`):
1. `this.#userData.has(username)` — reject duplicate usernames.
2. `Object.values(this.Role).includes(role)` — `Object.values(...)` turns the frozen
   `Role` object into an array of just its values (`["admin", "editor", "viewer"]`),
   and `.includes(role)` checks whether the given `role` string is actually one of
   them. The `!` negates it: if `role` is **not** one of the valid roles, reject it.
   This is the validation step that keeps `rolePermissions` (built only for exactly
   those three roles) from ever being asked about a role it has no entry for.
3. Only once both checks pass does it hash the password and store the new user
   object — note the stored object has `passwordHash`, never the raw `password`
   itself. The raw password is used only transiently, inside this one call, to
   compute the hash, and then it's gone (not stored anywhere).

```js
    login(username,password){
        if(!this.#userData.has(username)) throw new UserError("user not found");
        if (!(this.#userData.get(username).passwordHash === this.fakeHash(password))) throw new UserError("Invalid credentials");
        const role = this.#userData.get(username).role
        return {username,role};
    }
```

Two guard checks: user must exist, and the hash of the *supplied* password must
match the *stored* hash. `!(a === b)` is a slightly roundabout way of writing
`a !== b` — functionally identical, just inverted-then-negated instead of directly
negated. If both checks pass, it builds and returns a small object with just
`username` and `role` — notably **not** the password hash. This mirrors something
genuinely important about real authentication design: what you hand back after a
successful login should describe *who the user is*, not repeat back sensitive
stored data.

```js
    listUsers(){
        return ([...this.#userData.values()].map(usr =>({username: usr.username,role: usr.role})))
    }
```

`.map(usr => ({username: usr.username, role: usr.role}))` transforms every stored
user object into a **smaller, safer** object containing only `username` and `role`
— deliberately leaving `passwordHash` out of anything that gets listed externally.
This is the correct instinct (never casually expose stored hashes, even fake ones),
applied consistently with how `login()` already behaves. Note the arrow function
body is wrapped in parentheses — `usr => ({...})` — which is required here: without
the parens, `usr => {username: ...}` would be parsed as a function *body* using `{}`
as a block, with `username:` read as a label, not as an object literal. Wrapping the
`{}` in `(...)` tells JS "this curly-brace thing is an object expression, not a
block of statements."

```js
    can(username, permission) {
        if (!this.#userData.has(username)) throw new UserError("user not found");
        const role = this.#userData.get(username).role;
        return this.rolePermissions[role].includes(permission);
    }

}

module.exports ={UserError,UserManager,InvalidRole}
```

`can(username, permission)` is the actual permission check: look up the user's
role, then look up *that role's* permission array in `rolePermissions`, then check
whether the requested `permission` is in it. `this.rolePermissions[role]` works
because `role` is guaranteed (by `signUp`'s earlier validation) to be one of the
three valid role strings, which are exactly the keys `rolePermissions` has entries
for — if `role` were ever something `rolePermissions` had no key for, this would
return `undefined`, and `.includes(permission)` on `undefined` would throw a
`TypeError`. The validation in `signUp` is what keeps that from ever happening in
practice, as long as nothing else ever sets a `role` field directly without going
through `signUp`.

---

## File: `main.js` — piece by piece

```js
const {UserError,UserManager,InvalidRole} =require("./authService")

const userManage = new UserManager()
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof UserError||err instanceof InvalidRole){
            console.log(err.message)
        }
        else throw err
    }
}

run(()=>{userManage.signUp("Kishore","pass123","admin");console.log(`user added`);})
run(()=>{userManage.signUp("revi","revi456","viewer");console.log(`user added`);})
run(()=>{userManage.signUp("Kishore","pass123","admin");console.log(`user added`);})
run(()=>{userManage.signUp("bad","pass123","superuser");console.log(`user added`);})
```

Same generic `run(action)` wrapper seen throughout the folder. Two valid sign-ups
(`"Kishore"` as admin, `"revi"` as viewer), then a duplicate `"Kishore"` signup
(triggers `UserError`, "user already exists"), then a signup with role
`"superuser"` — not one of `Role`'s three valid values — triggering `InvalidRole`.

```js
//--------------------login----------//

run(()=>{console.log(userManage.login("Kishore","wrongpass"))})
run(()=>{console.log(userManage.login("Kishore","pass123"))})
```

First login attempt uses the wrong password — `fakeHash("wrongpass")` won't match
the stored `fakeHash("pass123")`, so it throws `"Invalid credentials"`. Second
attempt uses the correct password and succeeds, logging the returned
`{username: "Kishore", role: "admin"}` object.

```js
//-----------------
run(()=>{console.log(userManage.can("Kishore", userManage.Permission.DELETE))})
run(()=>{console.log(userManage.can("revi", userManage.Permission.DELETE))})
run(()=>{console.log(userManage.can("revi", userManage.Permission.VIEW))})
```

`userManage.Permission.DELETE` reads the frozen `Permission` constant off the
*instance* (since `Permission` is an instance field, not static — see above —
accessing it has to go through an actual `UserManager` object, here `userManage`,
rather than being reachable as `UserManager.Permission` on the class itself).
Kishore (admin) can delete → `true`. Revi (viewer) can delete → `false` (viewer's
permission list is just `[VIEW]`). Revi can view → `true`.

---

## Gotchas worth remembering

- **`Role` and `Permission` are instance fields, not `static`.** Every
  `new UserManager()` builds its own separate frozen copies of identical data. This
  project only ever creates one `UserManager`, so it's invisible here, but it's
  worth remembering: constants that never vary per-instance belong on the class
  (`static Role = ...`), reachable via `UserManager.Role` without needing any
  instance at all, and shared by every instance rather than duplicated.

- **Field declaration order inside the class is load-bearing.** `rolePermissions`'s
  initializer reads `this.Role` and `this.Permission`, both of which must already
  be initialized by the time it runs — which only works because they're declared
  *above* `rolePermissions` in the source. Moving `rolePermissions` above `Role`
  would break it at the moment the object is constructed, with an error that only
  shows up at runtime, not at write-time.

- **`fakeHash` is just string interpolation (`` `hashed(${password})` ``) — not a
  real hash function.** It's deterministic (same input always gives the same
  output, which is the one property actually needed for this exercise's comparison
  logic to work), but it's trivially reversible by inspection — the "hashed"
  password literally contains the real password in plain sight. The whole point of
  calling it "fake" is to separate the *idea* of "compare a derived value instead of
  the raw secret" from the much harder problem of actually making that derived value
  one-way and secure (a real hash function like bcrypt or Argon2 would be
  irreversible). Project 6b's reference solution uses a slightly more realistic
  (still fake, but less transparent) rolling character-code hash — worth comparing
  the two.

- **`can()` assumes `role` is always a key present in `rolePermissions`.** That
  assumption holds only because `signUp()` validates the role before ever storing
  it. If some other code path ever stored a user object with an unvalidated role
  (bypassing `signUp` entirely — impossible from outside this class today, since
  `#userData` is private, but worth noting as a design dependency), `can()` would
  crash with a `TypeError` trying to call `.includes` on `undefined`.
