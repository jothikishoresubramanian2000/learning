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
  - ✅ **Module 32b (Assertions) DONE** — taught + practiced step-by-step (`!`, `as const`, `as`+validate untrusted data incl. WHY `Partial<T>` not full `T` when asserting unverified JSON). Notes written.
  - **CURRENT / NEXT:** Module 39 — TypeScript with Node (ts-node/tsx, `@types/*`, typing Express request/response). Then Module 40 (Rebuild SaaS backend in TS, 3 days).
- ⬜ **Phase 4.5 — Design Patterns (Modules 40.5):** added on his request, after TS. Factory/Singleton/Strategy/Repository/DI/Chain-of-Responsibility/Observer/Adapter/Facade/Decorator — each mapped to a real procIq file.
- ⬜ **Phase 5 — Production (Modules 41–50):** Node/Express, PostgreSQL+RLS, Prisma, NestJS, Auth/Cognito, messaging/Redis/SQS, AWS/CDK, Testing/Jest, DevOps/Docker/Nx, Capstone.

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

1. **Module 39 — TypeScript with Node** next (set up `tsx`/`ts-node` to run `.ts` directly, `@types/*`, typing an Express-style request/response). Then Module 40 (rebuild the SaaS backend, typed, 3 days).
2. Keep the rhythm: teach atomically w/ syntax examples → create empty files → 3 no-hint tasks (Input/Output) → he writes → "done check" → I read+run+feedback → append notes → tick schedule.
3. **caveman mode** is active in his terminal (a plugin) — responses come out terse/fragment-style; code stays normal. Not something you control; just be aware his hook compresses tone.
4. Note: if a module gets rushed/skipped-feeling, he may ask to redo it **step-by-step, one atom at a time** (concept→tiny example→his one-piece task→check→next atom) instead of all-3-tasks-at-once. Honor that pacing when asked.

## 8. THE FILES (all in `d:\learning\javascript\`)

- `javascript-roadmap.md` — full curriculum, Phases 1–5 + 4.5, every module's atoms.
- `learning_schedule.md` — day-by-day plan, `[x]` ticked through Day 35.
- `js_learning_notes.md` — per-module notes (Modules 1–37 written; **keep appending 38+**).
- `frontend-roadmap.md` — future FE track (start after backend).
- `01_Introduction/` … `28_NPM/`, `phase3_projects/`, `phase4_typescript/` — his task files by module.
- `D:\learning\procIq-app` — the cloned target project to study/reference.

> **Bottom line for new-you:** Kishore is a sharp, deeply-curious backend learner (knows Python/C) building toward reading & writing procIq's NestJS/TS/Prisma backend. Teach atomically with real examples, never write his code (unless asked), 3 no-hint Input/Output tasks per module, explain every new term, write notes every module, connect everything to procIq. He's mid-Phase-4 (TypeScript), on Module 38, with the small pending items in §7. Keep it seamless.
