# JavaScript → procIq: Day-by-Day Learning Schedule

> **Pace:** 2 hours = 1 day. No topic skipped. Goal: read & write `procIq-app` code fluently.
> Companion to `javascript-roadmap.md`. Tick `[x]` as you finish each day.
> Some modules span multiple days; some small ones share a day. Verified against the actual procIq repo.

---

## Summary

| Phase | Modules | Days | Status |
|-------|---------|------|--------|
| 1 — Fundamentals | 1–12 | ~10 | ✅ **DONE** |
| 2 — Intermediate JS | 13–30 | 15 | ⏳ next |
| 3 — Backend Projects | 8 projects | 12 | |
| 4 — TypeScript | 31–40 | 13 | |
| 5 — Production (procIq) | 41–50 | 41 | |
| **Total remaining** | | **81 days** | |

**Timeline (from Module 13):**
- 7 days/week → ~12 weeks (~3 months)
- 5 days/week → ~16 weeks (~4 months)
- Add buffer for revision/projects → realistically **4–5 months** to procIq-ready.

> This is honest. procIq is a real production SaaS (NestJS + PostgreSQL/Prisma + AWS + Docker + multi-tenant RLS). No shortcut makes you fluent faster — but every day below moves you directly toward it.

---

## ✅ Phase 1 — Fundamentals (DONE)

Modules 1–12 completed: Introduction, Variables, Data Types, Operators, Type Conversion, Conditionals, User Input, Loops, Functions, Strings, Arrays (10A+10B), Objects, Dates. Notes in `js_learning_notes.md`.

---

## Phase 2 — Intermediate JavaScript (15 days)

- [x] **Day 1** — M13 Scope & Closures: global/function/block scope, lexical scope, nested functions, closures, practical uses (counter, private state) ✅
- [x] **Day 2** — M14 Execution Model + M15 Hoisting: execution context, call stack, memory (heap/stack), hoisting, Temporal Dead Zone ✅
- [x] **Day 3** — M16 `this`: `this` in global/function/method/arrow, `bind`/`call`/`apply`, losing `this` ✅
- [x] **Day 4** — M17 DOM (awareness) + M18 Events & Callbacks: what DOM is, `querySelector`, events, `addEventListener`, callbacks, callback hell, EventEmitter ✅
- [x] **Day 5** — M19 Promises: states, `resolve`/`reject`, `.then/.catch/.finally`, chaining, carry-forward bundling, `Promise.all/allSettled/race/any` ✅
- [x] **Day 6** — M20 Async/Await: `async` functions, `await`, `try/catch`, sequential vs parallel, `await Promise.all`, setTimeout→Promise pattern ✅
> **Order note:** M23 (Classes) is taught BEFORE M21 (Error Handling), because custom error classes (`extends Error`) depend on classes. Numbers are labels; sequence below is the real order.

- [x] **Day 7** — M23 Classes: `class`, `constructor`, methods, `this`, `extends`, `super`, getters/setters, static, private `#` ✅
- [x] **Day 8** — M21 Error Handling: `try/catch/finally`, `throw`, `Error` object, custom error classes (`extends Error`), `instanceof` dispatch, errors in async ✅
- [x] **Day 9** — M22 Modules: CommonJS (`require`/`module.exports`), ES Modules (`import`/`export`), named vs default, dynamic import, closure-factory trap ✅
- [x] **Day 10a** — M24 Collections: `Map`, `Set`, `WeakMap/WeakSet`, dedupe, tally pattern, Map vs Object ✅
- [x] **Day 10b** — M25 JSON: `JSON.stringify/parse` round-trip, pretty print, JSON vs JS object, what JSON drops ✅
- [ ] **Day 11** — M26 Timers & Event Loop: `setTimeout/setInterval/clear*`, event loop, `setImmediate`, `process.nextTick`
- [ ] **Day 12** — M27 Node.js Basics (part 1): globals, `process.argv/env`, module system, `fs` (read/write, sync vs async)
- [ ] **Day 13** — M27 Node.js Basics (part 2): `path`, `os`, `events`/EventEmitter, `__dirname/__filename`, `.env`
- [ ] **Day 14** — M28 NPM: `package.json`, `npm init`, dependencies vs devDependencies, `node_modules`, lockfile, scripts, semver
- [ ] **Day 15** — M29 Debugging + M30 Best Practices: console methods, stack traces, VS Code debugger; clean code, folder structure, linting

