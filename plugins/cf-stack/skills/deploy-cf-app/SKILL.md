---
name: deploy-cf-app
description: Prepare, validate, preview, deploy, release, monitor, or troubleshoot a CF TanStack Start application on Cloudflare Workers. Use for Wrangler bindings, generated Worker types, D1 migration ordering, secrets, environments, CI, preview deployments, logs, tailing, versions, or production releases. Do not mutate production resources, secrets, remote D1, or deployments without explicit authorization.
---

# Deploy a CF application

Use the locally installed Wrangler CLI and maintained Cloudflare skills. Separate read-only preparation from production mutations.

## Ground the release

1. Read `package.json`, the lockfile, Wrangler config, generated binding types, deployment adapter, environment files, migrations, CI, and recent deployment conventions.
2. Check `pnpm exec wrangler --version` and relevant help output.
3. Use installed Cloudflare skills and current documentation:
   - https://developers.cloudflare.com/workers/llms.txt
   - https://developers.cloudflare.com/d1/llms.txt
4. Confirm the target account, Worker name, environment, D1 database name and ID, compatibility date, and bindings.

## Prepare without mutation

- Install/update Wrangler locally, not globally.
- Run `pnpm run cf:typegen` after binding or compatibility changes.
- Run `pnpm run validate` from a clean dependency installation.
- Run `pnpm run db:check` and list local and remote migration status.
- Inspect required variables and secret names without printing secret values.
- Use a preview or temporary deployment only when the user authorizes the external deployment action.
- Prefer Wrangler configuration as the source of truth over dashboard-only edits.

## Release ordering

When explicitly authorized to deploy:

1. Reconfirm the exact target immediately before mutation.
2. Review pending migration SQL and backup/rollback implications.
3. Apply remote D1 migrations through `wrangler d1 migrations apply DB --remote`.
4. Deploy the Worker with the repository's `deploy` script or local Wrangler.
5. Verify the deployed version, health path, critical route, auth callback if enabled, and database compatibility.
6. Observe logs with Wrangler tail without exposing sensitive payloads.

Do not run remote migrations concurrently with another release. Do not treat Worker version rollback as a database rollback; D1 state is independent of Worker versions.

## CI

- Pin the lockfile and use the latest active LTS Node.js selected by the repository.
- Run formatting, lint, stable typecheck, tests, build, binding type generation, and migration checks.
- Keep Cloudflare credentials in CI secrets with least privilege.
- Apply remote migrations in one serialized release job before deployment.
- Require an explicit protected environment/approval for production when the repository uses GitHub Actions.
- Avoid automatic production provisioning from pull-request jobs.

## Diagnose

- Use Wrangler deployment/version/status commands with JSON output where available.
- Use `wrangler tail` for request and exception logs.
- Check structured event shape, correlation metadata, redaction, and observability sampling before adding a separate logging service; use `$instrument-cf-observability` when application instrumentation needs work.
- Check binding type drift, compatibility dates, missing secrets, pending migrations, and environment selection before changing code.
- Report the failing layer and evidence before attempting a mutation.

## Verify

Record the validated commit, package lock state, target environment, migration result, deployment/version identifier, and smoke-test result. Stop and report if any verification is ambiguous.
