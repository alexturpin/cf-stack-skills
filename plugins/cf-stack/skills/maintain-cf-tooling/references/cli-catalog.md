# CF CLI catalog

| CLI | Owns | Prefer |
|---|---|---|
| `tanstack` | Project creation, add-ons, docs search, docs fetch | JSON output and installed Intent knowledge |
| `skills` | Project-local Agent Skills installation and updates | Documented upstream source URLs; omit `-g` and `--global` |
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
- Do not use `npx`. Use `pnpm exec` for local CLIs and `pnpm dlx` only for bootstrapping or an explicitly current one-off CLI.
- Do not use the Cloudflare API or dashboard for a local operation supported by Wrangler.
- Do not deploy, mutate secrets, provision resources, or apply remote migrations without explicit authority.

## Agent-oriented discovery

- Use `tanstack create --list-add-ons --json` and `--addon-details` before selecting add-ons.
- Use `tanstack search-docs` and `tanstack doc` before broad web lookup.
- Inspect `pnpm dlx skills add --help` and the source repository's `--list` output before installing project skills. Use repeated names after `--skill` for the focused set; do not install an entire upstream repository by default, and do not pass `-g` or `--global`.
- Use `auth info --json` when diagnosing Better Auth; it redacts sensitive values.
- Use Local Explorer's `/cdn-cgi/explorer/api` OpenAPI surface for agent-driven local binding inspection.
