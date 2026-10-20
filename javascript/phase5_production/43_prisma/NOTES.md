# Module 43 — Prisma ORM — Extended Notes

This is the first module with an actual, persistent database behind it: a personal
practice Postgres running in Docker (container `learning-postgres`, port **5434** —
deliberately separate from `purveo-app`'s own containers on 5432/5433, never touched).
Prisma was pinned to **v5** on purpose — `npm install prisma` alone grabs the newest
major (v7 at the time of writing), which restructures configuration into a separate
`prisma.config.ts` file instead of the classic all-in-`schema.prisma` setup this course
and procIq's own codebase both assume. `package.json` in this folder shows the pin
directly: `"@prisma/client": "^5.22.0"`, `"prisma": "^5.22.0"`.

Three days, each building directly on the last: Day 1 is the schema (the declarative
description of the database) and the real migration SQL Prisma generates from it; Day 2
is using Prisma Client to actually read/write rows, inside transactions, including
dropping down to raw SQL; Day 3 is wiring real Postgres Row-Level Security into Prisma —
by far the most important and most debugged part of the whole module.

---

## Day 1 — Schema: models, relations, enums, migrations

### What I learned today

A Prisma **schema** (`prisma/schema.prisma`) is a single file that describes every
table, every column, every relationship, and every constraint *declaratively* — you
write down the shape you want, and Prisma's migration engine figures out the actual SQL
needed to make the real database match it. This directly replaces hand-writing
`CREATE TABLE`/`ALTER TABLE` statements from Module 42, the same way `enum` here
directly replaces the `as const`-array-plus-derived-type pattern from Module 40.

### File: `prisma/schema.prisma` — field by field

```prisma
generator client {
  provider = "prisma-client-js"
}
```
This block tells Prisma *what to generate* from this schema — in this case, a
fully-typed JavaScript/TypeScript client library (`@prisma/client`). Running
`npx prisma generate` reads this whole file and produces real TypeScript types and
query methods matching every model below — this is how `prisma.org.findMany(...)` later
gets full autocomplete and compile-time type checking, generated code, not hand-written.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
This block says *which real database* this schema targets and *where to find it*.
`provider = "postgresql"` picks Postgres's particular SQL dialect/features.
`url = env("DATABASE_URL")` means the actual connection string is never hardcoded in
this file — it's read from an environment variable, loaded from `.env`
(`DATABASE_URL="postgresql://postgres:learning@localhost:5434/learning_db?schema=public"`).
Same "secrets live in env vars, not source code" lesson as Module 41's Day 3.

```prisma
enum Role {
  ADMIN
  MEMBER
  VIEWER
}
```
An `enum` declares a fixed, closed set of allowed values for a field. This single
declaration gives you **two things at once**: a real Postgres `ENUM` type enforced by
the database itself (a row literally cannot be inserted with a `role` outside these
three values — the constraint lives in the database, not just in application code), and
a generated TypeScript union type (`"ADMIN" | "MEMBER" | "VIEWER"`) for compile-time
checking on the client side. This is strictly more than the `as const` array + derived
`typeof` union pattern from Module 40 managed on its own, because that pattern only ever
checked things in TypeScript — nothing stopped a bad value from reaching the database
itself.

```prisma
model Tenant {
  id   String @id @default(uuid())
  name String

  Org Org[]
}
```
A `model` block describes one table. `id String` declares a column named `id` of type
`String` (maps to Postgres `TEXT`). `@id` is a **field attribute** marking this column
as the table's **primary key** — the unique identifier for every row, same concept as
Module 42's "primary key," just declared here instead of written as raw SQL.
`@default(uuid())` tells Prisma to auto-generate a random UUID for this field whenever a
new row is created and no value is explicitly provided — no application code has to
remember to generate an ID itself. `name String` is a plain required text column, no
attributes. `Org Org[]` is **not a real column at all** — it's a *relation field*, pure
TypeScript-side convenience letting you write `tenant.Org` in code to navigate to every
`Org` row that points back at this tenant; it generates no actual column in the SQL
table, which the migration file below proves directly.

```prisma
model Org {
  id   String @id @default(uuid())
  name String

  tenantId String @map("tenant_id")
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  User User[]

  @@unique([tenantId, name])
  @@index([tenantId])
}
```
`id`/`name` — same pattern as `Tenant` above. `tenantId String @map("tenant_id")` is the
real **foreign key column** (same concept as Module 42's FK, `Org.tenantId` pointing at
`Tenant.id`) — but notice `@map("tenant_id")`: this renames the *actual underlying SQL
column* to `tenant_id` (snake_case, a common SQL convention) while keeping the
TypeScript-facing field named `tenantId` (camelCase, the normal JS convention). The two
names can differ on purpose; `@map` is purely a renaming attribute, it changes nothing
about behavior. `tenant Tenant @relation(fields: [tenantId], references: [id])` is the
line that actually *creates* the foreign key relationship: `@relation(...)` tells Prisma
"the `tenantId` field on *this* model points at the `id` field on `Tenant`," and the
migration engine turns this into a real SQL `FOREIGN KEY` constraint. This `tenant`
field itself is, like `Tenant.Org` above, a relation field with no real column of its
own — the only *real* column here is `tenantId`. `User User[]` — same reverse-relation,
TS-only convenience, no column, letting you write `org.User` later. `@@unique([tenantId,
name])` is a **model-level attribute** (double-`@` instead of single-`@`, because it
spans more than one field) declaring that the *combination* of `tenantId` and `name`
must be unique together — two different tenants can both have an org named "Sales," but
one tenant can't have two. `@@index([tenantId])` creates a real database index on the
`tenantId` column — recap of Module 42's point that foreign keys are **not**
auto-indexed in Postgres, so this has to be added deliberately for lookups filtering by
tenant to stay fast.

```prisma
model User {
  id    String @id @default(uuid())
  name  String
  orgId String

  role Role // this automatically give the runtime check and TS compile time type check which replaces as const and derived type role

  org Org @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@map("users")
}
```
Same `id`/`@id`/`@default(uuid())` pattern a third time. `orgId String` — the foreign
key column pointing at `Org`, this time *without* a `@map`, so the real SQL column stays
named `orgId` exactly as written (the inconsistency with `Org.tenantId`'s `@map`'d
`tenant_id` is visible directly in the generated migration SQL below — one FK column is
snake_case, the other stays camelCase, since `@map` is applied per-field, not globally).
`role Role` — a field typed as the custom `Role` enum declared above, giving this one
line both the real Postgres enum constraint and the generated TS union type, as the
comment in the file itself notes. `org Org @relation(...)` — same relation pattern as
`Org`→`Tenant`, this time singular (`org`, not `orgs`) because each user belongs to
exactly one org — matching the actual one-to-many direction correctly (a relation field
name doesn't change behavior, but naming a single-object relation with a plural name
like `orgs` would mislead a future reader into expecting an array and calling `.map()`
on it, crashing at runtime; this was caught and fixed for exactly that reason, and
renaming a relation field needs no new migration at all since it isn't a real column —
just `prisma generate` to regenerate the types). `@@index([orgId])` — same FK-indexing
reasoning as `Org`. `@@map("users")` — a **model-level** map, renaming the entire table
from the model's name (`User`) to a different real table name (`users`, lowercase
plural) — same renaming idea as field-level `@map`, just applied to the whole table
instead of one column.

