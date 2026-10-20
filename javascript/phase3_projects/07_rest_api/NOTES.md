# Project 7 — Mini REST API (Node's raw `http` module)

## What this project builds

The first project in this folder that actually talks over a network: a tiny HTTP
server, built using Node's built-in `http` module directly — no Express, no
framework, nothing hiding the mechanics. It exposes a `/students` resource with
GET (list all / get one), POST (create), PATCH (partially update), and DELETE
routes, all hand-written by checking `req.method` and `req.url` yourself. This is
deliberately the "hard way" of building a server, and the whole point is to see
every piece a framework like Express would normally do for you — routing,
parsing a request body, picking a status code — written out by hand, once, so
that using a framework later feels like a shortcut for something you've already
done manually rather than a black box.

### File structure

```
07_rest_api/
├── demo_server.js   ← the first, SIMPLER server (2 routes) — read this one first
└── server.js        ← the fuller server (5 routes: GET list, GET one, POST, PATCH, DELETE)
```

The concise learning notes describe the core server lessons from this project as:
**one request = one response** (responding twice crashes the connection with
`ERR_HTTP_HEADERS_SENT`), always `return` right after a matched route finishes
responding, always have a 404 fallback for unmatched routes, and the real
distinction between **400 bad input**, **404 not found**, and **409 conflict**
status codes. All of that is visible directly in `server.js` below.

---

## File: `demo_server.js` — piece by piece

```js
// DEMO server — study this after seeing it run. A student API with 2 routes.
const http = require("http");

// our "database" — just a Map (the manager idea from Projects 1-6, simplified)
const students = new Map();
students.set("S-01", { id: "S-01", name: "Ravi", marks: 80 });  // one seed row
```

`require("http")` loads Node's built-in HTTP module — no npm install needed, it
ships with Node itself. The "database" is, once again, just a `Map` — the exact
same storage mechanism used in Projects 1 through 6, just now sitting behind an
actual network server instead of being called directly from a driver script. One
student, `"S-01"`, is pre-loaded ("seeded") so there's something to `GET`
immediately on startup.

```js
// createServer takes ONE function that runs on EVERY request.
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);          // log each request (server-side)
```

`http.createServer(callback)` builds a server object. The callback you give it is
called **once per incoming request**, automatically, by Node — you never call it
yourself. It receives two objects every single time: `req` (the incoming
**request** — method, URL, headers, and eventually body data) and `res` (the
outgoing **response** — what you write back to whoever made the request).
`req.method` is the HTTP verb (`"GET"`, `"POST"`, etc.) and `req.url` is everything
after the host in the URL (e.g. `/students`). Logging both on every request is a
simple but genuinely useful debugging habit — it's the one line that lets you
*see*, in the terminal, exactly what request just arrived, which matters a lot once
things aren't working as expected.

```js
  // ROUTE 1: GET /students  → list all students
  if (req.method === "GET" && req.url === "/students") {
    const all = [...students.values()];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(all));
    return;                                          // stop — response sent
  }
```

This is **manual routing**: there's no router object matching patterns for you —
just a plain `if` checking both the method and the exact URL string. `[...students.values()]`
is the same spread-into-array pattern from every earlier project. `res.writeHead(200, {...})`
sets the HTTP **status code** (200 = OK/success) and headers — here, telling the
client "what I'm about to send you is JSON." `res.end(JSON.stringify(all))` sends
the actual body (converting the JS array into a JSON text string first) **and**
signals "the response is complete, no more data is coming" — `res.end()` is the one
call that actually finishes a response; nothing more can be written to `res` after
it. The trailing `return;` stops this callback function from running any further —
crucial, because without it, execution would fall through to the *next* `if` check
below, and potentially all the way down to the 404 fallback at the bottom, which
would try to call `res.end()` a **second time** on the same response — Node throws
an error (`ERR_HTTP_HEADERS_SENT`) the moment you try to write a response that's
already been finished.

```js
  // ROUTE 2: POST /students  → create a student (body has the data)
  if (req.method === "POST" && req.url === "/students") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });  // collect body pieces
    req.on("end", () => {                            // whole body arrived
      const student = JSON.parse(body);             // text → object
      students.set(student.id, student);            // store it
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(student));             // echo back what we created
    });
    return;
  }
```

