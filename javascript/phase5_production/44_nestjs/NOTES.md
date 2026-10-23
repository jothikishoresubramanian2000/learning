# Module 44 — NestJS — Beginner Notes (very elaborate, line by line)

> Purpose of this file: the central `js_learning_notes.md` has the short, crux version of
> this module. THIS file is different on purpose — every line, every field inside every
> object, explained in the simplest possible words, with little examples right here, so
> that months from now you can open this file cold and rebuild full understanding without
> needing to ask anyone anything again.

---

## Day 52 — Why Nest, Bootstrap, Modules

### What I learned today

Express gave me routing and that's it — everything else (splitting code into
controller/service/repository, wiring one piece to another) was manual discipline I had
to remember to do myself. Nest is a framework that takes that same shape and bakes it in
as actual rules the framework enforces, using **decorators** (little `@Something` tags
above a class or method) that don't run code themselves — they just stick a label on
something, and Nest reads all those labels at startup to build the real app.

### File: `main.ts` — line by line

```ts
import { NestFactory } from '@nestjs/core';
```
Bringing in a tool called `NestFactory`. Its only job: take a Module (a labeled box of
related classes) and turn it into an actual, running application.

```ts
import { AppModule } from './app.module.js';
```
Bringing in `AppModule` — the one "root" box that contains (or imports) everything else
in the app.

```ts
async function bootstrap() {
```
A function named `bootstrap` — just a name, not a Nest keyword. It's `async` because
starting the app involves waiting (connecting things, etc.) — same `async` you already
know.

```ts
  const app = await NestFactory.create(AppModule);
```
This is the actual "build the app" step. `NestFactory.create(AppModule)` reads
`AppModule`, follows every module it imports, finds every controller and provider
declared anywhere in that whole tree, and builds a real, running application object —
stored here in the variable `app`. `await` because this takes a moment (it's not
instant).

```ts
  const port = process.env.PORT ?? 4000
```
Pick a port number. `process.env.PORT` reads an environment variable named `PORT` (recap
Module 41 Day 3). `?? 4000` means: if that environment variable was never set (so it's
`undefined`), fall back to `4000` instead.

```ts
  await app.listen(port, async()=>{ ... });
```
`app.listen(port)` actually starts the HTTP server listening on that port — same idea as
Express's `app.listen`, just called on the Nest `app` object. Everything inside the
`async () => {...}` callback runs once the server is actually up and ready.

### File: `hello.module.ts`, `hello.controller.ts`, `hello.service.ts` — field by field

```ts
@Injectable()
export class HelloService {
  getHello(): string {
    return "Hello from Nest";
  }
}
```
`@Injectable()` — a label meaning "this class is allowed to be handed to other classes
automatically by Nest." Without this label, Nest won't manage/create this class for you.
`getHello()` is just a normal method, nothing Nest-specific about it — it returns a
plain string.

```ts
@Controller('')
export class HelloController {
  constructor(private readonly appservice: HelloService) {}

  @Get()
  gethello() {
    return this.appservice.getHello();
  }
}
```
- `@Controller('')` — labels this class as "the thing that handles incoming HTTP
  requests starting with this path." Empty string `''` means "the root path," i.e. `/`.
- `constructor(private readonly appservice: HelloService) {}` — this is **Dependency
  Injection** happening. You're not writing `new HelloService()` anywhere — you just
  declare "I need a `HelloService`" by listing it as a constructor parameter, and Nest
  hands you a real, working instance automatically, because `HelloService` is
  `@Injectable()` and listed in this module's `providers`.
- `@Get()` — labels the method right below it as "run this when a GET request arrives at
  this controller's path." Since the controller's path is `''` (root), and this `@Get()`
  has no extra path text inside its parentheses, this method handles exactly `GET /`.
- `return this.appservice.getHello();` — calls the method on the injected service, and
  whatever that returns becomes the actual HTTP response body, automatically (Nest
  converts a returned string into the response for you — no `res.send()` needed).

