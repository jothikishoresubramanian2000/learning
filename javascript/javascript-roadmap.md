# JavaScript Roadmap (Beginner → Intermediate → Backend → TypeScript)

> **Learning rule:** every module is broken into *atomic sub-topics*. We do them
> one at a time, no skipping — even the tiny ones. A ✅ appears when done.
> Cross-references like *(→ Module N)* mean that atom gets its deep dive later.

---

## Phase 1 — JavaScript Fundamentals
**Goal:** Understand the language itself.

### Module 1 — Introduction
- What is JavaScript?
- Short history (why it exists)
- How JS runs: the **V8 engine**
- Browser vs Node.js (two homes for JS)
- Execution flow (top to bottom)
- `console.log()` — printing to terminal
- Running a file: `node file.js`
- Comments — single line `//` and block `/* */`
- Statements & semicolons (ASI — automatic semicolon insertion)

**Mini task:** Install Node.js, install VS Code, run your first JS file.

### Module 2 — Variables
- `var`, `let`, `const` — the three declarations
- When to use each (default `const`, `let` if reassign, avoid `var`)
- Reassign vs redeclare rules
- Declaring empty (`let x;` → `undefined`)
- `const` must be initialized immediately
- Cannot redeclare in same scope
- Naming rules (letter/`_`/`$`, case-sensitive, no keywords)
- Naming convention — camelCase, `UPPER_SNAKE` for constants
- (Scope, block scope, hoisting → Modules 13 & 15)

**Task:** Create variables for employee name, salary, department, isLoggedIn.

### Module 3 — Data Types
- Primitives: Number, String, Boolean, Null, Undefined, Symbol, BigInt
- Reference types: Object, Array, Function
- `typeof` operator (and the `typeof null === "object"` quirk)
- `null` vs `undefined`
- Number details: integers, floats, `NaN`, `Infinity`
- **Reference vs value**: primitives copy by value; objects copy by reference
- `const` object is still mutable (locks reference, not contents)

**Task:** Create an employee object.

### Module 4 — Operators
- Arithmetic: `+ - * / % **`
- Assignment: `= += -= *= /= %=`
- Comparison: `< > <= >=`
- Equality: `==` vs `===` (loose vs strict) and `!=` vs `!==`
- Logical: `&& || !`
- Short-circuit evaluation (`&&`, `||` return values, not just true/false)
- Ternary operator `cond ? a : b`
- Nullish coalescing `??`
- Optional chaining `?.`
- Logical assignment `||=`, `&&=`, `??=`
- String concatenation with `+`
- Operator precedence (order of evaluation)

**Task:** Employee bonus calculator.

### Module 5 — Type Conversion
- Explicit: `Number()`, `String()`, `Boolean()`, `parseInt()`, `parseFloat()`
- Implicit / coercion (JS auto-converting)
- Truthy values
- Falsy values (`false`, `0`, `""`, `null`, `undefined`, `NaN`)
- String → Number gotchas (`Number("")`, `Number("abc")` → `NaN`)
- `+` with strings vs numbers (concatenation vs addition)

**Task:** Convert input values into numbers.

### Module 6 — Conditionals
- `if`, `else if`, `else`
- Nested `if`
- `switch`, `case`, `break`, `default`
- Fall-through in `switch`
- Ternary as a short conditional
- Truthy/falsy in conditions
- Guard clauses (early return style)

**Task:** Library Management.

### Module 7 — Loops
- `for` loop (init; condition; step)
- `while` loop
- `do...while` loop
- `for...of` (iterate values — arrays, strings)
- `for...in` (iterate keys — objects)
- `break` and `continue`
- Nested loops
- Infinite loop danger
- `forEach` (array method, intro — deep in Module 10)

**Task:** Print a `*****` box pattern.