### The generated migration: `prisma/migrations/20260928054234_init/migration.sql`

Running `npx prisma migrate dev --name init` diffed the schema above against the
(empty) real database and generated this actual SQL file — openable, readable, and
genuinely what gets executed against Postgres. Walking through it line by line,
connecting every piece back to the schema syntax above:

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');
```
Directly from `enum Role { ADMIN MEMBER VIEWER }` — a real Postgres custom type, with
exactly the three values listed, in the same order.

```sql
-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
```
From `model Tenant`. `String` became SQL `TEXT`. Every field is `NOT NULL` by default
(Prisma fields are required unless marked optional with a `?`, which none here are).
`@id` became a named `PRIMARY KEY` constraint (`Tenant_pkey`, an auto-generated name).
Notice `Org Org[]` produced **no column at all** here — exactly as expected, since it's
a relation field, not a real one.

```sql
-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);
```
From `model Org`. Note the actual column is `"tenant_id"` (snake_case) — direct proof
that `@map("tenant_id")` really did rename the physical column, while every Prisma
Client call still uses `tenantId` in TypeScript. `tenant Tenant @relation(...)` produced
no column here either (the FK *constraint* comes later, below) — only `tenantId`'s own
`@map`'d column shows up in `CREATE TABLE` itself.

```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
```
From `model User`. The table itself is named `"users"` (lowercase) — direct proof
`@@map("users")` renamed the whole table, even though the schema calls the model
`User`. `"orgId"` stayed camelCase here (no `@map` was applied to this particular
field) — visibly inconsistent with `Org`'s `tenant_id`, which is exactly what reading
real generated SQL side by side with the schema makes obvious. `"role" "Role"` — the
column is named `role`, typed as the custom `"Role"` enum type created in the very
first statement above.

```sql
-- CreateIndex
CREATE INDEX "Org_tenant_id_idx" ON "Org"("tenant_id");
```
Directly from `@@index([tenantId])` on `Org` — note the generated index name,
`Org_tenant_id_idx`, uses the **mapped** column name (`tenant_id`), not the schema field
name (`tenantId`), since by this point Prisma is talking about the real physical
column.

```sql
-- CreateIndex
CREATE UNIQUE INDEX "Org_tenant_id_name_key" ON "Org"("tenant_id", "name");
```
Directly from `@@unique([tenantId, name])` — a composite unique index across both
columns together, enforcing that no two rows can share the same `(tenant_id, name)`
pair, while the same `name` can repeat freely across different tenants.

```sql
-- CreateIndex
CREATE INDEX "users_orgId_idx" ON "users"("orgId");
```
Directly from `@@index([orgId])` on `User` — same FK-indexing idea as `Org`'s, on the
`users` table this time, using the un-mapped `orgId` column name.

```sql
-- AddForeignKey
ALTER TABLE "Org" ADD CONSTRAINT "Org_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```
This is where `tenant Tenant @relation(fields: [tenantId], references: [id])` actually
becomes a real constraint: `"Org"."tenant_id"` must always reference a real, existing
row in `"Tenant"."id"`. `ON DELETE RESTRICT` means Postgres will *refuse* to delete a
`Tenant` row while any `Org` still points at it (preventing orphaned orgs). `ON UPDATE
CASCADE` means if a `Tenant`'s `id` ever changed, every `Org` pointing at it would
automatically update to match (Prisma's default behavior when a relation doesn't
specify otherwise).

