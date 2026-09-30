# SESSION HANDOFF — read this fully before continuing with Kishore

> Purpose: a new assistant session (possibly on a new laptop) must continue **identically** —
> same teaching style, same standards, same place in the journey. Nothing should feel different.
> Companion files: `javascript-roadmap.md` (curriculum), `learning_schedule.md` (day-by-day, ticked),
> `js_learning_notes.md` (per-module notes), `frontend-roadmap.md` (future FE track).
> Long-term memory also holds: `user-profile`, `js-learning-workflow`, `js-learning-goal`.

---

## 1. WHO — the learner

- **Name: Kishore** (email wheelsonai@gmail.com). Use "Kishore" in examples (not "Vicky").
- **Background:** knows **Python and C** well. Systems/logic thinker. New to JS/web.
- **Learning JavaScript from scratch → for BACKEND development.**
- **Mindset:** wants to *genuinely understand*, not skim. Asks "but why / how does X actually work" constantly — answer deeply, never hand-wave. He catches gaps and gotchas himself — respect that, and fix the roadmap when he finds a missing atom.
- Communicates in a hurry sometimes ("go", "done", "check") — that's normal; keep momentum.

## 2. GOAL — the north star

- **End goal: be able to READ and WRITE code like `D:\learning\procIq-app`** — a real production multi-tenant SaaS monorepo (his actual work project).
- **procIq stack:** Nx monorepo + pnpm. `apps/spine` = **NestJS (TypeScript)** backend (the target); `apps/pico` = Python/FastAPI (AI); `apps/compass` = React frontend; `libs/db` = **Prisma + PostgreSQL with Row-Level Security**; Docker/docker-compose/AWS (via LocalStack); Jest tests.
- After backend, he'll do the **frontend track** (`frontend-roadmap.md`, React+Angular+shadcn) → become **fullstack**.
- Every phase/module ties back to procIq — always connect lessons to it.

## 3. HOW WE TEACH — the workflow (NON-NEGOTIABLE rules)

These are in memory (`js-learning-workflow`) but repeated here — follow **exactly**:

1. **Teach, don't write his code.** I teach atomically (concept + real analogy + small syntax-showing example), then give tasks. I do NOT write task solutions.
2. **I create the empty folder + file(s) only, BEFORE the task.** He writes all code himself. Then he says "done check" and I **read + run** it and give feedback.
3. **NEVER edit his working code files** (no Edit/sed on task files) **unless he explicitly asks** ("you do it"). Point out file+line+fix in words; he changes it. I only freely edit: `*_reference.*` files, notes, roadmap, schedule.
4. **Always 3 tasks per concept module**, easy→tricky, edge-cases welcome, using ONLY already-learned concepts. (Phase 3 was projects = 1 big build each instead.)
5. **Tasks are STRICT format:** (1) plain-English what-to-build, (2) Input, (3) Expected Output. **NO hints** — never name the method/function/keyword to use, no code skeletons. He picks the approach.
6. **Before the full task, give a one-line "glance"** summary.
7. **Teach EVERY new term/keyword/acronym in depth BEFORE any task uses it** — JWT, hashing, REST, ORM, RBAC, DI, `as`, `!`, etc. He may know the concept but not the industry name. No unexplained term.
8. **Teaching code ≠ task code** — ALWAYS a fresh scenario for tasks; never reuse the demo I showed while teaching.
9. **WRITE NOTES for EVERY module** into `js_learning_notes.md` as it completes (Concept→Syntax→small example→gotchas→backend use). Core deliverable, never skipped.
10. **While teaching, always show small real syntax examples** — not theory alone.
11. Folder structure mirrors `python-basics/`: one folder per module, task files inside.
12. Go strictly module by module, **skip NO atom** even if tiny. When he finds a missing atom, add it to the roadmap + notes and teach it.

## 4. WHERE WE ARE — current position (update this as you go)