This is the part that looks strangest the first time you see it, and it's worth
understanding *why* it's shaped this way: an HTTP request body doesn't arrive all
at once as a complete string — it arrives as a **stream of small chunks** over time
(especially for larger bodies), and `req` is a Node **stream** object (specifically,
a `Readable` stream, the same general concept behind reading files or responses
piece by piece instead of all at once). You subscribe to events on it with `.on(eventName, callback)`:
- `req.on("data", (chunk) => { body += chunk })` — fires every time another piece of
  the body arrives; each `chunk` gets appended onto the growing `body` string.
  (String-concatenating a `Buffer` chunk onto a string like this implicitly
  converts it to a UTF-8 string — fine for small JSON bodies like these.)
- `req.on("end", () => {...})` — fires exactly once, after the **last** chunk has
  arrived and the body is now complete. Everything that needs the *whole* body
  (parsing it as JSON, storing it, responding) has to happen **inside** this
  callback, because that's the only place in the code that's guaranteed the full
  body actually exists yet.

Inside `"end"`: `JSON.parse(body)` turns the accumulated JSON text back into a real
object, `students.set(student.id, student)` stores it (note: unlike Projects 1-6's
managers, there's **no duplicate-id check here at all** — posting a student whose
id already exists just silently overwrites the old one), and the response uses
status `201` (Created — the conventional status for "a POST successfully created a
new resource") and echoes back the newly created student as confirmation.

The `return;` right after the `req.on("end", ...)` registration (not inside it) is
subtle and important: it returns from the **outer** `createServer` callback
immediately after *registering* the two event listeners, **before** either of them
has actually fired. This is correct and necessary — the whole point of
event-driven, asynchronous code like this is that the outer function doesn't wait
around for the body to arrive; it registers "when data arrives, do this" and "when
it's done, do that," then gets out of the way, and Node calls those registered
functions later, whenever the actual data shows up. This file has **no 404
fallback** at all below these two routes — see Gotchas for what that means in
practice.

```js
server.listen(3000, () => console.log("Server on http://localhost:3000"));
```

`server.listen(port, callback)` actually starts the server listening for incoming
connections on port 3000, and runs the callback once it's ready — purely for the
confirmation log message.

---

## File: `server.js` — the fuller version, piece by piece

This file keeps the same `http.createServer` shape but adds three more routes,
**path-segment parsing** (so a route can include a dynamic id, like `/students/S-01`),
and safer JSON parsing.

```js
const http = require("http");

const students = new Map();
students.set("S-01", { id: "S-01", name: "Ravi", marks: 80 }); 
students.set("S-02", { id: "S-02", name: "kishore", marks: 100 }); 

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

    const parts = req.url.split("/").filter(Boolean)
```

`req.url.split("/")` breaks the URL into pieces on every slash. For a URL like
`/students/S-01`, this gives `["", "students", "S-01"]` — note the **leading empty
string**, because the URL starts with a `/` and splitting on a leading delimiter
always produces an empty piece before it. `.filter(Boolean)` removes every
**falsy** value from the array — and an empty string `""` is falsy — leaving
`["students", "S-01"]`. `Boolean` used directly as the filter callback (rather than
writing `x => Boolean(x)`) works because `.filter` calls its callback with each
element as the argument, and `Boolean(value)` converts any value to `true`/`false`
based on JS's truthy/falsy rules — a common, compact idiom for "strip out empty/
null/undefined entries from an array." After this, `parts[0]` is always the
resource name (`"students"`) and `parts[1]`, if present, is the id.

```js
    if(req.method === "GET" && parts[0]==="students" && parts[1]){

        if(students.has(parts[1])){
            res.writeHead(200,{"content-type":"application/json"});
            res.end(JSON.stringify(students.get(parts[1])));
            return
        }
        else{
            res.writeHead(404,{"content-type":"application/json"});
            res.end(JSON.stringify({error: "Student not found"}));
            return;
        }

    }
    if(req.method === "GET" && parts[0]==="students" && !parts[1]){
        res.writeHead(200,{"content-type":"application/json"});
        res.end(JSON.stringify([...students.values()]));
        return;
    }
```

Two separate `GET` routes, told apart by whether `parts[1]` (the id segment)
**exists** or not: `GET /students/S-01` (get one) versus `GET /students` (list
all) — the exact same URL *prefix*, routed differently based on how many path
segments follow it. The single-student route is the first place in this project
that uses a proper **404** status — not found is a *distinct, meaningful* status
from a generic error, telling the client specifically "the resource you asked for
by that id doesn't exist," which is different information than "your request
itself was malformed" (400) or "that id is already taken" (409, seen in Project 8).

```js
    if(req.method === "PATCH" && parts[0]==="students" && parts[1]){
        const id = parts[1]
        let body =""
        req.on("data",(chunks)=>{body+=chunks});
        req.on("end",()=>{
            let stdobj
            try{
                stdobj =JSON.parse(body)
            }
            catch{
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error: "Invalid JSON"}))
                return;
            }

            if(!students.has(id)){
                res.writeHead(404,{"content-type":"application/json"})
                res.end(JSON.stringify({error:"id not exists"}))
                return;
            }
            const {name,marks} =stdobj;
            if(name !== undefined){
                students.get(id).name = name
            }
            if(marks !== undefined){
                students.get(id).marks = marks
                
            }
            res.writeHead(200,{"content-type":"application/json"})
            res.end(JSON.stringify(students.get(id)))
        })
        return;
    }
```

PATCH (a **partial** update — change only the fields that were actually sent,
leave everything else as-is) is the most carefully written route in this file:

- The body is collected the same chunked-stream way as `demo_server.js`'s POST,
  but this time `JSON.parse(body)` is wrapped in a **`try/catch`**. If the client
  sends malformed JSON (a typo, a cut-off body, plain garbage), `JSON.parse` throws
  a `SyntaxError` — without the `try/catch`, that error would propagate up and
  crash the whole server process (an uncaught exception inside an async callback
  like this isn't something Express or any framework could save you from either —
  it's entirely on the server code to catch it). The `catch{...}` block here uses
  the newer JS syntax that allows **omitting the error variable entirely**
  (`catch { ... }` instead of `catch(err) { ... }`) when you don't need to inspect
  what the error actually was — appropriate here, since any JSON parse failure gets
  the same `400 Bad Request` response regardless of its specific message.
- *After* confirming the JSON itself is valid, it checks `!students.has(id)` and
  responds `404` if the id doesn't exist — note this existence check happens
  **after** the JSON-parse check, meaning a request with both a bad id *and*
  malformed JSON reports the JSON problem first; same "which guard fires first"
  consideration seen in earlier projects' managers, just now expressed as HTTP
  status code priority.
- `const {name, marks} = stdobj` destructures just the two fields this route cares
  about out of the parsed body.
- `if(name !== undefined){ students.get(id).name = name }` — the key PATCH-specific
  idea: only update a field if it was **actually present** in the request body.
  Checking `!== undefined` specifically (rather than something looser like
  `if(name)`) matters: if someone legitimately wants to set a name to an empty
  string, or a mark to `0`, a truthy check (`if(name)`) would wrongly treat those
  valid-but-falsy values as "not provided" and skip updating them. Checking
  specifically against `undefined` only skips fields that were truly absent from
  the request, correctly allowing `0`, `""`, or `false` as legitimate new values.
  (Also note, same as every earlier Map-based project: `students.get(id)` returns
  the live stored object, so `.name = name` mutates the real stored student
  directly, no `.set()` needed afterward.)
- Finally responds `200` with the fully updated student object.

```js
    if(req.method === "POST" && parts[0] ==="students"){
        let body = ""
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end",()=>{
            let jsonBody
            try{
                jsonBody = JSON.parse(body);
            }
            catch(err){
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));

                return;
            }
            

            if(!jsonBody.id||!jsonBody.name){
                res.writeHead(400,{"content-type":"application/json"})
                res.end(JSON.stringify({error:"Missing fields"}))
                return
            }
            if(students.has(jsonBody.id)){
                res.writeHead(409,{"content-type":"application/json"})
                res.end(JSON.stringify({error:"id already exists"})) 
                return     
            }
            students.set(jsonBody.id,jsonBody)
            res.writeHead(201,{"content-type":"application/json"})
            res.end(JSON.stringify(students.get(jsonBody.id)))
            return;
        })
        

        return;
    }
```

A much more complete POST than `demo_server.js`'s version, with **three** guard
checks stacked in order, each mapping to a specific, correct HTTP status:
1. Invalid JSON → **400** (bad request — the request itself is malformed, nothing
   to do with the data's meaning).
2. Missing required fields (`!jsonBody.id || !jsonBody.name`) → **400** (the JSON
   parsed fine, but the data inside it doesn't satisfy the minimum shape needed).
3. An id that already exists → **409 Conflict** (the request is well-formed and
   valid on its own, but it conflicts with existing state — this is the textbook
   meaning of 409, distinct from both 400 and 404).

Only after all three checks pass does it actually store the student and respond
**201 Created**. This progression — 400 for malformed/incomplete input, 409 for a
valid-but-conflicting request, 404 for a reference to something that doesn't exist,
200/201 for success — is the concrete, hands-on version of the status-code mapping
that Project 8's `server.js` later formalizes into a reusable helper function.

```js
    if(req.method ==="DELETE" && parts[0] ==="students"&&parts[1]){
        const id = parts[1];
        if(students.has(id)){
            students.delete(id)
            res.writeHead(204,{"content-type":"application/json"})
            res.end()
            return;
        }
        res.writeHead(404,{"content-type":"application/json"})
        res.end(JSON.stringify({error:"id not exists"}))
        return;

    }
    res.writeHead(404,({"content-type":"application/json"}))
    res.end(JSON.stringify({error:"Not route found"}))

})
server.listen(3003, () => console.log("Server on http://localhost:3003"));
```

DELETE uses status **204 No Content** on success — the conventional status for "the
action succeeded, and there is deliberately no body to send back" — and correctly
calls `res.end()` with **no argument** (sending an empty body), rather than
`res.end(JSON.stringify({...}))`, since a 204 response isn't supposed to carry a
body at all. If the id doesn't exist, it falls through to a 404 instead.

The very last two lines, sitting **outside every `if` block**, are the **404
fallback**: if execution ever reaches this point, it means *none* of the routes
above matched (no `if` branch's conditions were true), so nothing has called
`res.end()` yet — this is the one and only place left that can send a response. A
server missing this fallback entirely (like `demo_server.js`) would leave any
unmatched request hanging forever, with no response ever sent at all. This port is
`3003`, different from `demo_server.js`'s `3000` — deliberately, so both files
could in principle run side by side without a port conflict.

---

## Gotchas worth remembering

- **Every single matched route in both files ends with a `return;`**, immediately
  after calling `res.end(...)`. This is not stylistic — it's the mechanism that
  prevents the request from falling through to later `if` checks (which, if their
  conditions somehow also matched, or once execution reached the final 404
  fallback, would call `res.end()` a second time on the same response and crash
  with `ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent to the
  client`). One response per request, always, and `return` is how you guarantee it
  in this manual-routing style.

- **`demo_server.js` has no 404 fallback at all.** Any request that doesn't match
  its exact two routes (wrong method, wrong path, a typo in the URL) never gets any
  response — the connection just hangs until the client times out. `server.js`
  fixes this by always having one final, unconditional `res.end()` after every
  specific route check. Any hand-written router needs this same safety net, or
  unmatched requests silently hang forever instead of failing fast with a clear
  404.

- **The `name !== undefined` / `marks !== undefined` checks in the PATCH route are
  a deliberately precise choice**, not an arbitrary one. A looser truthy check
  (`if (name)`) would incorrectly skip legitimate updates where the new value is
  falsy but still meaningful — an empty string name, or a mark of `0`. Always check
  "was this field present at all" with `!== undefined` (or `"field" in obj`) rather
  than "is this field truthy" when the goal is distinguishing "not provided" from
  "provided, but happens to be falsy."

- **Request bodies must be read as a stream (`"data"` + `"end"` events), never
  assumed to be available synchronously.** This is the single biggest structural
  difference between writing an HTTP server by hand versus using a framework like
  Express, which does this exact chunk-collection-and-JSON-parsing work for you
  behind something like `express.json()` middleware — once you've written it by
  hand here, that middleware stops being mysterious.

- **400 vs. 404 vs. 409 is a real, meaningful distinction, not an arbitrary choice
  of number.** 400 means "what you sent me doesn't make sense or is incomplete."
  404 means "what you sent me makes sense, but the thing you're referring to
  doesn't exist." 409 means "what you sent me makes sense and refers to something
  real, but it conflicts with what already exists." `server.js`'s POST route is the
  clearest single place in this project where all three ideas are checked in
  sequence, each with its own distinct, correct status code.