```ts
@Module({
  imports: [],
  controllers: [HelloController],
  providers: [HelloService],
})
export class HelloModule {}
```
A `@Module({...})` is a labeled box. Three fields inside it, each meaning something
specific:
- `imports: []` — "which OTHER modules does this one need things from." Empty here
  because `HelloModule` is self-contained, doesn't need anything from elsewhere.
- `controllers: [HelloController]` — "which controller classes live in this box." Nest
  will scan these for `@Get`/`@Post`/etc. and build real routes from them.
- `providers: [HelloService]` — "which injectable classes/values live in this box, ready
  to be handed to constructors that ask for them." This is literally what makes
  `HelloController`'s constructor injection in the previous file actually work — if
  `HelloService` weren't listed here, Nest would have no idea where to find one when
  `HelloController` asks for it.

### Dynamic modules — `GreetingModule.forRoot({...})`

A normal `@Module({...})` is baked in at compile time — always exactly the same, no
matter who imports it. A **dynamic module** is a module you can *configure* differently
each time it's imported, by calling a method instead of just writing the decorator
directly.

```ts
export class GreetingModule {
  static forRoot(options: { name: string }): DynamicModule {
    return {
      module: GreetingModule,
      providers: [
        { provide: "GREETING_OPTIONS", useValue: options },
        GreetingService,
      ],
      controllers: [GreetingController],
      exports: ["GREETING_OPTIONS"],
    };
  }
}
```
- `static forRoot(...)` — `static` means this method belongs to the CLASS itself, not to
  an instance. You call it as `GreetingModule.forRoot(...)` directly — you never write
  `new GreetingModule()`.
- `options: { name: string }` — whatever configuration data the IMPORTER wants to hand
  in. In our case, `{ name: "kishore" }`.
- The return value is a plain object — Nest's type calls this a `DynamicModule`. It's
  built FRESH, every time `forRoot` runs, using whatever `options` were passed in. A
  plain `@Module({...})` can't do this because it's not inside a function — there's no
  code running, just a fixed decorator.
- `module: GreetingModule` — required field, just says "this configuration belongs to
  the `GreetingModule` class."
- `providers: [...]` — same meaning as a normal module's `providers`, just built
  dynamically here instead of written as a fixed list.
- `{ provide: "GREETING_OPTIONS", useValue: options }` — see the "providers, field by
  field" section below (Day 53) for exactly what `provide`/`useValue` mean — short
  version: "store this `options` object under the name tag `'GREETING_OPTIONS'`."
- `exports: ["GREETING_OPTIONS"]` — "other modules/controllers ARE allowed to ask for
  whatever is stored under this name tag." Leaving something off `exports` keeps it
  private to this module only.

Used like this, in `app.module.ts`:
```ts
imports: [GreetingModule.forRoot({ name: "kishore" })]
```
`forRoot({ name: "kishore" })` is CALLED right there, immediately — its return value (the
object described above) is what actually lands in the `imports` array. Nest accepts
either a plain module class OR the result of calling a method like this.

---

## Day 53 — Controllers + Routing + Dependency Injection (deeper)

### What I learned today

Yesterday I saw injection work without knowing exactly HOW Nest decides what to hand
over. Today: the actual mechanism, plus how to read data arriving in a request
(`@Param`, `@Query`, `@Body`), plus "custom tokens" — ways to register something
injectable that ISN'T a class (a plain number, a computed value).

### `@Param`, `@Query`, `@Body` — where each one reads from

```ts
@Get(":amount")
gettax(@Param("amount") amount: number, @Query("rate") rate: number) { ... }
```
- A URL looks like: `http://localhost:4000/pricing/100?rate=0.1`
- `:amount` inside `@Get(":amount")` is a placeholder in the PATH itself — it means "this
  part of the URL can be anything, and whatever it is, make it available." In
  `/pricing/100`, the `:amount` placeholder matches `100`.
- `@Param("amount")` — "go grab whatever matched the `:amount` placeholder from the URL
  path, and put it in this parameter." This is the exact same data as Express's
  `req.params.amount`, just read via a decorator instead of destructuring `req`
  yourself.
