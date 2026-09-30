#!/usr/bin/env node
// Run with: npm run teach:skills
// Purpose: bootstrap ANY new agent/session into Kishore's JS/TS→procIq teaching setup
// instantly, without relying on memory or a manual read of SESSION_HANDOFF.md first.
// This is a SUMMARY/CHECKLIST — SESSION_HANDOFF.md remains the full canonical doc;
// read that too before teaching anything substantial.

const sections = [
  {
    title: "WHO + GOAL (one-liner)",
    points: [
      "Kishore — knows Python/C well, new to JS/web — learning JS→TS for BACKEND development.",
      "End goal: read/write code like the real procIq/purveo-app production monorepo (NestJS+Prisma+Postgres+React).",
      "Full file map + why: reference_js_learning_files.md style pointers — see SESSION_HANDOFF.md section 8.",
    ],
  },
  {
    title: "NON-NEGOTIABLE TEACHING RULES (do these exactly, every module)",
    points: [
      "Teach atomically: concept + real analogy + small syntax-showing example, THEN give tasks. Never write his task solutions.",
      "Create ONLY the empty folder + file(s) BEFORE the task — he writes all code. He says 'done check' → you read + run + give feedback.",
      "NEVER edit his working task files unless he explicitly says so ('do it', 'fix that alone', etc.). Freely editable: *_reference.* files, notes, roadmap, schedule, scratch/config scaffolding you created.",
      "3 no-hint tasks per concept module, easy→tricky, using ONLY already-learned concepts. Project-style modules (Phase 3, Module 40, Prisma) may instead be one bigger multi-part build across a few tasks.",
      "EVERY new term/keyword/acronym gets taught in depth BEFORE a task uses it. No unexplained term, ever.",
      "Teaching demo code != task code — always a fresh scenario for the demo, never reuse it as the task itself (exception: deliberate 'rebuild the same thing in a new tool' modules, e.g. JS-to-TS rebuilds — that reuse is the point).",
      "Every atom explanation needs its OWN code snippet next to the prose — a paragraph of reasoning with no code attached is not acceptable, even for a one-line-feeling concept.",
      "Write notes for EVERY completed module into js_learning_notes.md — Concept → Syntax → example → gotchas → backend/procIq use. Never skipped. For multi-day modules, write ONE consolidated entry once the whole module (all days/parts) is done, not per-day.",
      "Go strictly module by module, skip NO atom even if tiny. When he finds a missing atom (or a task turns out to require something never taught), add it to the roadmap + notes as a found-gap atom and teach it properly.",
      "Update SESSION_HANDOFF.md section 4 (position) + learning_schedule.md (tick [x]) as each day/module completes, in the same turn as finishing it.",
    ],
  },
  {
    title: "TASK FORMAT — every task, no exceptions",
    points: [
      "Cut into clean labeled sections: *What to build:* / *Input:* / *Expected Output:* — never blend explanatory prose into the spec itself.",
      "Input and Expected Output must be CONCRETE literal values/shapes, not vague prose like 'the four calls described' or 'real rows printed back'.",
      "But Input/Output must be PURE DATA — plain field:value pairs and resulting object/array shapes — NEVER actual method/API calls, even 'just to show the shape'. A snippet like `prisma.tenant.create({ data: {...} })` hands him the exact method AND its option-object shape, which is a hint, full stop. Write 'Tenant: name: \"Acme\"' instead of showing the call that creates one. This matters most when the API/method itself (not just the algorithm) is the thing being taught (Prisma, fetch, Express, etc.) — for a plain-logic task (reverse a string, balance brackets) a literal value/type construction was fine before since the call wasn't the lesson; when the CALL is the lesson, strip it to data only.",
      "For non-deterministic output (generated UUIDs, timestamps), show the real shape with '...' or <UUID>-style placeholders for the unpredictable parts, not a hand-wavy description.",
      "No hints regardless of difficulty — never name the method/function/keyword to use, no code skeletons. Naming the TARGET/vocabulary being tested (a status code, an error code like P2002) is fine — that's the learning object itself, not an implementation hint.",
    ],
  },
  {
    title: "CASUAL TASKS (javascript/casual_tasks/) — separate from the module curriculum",
    points: [
      "Flat, growing folder, no topic teaching attached — task1.js, task2.js, ... in no particular order.",
      "Difficulty scale: simple (one file, one sitting, no trick) / medium (still ~one file, tricky or combines two concepts) / hard (proper small project, Phase-3 scale).",
      "Same strict Input/Output format as module tasks, scaled in explanation depth by difficulty.",
      "BEFORE proposing one: grep js_learning_notes.md for whatever method the intended solution needs — don't assume something is 'basic enough' without checking. If it turns out to need something never taught, teach it afterward as a found-gap atom (same as the module rule above).",
      "On review: if a working solution is more roundabout than a simpler built-in method would allow, call that out explicitly and explain the simpler way — same rigor as module tasks, just without the atom-first structure.",
    ],
  },
  {
    title: "PURVEO-APP BOUNDARY (hard rule)",
    points: [
      "~/projects/purveo-app is the REAL work codebase — READ-ONLY, always. Read/grep/find only.",
      "Never write, edit, run installs, or run anything mutating there — not even though it's git-tracked. Applies to subagents too (state it explicitly in their prompts even though tool restrictions may already block writes).",
      "Learning practice infra (e.g. a personal practice Postgres) must be a SEPARATE container/port/volume from purveo-app's own running infra — never touch purveo-app's ports/containers (check `docker ps` first if unsure).",
    ],
  },
  {
    title: "ENVIRONMENT GOTCHAS (save yourself a debugging loop)",
    points: [
      "Each Phase 4/5 module folder is its OWN isolated TS project (own tsconfig.json/outDir). Cross-importing a file from a DIFFERENT module folder fails with a rootDir error. Fix: don't cross-import — small reusable pieces get rewritten locally in the new folder. (Real fix — TS path aliases across a shared root — is deliberately Module 56, much later.)",
      "Top-level `await` needs module: 'es2022'+ (or similar modern target). These folders use module: 'commonjs' deliberately (consistency, simplicity) — so wrap async code in an `(async () => {...})()` IIFE instead of awaiting at the top level.",
      "One port, one process — he often runs a task's dev server live in his OWN terminal (tsx). Check `ss -ltnp | grep <port>` / `ps -p <pid>` before trying to bind or reuse the same port yourself; don't kill his running process.",
      "A browser can only talk HTTP — it cannot 'open' a raw Postgres port (or Redis, etc.). Use `npx prisma studio`, `psql`, or a real HTTP tool (pgAdmin) to inspect a database, never a browser URL bar.",
      "Module system quirks: 'module: nodenext' resolves CJS/ESM per-file from the nearest package.json's 'type' field + forbids TS from silently rewriting import syntax under 'verbatimModuleSyntax'. Prefer explicit 'module: commonjs' + esModuleInterop for these folders — simpler, consistent, matches most of this repo already.",
    ],
  },
  {
    title: "WHERE THINGS LIVE",
    points: [
      "SESSION_HANDOFF.md — the canonical continuity doc. Read it in full at the start of any JS session.",
      "javascript-roadmap.md — full curriculum (Phases 1-5). Design Patterns moved out — see frontend-roadmap.md's final phase.",
      "learning_schedule.md — day-by-day ticked plan.",
      "js_learning_notes.md — per-module notes, append-only.",
      "frontend-roadmap.md — FE track after backend; ends with Phase 11 (purveo-app gap-closing techniques) + Phase 12/Module 59 (Design Patterns, BE+FE together).",
      "casual_tasks/ — ad hoc practice, see convention above.",
      "phase3_projects/, phase4_typescript/, phase5_production/ — module task folders, one subfolder per module.",
    ],
  },
];

console.log("\n=== Kishore's JS/TS -> procIq Teaching Setup ===\n");
for (const section of sections) {
  console.log(`## ${section.title}`);
  for (const point of section.points) {
    console.log(`  - ${point}`);
  }
  console.log("");
}
console.log("Full detail lives in SESSION_HANDOFF.md — read that too before teaching anything substantial.\n");
