# CF CLI catalog

| CLI | Owns | Prefer |
|---|---|---|
| `tanstack` | Project creation, add-ons, docs search, docs fetch | JSON output and installed Intent knowledge |
| `wrangler` | Worker local runtime, bindings, D1 execution/migrations, types, logs, deploy | Local dependency and explicit environment flags |
| `drizzle-kit` | Schema diff, SQL generation, migration consistency | `generate` and `check` for D1 |
| `auth` | Better Auth schema generation, diagnostics, secrets | Current `auth@latest` command contract |
| `oxlint` | Fast linting and type-aware rules | Safe fixes; agent or JSON diagnostics when useful |
| `oxfmt` | Formatting and sorting | Check mode in CI, write mode locally |
| `tsc` | Stable TypeScript type checking | `--noEmit` |
| `vitest` | Unit and Worker integration tests | Non-interactive CI mode |

## Boundaries

- Do not use Drizzle Kit to apply D1 migrations; Wrangler owns the D1 migration ledger.
- Do not use Wrangler's private persistence files as a database connection API.
- Do not use `npx` for routine commands when a local CLI exists. Bootstrap and explicitly current schema generators are exceptions.
- Do not use the Cloudflare API or dashboard for a local operation supported by Wrangler.
- Do not deploy, mutate secrets, provision resources, or apply remote migrations without explicit authority.

## Agent-oriented discovery

- Use `tanstack create --list-add-ons --json` and `--addon-details` before selecting add-ons.
- Use `tanstack search-docs` and `tanstack doc` before broad web lookup.
- Use Wrangler's `--install-skills` support to install maintained Cloudflare agent guidance.
- Use `auth info --json` when diagnosing Better Auth; it redacts sensitive values.
- Use Local Explorer's `/cdn-cgi/explorer/api` OpenAPI surface for agent-driven local binding inspection.
