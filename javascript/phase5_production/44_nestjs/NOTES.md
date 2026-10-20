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

### Gotchas worth remembering from this module

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
