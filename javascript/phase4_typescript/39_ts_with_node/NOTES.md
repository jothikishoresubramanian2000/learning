# Module 39 — TypeScript with Node

### What I learned today

Everything so far has been pure TypeScript concepts, run in isolation. This module is
about actually USING TypeScript in a real Node.js project — running `.ts` files directly
without a manual two-step compile, getting type information for a JS library (Express)
that wasn't originally written in TypeScript, and typing a real HTTP server's request and
response objects so that route params and request bodies are checked at compile time
instead of trusted blindly at runtime.

### Running TypeScript directly with `tsx`

Before this module, running a `.ts` file meant two separate steps: `tsc file.ts`
(compile to `.js`), then `node file.js` (run it). `tsx` collapses that into one command:

```bash
npm i -D tsx
npx tsx file.ts          # compiles in-memory + runs, one command
npx tsx watch file.ts    # auto-rerun on save
```

`tsx` is installed as a **devDependency** (the `-D` flag) — it's a tool needed only
during development, never needed by the actual running production code, which is why
`39_ts_with_node/package.json`'s `devDependencies` block lists it alongside `typescript`
and `@types/express`, while `express` itself sits in the separate `dependencies` block
(needed at runtime, in every environment, not just my dev machine).

### `@types/*` packages — line by line from `package.json`

```json
"dependencies": {
    "express": "^5.2.1"
}
```
```json
"devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.2.0",
    "tsx": "^4.23.12",
    "typescript": "^7.0.2"
}
```
`express` is a plain JavaScript library — it has no built-in knowledge of TypeScript
types. `@types/express` is a COMPLETELY SEPARATE package whose only job is to describe
Express's shapes (what `Request`, `Response`, `app.get`, etc. actually look like) to the
TypeScript compiler. Without installing `@types/express`, importing from `"express"`
would give untyped values (effectively `any`) — no autocomplete, no safety, nothing
checked. It lives in `devDependencies` specifically because these type definitions are
ONLY useful while writing/compiling code — they get completely stripped away before the
code ever runs, same as every other TypeScript annotation (Module 31's core lesson).
`@types/node` is the same idea, but for Node's own built-in APIs (`fs`, `path`, globals
like `process`) rather than for a third-party library.

### File: `node_task1.ts`

```ts
const gstCal = (price: number) =>{
    return price + price * 0.18;
}

console.log(gstCal(5000))
```
A warm-up repeat of the very first typed function from Module 31 — just confirming `tsx`
actually runs a typed file directly, with nothing new conceptually.

### File: `node_task2.ts` — typed GET route, line by line

```ts
import express, { Request, Response } from "express";

const app = express();
```
`Request` and `Response` are imported as named types directly from `"express"` — this
import only works correctly, with real type information instead of `any`, because
`@types/express` is installed.

```ts
interface response{id: string, name: string}
interface StudentParams {
    id: string;
}
```
Two small interfaces describing, respectively, the SHAPE of data the route will send back
(`response`) and the shape of the URL's route parameters (`StudentParams` — here just one
field, `id`, matching the `:id` placeholder in the route path below).

