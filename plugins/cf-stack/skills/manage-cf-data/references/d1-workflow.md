# Drizzle and D1 ownership

## Supported local path

| Need | Tool |
|---|---|
| Typed runtime queries | `drizzle-orm/d1` over `env.DB` |
| Schema declarations | Drizzle ORM |
| Migration SQL and snapshots | `drizzle-kit generate` |
| Migration consistency | `drizzle-kit check` |
| Apply local migrations | `wrangler d1 migrations apply DB --local` |
| Apply remote migrations | `wrangler d1 migrations apply DB --remote` |
| Query or seed locally | `wrangler d1 execute DB --local` |
| Browse local data | Wrangler Local Explorer |
| Agent local-data API | `/cdn-cgi/explorer/api` |

## Wrangler configuration

Point Wrangler at the generated Drizzle migration files. For nested output, use the actual paths, for example:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<name>",
      "database_id": "<id>",
      "migrations_dir": "drizzle",
      "migrations_pattern": "drizzle/*/migration.sql"
    }
  ]
}
```

Do not copy this pattern blindly. Inspect the current Drizzle output and choose the narrowest matching glob. Wrangler requires the pattern to begin with `migrations_dir`.

## Unsupported defaults

- Do not locate `.wrangler/state/**.sqlite` files.
- Do not connect `better-sqlite3` to Wrangler persistence.
- Do not mix Drizzle's migration table with Wrangler's `d1_migrations` ledger.
- Do not use remote D1 HTTP credentials for ordinary local development.
- Do not use `db:push` as the team's recorded migration workflow.

## Remote safety

Treat remote D1 migrations as a production mutation. Confirm the Worker environment, account, database name and ID, pending SQL, backup expectations, and authorization immediately before applying.