### Module 8 — Functions
- Function declaration `function foo() {}`
- Function expression `const foo = function() {}`
- Arrow functions `const foo = () => {}`
- Parameters vs arguments
- `return` statement (and functions with no return → `undefined`)
- Default parameters
- Rest parameters `...args`
- Spread operator `...` in calls
- Function hoisting (declaration vs expression difference)
- Callback functions (function passed as argument)
- Pure vs impure functions
- (Closures → Module 13)

**Task:** Bank interest calculator.

### Module 9 — Strings
- Creating strings — quotes `' '`, `" "`, backticks `` ` ` ``
- Template literals `` `Hello ${name}` ``
- String is immutable
- Length — `.length`
- Access char — indexing / `.charAt()`
- Case — `.toUpperCase()`, `.toLowerCase()`
- Search — `.includes()`, `.indexOf()`, `.startsWith()`, `.endsWith()`
- Extract — `.slice()`, `.substring()`
- Modify — `.replace()`, `.replaceAll()`, `.trim()`, `.padStart()`, `.padEnd()`
- `.split()` (string → array) and `.join()` (array → string)
- `.repeat()`
- Escape characters `\n`, `\t`, `\"`

**Task:** Generate Employee ID → `EMP-VICKY-001`.

### Module 10 — Arrays
- Create array `[]`, access by index, `.length`
- Add/remove ends — `push`, `pop`, `shift`, `unshift`
- Copy/extract — `slice`
- Insert/remove/replace — `splice`
- Iterate — `forEach`
- Transform — `map`
- Filter — `filter`
- Search — `find`, `findIndex`, `indexOf`, `includes`
- Test — `some`, `every`
- Reduce — `reduce` (aggregate to single value)
- Sort — `sort` (and the number-sort gotcha)
- `reverse`
- `concat`, spread `...` to merge
- `flat`, `flatMap`
- `Array.from`, `Array.isArray`
- Destructuring arrays `const [a, b] = arr`
- Arrays are reference type (copy trap)

**Task:** Student Marks System.

### Module 11 — Objects
1. Create — object literal `{}`
2. Access — dot `.` vs bracket `["key"]`
3. Add / update / delete (`delete obj.key`)
4. Nested objects (`emp.address.city`)
5. Methods (function inside object)
6. `this` inside a method (intro; deep dive → Module 16)
7. Property shorthand `{ name }`
8. Computed property names `{ [key]: value }`
9. Destructuring `const { name } = emp` (+ rename, defaults)
10. Spread `...` — copy / merge objects
11. `Object.keys()`, `Object.values()`, `Object.entries()`
12. `Object.freeze()`, `Object.assign()`
13. Property exists — `in`, `hasOwnProperty()`
14. Loop object — `for...in`
15. Optional chaining `emp?.address?.city`
16. Shallow vs deep copy (reference trap)
17. `JSON.stringify` / `JSON.parse` (→ Module 25)

**Task:** Inventory object.

### Module 12 — Dates
- `new Date()` (now)
- Create specific date
- Get parts — `getFullYear`, `getMonth` (0-indexed!), `getDate`, `getHours`, etc.
- Timestamps — `Date.now()`, `getTime()`
- Formatting — `toISOString`, `toLocaleDateString`
- Date difference (ms → days)

**Task:** Age calculator.

---

## Phase 2 — Intermediate JavaScript

### Module 13 — Scope & Closures
- Global scope
- Function scope
- Block scope (`{}` with `let`/`const`)
- Lexical scope (inner sees outer)
- Nested functions
- Closures (function remembering its outer variables)
- Practical closure uses (counters, private state)

### Module 14 — Execution Model
- Execution context
- Call stack
- Memory (heap vs stack)
- Stack overflow

### Module 15 — Hoisting
- `var` hoisting (undefined)
- Function declaration hoisting
- `let`/`const` hoisting + Temporal Dead Zone (TDZ)
- Why `let`/`const` are safer