```ts
app.get("/students/:id",(req: Request<StudentParams>, res: Response<response>)=>{
    const id: string= req.params.id
    res.status(201).json({id, name: "kishore"})
} )
```
`Request<StudentParams>` and `Response<response>` are both GENERIC INTERFACES (Module
36's idea applied to Express's own built-in types) — filling in `Request`'s type
parameter with `StudentParams` tells TypeScript exactly what shape `req.params` has,
which is why `req.params.id` is known to be a `string` without any extra checking: the
route's own declared params shape guarantees it. Filling in `Response`'s type parameter
with `response` means `res.json(...)` is now CHECKED against that shape — if I tried to
`res.json({wrongField: true})`, TypeScript would catch the mismatch before running
anything, because the response shape was declared up front. `res.status(201).json(...)`
chains the status code (201 = "Created," from Module 41's HTTP status knowledge) with the
actual JSON body.

```ts
app.listen(4000,()=>{console.log("server listening on port 4000")})
```
Starts the actual HTTP server on port 4000 — the callback just logs once it's ready.

### File: `node_task3.ts` — typed POST route with a request body, line by line

```ts
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());
```
`app.use(express.json())` is NOT a typing concept, it's a real runtime requirement —
without it, incoming POST request bodies arrive as raw, unparsed data, and `req.body`
would be `undefined` even if the client sent valid JSON. This single line is what's
responsible for actually parsing an incoming `Content-Type: application/json` body into a
usable JS object before any route handler sees it.

```ts
interface StudentParams {
    name: string
    mark: number;
}

type response = Required<StudentParams>
```
Despite the name `StudentParams`, this interface is actually describing the shape of the
incoming request BODY in this file (slightly confusing naming carried over from
`node_task2.ts`'s pattern, where it genuinely was the URL params — worth noting as a small
inconsistency in my own naming across these two files). `Required<StudentParams>` is a
NEW utility type (not covered explicitly in Module 38, but following the exact same
built-in-transformation pattern as `Partial`/`Pick`/`Omit`): it takes a type and makes
EVERY property required even if the original had some marked optional with `?`. Since
`StudentParams` already has no optional fields here, `Required<StudentParams>` produces
an identical shape — but it still documents clear INTENT: "the response is guaranteed to
have both fields, fully, with nothing missing."

```ts
app.post("/students",(req: Request<{},response,StudentParams>, res: Response<response>) =>{
    const data = req.body
    res.status(201).json(data)
})
```
`Request<Params, ResBody, ReqBody>` — the full three-type-parameter form of Express's
generic request type (my concise notes call this out directly as "a generic interface —
fill in each shape"). Breaking down each slot used here:
- `{}` (first slot, `Params`) — no URL route parameters at all for this route (`/students`
  has no `:something` placeholder), so an empty object type.
- `response` (second slot, `ResBody`) — the shape the RESPONSE body is expected to have.
- `StudentParams` (third slot, `ReqBody`) — the shape the REQUEST BODY (the JSON the
  client POSTs) is expected to have, which is exactly why `req.body` on the next line is
  typed, not `any` — TypeScript knows it has `name: string` and `mark: number` because
  this generic slot said so.

`res.status(201).json(data)` — same pattern as the GET route, just echoing the parsed and
typed body straight back with a 201 "Created" status.

```ts
app.listen(4000,()=>{console.log("server listening on port 4000")})
```

### Node tsconfig essentials (from `tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  }
}
```
- `"module": "commonjs"` — compile using Node's traditional `require`/`module.exports`
  module system rather than modern `import`/`export` syntax at the OUTPUT level (the
  source `.ts` can still use `import`/`export` syntax — this setting controls what the
  compiled `.js` looks like).
- `"esModuleInterop": true` — lets `import express from "express"` work cleanly even
  though Express (and many older libraries) weren't originally written using the modern
  ES module `export default` convention; without this flag, importing some libraries this
  way either fails or needs awkward workarounds.
- `"skipLibCheck": true` — skips type-checking files INSIDE `node_modules`'s own `.d.ts`
  type-definition files. Speeds up compilation, since those are third-party files I'm
  trusting are already correct, not files I'm actively editing.
- `"types": ["node"]` — explicitly tells TypeScript to include Node's own global type
  definitions (from `@types/node`), which is what makes things like `process` recognized.

### Gotchas worth remembering from this module

- **A JS library having no types doesn't mean I can't type it — `@types/X` packages
  supply types SEPARATELY, as a devDependency.** Some newer packages ship their own types
  bundled in, in which case no separate `@types/X` install is needed at all — worth
  checking before assuming one is required.
- **`app.use(express.json())` is a RUNTIME requirement, completely independent of
  typing.** Forgetting it means `req.body` is empty at runtime no matter how perfectly
  the `Request<Params, ResBody, ReqBody>` generic is filled in — the generic only tells
  TypeScript what SHAPE to expect once the body actually exists; it does nothing to make
  the body parsing itself happen.
- **POST needs the right `Content-Type: application/json` header from the client, or the
  body parser won't recognize it as JSON at all** — a gotcha hit directly while testing
  these routes by hand.
- **Always Ctrl+C a running server before restarting it** — otherwise the next attempt to
  `app.listen(4000, ...)` fails with `EADDRINUSE` ("this port is already in use") since
  the previous process is still holding the port.
- **`Request<Params, ResBody, ReqBody>`'s three type-parameter SLOTS have a fixed order** —
  mixing up which slot is params vs response body vs request body silently produces wrong
  (or overly permissive) typing rather than an obvious error, so it's worth double-checking
  the slot order against Express's actual generic definition when writing a new route.
