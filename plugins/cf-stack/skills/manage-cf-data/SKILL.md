---
name: manage-cf-data
description: Design, migrate, query, seed, inspect, or troubleshoot CF data using Drizzle ORM and Cloudflare D1. Use for schemas, SQLite columns, relations, CUID2 IDs, timestamps, D1 bindings, Drizzle migration generation, Wrangler local or remote migrations, Local Explorer, or database tests. Do not use Drizzle Kit to apply D1 migrations or reach into Wrangler's private SQLite state.
---

# Manage CF data

Use Drizzle for typed schema/query construction and SQL generation. Use Wrangler for the D1 runtime, migration ledger, local commands, and remote commands.

## Ground the change

1. Read installed Drizzle and Wrangler versions, schema exports, Drizzle config, Wrangler D1 binding, generated migration layout, and package scripts.
2. Read [d1-workflow.md](references/d1-workflow.md) before changing migration configuration.
3. Use current indexes for API detail:
   - https://orm.drizzle.team/llms.txt
   - https://developers.cloudflare.com/d1/llms.txt
   - https://developers.cloudflare.com/workers/llms.txt

## Model schemas

- Use `drizzle-orm/sqlite-core` and export schemas through a stable database module boundary.
- Use the existing CF ID convention: CUID2 values with a three-character mnemonic table/entity prefix.
- Reuse consistent creation and update timestamp helpers.
- Infer select and insert types from schema declarations.
- Define indexes, uniqueness, nullability, defaults, and foreign keys intentionally.
- Define relations when relational queries use them; do not mistake relations for database constraints.
- Never edit generated migration snapshots or SQL to make routine schema changes. Use a custom migration only for deliberate SQL that the schema diff cannot express.

## Use D1 at runtime

- Obtain the typed binding from `cloudflare:workers` or the generated Worker environment type.
- Initialize Drizzle with `drizzle-orm/d1` and `env.DB`.
- Keep database helpers server-only.
- Use transactions/batches according to current D1 and Drizzle capabilities.
- Return domain data rather than leaking driver result shapes across the application.

## Generate and apply migrations

Use this ownership split:

```sh
pnpm run db:generate
pnpm run db:check
pnpm run db:migrate:local
```

- `db:generate` must run `drizzle-kit generate`.
- `db:check` must run `drizzle-kit check`.
- `db:migrate:local` must run `wrangler d1 migrations apply DB --local`.
- `db:migrate:remote` must run the same Wrangler command with `--remote` and requires explicit authority.
- Configure `migrations_dir` and `migrations_pattern` to match Drizzle's actual output.
- Keep one Wrangler migration table/ledger for local and remote D1 environments.

Never default to `drizzle-kit migrate`, `drizzle-kit push`, raw SQLite-file access, or recursive `.wrangler/state` discovery.

## Inspect and seed local D1

- Use `wrangler d1 execute DB --local` for scripts and ad-hoc CLI queries.
- Use `wrangler d1 migrations list DB --local` for status.
- Start local development and open `/cdn-cgi/explorer` for table browsing and SQL.
- Let agents discover the Local Explorer API from `/cdn-cgi/explorer/api`.
- Keep seed operations explicit and local by default.

Drizzle Studio's D1 HTTP driver targets deployed D1 credentials. Do not present it as a supported connection to Wrangler's local binding.

## Verify

- Review generated SQL before applying it.
- Apply to a clean local D1 database and an existing migrated local database.
- Test constraints, defaults, relation queries, and rollback/error behavior where relevant.
- Run `pnpm run cf:typegen`, `pnpm run db:check`, relevant tests, `pnpm run typecheck`, and `pnpm run build`.
- Before a remote migration, list pending remote migrations, confirm the target account/database, and obtain explicit authorization.