```sql
-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```
Same idea for `org Org @relation(fields: [orgId], references: [id])` on `User` — a real
foreign key from `users.orgId` to `Org.id`, same `RESTRICT`/`CASCADE` defaults.

**The overall shape to take away:** every single line in this migration file traces
back to one specific piece of schema syntax above — nothing in the generated SQL is
magic or hidden; `prisma migrate dev` is a diffing + SQL-generation tool, not a black
box, and the file it writes is exactly as readable and auditable as SQL written by hand
in Module 42.

---

## Day 2 — Prisma Client: CRUD, transactions, raw SQL

### What I learned today

Three files, each demonstrating a different slice of Prisma Client's actual query API
against the real database: `crud_task2.ts` proves Prisma's typed error codes replace
hand-rolled error classes like `DuplicateIdError`/`NotFoundError` from Module 40;
`crud_task3.ts` proves `$transaction` gives genuine all-or-nothing atomicity, stronger
than expected; and dropping to `$queryRaw` for a query Prisma's own query builder
doesn't conveniently express. The other big lesson of the day had nothing to do with
code at all: a *real* database persists data across every run, forever — unlike
Module 40's in-memory `Map`-based `Store<T>`, which reset itself on every restart.
Confusing, seemingly-buggy accumulating duplicate rows across repeated script runs
during this module turned out to be nothing but Durability (the "D" in ACID from Module
42.5) working exactly as designed — the fix wasn't a code change, it was running
`TRUNCATE` to get back to a clean slate before testing again.

### File: `crud_task2.ts` — line by line

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();
```
`PrismaClient` is the generated class from Day 1's `generator client` block —
instantiating it (`new PrismaClient()`) creates the actual connection-managing client,
reading `DATABASE_URL` from the environment automatically (no explicit URL needed here,
unlike `crud_task1.ts` below). `PrismaClientKnownRequestError` is a specific error class
Prisma throws for *known*, structured database error situations (as opposed to a
generic crash) — each instance carries a `.code` property identifying exactly what went
wrong.

```ts
async function main() {

    const tenant = await prisma.tenant.create({ data: { name: "Globex" } });
    const org = await prisma.org.create({data: {name: "Sales",tenantId: tenant.id}})
```
`prisma.tenant.create({ data: {...} })` is Prisma's typed equivalent of Module 42's raw
`INSERT INTO "Tenant" (...) VALUES (...)` — this is literally the `Store.create` pattern
from Module 40, just backed by a real table now. The returned `tenant` object includes
the auto-generated `id` (from `@default(uuid())`), used immediately below to satisfy
`Org`'s required `tenantId` foreign key.

```ts
    try{
        
        const org1 = await prisma.org.create({data: {name: "Sales",tenantId: tenant.id}})
    }
    catch(err){
        if(err instanceof PrismaClientKnownRequestError){

            console.log(err.code)
        }
    }
```
Deliberately creating a **second** org named `"Sales"` under the exact same tenant —
this is designed to violate the `@@unique([tenantId, name])` constraint from Day 1's
schema. Prisma throws a `PrismaClientKnownRequestError` for this, and checking
`err instanceof PrismaClientKnownRequestError` narrows the type so `err.code` is
accessible — this prints **`P2002`**, Prisma's code for a unique-constraint violation,
directly tied to the `@@unique` declared in the schema. This replaces hand-writing a
`DuplicateIdError` class and checking for it, as Module 40 had to.

```ts
    try{
        
        const org2 = await prisma.org.update({where:{id:"does not exit"},data:{name:"Acme"}})
    }
    catch(err){
        if(err instanceof PrismaClientKnownRequestError){

            console.log(err.code)
        }
    }
}