- `?rate=0.1` is the QUERY STRING — the part after the `?`. It's optional by nature; the
  URL works fine without it.
- `@Query("rate")` — "go grab the value of `rate` from the query string, if it's there."
  This is the same data as Express's `req.query.rate`. If the URL has no `?rate=...` at
  all, this parameter simply comes through as `undefined` at runtime — even though
  TypeScript's annotation says `number`. (Nest doesn't validate/convert this
  automatically unless you set up a validation pipe — not covered yet.)

```ts
@Post()
getfinalrate(@Body() body: { amount: number }) { ... }
```
- `@Body()` — "go grab the entire JSON body sent with this POST request, and put it
  here." Same data as Express's `req.body`. The type `{ amount: number }` is just you
  describing the shape YOU expect — again, nothing actually validates that the real
  request sent exactly that shape (that's a later module's job, DTOs + validation pipes).

### How standard (type-based) dependency injection actually works, mechanically

```ts
constructor(private readonly pricingservice: PricingService) {}
```
Here's the actual step-by-step of what Nest does at startup:
1. Nest scans every module's `providers` array across the whole app and builds one big
   list: "here's every injectable thing that exists, and its class name."
2. When Nest needs to create a `PricingController`, it looks at its constructor and sees
   it wants something of type `PricingService`.
3. TypeScript, when compiling this file, is told to also emit extra information
   alongside the normal JS output — called "decorator metadata" — literally recording
   "this constructor's first parameter has type `PricingService`." (This is the exact
   metadata that breaks under `tsx`/esbuild — see the gotcha note at the bottom.)
4. Nest reads that metadata at runtime, sees "`PricingService`," looks it up in its big
   list from step 1, finds it, builds (or reuses) an instance of it, and hands it to the
   constructor automatically.

This ONLY works because `PricingService` is a real class — its name survives as usable
information at runtime. A plain string, number, or object has no "type name" like this —
which is exactly why custom tokens exist (next section).

### Providers, field by field — every shape you've used

**Shorthand (a class providing itself):**
```ts
providers: [PricingService]
```
Short for: "register something under the name tag `PricingService` (the class itself
acts as its own name tag), and when asked for it, build an instance of `PricingService`."

**Long form — `provide` + `useValue` (a literal value, not a class):**
```ts
{ provide: "TAX_RATE", useValue: 0.18 }
```
- `provide: "TAX_RATE"` — the NAME TAG (token). Think of it as a locker label. You're
  choosing the string `"TAX_RATE"` as the label for this particular locker. It could be
  named anything — `"FOO"`, `"XYZ"` — Nest doesn't care what the text says, as long as
  whoever asks for it later uses the EXACT same text.
- `useValue: 0.18` — the actual thing placed inside that locker. Here, literally the
  number `0.18`. Whenever something asks for `"TAX_RATE"`, Nest hands back exactly this
  value, every time, unchanged.

**Long form — `provide` + `useFactory` + `inject` (a COMPUTED value):**
```ts
{
  provide: "FINAL_RATE",
  useFactory: (taxRate) => taxRate + 0.02,
  inject: ["TAX_RATE"],
}
```
- `provide: "FINAL_RATE"` — another locker, named `"FINAL_RATE"`.
- `useFactory: (taxRate) => taxRate + 0.02` — instead of putting a FIXED value in this
  locker, Nest runs this FUNCTION once (at startup) and puts whatever it RETURNS into the
  locker instead. The function can take arguments.
- `inject: ["TAX_RATE"]` — this is what SUPPLIES those arguments. It's a list, and it's
  matched to the factory function's parameters BY POSITION, not by name:
  - Position 1 in `inject` (`"TAX_RATE"`) → Nest first resolves whatever's in the
    `"TAX_RATE"` locker (which is `0.18`) → that becomes the factory's FIRST parameter,
    which you happened to name `taxRate` (the name is just your own choice, Nest doesn't
    read it).
  - If there were a second token in `inject`, it would become the factory's SECOND
    parameter, and so on.
