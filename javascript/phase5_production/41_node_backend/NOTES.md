# Module 41 — Node.js Backend Foundations — Extended Notes

Three days of work, same underlying idea rebuilt three times at increasing levels of
polish: Day 1 does everything by hand with Node's raw `http` module (no framework, no
help), Day 2 rebuilds the exact same behavior with Express (a framework that automates
the boring/dangerous parts), Day 3 adds environment-variable config and splits the code
into proper layers (Controller → Service → Repository) the way a real production app is
actually organized. Nothing here is a toy for its own sake — this whole module is the
direct on-ramp to NestJS (Module 44): Express's routing/middleware model is literally
the thing Nest sits on top of and wraps in decorators.

---

## Day 1 — Raw `http`: status codes, idempotency, content negotiation, `fetch`

### What I learned today

Before today I had only ever *received* HTTP requests conceptually (as a user of APIs).
Today was the first time writing both sides: the raw server that answers requests by
hand, with zero framework help, AND the raw client (`fetch`) that sends them. Three
separate files, three separate lessons: `http_task1.ts` is about status codes
(401 vs 403) and reading headers safely; `http_task2.ts` proves **idempotency** for real
by hammering the same request repeatedly and watching what does/doesn't change;
`http_task3.ts` is **content negotiation** — reading what format the client *wants*
(`Accept` header) and answering in that format instead of always assuming JSON.

The biggest lesson of the day wasn't a feature, it was a bug I caused myself: calling
`.includes(...)` on a header that might not exist at all crashes the whole request,
because `undefined.includes` is not a function call that exists. Every file below reads
headers defensively because of that lesson.

### File: `http_task1.ts` — line by line

```ts
import { createServer, IncomingMessage, ServerResponse } from "node:http";
```
`node:http` is a module built into Node itself — nothing to install. `createServer` is a
function whose whole job is: "give me a callback function, and I'll call that callback
automatically, once, every single time any HTTP request reaches this server."
`IncomingMessage` and `ServerResponse` are **types only** (TypeScript, erased at
runtime) — they describe the shape of the request object and response object so the
editor and compiler know what properties/methods exist on each (`req.method`,
`req.headers`, `res.writeHead`, `res.end`, etc).

```ts
const secret: string = "letmein";
```
A hardcoded "password" this toy server checks incoming requests against. In a real app
this would come from an environment variable (exactly the lesson of Day 3).

```ts
const myShape = {};
```
A leftover scratch variable from fixing an earlier syntax mistake (the comment above it
says so) — it doesn't do anything functionally; it's not read anywhere below.