main();
```
Deliberately trying to update an `Org` row by an `id` that doesn't exist in the table —
this prints **`P2025`**, Prisma's code for "record not found," directly replacing a
hand-written `NotFoundError` class. Note the final `main();` call with no `await` and no
top-level `await` anywhere in the file — this is the same IIFE-flavored workaround from
Module 41's raw-http days: top-level `await` needs an ESM-flavored `module` setting,
and these CommonJS-based module folders wrap everything in `async function main() {...}
main();` instead.

### File: `crud_task3.ts` — line by line

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();


async function main(){
    
   
    try{
        await prisma.$transaction(async(tx)=>{

            const tenant = await tx.tenant.create({data:{name:"Initech"}})
            await tx.org.create({data:{name:"Sales", tenantId: tenant.id}})
            await tx.org.create({data:{name:"Sales",tenantId: tenant.id}})
        })
    }
    catch(err){
        console.log("transaction failed rolled back")
    }
```
`prisma.$transaction(async (tx) => {...})` wraps everything inside the callback in one
real Postgres transaction (`BEGIN`/`COMMIT`/`ROLLBACK` from Module 42.5, managed for
you). `tx` here is a special client — every query *must* go through `tx`, not the outer
`prisma`, for it to actually be part of this transaction. Inside: create a new tenant,
then create an org named `"Sales"` under it (fine, first one), then **deliberately**
create a *second* org also named `"Sales"` under the *same* tenant — violating
`@@unique([tenantId, name])` again, just like Day 2's first file, except this time
inside a transaction. When that third statement throws, `$transaction` automatically
rolls back **everything** that happened inside the callback — not just the failing
statement. This was proven **stronger than expected** while building this: the tenant
creation that had already "succeeded" earlier in the very same callback also got
rolled back and never actually persisted, confirmed by it not appearing even in a later
`GROUP BY` query — real atomicity, not just "the last statement failed."