### Module 16 — `this`
- `this` in global scope
- `this` in a regular function
- `this` in an object method
- `this` in arrow functions (lexical `this`)
- `bind`, `call`, `apply`
- Losing `this` (common bug)

### Module 17 — DOM (Basic, awareness only)
> You're doing backend — this is *awareness*, not deep study.
- What the DOM is
- `document.querySelector`
- Changing text / attributes
- Why backend devs still should know it exists

### Module 18 — Events & Callbacks
- What an event is
- Event listeners `addEventListener`
- Callback functions
- Callback hell (why Promises exist)

### Module 19 — Promises *(Very Important)*
- What a Promise is (pending / fulfilled / rejected)
- Creating a Promise — `resolve()`, `reject()`
- Consuming — `.then()`, `.catch()`, `.finally()`
- Chaining `.then()`
- `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`
- Error propagation in chains

**Real example:** Calling a REST API.

### Module 20 — Async / Await
- `async` functions (always return a Promise)
- `await` keyword
- `try/catch` with `await`
- Sequential vs parallel awaits
- `await` with `Promise.all`
- Common mistakes (forgetting `await`)

### Module 21 — Error Handling
- `try`, `catch`, `finally`
- `throw`
- The `Error` object (`.message`, `.name`, `.stack`)
- Custom error classes (`extends Error`)
- Errors in async code
- When to catch vs let it bubble

### Module 22 — Modules
- Why modules (splitting code)
- CommonJS — `require`, `module.exports` (Node classic)
- ES Modules — `import`, `export`
- Named vs default exports
- `"type": "module"` in package.json
- Import paths (relative, packages)

### Module 23 — Classes
- `class` syntax
- `constructor`
- Methods
- Instance properties
- `this` in classes
- `extends` (inheritance)
- `super`
- Getters / setters
- Static methods / properties
- Private fields `#field`
- (Compare to Python classes you know)

### Module 24 — Collections
- `Map` (key-value, any key type)
- `Set` (unique values)
- `WeakMap`, `WeakSet`
- Map/Set vs Object/Array (when to use which)
- Iterating Maps and Sets

### Module 25 — JSON
- What JSON is (data format)
- `JSON.stringify()` (+ pretty print, replacer)
- `JSON.parse()`
- JSON vs JS object (differences)
- Common parse errors

### Module 26 — Timers
- `setTimeout`
- `setInterval`
- `clearTimeout`, `clearInterval`
- Event loop basics (how timers fit)
- `setImmediate`, `process.nextTick` (Node)

### Module 27 — Node.js Basics
- What Node is / global objects (`global`, `process`)
- `process.argv`, `process.env` (environment variables)
- Module system in Node
- `fs` — file system (read/write, sync vs async)
- `path` module
- `os` module
- `events` — EventEmitter
- `__dirname`, `__filename`
- Reading env vars / `.env` concept

### Module 28 — NPM
- What npm is
- `package.json` (fields explained)
- `npm init`
- Installing packages (`dependencies` vs `devDependencies`)
- `node_modules`, `package-lock.json`
- Scripts (`npm run`)
- Semantic versioning (`^`, `~`)
- Global vs local install

### Module 29 — Debugging
- `console` methods (`log`, `error`, `warn`, `table`, `dir`)
- Reading stack traces
- VS Code debugger + breakpoints
- Common error types (`TypeError`, `ReferenceError`, `SyntaxError`)

### Module 30 — Best Practices
- Clean code + naming
- Folder structure
- Code style (linting, Prettier)
- DRY, single responsibility
- Error-handling discipline

---

## Phase 3 — Real Backend JavaScript
> Stop writing toy examples — build backend-focused projects.