---

## Phase 3 — Real Backend Projects (12 days)

> Console/logic first, then real HTTP. Apply everything from Phase 1–2.

- [ ] **Day 16** — Project 1: Student Management (add/delete/update/find) — arrays of objects, functions
- [ ] **Day 17** — Project 2: Employee Management (CRUD, salary, department, filtering)
- [ ] **Day 18** — Project 3: Inventory System (products, stock, price, GST)
- [ ] **Day 19** — Project 4: Expense Tracker (income, expense, balance, monthly report)
- [ ] **Day 20** — Project 5: Library Management (books, issue, return, fine)
- [ ] **Day 21** — Project 6 (part 1): Authentication Simulation — login, roles, permissions
- [ ] **Day 22** — Project 6 (part 2): JWT concept, protecting actions
- [ ] **Day 23** — Project 7 (part 1): Mini REST API in Node — HTTP server, routing, GET/POST
- [ ] **Day 24** — Project 7 (part 2): PATCH/DELETE, status codes, JSON request/response
- [ ] **Day 25** — Project 8 (part 1): SaaS backend — tenants, organizations, users data model
- [ ] **Day 26** — Project 8 (part 2): roles, workspaces, CRUD APIs
- [ ] **Day 27** — Project 8 (part 3): validation, wiring it together (mirrors procIq shape)

---

## Phase 4 — TypeScript (13 days)

- [ ] **Day 28** — M31 Why TypeScript: type safety, compile vs runtime, `tsc`, `tsconfig.json`, install & first compile
- [ ] **Day 29** — M32 Basic Types: `string/number/boolean/null/undefined`, `any/unknown/never/void`, arrays, tuples, inference
- [ ] **Day 30** — M33 Interfaces & Types: `interface`, `type`, `?` optional, `readonly`, nested, extending
- [ ] **Day 31** — M34 Functions with Types: param/return types, optional/default, function signatures
- [ ] **Day 32** — M35 Union, Literal & Enums: `A|B`, literal types, `enum`, narrowing, discriminated unions
- [ ] **Day 33** — M36 Generics (part 1): generic functions, why generics
- [ ] **Day 34** — M36 Generics (part 2): generic interfaces, constraints (`extends`), multiple params
- [ ] **Day 35** — M37 Classes in TS: `public/private/protected`, `readonly`, implementing interfaces, abstract
- [ ] **Day 36** — M38 Utility Types: `Partial/Required/Pick/Omit/Record/Readonly/ReturnType/Parameters`
- [ ] **Day 37** — M39 TS with Node: project setup, `ts-node/tsx`, `@types/*`, typing request/response
- [ ] **Day 38** — M40 Rebuild SaaS in TS (part 1): typed models
- [ ] **Day 39** — M40 (part 2): typed CRUD APIs
- [ ] **Day 40** — M40 (part 3): typed validation + review

---

## Phase 5 — Production Backend Engineering (41 days)

> This is where you reach procIq level. Each module points at real repo files to study.

### M41 — Node Backend Foundations (3 days)
- [ ] **Day 41** — HTTP deep: methods, status codes, headers, REST design
- [ ] **Day 42** — Express: routing, middleware, request lifecycle
- [ ] **Day 43** — Config/env/secrets, layered architecture (controller→service→repository)

### M42 — Databases & SQL / PostgreSQL (5 days)
- [ ] **Day 44** — Relational model, tables, keys, relationships
- [ ] **Day 45** — SQL: SELECT/INSERT/UPDATE/DELETE/WHERE/ORDER BY
- [ ] **Day 46** — SQL: JOINs, GROUP BY, aggregates
- [ ] **Day 47** — Indexes, transactions & ACID, connection pooling
- [ ] **Day 48** — Postgres roles/privileges + **RLS** (policies, `current_setting`, fail-closed) — procIq core

### M43 — Prisma ORM (3 days)
- [ ] **Day 49** — Schema: models, relations, enums, `@map/@@unique/@@index`, migrations
- [ ] **Day 50** — Client queries, `select`, error codes, `$transaction`, raw SQL
- [ ] **Day 51** — `$extends` query hooks + **two-client RLS pattern** (tenant vs admin) — study `connection.service.ts`