- So the full sequence at startup: Nest sees `FINAL_RATE` needs `TAX_RATE` first → looks
  up `TAX_RATE` → gets `0.18` → calls `(taxRate) => taxRate + 0.02` with `taxRate = 0.18`
  → the function returns `0.2` → `0.2` gets stored in the `"FINAL_RATE"` locker,
  permanently (computed once, not recomputed on every request).

### `@Inject(token)` — reading a custom-token locker back out

```ts
constructor(
  @Inject("TAX_RATE") private readonly taxrate: number,
  @Inject("FINAL_RATE") private readonly frate: number
) {}
```
Recall: normal injection (`private readonly pricingservice: PricingService`) works
because the TYPE itself (`PricingService`) is a usable lookup name. A string token like
`"TAX_RATE"` isn't a type — TypeScript types vanish at runtime, strings don't carry type
information the compiler can read. So you must say explicitly, right before the
parameter: `@Inject("TAX_RATE")` — "don't guess from the type here, go open the locker
literally named `'TAX_RATE'` and put its contents in this parameter." Both lines work the
exact same way, each pulling from a different named locker.

### Full request trace — `GET /pricing/100?rate=0.1`, start to finish

Walking one real request through every file, in order, so the whole connection is
visible at once:

1. A GET request arrives at `http://localhost:4000/pricing/100?rate=0.1`.
2. Nest's router (built at startup from every `@Controller`/`@Get` it scanned) matches
   this against `PricingController`'s `@Get(":amount")` route.
3. Before running the method, Nest resolves its parameters: `@Param("amount")` reads
   `"100"` from the URL path; `@Query("rate")` reads `"0.1"` from the query string.
4. `PricingController`'s constructor already has a real `PricingService` instance
   injected into `this.pricingservice` — this happened once, back at app startup, not
   freshly for this request.
5. The method body runs: `return this.pricingservice.getTax(amount, rate)` — calls the
   service's method, passing both values through.
6. Inside `PricingService.getTax`, `this.taxrate` is already `0.18` (injected at startup
   from the `"TAX_RATE"` locker). The method computes `amount * (rate ?? this.taxrate)` —
   since `rate` (`"0.1"`, read from the query string) is NOT `undefined`, it's used
   instead of the injected default.
7. The computed number is `return`ed out of the method, back to the controller, back to
   Nest — which converts it into the actual HTTP response body sent back to whoever made
   the request.

---

## Day 54 — Custom Decorators, Metadata, and Guards

### What I learned today

So far every decorator I used (`@Controller`, `@Get`, `@Param`, `@Injectable`...) was one
Nest already built for me. Today: how to build MY OWN decorators, and how Nest can read
"tags" I stick on a route from a completely different class (a Guard) — which is the
actual mechanism behind things like "only admins can call this route."

### `SetMetadata` — sticking a label on a route, readable later

```ts
export const AdminAction = (action: string) => SetMetadata("action", action)
```
- `SetMetadata(key, value)` is a function Nest gives you. Calling it returns a decorator —
  i.e. calling `SetMetadata(...)` doesn't itself label anything; it HANDS BACK a labeler
  you then use with `@`.
- `"action"` is the KEY — like the `provide` token from Day 53, just for metadata instead
  of DI. It's a name tag for "where is this piece of information stored," not the data
  itself.