| # | Project | Features |
|---|---------|----------|
| 1 | Student Management | Add / Delete / Update / Find |
| 2 | Employee Management | CRUD, Salary, Department, Filtering |
| 3 | Inventory System | Products, Stock, Price, GST |
| 4 | Expense Tracker | Income, Expense, Balance, Monthly Report |
| 5 | Library Management | Books, Issue, Return, Fine |
| 6 | Authentication Simulation | Login, JWT concept, Roles, Permissions |
| 7 | Mini REST API (Node.js) | GET, POST, PATCH, DELETE |
| 8 | SaaS Product Backend | Tenant, Org, Users, Roles, Auth, CRUD, Validation |

---

## How We'll Learn (per atom)
1. **Concept** — the why and how.
2. **Real-world analogy** — connect to something familiar.
3. **Backend example** — where it's used in real APIs.
4. **One small example** — minimal, clear.
5. **Common mistakes** — pitfalls.
6. **Task** — you write the code yourself.
7. **Review** — I read + run it, give feedback before moving on.

---

## Phase 4 — TypeScript (After JavaScript)
> TypeScript = JavaScript + Types. Every `.js` is valid `.ts`.
> Node/browser can't run `.ts` directly — `tsc` compiles it to `.js` first.

### Module 31 — Why TypeScript
- Problems with plain JS (no type safety)
- Compile-time vs runtime errors
- How `tsc` works
- `tsconfig.json` basics
- Installing TS

### Module 32 — Basic Types
- `string`, `number`, `boolean`
- `null`, `undefined`
- `any`, `unknown`, `never`, `void`
- Arrays `number[]`
- Tuples `[string, number]`
- Type inference
- Type annotations

### Module 33 — Interfaces & Types
- `interface`
- `type` alias
- `interface` vs `type`
- Optional properties `?`
- `readonly`
- Nested / extending interfaces

### Module 34 — Functions with Types
- Parameter types
- Return types
- Optional / default params
- Function type signatures
- Void return

### Module 35 — Union, Literal & Enums
- Union types `A | B`
- Literal types `"ADMIN" | "USER"`
- `enum`
- Type narrowing
- Discriminated unions

### Module 36 — Generics
- Generic functions `<T>`
- Generic interfaces
- Constraints `extends`
- Multiple type params

### Module 37 — Classes in TypeScript
- Access modifiers `public`, `private`, `protected`
- `readonly`
- Implementing interfaces
- Abstract classes

### Module 38 — Utility Types
- `Partial`, `Required`
- `Pick`, `Omit`
- `Record`
- `Readonly`
- `ReturnType`, `Parameters`

### Module 39 — TypeScript with Node.js
- Node + TS project setup
- `ts-node`, build scripts
- `@types/*` packages
- Typing Express request/response

### Module 40 — Rebuild the SaaS Backend in TS
- Typed Tenant / Org / User / Role models
- Typed CRUD APIs
- Typed validation

---

## Phase 5 — Production Backend Engineering
> **Goal:** close the gap between roadmap-level code and a real production codebase
> like **procIq-app** (NestJS + PostgreSQL/Prisma + AWS + Docker + tests).
> Phases 1–4 teach the *language*; this phase teaches the *systems* built with it.
> Do this AFTER Phase 4 (TypeScript) — Nest and Prisma are TypeScript-first.
>
> Reference project to study: `D:\learning\procIq-app`
> - `apps/spine` — NestJS TS backend (the target style)
> - `libs/db` — Prisma + PostgreSQL
> - `docker-compose.yml`, `infra/` — infrastructure

### Module 41 — Node.js Backend Foundations
- HTTP deeper: methods, status codes, headers, REST design
- Express basics (routing, middleware) — the layer Nest sits on
- Request lifecycle: request → middleware → handler → response
- Environment config & secrets (`.env`, `@nestjs/config`)
- Project/folder architecture (layered: controller → service → repository)