- ✅ **Phase 1 — Fundamentals (Modules 1–12):** DONE.
- ✅ **Phase 2 — Intermediate JS (Modules 13–30):** DONE. (scope/closures, execution/hoisting, `this`, DOM/events, Promises, async/await, classes, error handling, modules, collections, JSON, event loop, Node basics, npm, debugging, best practices)
- ✅ **Phase 3 — Backend Projects (8 projects):** DONE. Student, Employee, Inventory, Expense, Library, Auth+JWT, **REST API**, **multi-tenant SaaS backend** (Projects in `phase3_projects/`).
- ⏳ **Phase 4 — TypeScript (Modules 31–40):** IN PROGRESS in `phase4_typescript/`.
  - Done: 31 (Why TS), 32 (Basic Types), **32b (Assertions: `as`/`!`/`as const`/`satisfies` — added late as a found-gap atom)**, 33 (Interfaces/Types), 34 (Functions), 35 (Union/Literal/Enum), 36 (Generics a/b/c + keyof), 37 (Classes in TS).
  - ✅ **Module 38 (Utility Types) DONE** — Partial/Pick/Omit/Record/Readonly + DTO composition, all verified with output.
  - ✅ **Module 32b (Assertions) DONE** — taught + practiced step-by-step (`!`, `as const`, `as`+validate untrusted data incl. WHY `Partial<T>` not full `T` when asserting unverified JSON; `satisfies`). Notes written.
  - ✅ **Module 39 (TS with Node) DONE** — `tsx` direct execution (replaced tsc+node two-step), `@types/express`/`@types/node`, typed Express `Request`/`Response`/body, in `39_ts_with_node/` (its own package.json + express installed there).
  - ✅ **Module 40 (Rebuild the SaaS Backend in TS) DONE** — all 3 parts in `40_saas_backend_ts/`: typed models (FK-style `Tenant`/`Org`/`User`, `as const`+indexed-access `Role`), a generic `abstract class Store<T extends {id:string}>` CRUD engine with `TenantStore`/`OrgStore`/`UserStore` extending it (constructor-injected DI, `override create()` + `super.create()` for parent-existence checks), and typed `unknown`-input validation (`parseTenantInput`/`parseOrgInput`/`parseUserInput` → `ValidationError`). This was the last module of Phase 4 — **Phase 4 TypeScript is now fully complete.**
  - **Design Patterns no longer sits here** — moved (see below).