### M44 — NestJS Framework (7 days — largest)
- [ ] **Day 52** — Why Nest, bootstrap, modules (global/dynamic `forRoot`)
- [ ] **Day 53** — Controllers + routing + **Dependency Injection** (providers, custom tokens, `@Inject`)
- [ ] **Day 54** — Decorators built-in + **custom** (`SetMetadata`, `createParamDecorator`), `reflect-metadata`, `Reflector`
- [ ] **Day 55** — DTOs + validation (`class-validator/transformer`, `ValidationPipe`), Pipes
- [ ] **Day 56** — **Guards** (`CanActivate`, `APP_GUARD`) + **Interceptors** (RxJS `Observable`, `APP_INTERCEPTOR`)
- [ ] **Day 57** — **Exception Filters** (`@Catch`, error envelope) + **Middleware** + lifecycle hooks
- [ ] **Day 58** — **WebSocket Gateways** + Swagger docs; study `apps/spine/src/users/` end-to-end
- [ ] **Day 58b (buffer)** — consolidate: build a full Nest module yourself

### M45 — Auth & Authorization (4 days)
- [ ] **Day 59** — Sessions vs tokens, JWT/OIDC structure, claims, RS256
- [ ] **Day 60** — JWKS (`jwks-rsa`), Passport strategy, httpOnly cookie auth
- [ ] **Day 61** — AWS Cognito, multi-pool, JIT user sync (Cognito→DB, Redis cache)
- [ ] **Day 62** — RBAC (`@Roles` + guard), role ceilings, SoD, tenant-trust — study `apps/spine/src/auth/` + `guards/`

### M46 — Async Architecture & Messaging (4 days)
- [ ] **Day 63** — **AsyncLocalStorage** + correlation IDs (per-request context powering RLS/logging)
- [ ] **Day 64** — Redis (cache/rate-limit) + AWS SQS (consumer, DLQ, poison messages)
- [ ] **Day 65** — Event-driven: `@nestjs/event-emitter`, event contracts, EventBridge; jobs/schedulers
- [ ] **Day 66** — WebSockets real-time (rooms, streaming) + Chain of Responsibility — study `jobs/`, `gateways/`

### M47 — Cloud & AWS + IaC (3 days)
- [ ] **Day 67** — AWS SDK v3, credential chain, LocalStack; SES/SQS/DynamoDB/Secrets
- [ ] **Day 68** — EventBridge/Step Functions; ECS deploy context (SIGTERM, trust proxy)
- [ ] **Day 69** — **AWS CDK** (CloudFront/Route53/ACM, `cdk synth/deploy`) — study `infra/aws/`

### M48 — Testing (3 days)
- [ ] **Day 70** — Jest basics: unit tests, assertions, matchers
- [ ] **Day 71** — Mocking dependencies, `@nestjs/testing`, `Test.createTestingModule`
- [ ] **Day 72** — e2e/integration, coverage — study `users.service.spec.ts`

### M49 — DevOps & Tooling (4 days)
- [ ] **Day 73** — Docker: images, containers, Dockerfile
- [ ] **Day 74** — docker-compose (multi-service), nginx reverse proxy + subdomain routing
- [ ] **Day 75** — Nx + pnpm workspaces + Makefile; husky hooks, ESLint/Prettier
- [ ] **Day 76** — Observability (Pino→Loki/Grafana, Sentry), contract codegen, env/secrets — study `docker-compose.yml`, `Makefile`

### M50 — Capstone: Build ProcIQ-Style (5 days)
- [ ] **Day 77** — Design a new resource (model + Prisma schema + migration + RLS policy)
- [ ] **Day 78** — NestJS module: controller + service + repository
- [ ] **Day 79** — DTOs + validation + JWT-guarded RBAC routes
- [ ] **Day 80** — Add a queue/job + WebSocket event + error handling
- [ ] **Day 81** — Unit tests + Dockerize + wire into the monorepo; compare against real `apps/spine`

---

## ✅ After Day 81
You can read every file in `apps/spine` and write new feature modules in the same style.
Remaining fluency (speed, architecture judgment) comes from actually contributing to procIq — which you'll now be equipped to do.

> Frontend (`apps/compass` — React) and AI (`apps/pico` — Python, which you already know) are separate tracks, not required to be a backend contributor.