```ts
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
```
This is the one callback `createServer` was promised above. `req` = the incoming
request (method, url, headers, and — if there's a body — a readable stream of it).
`res` = the outgoing response object; nothing is sent to the client until you call
methods on `res`.

```ts
    console.log(`${req.method} ${req.url}`);
```
Just logging every request as it comes in, e.g. `GET /secret` — pure visibility while
developing, no effect on the response.

```ts
    const parts = (req.url || "").split("/").filter(Boolean);
```
`req.url` is *typed* as possibly `undefined` (an edge case TypeScript insists you
handle even though it's rare in practice), so `|| ""` falls back to an empty string
before calling `.split` on it — calling `.split` on `undefined` would crash instantly.
`"/secret".split("/")` gives `["", "secret"]` (there's an empty string before the first
slash); `.filter(Boolean)` throws out falsy entries (empty strings are falsy), leaving
`["secret"]`. This manual parsing is exactly the work Express's router will do for you
starting tomorrow.

```ts
    if (req.method === "GET" && parts[0] === "secret") {
```
Hand-rolled route matching: "is this a GET request, and is the first path segment
literally `secret`?" This *is* `app.get("/secret", ...)`, just written out by hand
instead of handed to a framework.

```ts
        const apiKey = req.headers["x-api-key"];
```
`req.headers` is a plain JS object; Node lowercases every header name automatically, so
a client sending `X-Api-Key` still has to be read here as `"x-api-key"`.

```ts
        if (!apiKey) {
            res.writeHead(401, {
                "content-type": "application/json"
            });
            res.end(JSON.stringify({ error: "missing key" }));
            return;
        }
```
No key at all was sent → **401 Unauthorized**, meaning "I don't know who you are."
`res.writeHead(status, headers)` sets the status line and response headers (must happen
before any body is written). `res.end(body)` sends the body and signals "this response
is finished, nothing more is coming." The `return` right after is critical — without
it, execution would fall through to the code below and try to write a *second* response
onto the same request, crashing with `ERR_HTTP_HEADERS_SENT`.

```ts
        if (apiKey !== secret) {
            res.writeHead(403, {
                "content-type": "application/json"
            });
            res.end(JSON.stringify({ error: "wrong secret" }));
            return;
        }
```
A key *was* sent, but it's the wrong one → **403 Forbidden**, meaning "I know who you
are (you sent something), but you're not allowed in." This is the real-world
distinction: 401 = unidentified, 403 = identified but denied.

```ts
        res.writeHead(200, {
            "content-type": "application/json"
        });
        res.end(JSON.stringify({ message: "success" }));
    }
});
```
Correct key → **200 OK** with a small JSON success payload. The closing `}` ends the
`if`, the next `}` ends the whole `createServer` callback. Notice: if the request isn't
`GET /secret` at all, none of these branches run and the function just falls off the
end — Node still considers the request "handled" in the sense that nothing crashes, but
no response is ever sent, so the client would hang. (This gap doesn't bite today because
every test call below is genuinely `GET /secret`, but it's worth noticing — Express adds
a default 404 for unmatched routes that raw `http` does not give you for free.)

```ts
server.listen(4000, async() => {
    console.log("server listening at port 4000");
```
`server.listen(port, callback)` actually starts the server accepting connections on
port 4000; the callback runs once the server is really up and ready, not before. The
callback is declared `async` specifically so `await fetch(...)` can be used inside it.

```ts
    const res = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"wrong"}
    })

    console.log(res.status)
    console.log(await res.json())
```
`fetch` is the **client** side of HTTP — sending a request *out*, the opposite role from
everything above. `await fetch(...)` only waits for the response *headers and status*
to arrive; the body is a separate stream that hasn't necessarily finished downloading
yet, which is why reading it is a second, separate `await res.json()` call. This first
call sends the wrong key on purpose, so it should come back `403`.

```ts
    const res2 = await fetch("http://localhost:4000/secret",{
    })
    console.log(res2.status)
    console.log(await res2.json())

    const res3 = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"letmein"}
    })
    console.log(res3.status)
    console.log(await res3.json())
});
```
Same pattern, twice more, deliberately varying the one thing under test: `res2` sends no
headers object at all → no `x-api-key` → should come back `401`. `res3` sends the
correct key (`"letmein"`, matching `secret` up top) → should come back `200` with the
success message. Three calls, three branches of the `if`/`if`/`else` logic above,
exercised one at a time and the actual status/body printed to prove it.

### File: `http_task2.ts` — line by line

This file exists to **prove idempotency**, not just explain it: it stands up two tiny
in-memory "resources" (`items`, a growable list, and `config`, a single overwritable
value) and hammers each one with the exact same request twice in a row, to literally
watch `POST` grow the list on both calls while `PUT` leaves the single value unchanged
on both calls.

```ts
interface Items {
    id: string,
    name: string
}

interface Config {
    value: string
}

let myItems: Items[] = [];
let myConfig: Config = { value: "" };
let idCount = 0;
```
Two shapes described as `interface`s (compile-time only, erased at runtime — pure
documentation for the compiler and editor). `myItems` starts as an empty array that
will grow; `myConfig` starts with an empty string that will be overwritten in place;
`idCount` is a counter used to generate fake unique IDs below.

```ts
const server = createServer((req: IncomingMessage, res: ServerResponse) => {

    console.log(`${req.method} ${req.url}`);

    const parts = (req.url || "").split("/").filter(Boolean);
```
Same setup pattern as `http_task1.ts`: log the request, split the URL into clean path
segments.

```ts
    // POST /items
    if (req.method === "POST" && parts[0] === "items") {

        let body: string = "";

        req.on("data", (chunks: Buffer) => {
            body += chunks;
        });
```
This is the part raw `http` makes you do manually that Express automates tomorrow: the
request *body* (the JSON someone POSTed) doesn't arrive all at once — it streams in as
one or more chunks of raw bytes (`Buffer`s). `req.on("data", ...)` registers a listener
that fires every time a new chunk arrives; `body += chunks` relies on `Buffer`'s
`toString()` happening implicitly during string concatenation, appending each chunk's
text onto the growing `body` string.

```ts
        req.on("end", () => {

            try {
                const pBody = JSON.parse(body) as Partial<Items>;
```
`"end"` fires once, after every chunk has arrived — this is the only safe moment to
actually use the full body. `JSON.parse` turns the accumulated text into a real object;
`as Partial<Items>` tells TypeScript "trust me, treat this as an `Items` where every
field is optional" — necessary because `JSON.parse`'s real return type is just `any`,
and the client's JSON can't be trusted to actually match the shape (hence the manual
check right below).

```ts
                if (typeof pBody.name !== "string" || !pBody.name) {
                    res.writeHead(400, {
                        "content-type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "Name required"
                    }));

                    return;
                }
```
Validation: `name` must actually be a string and non-empty (an empty string is falsy,
so `!pBody.name` also catches `name: ""`). Missing/invalid input on the *client's* side
→ **400 Bad Request**. `return` again prevents a double response.

```ts
                const itemId = "ID-" + (++idCount);

                const item: Items = {
                    id: itemId,
                    name: pBody.name
                };

                myItems.push(item);

                res.writeHead(201, {
                    "content-type": "application/json"
                });

                res.end(JSON.stringify({
                    item: item
                }));
            }
```
`++idCount` increments the counter *then* reads it (pre-increment), so the first item
ever created gets `"ID-1"`. A new item object is built and `push`ed onto the shared
array — this mutation is the whole point: calling this same endpoint twice creates
**two separate items**, proving `POST` is not idempotent. **201 Created** (not 200) is
the conventional status for "a new resource now exists," with the created item echoed
back in the body.

```ts
            catch (err) {
                res.writeHead(400, {
                    "content-type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));
            }
        });

        return;
    }
```
If `JSON.parse` itself throws (the body wasn't valid JSON at all, e.g. empty or
malformed), catch it and answer 400 rather than letting the server crash. The outer
`return;` right before the closing `}` exits the whole `if` block immediately after
registering the `"data"`/`"end"` listeners — necessary because the real work happens
later, asynchronously, inside the `"end"` callback; without this `return`, execution
would otherwise fall through and try to match the `PUT`/`GET` branches below on the very
same request.

```ts
    // PUT /config
    if (req.method === "PUT" && parts[0] === "config") {

        let body: string = "";

        req.on("data", (chunks: Buffer) => {
            body += chunks;
        });

        req.on("end", () => {

            try {
                const pBody = JSON.parse(body) as Partial<Config>;

                if (typeof pBody.value !== "string") {
                    res.writeHead(400, {...});
                    res.end(JSON.stringify({ error: "Value required" }));
                    return;
                }

                myConfig.value = pBody.value;

                res.writeHead(200, {...});
                res.end(JSON.stringify(myConfig));
            }
            catch (err) { ...400... }
        });

        return;
    }
```
Exact same body-collection pattern as `POST /items`, but the *effect* is the
idempotency contrast: instead of `.push`-ing a new entry, this **overwrites**
`myConfig.value` in place every time. Call this twice with the same `{ value: "X" }`
body and the end state after both calls is identical — `myConfig` still just holds
`{ value: "X" }`, not two of anything. That's exactly what "idempotent" means: repeating
the same request leaves the same end state, whether you call it once or five times.
Also notice this returns **200**, not 201 — nothing new was *created*, an existing
resource (`config`) was updated/replaced.

```ts
    // GET /items
    if (req.method === "GET" && parts[0] === "items") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(myItems));
        return;
    }

    // GET /config
    if (req.method === "GET" && parts[0] === "config") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(myConfig));
        return;
    }
});
```
Two read-only routes, no body parsing needed since `GET` requests don't carry a body —
just serialize whatever is currently in memory and send it back as-is.

```ts
server.listen(4000, async() => {
    console.log("Server listening on port 4000");

    const res1 = await fetch("http://localhost:4000/items",{
        method : "POST",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({name: "kishore"})
    })
    console.log(res1.status)
    console.log(await res1.json())
    const res2 = await fetch("http://localhost:4000/items",{
        method : "POST",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({name: "kishore"})
    })
    console.log(res2.status)
    console.log(await res2.json())

    const gFetch = await fetch("http://localhost:4000/items")
    console.log(gFetch.status)
    console.log(await gFetch.json())
```
The exact same `POST /items` request, fired twice in a row with *identical* bodies.
On the client side: `fetch` needs `method`, a `Content-Type` header (so the server
knows to expect JSON — though this particular server doesn't actually check that
header, it's good practice), and `body` as a JSON **string** (`fetch` never
auto-stringifies objects for you). The final `gFetch` call reads back `/items` with a
plain `GET` (no options object needed) — the printed array should show **two** separate
items with two different IDs, visual proof `POST` is not idempotent.

```ts
    const cres1 = await fetch("http://localhost:4000/config",{
        method : "PUT",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({value: "X"})
    })
    console.log(cres1.status)
    console.log(await cres1.json())
    const cres2 = await fetch("http://localhost:4000/config",{
        method : "PUT",
        headers: {"Content-Type":"application/json"},
        body : JSON.stringify({value: "X"})
    })
    console.log(cres2.status)
    console.log(await cres2.json())

    const cgFetch = await fetch("http://localhost:4000/config")
    console.log(cgFetch.status)
    console.log(await cgFetch.json())
});
```
Mirror image using `PUT /config` with the exact same body (`{ value: "X" }`) sent
twice. The final `GET /config` should print a single `{ value: "X" }` — not two
entries, not a doubled value — proving `PUT` *is* idempotent: calling it twice left
the exact same end state as calling it once.

### File: `http_task3.ts` — line by line

```ts
const myServer = createServer((req: IncomingMessage, res: ServerResponse)=>{

    console.log(`${req.method} ${req.url}`)

    const parts = (req.url || "").split("/").filter(Boolean)

    const accept = req.headers["accept"] ?? "";
```
Same familiar setup, except now the `Accept` header is read into its own variable —
and **this is the line that embodies the day's real lesson**. `req.headers["accept"]`
can genuinely be `undefined` (a client is not required to send an `Accept` header at
all), so `?? ""` (nullish coalescing) falls back to an empty string *before* anything
tries to call a string method on it. Doing `req.headers["accept"].includes(...)`
directly, without this guard, is exactly the bug that was hit for real while building
this: `undefined.includes(...)` throws, because `undefined` has no `.includes` method —
the whole request crashes instead of getting a response.

```ts
    if(req.method === "GET" && parts[0] === "tenants"&& accept.includes("application/json")){

        res.writeHead(200,{"content-type":"application/json"})
        res.end(JSON.stringify({id:parts[1],name:"kishore"}))
    }
```
**Content negotiation**: if the client's `Accept` header says it wants JSON, answer
with real JSON — `parts[1]` is the segment *after* `"tenants"` in the URL (e.g. `T-01`
in `/tenants/T-01`), used here as the "id" purely by hand-parsed position (Express's
`:id` route param tomorrow replaces this with something far less fragile).

```ts
    else if(req.method === "GET" && parts[0] === "tenants"){

        res.writeHead(200,{"content-type":"text/plain"})
        res.end(`id: ${parts[1]},name: kishore`)
    }
})
```
If it's the same route but the client did **not** ask for JSON, answer the exact same
information as a plain-text sentence instead, with a `text/plain` content-type header
that honestly describes what was actually sent. Same data, different format, chosen
by *reading what the client asked for* rather than the server unilaterally deciding.
Note this is `else if`, not a second independent `if` — guarding against the
double-response bug from Day 1's gotcha: if these were two unrelated `if`s and somehow
both conditions were true, both would try to write a response to the same request.

```ts
myServer.listen(4000,async()=>{console.log("server listening at port 4000")

    const res1 = await fetch("http://localhost:4000/tenants/T-01",{
        headers: {"accept":"application/json"}
    })

    console.log(res1.status);
    
    console.log(await res1.json())
    console.log(res1.headers.get("content-type"));   
```
First test call explicitly asks for JSON via the `Accept` header → expect status 200,
a real parsed object from `.json()`, and `content-type` read back as
`"application/json"`. Note `res1.headers` (on the **client** side, the `fetch`
`Response` object) is a `Headers` object with a `.get(name)` **method** — this is
deliberately different from the server side's `req.headers["..."]`, which is a plain
object read with **bracket notation**. Using bracket access on `res1.headers` would
silently return `undefined` instead of erroring, which is an easy trap.

```ts
    const res2 = await fetch("http://localhost:4000/tenants/T-01",{
        headers: {"accept":"text/plain"}
    })

    console.log(res2.status);
    console.log(res2.headers.get("content-type")); 
    console.log(await res2.text())
})
```
Second call asks for plain text instead → expect `content-type: text/plain` and the
body read with `.text()` (not `.json()` — calling `.json()` on a plain-text,
non-JSON-formatted body would throw a parse error). This is the direct client-side
proof that the exact same URL, same method, same route, gave back two genuinely
different response formats purely based on one request header.

---

## Day 2 — Express: rebuilding the same servers with a framework

### What I learned today

Everything from Day 1 still happens underneath — Express is not magic, it's built on
top of raw `http`. What changes is *who does the repetitive, error-prone parts*. Three
files, same three behaviors as Day 1, side by side for direct comparison:

- `express_task1.ts` → rebuild of `http_task1.ts` (the `/secret` API-key check), using
  **middleware** for the auth check instead of an `if` chain inline in the route.
- `express_task2.ts` → rebuild of `http_task2.ts` (items/config CRUD), using
  `express.json()` instead of hand-rolled `req.on("data"/"end")` body collection.
- `express_task3.ts` → rebuild of `http_task3.ts` (content negotiation), using a real
  route parameter (`:id`) instead of hand-splitting the URL by hand.

The single biggest new idea of the day is **middleware**: a function with the exact
signature `(req, res, next) => {...}` that runs *before* a route handler gets a turn.
It's the same idea as an airport security checkpoint every passenger passes through
regardless of which gate they're flying from — `app.use(fn)` posts it at the entrance
for *every* route; passing it as an extra argument to one specific `app.get(path, fn,
handler)` scopes the same kind of function to just that one route.

### File: `express_task1.ts` — line by line

```ts
import express from "express"
import { RequestHandler} from "express"

const app = express()
```
`express` (the default export) is a factory function — calling it builds a new,
empty Express application object, stored in `app`. Nothing is listening yet; this is
just the app instance that routes and middleware get attached to next.
`RequestHandler` is a **type** export — a type alias for the exact function shape
`(req, res, next) => void`, the same kind of thing as a `type` alias written by hand in
earlier modules, just pre-defined by Express's own type definitions.

```ts
const CheckApiKey : RequestHandler= (req,res,next) =>{

    const apiKey = req.headers['x-api-key']

    if(!apiKey){
        return res.status(401).json({error: "missing key"})
    }
    if(apiKey != "letmein"){
        return res.status(403).json({error: "wrong secret"})
    }
    next()
}
```
This is the **middleware** — a standalone function, not glued into a route's body like
Day 1's raw version. `req.headers['x-api-key']` reads the same custom header as before.
Missing key → `401` with `return` (so execution stops right there, nothing after this
function runs for this request). Wrong key → `403`, same pattern. If *neither* early
`return` fired, the key must be correct — call `next()`, which is Express's "I'm done,
let whatever comes after me run." `res.status(code).json(body)` is Express's
convenience chain replacing raw `http`'s two-step `writeHead` + `end(JSON.stringify(...))`
— `.status()` sets the code and returns `res` again so `.json()` can be chained
straight onto it, and `.json()` both serializes the object *and* sets the
`content-type` header automatically.

```ts
app.get("/secret",CheckApiKey,(req,res)=>{

    res.status(200).json({message: 'success'})

})
```
This is the route declaration — `app.get(path, ...handlers)` registers that *this
specific* middleware (`CheckApiKey`) should run before *this specific* route's final
handler, and only for this route (not globally). If `CheckApiKey` called `next()`
(meaning the key was valid), Express moves on to the next function in the list — the
actual route handler — which just answers 200 with the success message. Compare this
to Day 1's single giant nested `if` block doing auth-check-and-respond all in one
place: here the *same logic* is split into a reusable, separately-testable piece
(the middleware) plus a route handler that only cares about the "already authenticated"
case.

```ts
app.listen(4000,async()=>{
    console.log("server listening at port 4000")
    const res = await fetch("http://localhost:4000/secret",{
    })

    console.log(res.status)
    console.log(await res.json())

    const res1 = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"wrong"}
    })

    console.log(res1.status)
    console.log(await res1.json())

    const res2 = await fetch("http://localhost:4000/secret",{
        headers:{"x-api-key":"letmein"}
    })

    console.log(res2.status)
    console.log(await res2.json())
})
```
`app.listen(port, callback)` is Express's equivalent of raw `http`'s
`server.listen(...)` — same role, same timing (callback runs once the server is really
up). The three `fetch` calls are the identical test sequence as Day 1's
`http_task1.ts`: no key → expect 401, wrong key → expect 403, correct key → expect 200
— proving the Express rebuild behaves identically to the raw version, just with the
logic reorganized.

### File: `express_task2.ts` — line by line

```ts
import express from "express"
import { RequestHandler,Request,Response } from "express"

export const app = express()
app.use(express.json())
```
`Request`/`Response` are the Express-specific type names for `req`/`res` parameters
(richer than raw `http`'s `IncomingMessage`/`ServerResponse` — Express adds its own
convenience properties/methods on top, like `.params`, `.body`, `.status()`).
`export const app` — this app instance is exported so another file (`layered_task3.ts`
does this pattern too) could import and reuse it, e.g. for a separate test-runner file.
`app.use(express.json())` is the single line replacing *all* of Day 1's manual
`req.on("data", ...)` / `req.on("end", ...)` / `JSON.parse` dance — it's built-in
middleware that runs globally, automatically collects and parses any JSON request body,
and makes the result available as `req.body` before any route handler even runs.

```ts
export interface Items{
    id: string,
    name: string
}
export const myItem:Items[] = []
export let itemCount = 0

export interface Config{
    value: string
}

export let myConfig: Config ={value:""}
```
Same shapes and same in-memory storage as `http_task2.ts`, just also `export`ed this
time (for reuse) — identical idea, identical starting state.

```ts
app.post("/items",(req:Request,res:Response)=>{

    if(!req.body.name){
        return res.status(400).json({error: "Missing name"})
    }
    const itemCode = `ID-${++itemCount}`
    const item: Items = {id:itemCode,name: req.body.name}
    
    myItem.push(item)
    return res.status(201).json(item)
})
```
Thanks to `express.json()` already having run, `req.body` is simply available here —
no manual parsing, no `try`/`catch` around `JSON.parse` needed in this handler at all
(Express's own body-parser handles malformed JSON itself, before this handler is even
reached). Validation (`!req.body.name`) and the "grow the array" behavior are otherwise
identical to the raw version: same 400 for missing name, same `++itemCount` pre-increment
ID generation, same 201 + push for success.

```ts
app.get("/items",(req:Request,res: Response)=>{

    return res.status(200).json(myItem)
})

app.put("/config",(req: Request,res: Response)=>{

    const myCon : Config= req.body
    myConfig.value = myCon.value
    return res.status(200).json(myConfig)
})

app.get("/config",(req:Request, res: Response)=>{

    return res.status(200).json(myConfig)
})
```
Four tiny routes replacing Day 1's hand-matched `if` chain entirely — Express's own
router does the method + path matching that used to be `parts[0] === "items"` by hand.
`PUT /config` reads the already-parsed body straight off `req.body`, casts it as
`Config` (trusting the shape, no runtime validation here — a shortcut compared to the
raw version's `typeof pBody.value !== "string"` check), and overwrites `myConfig.value`
in place — the exact same idempotent-update behavior as Day 1.

```ts
app.listen(4000, async() => {
    console.log("Server listening on port 4000");
    // ...identical fetch test sequence as http_task2.ts...
});
```
The whole fetch test block at the bottom is line-for-line the same sequence as
`http_task2.ts`'s: POST `/items` twice with the same body → expect two separate items
on the follow-up GET (proving POST isn't idempotent); PUT `/config` twice with the same
body → expect one unchanged value on the follow-up GET (proving PUT is idempotent).
Same experiment, same expected outcome, now running through Express's machinery
instead of raw `http`'s.

### File: `express_task3.ts` — line by line

```ts
import express from "express"
import { Request,Response } from "express"

const app = express()
app.use(express.json())


app.use((req: Request, res: Response, next)=>{

    console.log(`${req.method},${req.url}`)
    next()
})
```
This is a second, *different* kind of middleware than `express_task1.ts`'s auth check —
an anonymous one, registered with `app.use(...)` and no path, meaning it runs on
**every single request**, no matter the method or route, purely for logging. It calls
`next()` unconditionally since its only job is to observe, not to block anything.
This directly demonstrates the lesson that middleware isn't one special mechanism —
`CheckApiKey` from Day 2's first file and this logger are the *same shape* of function,
just attached differently (one scoped to a single route, this one global).

```ts
app.get("/tenants/:id",(req: Request, res: Response)=>{

    const id = req.params.id
    const thisAccept = req.headers["accept"]?.includes("application/json")
```
`:id` inside the route path is a **route parameter** — Express itself captures
whatever text appears in that position of the URL and makes it available as
`req.params.id`. This directly replaces Day 1's manual, fragile
`parts[1]` (positional array indexing after a hand-written `.split("/")`) with a named,
self-documenting, framework-guaranteed value. Note the `Accept` header is read with
`?.includes(...)` (optional chaining) here rather than Day 1's `?? ""` fallback —
different syntax, same defensive purpose: if `req.headers["accept"]` is `undefined`,
`?.` short-circuits to `undefined` instead of crashing, rather than falling back to an
empty string first. Either style avoids the "accept header crash" gotcha; the project
settled on `?.` here.

```ts
    if(thisAccept){
        return res.status(200).json({id: id,name: "kishore"})
    }
    else {
        return res.status(200)
        .type("text")
        .send(`id: ${id}, name: kishore`)
    }
})
```
Same content-negotiation idea as `http_task3.ts`: JSON if asked for it, otherwise plain
text. `.json(...)` auto-sets the content-type to `application/json`; in the text branch,
`.type("text")` explicitly sets the content-type to a text MIME type and `.send(...)`
(rather than `.json(...)`) sends a raw string body unchanged — Express's equivalent of
raw `http`'s `writeHead(200, {"content-type":"text/plain"})` + `res.end(`...`)`, just
expressed as a readable method chain instead of two separate calls.

```ts
app.listen(4000,async()=>{console.log("server listening at port 4000")
    // ...identical two-call test sequence as http_task3.ts, same expectations...
})
```
Same two test calls as Day 1's content-negotiation file: `Accept: application/json` →
expect a parsed JSON object and `content-type: application/json`; `Accept: text/plain`
→ expect `.text()` to work and `content-type` to reflect plain text.

---

## Day 3 — Environment config + layered architecture (Controller → Service → Repository)

### What I learned today

Two separate but connected lessons today. First: secrets and config (API keys, ports)
should never be hardcoded into source files — they belong in environment variables,
loaded from a `.env` file, and the app should refuse to even start if something
required is missing, rather than silently limping along and failing later at request
time. Second, and bigger: splitting one messy file into three deliberate layers —
**Repository** (pure data storage, no HTTP awareness at all), **Service** (business
rules/validation, still no `req`/`res`), **Controller** (the *only* layer that ever
touches `req`/`res`, translating HTTP in and HTTP out). This is exactly the shape every
real NestJS module takes (`*.controller.ts` / `*.service.ts` / `*.repository.ts`), and
it's exactly what procIq's real backend modules look like.

### File: `layered_task1.ts` — line by line

```ts
import "dotenv/config"; 
```
A side-effect-only import — nothing is pulled out of this module into a named
variable; just importing it runs code that reads the `.env` file in this folder and
copies every `KEY=value` line into `process.env`. This must be the *first* import in
the entry file, before anything that might read `process.env` runs.

```ts
const requireEnv = (param: string) =>{

    const value = process.env[param] ?? undefined

    if(!value){
        throw new Error(`Missing env variable of ${param}`)
    }
    return value
}
```
A small reusable guard: look up an environment variable by name; `process.env[param]`
is already either a string or `undefined`, so `?? undefined` here doesn't actually
change anything (a slightly redundant line, but harmless) — the real work is the `if`:
if the value is missing/empty, **throw immediately**, crashing the whole startup
process loudly, rather than letting some route handler discover the missing config
deep into a live request, confusing a real user with a mysterious failure. This is
"fail loud at boot," the same philosophy as the validated-input lessons from earlier
modules, now applied to configuration instead of user input.

```ts
console.log(requireEnv("PORT"))
console.log(requireEnv("API_KEY"))
```
Calling the guard for both required variables and printing what came back — this file
is purely a standalone proof that the pattern works, reading from the `.env` file that
sits right next to it (`PORT = 4000` and `API_KEY = "letmein"`).

### File: `layered_task2.ts` — line by line

```ts
import "dotenv/config"
import express from "express"
import { RequestHandler,Request,Response } from "express"

const requireEnv = (param: string) => {
    const value = process.env[param];
    if (!value) {
        throw new Error(`Missing env variable of ${param}`);
    }
    return value;
}

const API_KEY = requireEnv("API_KEY")
```
Same `requireEnv` guard as `layered_task1.ts` (rewritten locally rather than imported —
each module folder here is its own isolated TypeScript project with its own
`tsconfig.json`, so importing a file from a sibling module folder breaks TypeScript's
`rootDir` assumption; the fix for that, path aliases across a shared workspace, is
deliberately much later). This time the fetched value (`API_KEY`) is actually used
below, as the real secret the app checks incoming requests against — no more
hardcoded `"letmein"` string baked into the source like Day 1 and Day 2 had.

```ts
export const app = express()
app.use(express.json())

export interface Items{
    id: string,
    name: string
}
app.use(express.json())
```
Same Express setup as Day 2. `app.use(express.json())` is accidentally registered
**twice** here — harmless (Express just runs the same body-parsing middleware twice in
a row, which is a no-op the second time since the body's already been read and parsed),
but worth noticing as a real, small, inconsequential duplication rather than something
intentional.

```ts
class ValidationError extends Error{

    constructor(message: string){
        super(message),
        this.name = "ValidationError"
    }
}
```
A custom error class extending the built-in `Error` — `extends Error` means
`instanceof ValidationError` checks work later, and anything that already knows how to
handle a generic `Error` (like logging it) still works. `super(message)` passes the
message up to `Error`'s own constructor, which is what actually sets `this.message`.
`this.name = "ValidationError"` sets the `.name` property specifically (not
`.message` — these are two different properties on an `Error`), so that `error.name`
reliably reads `"ValidationError"` rather than the generic `"Error"`.

```ts
class ItemRepository{
    #data : Map<string,Items> = new Map()

    create(items:Items):Items{
        const myItem = items
        this.#data.set(items.id,items)
        return items;
    }

    list(){
        return [...this.#data.values()]
    }
}
```
This is the **Repository layer**: pure data storage, nothing here knows what HTTP is,
what a request looks like, or what a valid name even means — its only job is "store
this" and "give me everything stored." `#data` is a **private class field** (the `#`
makes it genuinely inaccessible from outside the class, enforced by the language
itself, not just a naming convention) holding a `Map` keyed by item ID. `create`
stores an item and hands the same object back; `myItem` inside it is an unused local
alias (harmless dead code). `list()` spreads `.values()` (a `Map` iterator) into a
plain array with `[...]`, since callers expect an array, not a raw iterator.

```ts
class ItemService{

    constructor(private readonly repo: ItemRepository){}

    createItem(name: string):Items{

        if(!name){
            throw new ValidationError("name is required")
        }
        return this.repo.create({id: crypto.randomUUID(),name})
    }

    getItems(){
        return [...this.repo.list()]
    }

    checkApi(apiKey:string){

        if(!apiKey){
            throw new ValidationError("missing api key")
        }
        if(apiKey!= API_KEY){
            throw new ValidationError("wrong secret")
        }
        return {message: "sucess"}
    }
}
```
This is the **Service layer**: business rules and validation, still zero knowledge of
`req`/`res` — if Express were swapped out for a CLI tomorrow, this class wouldn't need
to change at all, only the controller would. `constructor(private readonly repo:
ItemRepository){}` is a TypeScript shortcut: declaring a constructor parameter with an
access modifier (`private readonly`) automatically creates and assigns
`this.repo = repo` with no extra code — this is **dependency injection written by
hand**, the exact same idea NestJS automates with its `@Injectable()` decorator in
Module 44. `createItem` validates the name is truthy, throwing the custom
`ValidationError` if not (never an HTTP status code here — that translation is the
controller's job, next); otherwise delegates storage to the repository, generating a
real unique ID with `crypto.randomUUID()` (a built-in Node/browser API, no library
needed) instead of the earlier `"ID-" + count` scheme. `checkApi` is the auth check
from Day 1/Day 2, now living in the service layer instead of inline in a route or a
standalone middleware — throwing specific `ValidationError`s with distinct messages
(`"missing api key"` vs `"wrong secret"`) that the controller below branches on to pick
the right status code.

```ts
const itemRep = new ItemRepository()
const itemService = new ItemService(itemRep)
```
Wiring: build the repository, then hand it into the service's constructor — this is
the "injection" actually happening, one plain line of object construction.

```ts
app.post("/items",(req: Request,res: Response)=>{
    try{
        const item:Items = itemService.createItem(req.body.name)
        return res.status(201).json(item)
    }
    catch(error){
        return res.status(400).json({error})
    }
})
```
This is the **Controller layer**: the only code here that touches `req`/`res`. It pulls
`name` out of the request body, hands it straight to the service, and translates
whatever comes back into an HTTP response — success becomes 201, any thrown error
becomes 400. Note `res.status(400).json({error})` sends the raw `Error` **object**
wrapped in a plain object — this is one of the real gotchas of the module (see below):
`JSON.stringify` on an `Error` only serializes `.name`, silently dropping `.message`,
because `Error.prototype.message` is non-enumerable by the JS spec.

```ts
app.get("/items",(req: Request,res: Response)=>{

    try{
        const apiKey = req.headers["x-api-key"]


        if (typeof apiKey !== "string") {
            return res.status(401).json({
                error: "missing api key"
            })
        }

        itemService.checkApi(apiKey)

        const items = itemService.getItems()
        res.status(200).json(items)
    }
    catch(error){
        if(error instanceof ValidationError){
            if(error.message === "missing api key"){
                return res.status(401).json({error})
            }
            if(error.message === "wrong secret"){
                return res.status(403).json({error})
            }
        }
        return res.status(500).json({message: "Internal server error"})
        
    }

})
```
Another controller route, this one guarding a read with the API key check. First a
quick type-guard (`typeof apiKey !== "string"` — headers can technically be `string[]`
if repeated, or `undefined` if absent) catches the "nothing sent at all" case early
with a direct 401, *before* even calling into the service. If a key **was** sent,
`itemService.checkApi(apiKey)` runs the real check — if it throws, the `catch` block
below branches on `error.message` to decide 401 ("missing api key" — reachable here only
if an empty string were somehow passed, since the direct type-guard above already
caught `undefined`) vs 403 ("wrong secret"), falling back to a generic 500 for anything
genuinely unexpected. This `instanceof ValidationError` check combined with inspecting
`.message` strings is exactly where the real bug below was hit.

```ts
// app.listen(4000,async()=>{ ... })
```
The entire test-runner block at the bottom is **commented out** in this file — this
file is purely the Controller/Service/Repository definitions, exported for another
file (`layered_task3.ts`) to actually start listening and run tests against.

### File: `layered_task3.ts` — line by line

```ts
import { app } from "./layered_task2";
import "dotenv/config"


app.listen(4000,async()=>{

    const apiKey = process.env.API_KEY
    const res = await fetch("http://localhost:4000/items",{
    })

    console.log(res.status)
    console.log(await res.json())

    const res1 = await fetch("http://localhost:4000/items",{
        headers:{"x-api-key":"wrong"}
    })

    console.log(res1.status)
    console.log(await res1.json())

    const res2 = await fetch("http://localhost:4000/items",{
        headers:{"x-api-key":apiKey!}
    })

    console.log(res2.status)
    console.log(await res2.json())
})
```
This file is the actual "run it" entry point — it imports the already-built `app` from
`layered_task2.ts` (proving `app` was worth exporting) and calls `.listen(...)` on it
here instead, keeping test-running separate from the app's own definition. `apiKey` is
read directly off `process.env` (not through `requireEnv`, since this file isn't
responsible for validating config, just using it). Three fetch calls test `GET
/items`: no header → expect 401 ("missing api key"); wrong key → expect 403 ("wrong
secret"); correct key (`apiKey!` — the `!` is a TypeScript non-null assertion,
asserting to the compiler "trust me, this won't actually be `undefined` at runtime,"
since `process.env.API_KEY`'s type is `string | undefined`) → expect 200 with the
items list.

---

## Full end-to-end trace: one `GET /secret` request, start to finish (Express version)

Using `express_task1.ts` as the concrete example, here is *everything* that happens for
one single request, in order:

1. `fetch("http://localhost:4000/secret", { headers: {"x-api-key":"letmein"} })` runs on
   the client side. Node opens a real TCP connection to `localhost:4000` and sends a raw
   HTTP request: a request line (`GET /secret HTTP/1.1`), headers (including
   `x-api-key: letmein`), and no body.
2. Express's internal server (built on raw `http` under the hood, same `createServer`
   mechanism as Day 1) receives the request and wraps the raw `req`/`res` objects with
   its own extra convenience methods/properties.
3. Express's router looks at the method (`GET`) and path (`/secret`) and finds the
   matching registration: `app.get("/secret", CheckApiKey, handler)`.
4. `CheckApiKey` middleware runs *first*. It reads `req.headers['x-api-key']`, finds
   `"letmein"`, confirms it's neither missing nor wrong, and calls `next()` — handing
   control onward instead of sending a response itself.
5. Because `next()` was called (not an early `return` with a response), Express moves
   to the next function registered for this route: the actual handler,
   `(req,res)=>{ res.status(200).json({message:'success'}) }`.
6. The handler sets status 200, serializes `{message: 'success'}` to a JSON string,
   sets the `content-type: application/json` header automatically, and sends it as the
   response body — this is the point where bytes actually start flowing back over the
   TCP connection to the client.
7. Back on the client, the original `await fetch(...)` promise resolves once the
   status/headers have arrived — `res2.status` is readable immediately as `200`.
8. `await res2.json()` is a *separate* asynchronous step: it waits for the body stream
   to finish arriving and parses it, producing `{ message: "success" }` as a real JS
   object, which then gets logged.

If the key had been wrong instead, step 4 would have ended differently: `CheckApiKey`
would call `res.status(403).json({error: "wrong secret"})` directly and simply
**not** call `next()` — so the route handler in step 5 never runs at all. This is the
entire point of middleware having the power to short-circuit the chain.

---

## Gotchas worth remembering from this module

- **Reading a possibly-missing header without a guard crashes the whole request.**
  `req.headers["accept"].includes(...)` throws `TypeError: Cannot read properties of
  undefined` the instant a client doesn't send an `Accept` header at all — not a rare
  edge case, a completely normal, common client behavior. Fix: `req.headers["accept"]
  ?? ""` before calling string methods, or `?.includes(...)` with optional chaining.
  Exactly the "handled the special case, forgot the normal one" pattern from earlier in
  the course, just in a new place.

- **Two independent `if`s that can both be true send two responses to one request.**
  If overlapping conditions are checked with separate top-level `if` statements instead
  of `if`/`else if`, and more than one can match, the second `res.writeHead`/`res.end`
  (or `res.status().json()`) call on an already-finished response throws
  `ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent to the client`. Every
  branch in every file above either uses `else if` or an explicit `return` right after
  responding, specifically to prevent this.

- **Forgetting `next()` inside Express middleware hangs the request forever** — silently.
  No crash, no error message, nothing printed anywhere. The client just sits there
  waiting, because Express genuinely is waiting for permission to continue and nothing
  ever told it to. This is arguably worse than a crash, since there's no error to go
  looking for.

- **`EADDRINUSE` port collisions.** Every file in this module listens on the same hard-
  coded port `4000`. Running two of these files at once (or re-running one before the
  previous process has actually exited) fails immediately with `Error: listen EADDRINUSE:
  address already in use :::4000` — the OS refuses to let a second process bind to a
  port that's already claimed. The fix is always just: stop the first process before
  starting another.

- **A `fetch` `Response` body can only be read once.** Calling `.json()` (or `.text()`)
  a second time on the same `Response` object throws `TypeError: Body is unusable:
  Body has already been read` — the body is a one-shot stream, not a value sitting in
  memory that can be inspected repeatedly. If both the parsed JSON and the raw text were
  needed, the response would have to be cloned first (`res.clone()`), never read twice
  off the same object.

- **`fetch` does not throw on 4xx/5xx status codes** — only on genuine network failure
  (DNS failure, connection refused, etc). A `403` or `500` response resolves the
  promise completely normally; `res.status` has to be checked explicitly if the caller
  cares whether the request "succeeded" in the HTTP sense. This is different from some
  other HTTP client libraries that throw on any non-2xx status by default.

- **Client-side headers (`res.headers`) use `.get(name)`, not bracket access** — unlike
  server-side `req.headers["..."]`, which is a plain object. `res.headers["content-type"]`
  on the client silently evaluates to `undefined` rather than erroring, which makes the
  mistake easy to miss if the resulting `undefined` isn't immediately noticed.

- **A raw `Error` object loses its `.message` when JSON-serialized.**
  `res.json({ error })` on a genuine `Error` instance (as `layered_task2.ts`'s
  controllers do) sends only `{"error":{}}`-ish output (effectively just `.name`,
  possibly `.stack` depending on environment) — `Error.prototype.message` and
  `.stack` are non-enumerable properties by the JS specification, and
  `JSON.stringify`/`res.json` only serializes a plain object's *enumerable* own
  properties. If a client genuinely needs to see the message, it has to be sent
  explicitly: `res.json({ error: error.message })`.

- **`this.message = "..."` inside a custom error constructor silently breaks message-
  based branching, if mistyped as the wrong property.** A real bug hit while building
  this kind of class: meaning to set `this.name` but instead overwriting
  `this.message` erases the actual thrown message text, so any later code doing
  `if (error.message === "wrong secret")` never matches, and a request that should have
  mapped cleanly to 403 falls through to a generic 500 instead — a silent,
  hard-to-trace failure since nothing actually crashes, it just answers with the wrong
  status.

- **Cross-module-folder imports break `rootDir`.** Each module folder in this course
  (`41_node_backend`, `43_prisma`, etc.) is deliberately its own isolated TypeScript
  project, with its own `tsconfig.json` and `outDir`. Trying to import a file from a
  *different* module folder (say, pulling a reusable class from Module 40 straight into
  a Module 41 file) fails to compile with a `rootDir` error, because that imported file
  sits outside the current project's inferred root. The real, general fix (TypeScript
  path aliases shared across a whole workspace) is deliberately much later in the
  roadmap — for now, small reusable pieces just get rewritten locally in each folder
  that needs them, exactly as `requireEnv` was rewritten from scratch in both
  `layered_task1.ts` and `layered_task2.ts` rather than imported.