```ts
    console.log(await prisma.org.findMany({where: {name: "Sales"}}))

    const count = await prisma.$queryRaw`
    SELECT t.name, COUNT(o.id) FROM "Tenant" t
    LEFT JOIN "Org" o ON o.tenant_id = t.id
    GROUP BY t.name
    `;

    console.log(count)
}

main()
```
`prisma.org.findMany({ where: { name: "Sales" } })` — a typed query filtering by name,
same idea as Module 42's `SELECT * FROM orgs WHERE name = 'Sales'`, run on the outer
`prisma` client (not `tx` — the transaction above has already fully finished, rolled
back or not, by this point). `$queryRaw` is used here for a query Prisma's own
query-builder API doesn't conveniently express on its own — a `JOIN` with a `GROUP BY`
and an aggregate `COUNT`, recap of Module 42's Day 3. Critically, `$queryRaw` is used as
a **tagged template literal** (backticks right after the method name, no parentheses
around the string) — this is not just styling: it's what lets Prisma automatically
parameterize any interpolated values safely, making raw SQL here immune to SQL
injection, as opposed to plain string concatenation which would not be safe. Note the
raw SQL references `o.tenant_id` (the real, `@map`'d column name), not `o.tenantId` —
raw SQL always has to speak the *actual* database's column names, bypassing Prisma's
TypeScript-facing renaming entirely.

---

## Day 3 — Real Row-Level Security: `withTenant`, the superuser bug, and the `$extends` bug

### What I learned today

This was the most important day of the module, and the one with real, hard-won
debugging. The goal: make Postgres itself refuse to return another tenant's rows, the
way Module 42.5 described in theory — and prove it actually works, empirically, against
a real database, not just read about it. Getting there required finding and fixing two
genuinely separate bugs: one about *who* the database connection is (superusers), and
one about *how* a transaction-scoped setting actually flows through Prisma's `tx` object
(the `$extends` pattern that was originally taught and turned out not to work as
described).

### The RLS migration: `prisma/migrations/20260930063423_enable_rls_org/migration.sql`

```sql
-- This is an empty migration.

ALTER TABLE "Org" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Org" FORCE ROW LEVEL SECURITY;


CREATE POLICY tenant_isolation on "Org" USING (tenant_id = current_setting('app.tenant_id',true)::text);
```
Prisma's schema language has **no syntax at all** for Postgres policies — RLS is a
Postgres-specific feature with no Prisma-native representation. The way to add it
anyway: `npx prisma migrate dev --create-only` generates an *empty* migration file (the
`-- This is an empty migration.` comment is Prisma's own placeholder text, left in
place), and the actual RLS statements are hand-written into it directly, as raw SQL.
`ENABLE ROW LEVEL SECURITY` turns RLS on for this table at all. `FORCE ROW LEVEL
SECURITY` is what makes RLS apply even to the table's own *owner* — without `FORCE`,
Postgres exempts the owner from RLS entirely by default. `CREATE POLICY tenant_isolation
on "Org" USING (...)` defines the actual rule: a row is visible only if its
`tenant_id` column equals whatever `current_setting('app.tenant_id', true)` currently
returns, cast to `text`. The `true` second argument to `current_setting` means "don't
error if this setting was never set — just return `NULL` instead," which turns out to
be the exact mechanism fail-closed behavior depends on (more below). The policy name
`tenant_isolation` is an arbitrary human label with no special meaning to Postgres
itself.

### File: `crud_task1.ts` — line by line

```ts
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://learning_app:learning_app_pw@localhost:5434/learning_db?schema=public",
});
```
`Prisma` (capital P, distinct from `PrismaClient`) is imported alongside the client
class here specifically to get access to `Prisma.TransactionClient`, a type used below.
The `PrismaClient` constructor is given an explicit `datasourceUrl` option this time —
**overriding** the `DATABASE_URL` environment variable from `.env` just for this one
client instance — connecting as `learning_app`, a different Postgres role than the
`postgres` superuser `.env`/migrations otherwise use. This one line is the fix for the
superuser bug explained below.

```ts
async function withTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}
```
This is the **corrected, proven-working pattern** for real multi-tenant RLS queries —
a generic helper function, not Prisma's `$extends` mechanism (explained in detail
below). `<T>` makes this generic over whatever type the caller's query eventually
returns. The second parameter, `fn`, is itself a function that takes a transaction
client (`tx`) and returns a `Promise<T>` — this is the caller's actual query, passed in
as a callback. Inside, `prisma.$transaction(async (tx) => {...})` opens one real
transaction; `tx.$executeRaw` sets the Postgres session variable `app.tenant_id` to the
given `tenantId` for this transaction only (the final `true` argument to
`set_config` means "local to this transaction," not a permanent session-wide change —
tagged-template syntax again, so `${tenantId}` is safely parameterized, not
string-concatenated). Then — critically — `fn(tx)` is called, handing the **same** `tx`
object that just had `set_config` run on it directly to the caller's query, guaranteeing
both operations share one real database connection.

```ts
async function main() {

    // await prisma.user.deleteMany()
    // await prisma.org.deleteMany()
    // await prisma.tenant.deleteMany()

//     const tenant1 = await prisma.tenant.create({ data: { name: "Acme" } });
//     const org1 = await prisma.org.create({data: {name: "Engineering",tenantId: tenant1.id}})

//     const tenant2 = await prisma.tenant.create({ data: { name: "Globex" } });
//     const org2 = await prisma.org.create({data: {name: "Sales",tenantId: tenant2.id}})
```
These lines are commented out — leftover setup code from creating the actual test data
(two tenants, Acme and Globex, each with their own org) during an earlier run. Left in
place as a visible record of how the data was seeded, rather than deleted, since a real
database persists data across runs (Day 2's lesson) — there was no need to re-run
creation every time.

```ts
    const acmeOrgs = await withTenant("37b6e535-054e-4811-b384-5c1313fce2b8", (tx) =>
        tx.org.findMany({ include: { tenant: true } })
    );
    console.log("as Acme:", acmeOrgs);

    const globexOrgs = await withTenant("4837c986-e381-4189-b33f-8d2e724d738b", (tx) =>
        tx.org.findMany({ include: { tenant: true } })
    );
    console.log("as Globex:", globexOrgs);
```
Two calls to the `withTenant` helper, each with a *different* real tenant UUID (Acme's
and Globex's, captured from the earlier seeding step). `tx.org.findMany({ include: {
tenant: true } })` is a normal typed query, recap of Module 42's `JOIN` — `include`
pulls in the related `Tenant` row alongside each `Org`. Run twice with two different
tenant IDs, this is the actual empirical proof of tenant isolation: the first call
should print only Acme's org(s), the second only Globex's — enforced by Postgres's own
RLS policy filtering rows at the database level, not by any `WHERE tenantId = ...`
written into this query (there isn't one — the query asks for *every* org with no
filter at all, and Postgres silently narrows the result anyway).

```ts
    const noContextAtAll = await prisma.org.findMany({ include: { tenant: true } });

    console.log("as failClose:", noContextAtAll);
}

