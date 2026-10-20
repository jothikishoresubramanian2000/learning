# Project 8 — SaaS Product Backend

## What this project builds

The capstone of Phase 3: a tiny multi-tenant SaaS (Software-as-a-Service) backend —
"tenant" here means a separate customer organization (like `"Acme"` or `"Globex"`),
each of which has its own set of users, and crucially, **one tenant's data must
never leak into or interfere with another tenant's data**. This project combines
almost everything from every earlier project — Maps, custom errors, guard clauses,
manual HTTP routing — plus two genuinely new ideas: **dependency injection** (one
service is handed a reference to another service through its constructor, rather
than creating or reaching for it itself) and **tenant-scoped validation** (every
operation on a user has to check not just "does this user exist" but "does this
user belong to *this* tenant").

### File structure

```
08_saas_backend/
├── tenantService.js   ← TenantManagement: create/get/list tenants + ValidationError (shared)
├── userService.js     ← UserManagement: tenant-scoped user CRUD, depends on TenantManagement
├── main.js            ← no-HTTP driver script, calls the two services directly
└── server.js          ← the HTTP layer: wraps both services behind real routes + status-code mapping
```

The natural reading order is `tenantService.js` → `userService.js` → `main.js`
(to see the plain logic work without any network involved) → `server.js` (to see
the same logic exposed over HTTP, the way Project 7 did for a single resource).

---

## File: `tenantService.js` — piece by piece

```js
class DuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "DuplicateId"
    }
}

class NotFound extends Error{
    constructor(message){
        super(message)
        this.name = "NotFound"
    }
}

// bad INPUT (missing/empty field, invalid value) → maps to HTTP 400
class ValidationError extends Error{
    constructor(message){
        super(message)
        this.name = "ValidationError"
    }
}
```

Three custom error classes, same pattern as every previous project — but notice
this project, for the first time, gives **"missing/invalid id"** its own explicit
class, `NotFound`, completely separate from `DuplicateId` and from input validation
(`ValidationError`). Compare this to Project 5's `BookStateErrors`, which lumped
"not found" together with other book-state problems under one class — this project
deliberately keeps the three ideas (bad input / already exists / doesn't exist)
fully separate, which is exactly what lets `server.js` later map each one to its own
distinct, correct HTTP status code without needing to inspect error message text at
all.

```js
class TenantManagement{

    #tenantData = new Map();

    createTenant(id,name){

        if(!id|| !name){
            throw new ValidationError("missing required fields")
        }
        if(this.#tenantData.has(id)){
            throw new DuplicateId("id already exists")
        }
        else{
            const tenant = {id,name}
            this.#tenantData.set(id,tenant)
            return tenant                        // return the created tenant, not the Map
        }
    }
```

Two guard clauses in sequence: first, **validate the input itself** — `!id || !name`
rejects a missing/empty id or name before even touching the Map at all (note this
check happens *before* the existence check, unlike several earlier projects that
checked existence first — a deliberate choice: there's no point checking whether an
empty string already exists as a key before rejecting it as invalid input in the
first place). Then, check for a duplicate id. Only if both pass does it build a
plain `{id, name}` object, store it, and **return that object** — the inline comment
`// return the created tenant, not the Map` is flagging something genuinely worth
noticing: `createTenant` hands back the newly created record itself, not the result
of `.set()` (which would just be the Map) and not the whole tenant collection — this
is what lets `server.js` immediately echo back exactly what was created in its
response, the same convention Project 7's POST route used.

```js
    getTenant(id){

        if(this.#tenantData.has(id)){
            return this.#tenantData.get(id)
        }
        else{
            throw new NotFound("tenant not found")
        }
    }

    listTenants(){
        return [...this.#tenantData.values()]
    }
}


module.exports = {DuplicateId,NotFound,ValidationError,TenantManagement}
```

Standard guard-and-fetch and spread-to-array patterns, same as every earlier
project. The one thing to flag here: `ValidationError` is exported from
**`tenantService.js`**, even though `userService.js` (below) also needs it and
imports it *from this same file* rather than declaring its own separate copy — a
single shared error class used by two different services, reached by one of them
importing it from where the other happens to define it.

---

## File: `userService.js` — piece by piece

```js
class UserDuplicateId extends Error{
    constructor(message){
        super(message)
        this.name = "UserDuplicateId"
    }
}

class UserOrRoleNotFound extends Error{
    constructor(message){
        super(message)
        this.name = "UserOrRoleNotFound"
    }
}


// reuse the shared ValidationError (bad input → 400)
const { ValidationError } = require("./tenantService")

const Role = {
    ADMIN: "admin",
    MEMBER: "member",
    VIEWER: "viewer"
}
```

Two more error classes, plus `ValidationError` pulled in via `require("./tenantService")`
— exactly the cross-file error reuse mentioned above. `Role` here is a **plain
object**, not `Object.freeze`d like Project 6's `Role`/`Permission` constants — so,
unlike that project, nothing here actually stops code elsewhere from mutating
`Role.ADMIN` to some other value at runtime. It would still work correctly as
written (nothing in this project ever does that), but it's a slightly less
defensive version of the same "simulate an enum" idea seen before.

```js
class UserManagement{

    #userData = new Map()
    #tenants                        // injected tenant service (Dependency Injection)

    constructor(tenantService){
        this.#tenants = tenantService
    }
```

This is the **dependency injection (DI)** piece, and it's worth slowing down on
since it's a genuinely new idea in this project. `#tenants` is declared as a private
field with **no initial value** — instead, the constructor receives a
`tenantService` parameter (an actual, already-created `TenantManagement` instance,
built *outside* this class entirely) and stores it. This means `UserManagement`
never creates its own `TenantManagement` — it's handed one from the outside, by
whoever constructs it. The alternative (what DI avoids) would have been something
like `this.#tenants = new TenantManagement()` written directly inside this
constructor — which would work, but would permanently couple `UserManagement` to
creating its *own*, separate `TenantManagement` instance, with its own separate
`#tenantData` Map, completely disconnected from whatever tenants actually exist
anywhere else in the program. By instead **injecting** the dependency (passing it
in), both `TenantManagement` and `UserManagement` can share the exact same tenant
data, and (in a larger, more realistic program) `UserManagement` could be tested in
isolation by injecting a fake/mock tenant service instead of a real one, without
changing a single line of `UserManagement` itself. See `main.js` below for where
this injection actually happens.

```js
    addUser(tenantId,user){

        // validate input FIRST (guard early) — bad input → 400
        if(!tenantId|| !user|| !user.id|| !user.name){
            throw new ValidationError("missing required fields")
        }
        // THEN verify the tenant EXISTS (getTenant throws NotFound → 404 if unknown),
        // so a user can never be attached to a nonexistent tenant.
        this.#tenants.getTenant(tenantId)

        if(this.#userData.has(user.id)){
            throw new UserDuplicateId("user already exists")
        }
        if(!(Object.values(Role)).includes(user.role)){
            throw new ValidationError("invalid role")
        }
        const newUser = {tenantId,id:user.id,name:user.name,role:user.role}
        this.#userData.set(user.id,newUser)
        return newUser                           // return the created user, not the Map
    }
```

This method's comments spell out its own guard ordering deliberately, and it's
worth walking through exactly why that order matters:

1. **Validate the shape of the input first** — is `tenantId` present, is `user`
   present, does it have an `id` and a `name`. This is pure "does this request even
   make sense," with no database/Map lookups involved yet.
2. **Then call `this.#tenants.getTenant(tenantId)`** — this is the actual DI payoff:
   `UserManagement` doesn't have its own copy of tenant data to check against; it
   asks the **injected** tenant service whether this tenant is real. If the tenant
   doesn't exist, `getTenant` itself throws `NotFound` — note this method doesn't
   even use `getTenant`'s *return value* here, it's called purely for its
   side-effect of throwing if the tenant is missing (the returned tenant object is
   discarded). This is the mechanism that guarantees, structurally, that a user can
   **never** be created under a tenant that doesn't exist — there's no code path in
   `addUser` that skips this check.
3. **Then check for a duplicate user id.**
4. **Then validate the role** is one of the three valid `Role` values.

Only after all four checks pass is the actual user object built and stored —
`{tenantId, id: user.id, name: user.name, role: user.role}` deliberately **stamps
the `tenantId` onto the stored user record itself**, right alongside the user's own
fields. This single design decision — storing `tenantId` as a field on every user,
inside one single shared `#userData` Map (not one separate Map *per* tenant) — is
the actual mechanism behind "tenant isolation" in this whole project, and it's the
thing worth understanding most carefully; see the next few methods and the Gotchas
section for exactly how (and where) that isolation does and doesn't hold up.

```js
    listUsers(id){
        return [...this.#userData.values()].filter(itm => itm.tenantId === id)
    }
```

Lists every user, then filters down to only the ones whose stored `tenantId` field
matches the requested tenant — this is tenant isolation implemented as a **filter
over one shared pool of data**, rather than as physically separate storage per
tenant. Both approaches achieve the same visible result for a correctly-behaving
system, but they have very different failure modes — see Gotchas.

```js
    getUser(tenantId,userId){
        if(!tenantId|| !userId){
            throw new ValidationError("missing required fields")
        }
        if(this.#userData.has(userId)){
            if(this.#userData.get(userId).tenantId === tenantId){
                return this.#userData.get(userId)
            }
            else{throw new UserOrRoleNotFound("user not found for this tenant")}
        }
        else throw new UserOrRoleNotFound("user not found")
    }
```

This is the method that shows the **defensive** side of the flat-Map design most
clearly: even though `#userData` is keyed only by `userId` (not by a combination of
tenant and user id), `getUser` never trusts a successful `.has(userId)` lookup on
its own — it *also* checks that the found user's stored `.tenantId` actually matches
the `tenantId` that was asked for. If a real user id exists, but under a
*different* tenant than the one being queried, this throws `"user not found for
this tenant"` rather than leaking that user's data to the wrong tenant's query.
This is exactly the kind of check that matters most in a real multi-tenant system
— get it wrong, and one customer could read another customer's private data simply
by guessing or enumerating ids.

```js
    updateRole(tenantId,userId,roles){
        if(!tenantId|| !userId|| !roles){
            throw new ValidationError("missing required fields")
        }

        if(!(Object.values(Role)).includes(roles)){
            throw new ValidationError("invalid role")
        }
        if(this.#userData.has(userId)){
            if(this.#userData.get(userId).tenantId === tenantId){
                this.#userData.get(userId).role = roles
                return this.#userData.get(userId)
            }
            else{throw new UserOrRoleNotFound("user not found for this tenant")}
        }
        else throw new UserOrRoleNotFound("user not found")
    }
```

Same tenant-matching defensive check as `getUser`, this time guarding a mutation —
`.role = roles` only happens after confirming both that the user exists **and**
that it belongs to the tenant making the request. Same pattern as earlier projects
of mutating the object returned by `.get()` directly, then fetching it again
(a third `.get(userId)` call total across this method) just to return it — the same
small "could have saved one lookup in a variable" inefficiency seen in Project 2's
`updateSalary`.

```js
    countByTenant(tid){

        return [...this.#userData.values()].filter(id => id.tenantId === tid).length
    }
```

Note the loop variable here is confusingly named `id` even though it holds a whole
user **object**, not an id — `id.tenantId` reads a property off of what is actually
a user record. Functionally correct, just a misleading variable name (the same kind
of small naming slip as Project 2's `depTotal`'s `values` variable, which actually
held a single value, not several).

```js
    removeUser(tenantId,userId){
        if(this.#userData.has(userId)){
            if(this.#userData.get(userId).tenantId === tenantId){
                return this.#userData.delete(userId)
            }
            else{throw new UserOrRoleNotFound("user not found for this tenant")}
        }
        else throw new UserOrRoleNotFound("user not found")
    }
}

module.exports ={UserManagement,UserDuplicateId,UserOrRoleNotFound}
```

Same tenant-matching guard one more time before allowing a delete. By this point in
the file, the pattern "look up by id, then separately confirm tenant ownership
before doing anything with it" has been applied consistently to every read and
every mutation **except one** — see Gotchas for the one place it's missing.

---

## File: `main.js` — piece by piece (the no-HTTP driver)

```js
const {DuplicateId,NotFound,TenantManagement} = require("./tenantService")
const {UserDuplicateId,UserOrRoleNotFound,UserManagement} = require("./userService")

const myTenants = new TenantManagement()
const myUsers = new UserManagement(myTenants)   // inject the tenant service (DI)
```

Here is the dependency injection actually happening: `myTenants` is constructed
first, on its own, and then **passed directly into** `new UserManagement(myTenants)`.
From this point on, `myUsers` and `myTenants` share the exact same tenant data —
any tenant `myTenants.createTenant(...)` adds is immediately visible to
`myUsers.addUser(...)`'s internal `this.#tenants.getTenant(...)` check, because
`this.#tenants` *is* `myTenants` — not a copy, not a separate instance, the literal
same object.

```js
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId|| err instanceof NotFound||err instanceof UserDuplicateId|| err instanceof UserOrRoleNotFound){
            console.log(err.message)
        }
        else throw err
    }
}
```

Same generic error-boundary `run()` pattern as earlier projects, now checking four
error types with three `||`s. Worth noticing: `ValidationError` is **not** in this
list — if a `ValidationError` were ever thrown by one of the calls below, it would
fail every `instanceof` check here and get re-thrown by the final `else`, crashing
`main.js` outright rather than being caught and printed. Looking through the actual
calls below, none of them happen to trigger a `ValidationError` in this particular
script, so the gap never gets exercised — but it is a real gap in this file's error
handling, distinct from `server.js`'s version below, which does account for
`ValidationError`.

```js
run(()=>{myTenants.createTenant("T-01","Acme");console.log("Tenant created")})
run(()=>{myTenants.createTenant("T-02","Globex");console.log("Tenant created")})
run(()=>{myTenants.createTenant("T-02","Globex");console.log("Tenant created")})

run(()=>{console.log(myTenants.getTenant("T-01"));})

run(()=>{console.table(myTenants.listTenants())})

run(()=>{myUsers.addUser("T-01",{ id:"U-01", name:"Kishore", role:"admin" });console.log("user created")});
run(()=>{myUsers.addUser("T-01",{ id:"U-02", name:"Ravi", role:"member" });console.log("user created")});
run(()=>{myUsers.addUser("T-02",{ id:"U-03", name:"John", role:"admin" });console.log("user created")});
run(()=>{myUsers.addUser("T-01",{ id:"U-04", name:"Bad", role:"superuser" });console.log("user created")});

run(()=>{console.table(myUsers.listUsers("T-01"))});

console.log("Get user by tenant id and user id")
run(() =>{console.log(myUsers.getUser("T-01","U-03"))});
run(() =>{console.log(myUsers.getUser("T-02","U-03"))});

run(()=>{myUsers.updateRole("T-01","U-02","viewer");console.log("Updated role")});
run(()=>{console.table(myUsers.listUsers("T-01"))});

run(()=>{console.log(myUsers.countByTenant("T-01"));});
```

Two tenants created, with a duplicate `"T-02"` triggering `DuplicateId`. Three users
added, one per tenant, except the fourth add (`"U-04"`, role `"superuser"`) — an
invalid role, triggering `ValidationError`... which, as noted above, is **not**
caught by this file's `run()` — this call would actually crash `main.js` rather
than printing a message and continuing. (Reading the concise learning notes and
project intent, the omission of `ValidationError` from `main.js`'s catch list looks
like an oversight carried over from earlier projects where `ValidationError` didn't
exist yet, rather than an intentional choice — `server.js` below gets this right.)
The most interesting single line is
`run(() =>{console.log(myUsers.getUser("T-02","U-03"))})` — asking for user
`"U-03"` (which belongs to tenant `"T-02"`) *while specifying* `"T-02"` as the
tenant — this succeeds. The line right before it,
`run(() =>{console.log(myUsers.getUser("T-01","U-03"))})`, asks for the **same**
user `"U-03"` but under tenant `"T-01"` — this is exactly the cross-tenant lookup
attempt `getUser`'s defensive check exists to catch, and it correctly throws
`"user not found for this tenant"`.

---

## File: `server.js` — the HTTP layer, piece by piece

```js
const http = require("http");
const {DuplicateId,NotFound,ValidationError,TenantManagement} = require("./tenantService")
const {UserDuplicateId,UserOrRoleNotFound,UserManagement} = require("./userService");

const myTenants = new TenantManagement()
const myUsers = new UserManagement(myTenants) 

myTenants.createTenant("T-01","Acme")
myTenants.createTenant("T-02","Globex")
myUsers.addUser("T-01",{ id:"U-01", name:"Kishore", role:"admin" })
myUsers.addUser("T-02",{ id:"U-02", name:"Jk", role:"member" })
```

Same DI setup as `main.js`, plus this version seeds some starter data **unguarded**
— these four setup calls are made directly, with no `run()`/`try-catch` wrapper at
all, so if any of them failed, the whole server would crash immediately on startup
rather than later during a request. That's an acceptable choice for one-time seed
data you know is valid, as opposed to the variable, possibly-bad data arriving from
real HTTP requests later, which absolutely does need the request-time error
handling shown next.

```js
function run(action, res) {
    try {
        action();
    }
    catch (err) {

        let status = 500;

        if (err instanceof ValidationError) {
            status = 400;                        // bad input
        }
        else if (err instanceof DuplicateId ||
            err instanceof UserDuplicateId) {
            status = 409;                        // conflict
        }
        else if (err instanceof NotFound ||
                 err instanceof UserOrRoleNotFound) {
            status = 404;                        // not found
        }

        res.writeHead(status, {
            "content-type": "application/json"
        });

        res.end(JSON.stringify({
            error: err.message
        }));
    }
}
```

This is the project's most important piece of new machinery: `run()` here is
**not** the simple print-and-continue helper from every earlier project — it's
rewritten specifically for an HTTP context. It takes a second parameter, `res`, and
instead of deciding *whether* to print a message, it decides **which HTTP status
code** to send back, based on *which kind* of error was thrown:
- `ValidationError` → **400**
- `DuplicateId` or `UserDuplicateId` → **409**
- `NotFound` or `UserOrRoleNotFound` → **404**
- anything else (an actual bug, not an expected domain error) → **500** (Internal
  Server Error), the `status` variable's default value, used precisely because this
  version has **no final `else { throw err }`** — unlike every earlier project's
  `run()`. This is a deliberate and correct difference for a *server*: a backend
  process should almost never crash outright just because one request triggered an
  unexpected error — it should report a 500 to that one client and keep running to
  serve every other request. This is the direct, practical reason a server's error
  boundary looks different from a one-shot script's error boundary.

Whatever the status ends up being, the response is always the same shape: JSON with
an `error` field holding the exception's message. This single `run()` function is
reused by every route below, so every route gets this exact same consistent
error-to-status mapping for free, rather than needing to repeat it per route (unlike
Project 7's `server.js`, which inlined its status-code choices directly into each
route by hand).

```js
const server = http.createServer((req, res) => {

    console.log(`${req.method} ${req.url}`);

    const parts = req.url.split("/").filter(Boolean)

    if(req.method === "GET" && parts[0] ==="tenants"){
        const tenantId = parts[1]
        const users = parts[2]
        const userId = parts[3]
```

Same path-splitting idea as Project 7, now supporting **up to four segments** —
`/tenants/T-01/users/U-01` splits into `["tenants", "T-01", "users", "U-01"]`, so
`tenantId = "T-01"`, `users = "users"` (used here only as a presence flag — its
actual string value is never checked, just whether it exists at all), and
`userId = "U-01"`. This is the "nested routes" idea mentioned in the concise notes:
one resource (`users`) nested inside another (`tenants`) in the URL path itself.

```js
        if(tenantId != null && users == null){
            run(()=>{
                res.writeHead(200,{"content-type":"application/json"})
                res.end(JSON.stringify({tenant: myTenants.getTenant(tenantId)}));
            },res)
            return;
        }

        if(users != null){

            if(userId != null){
                run(()=>{
                    const user = myUsers.getUser(tenantId,userId);
                    res.writeHead(200,{"content-type":"application/json"});
                    res.end(JSON.stringify({user}));
                },res)
                return;
            }
            run(()=>{
                res.writeHead(200,{"content-type":"application/json"});
                res.end(JSON.stringify({user: myUsers.listUsers(tenantId)}));
            },res)
            return;
        }
            
        run(()=>{
            res.writeHead(200,{"content-type":"application/json"})
            res.end(JSON.stringify({tenant: myTenants.listTenants()}));
        },res)
        return;
    }
```

Four different GET shapes, all under the `"tenants"` prefix, told apart purely by
which of `tenantId`/`users`/`userId` are present:
- `/tenants/:id` (tenantId set, no users segment) → get one tenant.
- `/tenants/:id/users/:userId` (both users and userId set) → get one user, by
  calling `myUsers.getUser(tenantId, userId)` — this is where the tenant-isolation
  check buried inside `getUser` actually gets exercised from a real request: a
  request for the right user under the *wrong* tenant id in the URL throws
  `UserOrRoleNotFound`, which `run()` correctly turns into a 404.
- `/tenants/:id/users` (users set, no userId) → list all users for that tenant.
- `/tenants` (nothing else set) → list all tenants.

Every branch follows the same shape: call `run(actionFn, res)`, passing an arrow
function that does the actual work and writes the response, then `return`
immediately after — the exact same "always return right after a matched route"
discipline as Project 7, just now wrapped through the shared `run()` helper instead
of being inline in every branch.

```js
    if(req.method === "POST" && parts[0] ==="tenants"){
        let body = ""
        const tenantId = parts[1]
        const users = parts[2]

        req.on("data",(chunks)=> body += chunks);
        req.on("end",()=>{
            let parseBody;
            try{
                parseBody = JSON.parse(body)
            }
            catch{
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error: "Invalid JSON"}))
                return;
            }
            
            if(tenantId != null){
                if(users != null){
                    run(()=>{
                        const user = myUsers.addUser(tenantId,parseBody)
                        res.writeHead(201,{"content-type":"application/json"});
                        res.end(JSON.stringify({user}));
                    },res)
                    return;
                }
            }

            run(()=>{
                const tenant = myTenants.createTenant(parseBody.id,parseBody.name);
                res.writeHead(201,{"content-type":"application/json"})
                res.end(JSON.stringify({tenant}))
            },res)
            return;

        })
        return;   // route matched — the async req.on("end") will send the response
    }
```

POST handles **two** different creates under the same `"tenants"` prefix: if the
URL is `/tenants/:id/users` (both `tenantId` and `users` present), it creates a
*user* under that tenant via `myUsers.addUser(tenantId, parseBody)`. Otherwise
(plain `/tenants`), it creates a *tenant* via `myTenants.createTenant(...)`. Both
branches reuse the shared `run()` helper, so a `ValidationError` (missing fields),
`DuplicateId`/`UserDuplicateId` (already exists), or `NotFound` (adding a user
under a nonexistent tenant id) thrown from deep inside either service method
automatically turns into the right status code without this route needing to know
anything about *why* it failed — just that `run()` will handle it. The trailing
comment `// route matched — the async req.on("end") will send the response` is
flagging the same async-stream subtlety from Project 7: the outer `return;` happens
immediately, long before the body has actually arrived; the real response is sent
later, from inside the `"end"` callback.

```js
    if(req.method === "PATCH" && parts[0] ==="tenants"){
        let body = ""
        const tenantId = parts[1]
        const users = parts[2]
        const userId = parts[3]

        req.on("data",(chunks)=> body += chunks);
        req.on("end",()=>{
            let parseBody;
            try{
                parseBody = JSON.parse(body)
            }
            catch{
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error: "Invalid JSON"}))
                return;
            }
            
            if(tenantId != null){
                if(users != null){
                    run(()=>{
                        const upt = myUsers.updateRole(tenantId,userId,parseBody.role)
                        res.writeHead(200,{"content-type":"application/json"});
                        res.end(JSON.stringify({user: upt}));
                    },res)
                    return;
                }
            }

        })
        return;   // route matched
    }
```

PATCH only handles updating a user's role
(`/tenants/:tenantId/users/:userId`, calling `myUsers.updateRole(...)`) — there is
**no branch here for PATCHing a tenant itself** (e.g. renaming a tenant). Look
closely at what happens if `tenantId` is set but `users` is **not** (a request like
`PATCH /tenants/T-01` with no `/users/...` after it): the outer `if(tenantId != null)`
is true, but the inner `if(users != null)` is false, so **neither** `run(...)` call
happens — the `"end"` callback simply finishes with nothing written to `res` at
all. This means **no response is ever sent** for that specific shape of PATCH
request — not even an error — and the connection would simply hang until the
client eventually times out. See Gotchas for why this is a real, structurally
present bug, not just a theoretical one.

```js
    if(req.method === "DELETE" && parts[0] ==="tenants"){
        let body = ""
        const tenantId = parts[1]
        const users = parts[2]
        const userId = parts[3]
        
        if(tenantId != null){
            if(users != null){
                run(()=>{
                    myUsers.removeUser(tenantId,userId)
                    res.writeHead(204);            // 204 No Content — no body
                    res.end();
                },res)
                return;
            }
        }
        return;   // route matched
    }

    // no route matched → 404
    res.writeHead(404,{"content-type":"application/json"})
    res.end(JSON.stringify({error:"route not found"}))
})
server.listen(3003, () => console.log("Server on http://localhost:3003"));
```

DELETE has the **exact same structural gap** as PATCH: it only handles removing a
user (`tenantId` and `users` both set), and if `tenantId` is set but `users` is not
(a request like `DELETE /tenants/T-01`, presumably intended to delete an entire
tenant — a feature `tenantService.js` doesn't even have a method for), the
`if(users != null)` check fails, the inner `run(...)` never runs, and the outer
`return;` is reached having never called `res.end()` at all. Same hang as the PATCH
case. Note also: unlike every POST/PATCH route, this DELETE route doesn't read or
parse a request body at all (`let body = ""` is declared but never actually used by
anything — no `req.on(...)` listeners are registered here), which makes sense since
a DELETE typically doesn't need one, but it's worth noticing the unused `body`
variable as a small leftover from copy-pasting the shape of the other route
handlers.

Finally, the one true 404 fallback at the very bottom, reached only when none of
the method/path combinations above matched at all (e.g. `GET /unknown`).

---

## Gotchas worth remembering

- **The PATCH and DELETE routes in `server.js` can silently hang the connection.**
  Both only handle the "nested under a tenant's users" shape
  (`/tenants/:id/users/:userId`). A request matching the outer `parts[0] === "tenants"`
  check but missing the `users` segment — e.g. `PATCH /tenants/T-01` or
  `DELETE /tenants/T-01` — falls through every inner `if` without ever calling
  `res.end()`, leaving the client waiting indefinitely with no response and no
  error. This is worse than returning a wrong status code: at least a wrong status
  code is visible immediately. A request that just hangs forever is much harder to
  diagnose. The fix matching this project's own pattern would be an unconditional
  "no matching sub-route" response at the end of each of those two blocks, the same
  way the very bottom of the whole file has one final fallback for completely
  unmatched routes.

- **Tenant isolation here is enforced entirely by a `tenantId` field stamped on
  each user record inside one shared, flat `#userData` Map — not by separate
  storage per tenant.** Every read method (`getUser`, `listUsers`) and every
  mutation (`updateRole`, `removeUser`) was written to manually re-check
  `storedUser.tenantId === tenantId` after looking the user up by id alone. This
  works, and it's the correct instinct, but it depends entirely on **every single
  method remembering to do that check** — there's no structural guarantee (like a
  composite key, e.g. storing users under `` `${tenantId}:${userId}` `` instead of
  just `userId`) that would make forgetting the check impossible rather than merely
  unlikely.

- **That dependency on "remembering to check" actually breaks in exactly one
  place: `addUser`'s uniqueness check is NOT tenant-scoped.**
  `if(this.#userData.has(user.id)){ throw new UserDuplicateId(...) }` checks
  whether `user.id` exists **anywhere in the entire Map**, across *all* tenants —
  not just within the tenant currently being added to. Concretely: tenant
  `"T-01"` adding a user with id `"U-05"` would permanently "reserve" that id
  globally — if tenant `"T-02"` later also tried to add a user with id `"U-05"`
  (a perfectly reasonable thing to want, since ids are usually only meant to be
  unique *within* a tenant, not across the whole system), it would incorrectly fail
  with `"user already exists"`, even though no actual conflict exists from
  `"T-02"`'s point of view. This is a genuine multi-tenancy design bug, and it's
  the single most important thing to understand about this project: every *read*
  and *mutation* path was carefully tenant-scoped, but the *creation* path's
  uniqueness check was not — a good reminder that a multi-tenant guarantee has to be
  enforced at **every** point data is written or compared, not just the points that
  happen to be the ones you tested.

- **`main.js`'s `run()` doesn't catch `ValidationError`**, even though
  `userService.js` can throw it (e.g. the `"superuser"` role in the script's own
  test data). `server.js`'s `run()` does handle it correctly, mapping it to 400.
  This is a good example of how two "copies" of a similar helper function, written
  at different points, can drift out of sync — the no-HTTP driver's error list
  wasn't kept updated when `ValidationError` was introduced, while the HTTP
  server's version was.