- `action` (the function's own parameter) is the VALUE actually stored under that key.
  Whatever text you pass in when you write `@AdminAction("delete-user")` becomes this
  value.
- `AdminAction` is just MY OWN NAME for this — a thin wrapper so I write
  `@AdminAction("delete-user")` instead of the more awkward
  `@SetMetadata("action", "delete-user")` directly on every route. Both do the exact same
  thing; this is purely a readability shortcut I built myself.
- Important: `SetMetadata` does NOT run any logic, check anything, or block anything. It
  only ATTACHES data to the method, invisibly, for something else to read later. By
  itself, a route tagged `@AdminAction("delete-user")` behaves identically to an untagged
  one — the tag does nothing until a Guard goes looking for it (next section).

### `reflect-metadata` — what makes attaching/reading metadata possible at all

Normal JavaScript has no built-in way to attach arbitrary extra data to a class or method
and read it back later — a function is just a function. `reflect-metadata` is a library
Nest depends on (installed automatically, imported once at the very top of `main.ts`) that
adds exactly this ability to the language: "attach a labeled piece of data to this
specific class/method, and look it up again later, given the same key and the same
class/method." `SetMetadata` and `Reflector.get` (below) are both just a friendlier Nest
wrapper around this underlying reflect-metadata mechanism — Nest didn't invent the
capability, it's standing on top of this library.

### `Reflector` — reading the label back out, inside a Guard

```ts
@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const action = this.reflector.get<string>("action", context.getHandler())
    console.log(`This route has action: ${action}`)
    return true
  }
}
```
- `@Injectable()` — same meaning as always: Nest is allowed to construct this class and
  inject things into it.
- `implements CanActivate` — a TypeScript contract (an `interface`, like Module 32's
  interfaces) saying "this class promises to have a `canActivate` method with this exact
  shape." This is what makes Nest recognize this class as usable with `@UseGuards(...)`.
- `constructor(private reflector: Reflector)` — ordinary type-based dependency injection
  (Day 53's mechanism) — `Reflector` is a real class Nest provides, so no `@Inject(token)`
  needed, the type itself is enough.
- `canActivate(context: ExecutionContext): boolean` — Nest calls THIS method automatically
  for every request that hits a route guarded by this Guard, BEFORE the route's own method
  runs. `context` is a wrapper object giving access to the current request. Returning
  `true` means "allow this request through to the actual route handler." Returning `false`
  would block it (not used yet — this Guard only logs, doesn't actually block anything).
- `context.getHandler()` — "give me a reference to the exact route method that's about to
  run" (e.g. the actual `adminaction` function object, not a copy or a description of it).
- `this.reflector.get<string>("action", context.getHandler())` — "look up whatever was
  stored under the key `'action'` on THIS SPECIFIC method, using `SetMetadata`." The
  `<string>` is just telling TypeScript what type to expect back (same "trust me" caveat
  as every other type annotation — nothing really checks it). If that route was never
  tagged with `@AdminAction(...)`, this returns `undefined` instead of crashing.
- So the full chain: `@AdminAction("delete-user")` on a route → stores `"delete-user"`
  under key `"action"` on that specific method, using reflect-metadata underneath → later,
  `ActionGuard.canActivate` runs for that same route (because of `@UseGuards(ActionGuard)`
  on it) → asks `Reflector` "what's under `'action'` on this exact method" → gets back
  `"delete-user"` → logs it.

### `createParamDecorator` — building my own `@Param`/`@Query`-style decorator

```ts
export const RequestId = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers[data] ?? "unknown"
});
```
- `createParamDecorator(fn)` — a Nest function that takes YOUR function and turns it into
  a usable parameter decorator, so you can write `@RequestId("x-request-id") id: string`
  as a method parameter, the exact same way you'd write `@Param("amount")`.
- The function you hand it always gets two things: `data` (whatever text YOU write inside
  the parentheses when using it — e.g. `"x-request-id"`) and `ctx` (the same kind of
  request-wrapper object the Guard got, here called `ExecutionContext` too).
- `ctx.switchToHttp()` — `ExecutionContext` is generic enough to represent other kinds of
  entry points too (WebSockets, microservices — not covered yet), so this line says "I
  specifically want the HTTP version of this request," and `.getRequest()` then hands back
  the actual underlying request object (same object Express would call `req`).
- `request.headers[data]` — `request.headers` is a plain object of all HTTP headers sent
  with the request, lowercased keys. `data` here is `"x-request-id"` (whatever text was
  passed when the decorator was used), so this reads that one specific header's value.
- `?? "unknown"` — if that header wasn't sent at all (`undefined`), fall back to the
  string `"unknown"` instead.
- Using it: `giveid(@RequestId("x-request-id") id: string) {...}` — Nest calls the
  function above automatically, right before `giveid` runs, and whatever it RETURNS
  becomes the actual value of `id` inside `giveid`'s body. Exactly the same mechanical
  pattern as `@Param`/`@Query`/`@Body`, except I wrote the extraction logic myself instead
  of Nest providing it.

### The colon (`:`) in a route path — what it actually means

```ts
@Get(":id")
@Get("combined")
```
- A route path is split into segments by `/`. A plain segment like `"combined"` only
  matches that EXACT text in the URL.
- A segment starting with `:` (like `:id`, or `:logid`, or `:ruleid` — the NAME after the
  colon is entirely my own choice, Nest doesn't care what I call it) is a PLACEHOLDER —
  "this segment can be literally any text, and whatever it is, make it available under
  this name via `@Param(nameAfterColon)`." So `:id` and `:logid` behave 100% identically
  as routing rules — the only difference is which name you'd use to read the value back
  out with `@Param(...)`. `/audit/:id` matches `/audit/108`, `/audit/combined`,
  `/audit/anything-at-all` — ONE segment, any text.
- This is exactly why today's ordering bug (next section) happened: `:id` isn't "a number
  placeholder" or anything restrictive — it's "literally any single path segment,"
  including text that happens to also be a real, separate, literal route.

### The bug I hit: wildcard route swallowing a literal route

My first version had, in this order:
```ts
@Get(":id")
giveid(@RequestId("x-request-id") id: string) { ... }

@Get("combined")
combined(...) { ... }
```
Calling `GET /audit/combined` returned a response, but the Guard's `console.log` never
printed the `combined` route's own tag — proof `giveid()` ran instead of `combined()`,
even though `combined()` also matches `/audit/combined`.

**Why:** Nest (like Express underneath it) checks routes in the exact order they were
REGISTERED, top to bottom, and uses the FIRST one that matches — it does not look ahead
for a "more specific" match first. Since `:id` matches ANY single segment, `/audit/:id`
being declared first means it swallows `/audit/combined` too, before `/audit/combined`
ever gets a chance to be checked.

**The fix:** declare the literal, specific route BEFORE the wildcard one:
```ts
@Get("combined")
combined(...) { ... }

@Get(":id")
giveid(...) { ... }
```
Now `/audit/combined` is checked first, matches exactly, and runs — `:id` only ever
catches whatever's left over (any segment that ISN'T one of the literal routes declared
above it).

### Full request trace — `GET /audit/combined` (header `x-request-id: xyz-999`), after the fix

1. Request arrives at `GET /audit/combined` with header `x-request-id: xyz-999`.
2. Nest's router checks routes top to bottom: `/audit` (no match, extra segment) →
   `/audit/combined` (exact text match — STOPS here, this route wins).
3. This route has `@UseGuards(ActionGuard)` attached, so before `combined()` itself runs,
   Nest constructs/reuses `ActionGuard` and calls its `canActivate(context)`.
4. Inside `canActivate`, `context.getHandler()` points at `combined` specifically;
   `this.reflector.get("action", ...)` looks up the metadata stored by `@AdminAction`
   on THIS method and gets back `"remove-user"`; it's logged; `true` is returned, so the
   request is allowed through.
5. Nest now resolves `combined`'s own parameter: `@RequestId("x-request-id")` runs its
   function, reads `request.headers["x-request-id"]`, gets `"xyz-999"`.
6. `combined`'s body runs: `return \`Request id is ${id}\`` → `"Request id is xyz-999"`.
7. That string becomes the HTTP response body sent back.

---

## Day 55 — DTOs, `class-validator`, `class-transformer`, `ValidationPipe`

### What I learned today

Every route so far trusted whatever data arrived — nothing actually checked that a
request body had the right shape or sane values. Today: a real mechanism for rejecting
bad input automatically, before my own route code ever runs, built from a DTO class +
rule-decorators + two separate conversion steps I'd been quietly conflating as one.

### What a DTO is, and why it has to be a CLASS, not an interface

A DTO (Data Transfer Object) is a plain class describing the shape of data moving in or
out — no real logic, just properties.

```ts
export class OrderDto {
  item: string
  quantity: number
  price: number
}
```

I already know `interface` from Module 32 and it looks like it'd do the same job. The
difference: an `interface` is a TypeScript-only concept — it's completely erased by the
time the code actually runs (compiled away to nothing). A `class` is NOT erased — it
still exists as a real, working thing while the program runs. Validation needs something
real at runtime to attach rules to and check against, so it has to be a class.

### `class-validator` — decorators that attach a rule to one field

```ts
import { IsString, IsInt, Min } from "class-validator";

export class OrderDto {
  @IsString()
  item: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsInt()
  @Min(0)
  price: number
}
```

- `@IsString()`, `@IsInt()`, `@Min(n)` are decorators `class-validator` already built.
  Same underlying mechanism as Day 54's `SetMetadata` — writing `@IsInt()` above
  `quantity` doesn't check anything by itself at that moment; it just ATTACHES a rule
  ("this field must be a whole number") as metadata on that property, for something else
  to read and check later.
- Several decorators can stack on one property (`@IsInt()` + `@Min(1)` on `quantity`) —
  ALL of them must pass, not just one.
- The thing that actually reads this metadata and checks real data against it is
  `class-validator`'s own `validate()` function, or (inside Nest) the `ValidationPipe`
  below — never the decorators themselves.

### Two separate conversions I was conflating — the full JSON round trip

This was my big confusion point today, worth writing out in full because it's a pattern
that comes up everywhere, not just here.

**JSON is a TEXT FORMAT (a string) — never an in-memory object.** A JS object like
`{ item: "Keyboard", quantity: 2 }` living in memory is NOT JSON — it only becomes JSON
once converted into quoted text. The two things that convert between them are exact
opposites of each other:

- `JSON.stringify(obj)` — real JS object (in memory) → JSON text (a string). Used on the
  SENDING side, e.g. in my `main.ts` test call:
  `body: JSON.stringify({ item: "Keyboard", quantity: 2, price: 1500 })` — turns that
  object into the string `'{"item":"Keyboard","quantity":2,"price":1500}'`, which is what
  actually travels over the network as the request body.
- `JSON.parse(text)` — JSON text (a string) → real plain JS object. Run automatically by
  `express.json()` middleware (recap Module 41) on the RECEIVING side, but ONLY if the
  request's `Content-Type: application/json` header says to. The header is just a LABEL
  the client attaches saying "treat my body text as JSON" — it does no parsing itself;
  `express.json()` is the thing that reads that label and decides whether to call
  `JSON.parse()` at all. No header (or wrong header) → body stays unparsed → `req.body`
  ends up empty.

**That parsed plain object is still NOT a class instance.** This is the SECOND, separate
conversion, and it's `class-transformer`'s job, not `JSON.parse`'s:

```ts
import { plainToInstance } from "class-transformer";

const raw = { item: "Keyboard", quantity: 2, price: 1500 }; // already a plain object
const dto = plainToInstance(OrderDto, raw);                  // now a REAL OrderDto instance
```
`plainToInstance` never touches raw text and does no JSON parsing at all — it only takes
an object that ALREADY exists (from step above) and copies its fields into a brand-new
real instance of the named class. Before this, `raw instanceof OrderDto` is `false`;
after, `dto instanceof OrderDto` is `true`. This step exists because `class-validator`'s
decorators only work on real class instances — a plain object has no class to look
decorators up on.

**Full chain, one request, both conversions in order:**
`JS object → JSON.stringify → JSON text (travels over network) → express.json() sees
Content-Type header, runs JSON.parse → plain JS object (req.body) → plainToInstance →
real class instance → class-validator's validate() checks the decorators on it.`

### `ValidationPipe` — wiring the DTO decorators + the transformer into Nest automatically

A Pipe sits between "data arrived" and "your route method runs" — it can transform data,
or block the request entirely by throwing.

```ts
@Post()
createOrder(@Body(new ValidationPipe()) body: OrderDto) {
  return `Order placed: ${body.quantity} x ${body.item}`
}
```

What Nest does, in order, for an incoming `POST /orders`:
1. Reads the raw request body (already parsed into a plain object by `express.json()`,
   assuming the `Content-Type` header was set correctly).
2. Because `@Body(new ValidationPipe())` is used instead of bare `@Body()`, Nest runs
   that plain object through the `ValidationPipe` BEFORE `createOrder` executes.
3. Internally, the Pipe does exactly the two conversions above: `plainToInstance` first,
   then `class-validator`'s `validate()` against every decorator on `OrderDto`.
4. All rules pass → the real, validated `OrderDto` instance becomes `body` inside
   `createOrder` — my code runs normally.
5. Any rule fails → `createOrder` is NEVER called. Nest automatically responds with
   `400 Bad Request` and a message describing exactly which field(s) failed and why —
   no code of mine involved in producing that error response.

### Real proof — what happened when `Content-Type` was missing

My own `main.ts` test call for `/orders` originally had no `Content-Type` header. Real
result:
```
{"message":["item must be a string","quantity must not be less than 1",
"quantity must be an integer number","price must not be less than 0",
"price must be an integer number"],"error":"Bad Request","statusCode":400}
```
EVERY single field failed, not just one — because without the header, `express.json()`
never parsed the body, so `plainToInstance` built an `OrderDto` where `item`, `quantity`,
and `price` were all `undefined`. `undefined` fails `@IsString()`, fails `@IsInt()`, and
fails `@Min(n)` too (comparing `undefined` against a number is never true) — hence every
rule on every field failing at once. This is a good diagnostic pattern to remember: if
EVERY field fails validation simultaneously, suspect the body never actually arrived
parsed, rather than suspecting the data itself.

**Fix:** add `headers: { "Content-Type": "application/json" }` to the fetch call —
exactly what the earlier `res5` (pricing) test call already had, which is why that one
worked and this one initially didn't.

### Gotchas worth remembering from this module

- **If EVERY field in a `ValidationPipe` error fails at once, suspect the body never got
  parsed at all (missing/wrong `Content-Type` header)** before suspecting the actual
  data — `undefined` fails every `class-validator` rule simultaneously, which looks like
  "everything is wrong" but usually means "nothing arrived."
- **`JSON.stringify`/`JSON.parse` and `plainToInstance` are TWO separate, unrelated
  conversions, not one** — stringify/parse convert between TEXT and a plain object;
  `plainToInstance` converts between a plain object and a real CLASS INSTANCE. Mixing
  these up (assuming parsing a JSON string already gives you a validated class instance)
  is an easy, very natural mistake.
- **`npx tsx` breaks NestJS dependency injection.** It doesn't fully support
  `emitDecoratorMetadata` (the exact mechanism in the "how DI actually works"
  walkthrough above, step 3) — so constructor-injected things silently come back
  `undefined`. Always run NestJS with `npm run start` / `npm run start:dev`, never
  `npx tsx`, unlike every other module in this repo so far.
- **Two `@Get()` methods on the same path is a real bug, not harmless duplication** —
  only the first one registered ever actually runs; the second is permanently dead code.
  If a route needs to behave differently sometimes (e.g. with/without a query param),
  that's ONE method with a branch inside it, not two competing methods.
- **A custom-token's declared type (`@Inject("X") x: number`) is never actually
  checked against what's really stored there** — TypeScript trusts whatever annotation
  you write; it has no way to trace a string token back to its real registered value.
  Same "trust me, no real check" family as `as`/M32b's assertions.
- **A wildcard path segment (`:id`) matches ANY single segment, including text that's
  also a real literal route** (`"combined"`) — and since routes are matched in
  REGISTRATION ORDER (not by specificity), a wildcard route declared before a literal
  route permanently steals its requests. Literal/specific routes must be declared BEFORE
  wildcard routes that could also match the same text.
- **`SetMetadata`/`@Inject`-style tags do nothing by themselves** — they only attach
  inert data (via `reflect-metadata`) for something else (a `Reflector`, inside a Guard)
  to go read later. Tagging a route and never reading the tag back has zero runtime
  effect — same "label vs. logic" split as a comment: the tag doesn't enforce anything on
  its own.