main();
```
The fail-closed proof: calling `prisma.org.findMany(...)` directly on the **outer**
client — never going through `withTenant`, so `set_config('app.tenant_id', ...)` is
never called at all on whatever connection this query happens to run on. The RLS
policy's `current_setting('app.tenant_id', true)` returns real SQL `NULL` in that case
(the earlier `true` argument prevents an error, substituting `NULL` instead).
Comparing `tenant_id = NULL` is **never true for any row**, under SQL's three-valued
logic — a comparison against `NULL` evaluates to `UNKNOWN`, which Postgres treats as
"exclude this row," no matter what the row's actual `tenant_id` value is. The result:
`noContextAtAll` comes back as an empty array, `[]` — genuine proof that an application
bug which *forgets* to set the tenant context doesn't leak every tenant's data, it leaks
nothing at all. (Worth noting precisely: `""` an empty string is *not* the same as
`NULL` here — `tenant_id = ''` would be a real, concrete, simply-never-matching
comparison, still returning zero rows but for an entirely different logical reason;
reproducing genuine fail-closed behavior specifically requires the setting to be truly
unset, which `current_setting(..., true)`'s `NULL` fallback is what actually provides.)

---

### The superuser bug — root cause and fix

**The bug:** early attempts to prove RLS tenant isolation kept failing — querying as
"Acme" would still return Globex's orgs too, as if the policy weren't applied at all,
even though `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` had both already
been run.

**Root cause:** `FORCE ROW LEVEL SECURITY` only forces RLS onto a table's owner *if that
owner is a non-superuser role*. A genuine Postgres **superuser** bypasses RLS
unconditionally — no exception, no override flag needed, `FORCE` or not. The practice
database's default connection (`postgres`, the role used by `.env` and every migration
up to this point) is exactly such a superuser. So every query up to this point had
secretly never been subject to RLS at all, regardless of how the policy itself was
written.

**Why this isn't just a quirk of this practice setup:** this is *exactly* why Module
42.5's three-role pattern (an ordinary app role with RLS fully applied, a separate
admin role with an explicit `BYPASSRLS` for legitimate cross-tenant operations, and a
separate owner role for migrations only) insists the everyday application connection
must be deliberately non-superuser — it isn't organizational tidiness, it's a hard
technical requirement for RLS to mean anything at all.

**The fix:** create a real, ordinary, non-superuser Postgres role — `learning_app`,
given normal `GRANT`s and explicitly *not* marked as a superuser — and point the
**query-side** client at it via `new PrismaClient({ datasourceUrl: "postgresql://
learning_app:learning_app_pw@localhost:5434/learning_db?schema=public" })`, a
per-instance connection override, exactly as seen in `crud_task1.ts` above. The
`.env` file and every migration deliberately stayed on the `postgres` superuser
connection, since DDL operations like `CREATE POLICY`/`ALTER TABLE ... ENABLE ROW LEVEL
SECURITY` genuinely need elevated privilege to run at all — only the *ordinary runtime
queries* needed to move to the restricted role.

### The `$extends` bug — a genuinely subtle lesson, worth the detail

**What was originally taught:** a Prisma mechanism called `$extends`, used to build a
"wrapped" client where you attach a query hook that runs before every query — the
intended recipe was something like: wrap every query in a `$transaction`, call
`set_config` inside that transaction, then call the original query (`query(args)`, the
extension's built-in "continue as normal" function) and return its result — all inside
one extension, so every call through the resulting wrapped client would *automatically*
be tenant-scoped, with no `withTenant`-style helper needed at every call site.

**Why it seemed reasonable:** `$transaction` and `set_config` are both real,
individually-correct pieces (exactly as used successfully in `withTenant` above) — the
idea of gluing them into an invisible, automatic wrapper via `$extends` seemed like a
natural next step, not an unreasonable thing to attempt.

**What actually went wrong:** this was **verified empirically, not just assumed to be
broken** — an isolated test was built specifically to check each half of the claim
separately. `set_config` run inside a `tx` from `$transaction` *is* real and correctly
readable — querying `tx.$queryRaw`SELECT current_setting('app.tenant_id', true)`` right
afterward, on the same `tx`, correctly shows the value that was just set. And
`tx.org.findMany()`, called directly on that same `tx`, *also* correctly sees it and
returns properly tenant-scoped rows. But the `$extends` pattern's `query(args)` —
the generic "continuation" function an extension's hook is handed, meant to represent
"now actually run the original query" — is bound to the **outer**, unextended client,
not to the `tx` the hook just ran `set_config` on. Calling it opens (or reuses) a
**different real database connection** than the one `set_config` had just modified.
Since `set_config(..., true)` is scoped to one specific transaction/connection by
design (the `true` argument means "local," not session-wide or global), the
continuation's query simply never sees the setting at all — it runs as if
`set_config` had never been called, meaning the policy's `current_setting(...)` call
sees `NULL`, triggering fail-closed (returning nothing) rather than proper tenant
scoping. The bug wasn't that `set_config` "didn't work" — it worked perfectly on the
connection it was actually run on. The bug was a **mismatch between which connection
the setting was applied to and which connection the actual query ran on**, hidden
behind `$extends`'s automatic, invisible wiring.

**The corrected, proven-working pattern:** drop `$extends` entirely in favor of the
explicit `withTenant` helper shown in `crud_task1.ts` above — every call site opens its
*own* transaction via `prisma.$transaction(...)`, receives the resulting `tx` directly
as a plain function argument, and is required to use that exact `tx` object for its
query, rather than trusting an "invisible" wrapped client to somehow inherit a setting
applied elsewhere. Less automatic, more verbose at every call site — but the one thing
that actually matters (the `set_config` call and the real query sharing one literal
connection) is now impossible to get wrong, because it's structurally forced by the
function signature itself (`fn: (tx: Prisma.TransactionClient) => Promise<T>`) rather
than relying on hidden plumbing.

**The lesson to carry forward, independent of this exact code:** this doesn't mean
`$extends` can never work for RLS — procIq's own real `connection.service.ts` uses
functionally the same two-client, transaction-scoped `set_config` idea successfully in
production, likely via a newer Prisma version or a subtly different wiring that this
session's exact attempt didn't replicate. The durable takeaway isn't "`$extends` is
broken" — it's that a transaction-scoped Postgres session setting is only ever visible
on the *exact* connection it was set on, and any abstraction promising to hide that
detail needs to be checked empirically, not trusted on reputation, especially when the
abstraction's job is specifically to paper over "which connection is this running on."

---

## Full end-to-end trace: one tenant-scoped query, start to finish

Using the Acme call from `crud_task1.ts` as the concrete example —
`withTenant("37b6e535-...", (tx) => tx.org.findMany({ include: { tenant: true } }))` —
here is everything that happens, in order:

1. `withTenant` is called with Acme's real tenant UUID and a callback describing the
   actual query to run.
2. Inside `withTenant`, `prisma.$transaction(async (tx) => {...})` opens one real
   transaction against Postgres, using the `learning_app` connection (a deliberately
   non-superuser role — the fix for the first bug above). A `tx` object is handed back,
   representing this specific transaction's connection.
3. `await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`` runs on
   that exact `tx` connection. Postgres sets a transaction-local session variable,
   `app.tenant_id`, to Acme's UUID — scoped to *this* transaction only, because of the
   trailing `true` argument.
4. `fn(tx)` is called — handing that *same* `tx` object (not a different client, not a
   new connection) to the caller's query function.
5. Inside the caller's callback, `tx.org.findMany({ include: { tenant: true } })` runs —
   on the identical connection `set_config` just modified. Prisma translates this into
   a real SQL `SELECT` with a `LEFT JOIN` against `Tenant` (from `include`).
6. Postgres executes that `SELECT` — but because `"Org"` has `FORCE ROW LEVEL SECURITY`
   and a policy (`tenant_isolation`) attached, Postgres silently appends the policy's
   condition to the query: only rows where `tenant_id = current_setting('app.tenant_id',
   true)::text`. `current_setting(...)` reads the value set two steps ago on this exact
   connection — Acme's UUID — so only Acme's org row(s) pass the filter.
7. The filtered rows (just Acme's) are returned up through `tx.org.findMany(...)`, back
   through `fn(tx)`'s return value, back out of the `$transaction` callback. Prisma
   commits the transaction (nothing failed), and `withTenant`'s own promise resolves
   with exactly Acme's data.
8. `console.log("as Acme:", acmeOrgs)` prints only Acme's org — proof, not assumption,
   that the whole chain (non-superuser connection → transaction-scoped `set_config` →
   same-connection query → Postgres policy enforcement) worked end to end.

If step 3 had been skipped entirely (the fail-closed proof, `prisma.org.findMany(...)`
called directly with no `withTenant`), step 6's `current_setting(...)` would return
`NULL` instead of a real UUID, the policy's `=` comparison against `NULL` would evaluate
to `UNKNOWN` for every row, and the result would be an empty array — not Globex's data,
not an error, just nothing. That is fail-closed, working as designed.

---

## Gotchas worth remembering from this module

- **`npm install prisma` defaults to the newest major version (v7), which is a real,
  breaking behavior change** from v5/v6 — v7 restructures configuration into a separate
  `prisma.config.ts` file instead of keeping everything inside `schema.prisma`. This
  module deliberately pinned `"prisma": "^5.22.0"` and `"@prisma/client": "^5.22.0"` in
  `package.json` specifically to match the classic setup this course and procIq's real
  codebase both assume — installing without checking the version first would have
  produced a project structure that doesn't match either.

- **Superusers bypass Row-Level Security unconditionally — `FORCE ROW LEVEL SECURITY`
  does not change this.** `FORCE` only makes RLS apply to a table's owner *if that owner
  is a non-superuser*. The practice database's default `postgres` role is a superuser,
  so every query made through it silently ignored the RLS policy entirely, regardless of
  how carefully the policy itself was written — this is the root reason the
  three-role pattern (ordinary non-superuser app role / separate admin role with an
  explicit `BYPASSRLS` / separate owner role for migrations) is a hard requirement, not
  a style preference.

- **The `$extends`-based "automatic" RLS wrapper pattern, as originally taught, doesn't
  actually share a connection with `$transaction`.** `set_config(..., true)` only
  affects the exact connection it was run on; an extension's `query(args)` continuation
  runs on the *outer*, unextended client — a different connection — so the setting is
  simply invisible to it. This was confirmed with a targeted, isolated empirical test
  (checking that `tx.$queryRaw` sees the setting correctly, but the extension's wrapped
  query doesn't) rather than guessed at. The fix was an explicit `withTenant(tenantId,
  (tx) => ...)` helper where every call site is handed the literal `tx` object that
  `set_config` ran on, making the connection match structurally guaranteed rather than
  hoped-for.

- **`""` (empty string) is not the same as `NULL` in a Postgres comparison, even though
  both can produce "zero matching rows."** `tenant_id = ''` is a concrete, real
  comparison that simply never matches any real tenant ID. `tenant_id = NULL` invokes
  SQL's three-valued logic — any comparison against `NULL` evaluates to `UNKNOWN`,
  which Postgres excludes from results regardless of the row's actual value. Fail-closed
  specifically depends on `current_setting(..., true)` returning genuine `NULL` when
  nothing was ever set — reproducing it requires the setting to be truly unset, not
  explicitly set to an empty string.

- **A real database persists data across every run of a script, forever** — unlike
  Module 40's in-memory `Store<T>` backed by a JS `Map`, which reset itself to empty on
  every process restart. Re-running a script that `create`s rows without first clearing
  the table produces what looks like duplicate/accumulating data on every run — this is
  not a bug, it's Durability (the "D" in ACID) working correctly. A full `TRUNCATE` (or
  `deleteMany()` calls, as commented out at the top of `crud_task1.ts`) is needed before
  re-running a test that assumes a clean starting state.

- **`$queryRaw`/`$executeRaw` must be used as tagged template literals, never plain
  string concatenation.** Writing `` prisma.$queryRaw`SELECT * FROM "Org" WHERE id =
  ${id}` `` automatically parameterizes `${id}` safely; building the same query as a
  plain string and passing it in would reopen exactly the SQL-injection risk
  parameterized queries exist to close.

- **Top-level `await` isn't available in these CommonJS-based module folders.** Every
  file in this module wraps its logic in `async function main() { ... } main();`
  instead — the same IIFE-flavored pattern already seen in Module 41's raw-http files,
  carried forward here for the same underlying reason (no ESM `module` setting in this
  project's `tsconfig.json`).

- **A browser cannot "open" a raw Postgres connection the way it can an HTTP URL** —
  Postgres speaks its own wire protocol, not HTTP. `npx prisma studio` is the actual
  tool for visually inspecting data in a browser (it runs a small local web server that
  *does* speak HTTP, which then talks to Postgres on the backend) — the same role a
  tool like pgAdmin plays.