### Module 42 — Databases & SQL (PostgreSQL)
- Relational model: tables, rows, columns, keys
- Primary keys, foreign keys, relationships (1-1, 1-many, many-many)
- Core SQL: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`
- Indexes (why queries get slow), unique constraints
- Transactions & ACID, isolation
- Postgres roles & privileges (`CREATE ROLE`, `GRANT`)
- **Row-Level Security (RLS)**: `ENABLE/FORCE ROW LEVEL SECURITY`, `CREATE POLICY ... USING/WITH CHECK`, `current_setting('app.tenant_id')`, fail-closed (0 rows) — procIq's core tenant isolation
- Session config / GUC: `SET`/`set_config()` inside a transaction
- Raw SQL basics, connection pooling
> Study: `migrations/` and the `*_rls_*` SQL files

### Module 43 — Prisma ORM
- What an ORM is (objects ↔ tables)
- `schema.prisma` — models, relations, enums, `@map`/`@@map`, `@@unique`, `@@index`, `@id`, `@default(uuid())`, `Json`, `Decimal`, `String[]`
- Migrations (`migrate dev/deploy/status`), shadow DB, `url` vs `directUrl`
- Prisma Client queries (`findMany/findUnique/create/update`, `select`, `orderBy`)
- Error codes (`P2002` unique violation), `instanceof PrismaClientKnownRequestError`
- `$transaction`, `$queryRaw`/`$executeRaw`, client `$extends` (query hooks)
- **Two-client RLS pattern**: tenant-scoped client vs admin (BYPASSRLS) client, injecting `SET app.tenant_id` per query
- Generated client location (custom `output`), types + type safety, seeding
> Study: `libs/db/prisma/schema.prisma`, `libs/db/src/connection.service.ts`

### Module 44 — NestJS Framework  *(largest module — see day split)*
- Why a framework (structure, DI, testability)
- Bootstrap (`NestFactory`, global prefix, CORS, `enableShutdownHooks`)
- Modules — `@Module`, imports/providers/exports, **global modules** (`isGlobal`), **dynamic modules** (`forRoot()`)
- Controllers + routing (`@Controller`, `@Get/@Post/@Patch`, `@Param/@Body/@Query`)
- Providers/Services + **Dependency Injection** (constructor injection, **custom provider tokens** + `@Inject()`)
- **Decorators** built-in + **custom** (`SetMetadata`, `createParamDecorator` → `@Roles`, `@Public`, `@CurrentUser`)
- `reflect-metadata` + `Reflector.getAllAndOverride` (how metadata drives guards)
- Repository pattern (controller → service → repository)
- DTOs + validation (`class-validator`, `class-transformer`, global `ValidationPipe`: whitelist/transform)
- **Pipes, Guards** (`CanActivate`, `APP_GUARD`), **Interceptors** (`NestInterceptor`, `APP_INTERCEPTOR`, **RxJS `Observable`**), **Exception Filters** (`@Catch`, global filter → consistent error envelope)
- **Middleware** (`NestModule.configure`, `MiddlewareConsumer`)
- **Lifecycle hooks** (`OnModuleInit`, `OnModuleDestroy`)
- **WebSocket Gateways** (`@WebSocketGateway`, `@SubscribeMessage`, `OnGatewayConnection`)
- Custom error hierarchy → HTTP mapping (`ProcIQError`)
- Swagger/OpenAPI docs (`@nestjs/swagger`)
> Study: `apps/spine/src/users/`, `apps/spine/src/common/`, `apps/spine/src/main.ts`, `apps/spine/src/gateways/`

### Module 45 — Authentication & Authorization
- Sessions vs tokens; httpOnly cookies vs Bearer header
- **JWT / OIDC** (structure, claims `iss`/`aud`/`kid`, RS256 signing & verification)
- **JWKS** — fetching signing keys (`jwks-rsa`), per-issuer key caching
- Passport strategies (`passport-jwt`, custom `secretOrKeyProvider`)
- Auth provider — **AWS Cognito** (user pools, groups↔roles), multi-pool (global + per-tenant)
- **JIT user sync** (Cognito → DB source-of-truth for roles, Redis cache + invalidation)
- **RBAC** (roles, permissions, `@Roles` + guard, role ceilings)
- Separation of Duties (SoD) concept
- Tenant-trust: token tenant must match host-resolved tenant
> Study: `apps/spine/src/auth/`, `apps/spine/src/guards/`

### Module 46 — Async Architecture & Messaging
- **AsyncLocalStorage** (`async_hooks`) — per-request context (tenant/user/correlationId) threaded through async calls (powers RLS + logging)
- Correlation IDs (edge middleware → propagated across services)
- Redis (caching, rate-limit, pub/sub) — `ioredis`
- Message queues — **AWS SQS** (long-poll consumer, DLQ, poison messages)
- Event-driven patterns — `@nestjs/event-emitter` (in-process bus), typed event contracts, EventBridge
- Background jobs & schedulers (`@nestjs/schedule`, job registry/dispatcher/retry/overlap-guard)
- **WebSockets** / real-time — `socket.io` (rooms, chunked streaming, handshake auth)
- **Chain of Responsibility** pattern (`setNext` pipeline)
- Long-running workflows — Step Functions
> Study: `apps/spine/src/jobs/`, `apps/spine/src/gateways/`, `libs/shared-utils/` (request-context), `libs/job-framework/`

### Module 47 — Cloud & AWS (SDK v3 + IaC)
- AWS SDK for JS (`@aws-sdk/*`), default credential provider chain
- Cognito (auth), SES (email), SQS (queue), DynamoDB (+ doc client), Secrets Manager, EventBridge, Step Functions
- **LocalStack** (run AWS locally for dev) — procIq uses it
- **Infrastructure as Code — AWS CDK** (`aws-cdk-lib`: CloudFront, Route53, ACM; `cdk synth/deploy/diff`)
- ECS deployment context (SIGTERM draining, `trust proxy` behind nginx)
> Study: `infra/aws/`

### Module 48 — Testing
- Why test (confidence, refactoring)
- **Jest** — unit tests, assertions, matchers
- Mocking dependencies (mock repos/services)
- Test doubles, `spec.ts` files
- e2e / integration tests
- Coverage
> Study: `apps/spine/src/users/users.service.spec.ts`

### Module 49 — DevOps & Tooling
- **Docker** — images, containers, Dockerfile
- **docker-compose** — multi-service local dev (2× Postgres, Redis, LocalStack, nginx, pgAdmin), healthchecks, profiles
- **nginx** — reverse proxy, TLS termination, `X-Forwarded-*`, subdomain host routing (multi-tenancy)
- **Monorepo** — Nx (task graph, caching, affected builds), pnpm workspaces, Makefile entry points
- Git workflow, hooks (**husky**: branch-name + commit-msg), linting (ESLint), Prettier
- **Contract-first codegen** — JSON Schema → TS + Python (`generate:contracts`)
- CI/CD basics (`.github/`)
- Logging & observability — Pino (structured JSON), `pino-loki` → Loki/Grafana, Sentry/GlitchTip error reporting
- Env & secrets management (`.env.local`, config validation)
> Study: `docker-compose.yml`, `Makefile`, `nx.json`, `.husky/`, `infra/`

### Module 50 — Build ProcIQ-Style
> Capstone: build a small multi-tenant SaaS feature end-to-end using everything:
> NestJS module + Prisma model + migration + DTO/validation + JWT-guarded RBAC
> routes + a queue/job + unit tests + Docker. Mirrors the `apps/spine` pattern.

---

### After Phase 5 you can read & write procIq-level code
Language (P1–2) → TypeScript (P4) → NestJS + Prisma + Auth + AWS + Testing + Docker (P5).
The pieces you saw in `users.controller.ts` / `users.service.ts` map directly to
Modules 44 (Nest/DI/decorators), 43 (Prisma), 45 (auth/guards), 48 (spec tests).