- ⏳ **Phase 5 — Production (Modules 41–50):** Node/Express, PostgreSQL+RLS, Prisma, NestJS, Auth/Cognito, messaging/Redis/SQS, AWS/CDK, Testing/Jest, DevOps/Docker/Nx, Capstone. IN PROGRESS in `phase5_production/`.
  - ✅ **Module 41 (Node.js Backend Foundations) DONE** — all 3 days in `41_node_backend/`: raw-`http` deep dive (401/403 precision, `PUT`/`POST` idempotency proved directly, content negotiation via `Accept`, `fetch` as the client-side counterpart to everything built so far — `http_task1-3.ts`); Express rebuild of the same three (routing, `express.json()`, middleware incl. `next()`/route-scoped vs global — `express_task1-3.ts`); env config (`dotenv`, fail-fast `requireEnv`) + naming the controller→service→repository split you'd already half-built in Module 40 (`layered_task1-3.ts`). Notes written.
  - ✅ **Module 42 (Databases & SQL Fundamentals, entry level) DONE** — all 3 days (44-46), conversational/query-writing only, no task files (no real DB wired up yet): relational model + keys + relationship types (self-check on his own Module 40 `Tenant`/`Org`/`User` all correct first try); core CRUD SQL (caught his own real mistakes: `WHERE` inside `INSERT`, double- vs single-quoting in Postgres, `SELECT` missing columns, `AND` vs `OR`/`IN` on the same column); `JOIN`+`GROUP BY`+aggregates+indexes (caught wrong clause order, undefined table alias; confirmed his Postgres-specific GROUP-BY-on-primary-key instinct was accurate). Notes written. Offered to spin up a personal practice Postgres (separate from `purveo-app`) for a real run-it-yourself loop — he chose to keep this stretch conceptual and wait for Module 43's real DB setup instead.
  - ✅ **Module 42.5 (PostgreSQL Production Features, procIq-level) DONE** — both days (47-48), conversational only (still no real DB): transactions/ACID/isolation levels (his own UPI-transfer real-life example, corrected precisely on why "no transaction" means the debit auto-commits alone rather than "rollback fails"; dirty/non-repeatable/phantom read real-life examples all landed); roles/privileges + RLS (`CREATE POLICY`/`current_setting`/fail-closed — his own real-life "tenant X sees Y/Z/A/B's confidential data" fail-open consequence was correct and unprompted). Notes written.
  - ✅ **Module 43 (Prisma ORM) DONE** — first module with a REAL database (personal practice Postgres, Docker container `learning-postgres` port 5434, fully separate from `purveo-app`'s own containers on 5432/5433). All 3 days in `phase5_production/43_prisma/`: schema/models/relations/enums/migrations (Day 1, real SQL migrations applied); Prisma Client CRUD/`select`/`include`/error codes/`$transaction`/raw SQL (Day 2, real rows, real rollback proven); `$extends` + real RLS (Day 3 — root-caused a real bug: superusers bypass RLS unconditionally, created a proper non-superuser role; caught that the originally-taught `$extends` query-hook recipe doesn't actually share a connection with `$transaction`'s `tx`, corrected to an explicit `withTenant(tenantId, tx => ...)` helper, verified empirically; proved real tenant isolation AND real fail-closed for the first time, not just reasoned through in words). Notes written — see `js_learning_notes.md` for the full debugging journey, worth reading if picking this up mid-Phase-5.
  - **CURRENT / NEXT: Module 44 — NestJS Framework** — the largest module in Phase 5, see day-split in `learning_schedule.md`.
- ⬜ **Design Patterns — MOVED (2026-08-27, on his request):** no longer Phase 4.5 here. Now the **final phase (Module 59) of `frontend-roadmap.md`**, done after the whole frontend track, so Factory/Singleton/Strategy/Repository/DI/Chain-of-Responsibility/Observer/Adapter/Facade/Decorator each get a **Spine (backend) AND a Compass (frontend) example side by side**, instead of backend-only months before React. Don't teach this after Phase 4 anymore — wait until the frontend roadmap is otherwise done.

**Pace:** ~1 module per 2-hour "day" (flexes by size; big ones span days). He often goes faster. Timeline ~4 months to procIq-ready. He tracks days in `learning_schedule.md` (ticked `[x]`).

## 5. HOW WE RUN THINGS — environment quirks (IMPORTANT)

- **OS:** Windows 11. Working dir: `d:\learning`, learning content in `d:\learning\javascript`.
- ⚠️ **Git Bash (the Bash tool) PATH is currently BROKEN** — `git`, `mkdir`, `touch`, `grep` etc. often "command not found". **Use the PowerShell tool** for file ops, git, running node/tsc. (A fresh shell may fix Bash; if it works, fine.)
- **Node v24 installed.** `node file.js` to run JS.
- **TypeScript:** installed per-folder (`npm i -D typescript`). Compile with `npx tsc`. Each Phase-4 folder has its own `tsconfig.json` (copied forward) with `outDir:"./dist"`, `declaration:false`, `strict:true` — so `.ts` compiles to `dist/*.js`; run `node dist/<file>.js`. **Keep this setup** (avoids the `.d.ts` clutter he disliked).
- **Servers (Phase 3):** run in one terminal, test with **`curl.exe`** (NOT PowerShell's `curl` alias, which is `Invoke-WebRequest` and throws on non-200) or Thunder Client. Always **Ctrl+C to stop** before restarting (else `EADDRINUSE`). **Restart the server after code changes** — a running server holds old code (he hit this hard).
- ⚠️ **WSL/Ubuntu on same laptop** may hold ports (e.g. 3000) → `EADDRINUSE` even when Windows shows nothing. Use a different port or `wsl --shutdown`. **Do NOT touch WSL.**
- ⚠️ **Encoding:** do NOT use PowerShell `Set-Content` on the `.md` files — it corrupts UTF-8 em-dashes (`—`→mojibake). **Use the Edit tool** for markdown, or `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))`.
- **Git:** `.gitignore` exists (ignores node_modules/dist/.env). node_modules was accidentally committed once and cleaned — keep it out. Commit only when he asks; branch off main first if needed.
- **C: drive was very low** (~800MB); cleaned temp/npm-cache/recycle-bin. A pending Windows update (~8.5GB staged) — he may restart to install it.

## 6. RECURRING LESSONS he's earned (reference these; they connect modules)

- **Reference vs value** — objects/arrays copy by reference (stack holds address, heap holds object). `[...a]`/`{...a}`/`structuredClone` to copy. Shallow copy shares nested objects.
- **`==` vs `===`** — always `===`. **`??` vs `||`** — `??` for defaults when `0`/`""` are valid.
- **Accidental globals** — his #1 recurring slip: `x = 5` without `const`/`let`. Throws in ES modules. Always keyword-declare. (Improving, but watch for it, incl. disguised forms like `run(add = () => ...)`.)
- **`slice` vs `splice`**, **`sort` needs `(a,b)=>a-b`**, **switch fall-through needs `break`**, **hoisting/TDZ**.
- **Strings immutable** — methods return new strings; capture the return.
- **Don't reshape data you don't need to** — he over-engineered dates (dayjs/new Date) when `"2026-07-01".slice(0,7)` sufficed. ISO date strings sort + slice for free.
- **Negative index:** `arr[-1]` is `undefined` in JS (Python habit!). Use `arr.at(-1)` / `.slice(-1)`.
- **Server:** one request = one response (double-write → `ERR_HTTP_HEADERS_SENT` crash); `return` after a matched route; 404 fallback mandatory.
- **Error status mapping:** ValidationError→400, NotFound→404, Duplicate→409 (he built this by hand in Project 8).
- **Encapsulation:** private `#` state, never `return` the internal Map, report methods pure.
- **"Handled the special case, forgot the normal one"** — a recurring bug class (read-with-side-effect `+=`, on-time-return not resetting, etc.). Always test success AND failure paths.
- **TS gotcha — excess property checking:** inline object literal checked strictly (extra props error); same object via a variable is lenient (structural). He found this himself.
- **`as`/`!` are "trust me" (no runtime check) — validate after for untrusted data.**

## 7. HOW TO PICK UP RIGHT NOW (next action)

1. **Module 44 — NestJS Framework** next — Module 43 (Prisma, first real database) is fully done. Environment note: a personal practice Postgres is already running (`docker ps` → `learning-postgres`, port 5434) plus a non-superuser role `learning_app` inside it (password `learning_app_pw`) — reuse this for Module 44 rather than provisioning another one. Design Patterns is no longer scheduled here at all — it moved to the very end of `frontend-roadmap.md` (Module 59), done together with frontend pattern examples after the whole frontend track.
2. Keep the rhythm: teach atomically w/ syntax examples → create empty files → 3 no-hint tasks (Input/Output) → he writes → "done check" → I read+run+feedback → append notes → tick schedule.
3. **caveman mode** is active in his terminal (a plugin) — responses come out terse/fragment-style; code stays normal. Not something you control; just be aware his hook compresses tone.
4. Note: if a module gets rushed/skipped-feeling, he may ask to redo it **step-by-step, one atom at a time** (concept→tiny example→his one-piece task→check→next atom) instead of all-3-tasks-at-once. Honor that pacing when asked.

## 8. THE FILES (all in `d:\learning\javascript\`)

- `javascript-roadmap.md` — full curriculum, Phases 1–5, every module's atoms. (Design Patterns/Phase 4.5 moved out — see `frontend-roadmap.md`.)
- `learning_schedule.md` — day-by-day plan, `[x]` ticked through Day 40.
- `js_learning_notes.md` — per-module notes (Modules 1–40 written; **keep appending 41+**).
- `frontend-roadmap.md` — future FE track (start after backend); its final phase (Module 59) is Design Patterns, covering both backend and frontend examples together.
- `01_Introduction/` … `28_NPM/`, `phase3_projects/`, `phase4_typescript/` — his task files by module.
- `D:\learning\procIq-app` — the cloned target project to study/reference.

> **Bottom line for new-you:** Kishore is a sharp, deeply-curious backend learner (knows Python/C) building toward reading & writing procIq's NestJS/TS/Prisma backend. Teach atomically with real examples, never write his code (unless asked), 3 no-hint Input/Output tasks per module, explain every new term, write notes every module, connect everything to procIq. He's mid-Phase-4 (TypeScript), on Module 38, with the small pending items in §7. Keep it seamless.
