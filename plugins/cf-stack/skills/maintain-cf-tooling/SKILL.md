---
name: maintain-cf-tooling
description: Maintain, upgrade, diagnose, or standardize the CF toolchain, dependencies, package scripts, TypeScript, Oxfmt, Oxlint, Vitest, TanStack CLI, Wrangler, Drizzle Kit, and Better Auth CLI. Use for latest-version upgrades, dependency drift, lint or format migration, CLI discovery, package-manager scripts, CI performance, or compatibility reports. Do not use for feature implementation that does not change tooling.
---

# Maintain CF tooling

Use locally installed CLIs, machine-readable output, and reproducible lockfiles. Treat latest stable compatibility as something to prove with validation, not assume.

## Inventory first

Read:

- `package.json` and the lockfile;
- Node and pnpm versions, `.node-version`, `engines.node`, and `packageManager`;
- `tsconfig` files;
- Oxfmt and Oxlint configuration;
- Vite, Vitest, Drizzle, and Wrangler configuration;
- current `AGENTS.md` commands;
- CI workflows.

Run local version and help commands before changing options. Prefer `pnpm exec <cli> --help` and JSON output where supported. Read [cli-catalog.md](references/cli-catalog.md) for the intended ownership boundaries.

## Upgrade current stable packages

1. Query current stable versions from the npm registry or `pnpm outdated`.
2. Group upgrades by compatibility surface:
   - TanStack Start, Router, Query, Form, and CLI;
   - React and Vite;
   - Mantine packages;
   - Drizzle ORM and Kit;
   - Cloudflare Vite plugin and Wrangler;
   - Better Auth and its adapter;
   - TypeScript, Oxfmt, Oxlint, and `oxlint-tsgolint`;
   - Vitest and Worker test integration.
3. Install stable tags explicitly and update the lockfile.
4. Do not silently downgrade any package to clear a peer error.
5. If latest stable packages conflict, report the exact ranges, affected command, and smallest upstream-owned resolution. Leave the repository on a working state only when the user authorizes a temporary pin.

Resolve the latest active LTS Node.js at change time through an installed version manager or Node.js's official release index at https://nodejs.org/dist/index.json. Write the full version to `.node-version`, set `engines.node` to `>=<resolved-version> <<next-major>`, activate it before installation and validation, and make CI read the same file. Do not preserve a stale version merely because it was previously pinned. Keep Wrangler locally installed so every developer and agent runs the locked version.

## Keep the fast TypeScript toolchain

- Use TypeScript 7 or newer and run stable `tsc --noEmit` for type checking.
- Use Oxfmt for formatting and import/package sorting.
- Use type-aware Oxlint with `oxlint-tsgolint` for linting.
- Deny warnings in CI.
- Apply only safe Oxlint fixes by default.
- Keep dangerous or suggestion fixes explicit.
- Do not add ESLint or Prettier unless a verified unsupported requirement forces a scoped compatibility layer.
- Do not replace stable `tsc` with Oxlint's experimental combined type checker.

Consult current Oxc documentation rather than embedding rule catalogs:

- https://oxc.rs/docs/guide/usage/linter.md
- https://oxc.rs/docs/guide/usage/linter/type-aware.html
- https://oxc.rs/docs/guide/usage/formatter.md

## Preserve the CLI contract

Keep these package scripts stable unless an upstream CLI has removed the capability:

- `dev`, `build`, `test`
- `lint`, `lint:fix`
- `format`, `format:check`
- `typecheck`, `validate`
- `cf:typegen`
- `db:generate`, `db:check`
- `db:migrate:local`, `db:migrate:remote`
- `db:query:local`
- `db:status:local`, `db:status:remote`
- `auth:generate`, `auth:info` when auth is enabled
- `deploy`, `tail`

Use package scripts for stable workflows and direct CLI commands for discovery or one-off diagnostics. Keep `AGENTS.md` synchronized with the commands agents can actually run.

## Verify

Run:

1. CLI version checks.
2. Confirm `node --version` exactly matches `.node-version` and `pnpm --version` matches `packageManager`.
3. `pnpm run format:check`.
4. `pnpm run lint`.
5. `pnpm run typecheck`.
6. `pnpm run test`.
7. `pnpm run build`.
8. `pnpm run cf:typegen` after Wrangler changes.
9. `pnpm run db:check` after Drizzle upgrades.

For a latest-version upgrade, include a before/after version table and call out experimental, preview, or deprecated surfaces. Do not install the preview `cf` CLI as a production dependency until Cloudflare marks the required operations stable.
