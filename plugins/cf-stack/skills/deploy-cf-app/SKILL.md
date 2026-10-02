---
name: deploy-cf-app
description: Set up GitHub Actions deployment on main pushes, prepare or run releases, and troubleshoot a CF TanStack Start application on Cloudflare Workers. Use for deployment workflows, Wrangler environments, D1 migration ordering, secrets, previews, commit attribution, and release verification. Production mutations require user authority or an authorized deployment workflow.
---

# Deploy a CF application

Use the locally installed Wrangler CLI and maintained Cloudflare skills. When asked to set up deployment, create or update GitHub Actions automation for pushes to `main` unless the user specifies another release trigger.

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

## Set up GitHub Actions deployment

- Create or update a workflow under `.github/workflows/` with `push.branches: [main]`. Keep pull-request validation separate from the production release job.
- Read current [Cloudflare GitHub Actions guidance](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) when writing the workflow; use current supported actions and the credential storage convention below.
- Check out the triggering commit, use `.node-version` and the pinned `packageManager` pnpm version, and install with `pnpm install --frozen-lockfile`.
- Validate workflow syntax and [expression context availability](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability) before publishing. Resolve `runner.temp` in step-level `env`, or use `$RUNNER_TEMP` inside a run step; the `runner` context is unavailable in job-level `env`.
- Reproduce the workflow's preflight checks locally before an authorized push, including regeneration and drift checks for committed types or catalogs. Application validation alone may miss generated source-reference changes after unrelated edits.
- Run binding type generation and check for generated type drift, then `pnpm run db:check` and `pnpm run deploy`. The `deploy` script must validate, apply remote D1 migrations, and deploy the Worker in that order, stopping on any failure. Keep this sequence in the script rather than duplicating migration/deployment commands in the workflow.
- Run migrations and deployment in one release job with a concurrency group shared by every workflow targeting that Worker/database environment and `cancel-in-progress: false`. Do not interrupt an active migration/deployment for a newer push.
- Use `permissions: contents: read` unless the workflow needs additional GitHub permissions. Provide `CLOUDFLARE_API_TOKEN` to release steps from a repository-level GitHub Actions secret; scope the token to the target account and required Workers/D1 permissions. Set `account_id` in the committed Wrangler configuration instead of configuring a `CLOUDFLARE_ACCOUNT_ID` GitHub secret or variable. Validation jobs do not need deployment credentials.
- For Cloudflare Vite builds, select the target environment at build time through `CLOUDFLARE_ENV`; see [Cloudflare environments](https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/). Before remote migrations, verify the generated Wrangler configuration matches the intended account, Worker, database IDs, and required bindings/variables. Deploy that generated configuration; deployment flags cannot retarget a flattened build.
- Use the target environment explicitly for migration status and application, and ensure it matches the deployed build's D1 name, ID, and migration paths. Skip D1 steps for applications without D1.
- Before applying remote migrations, verify required runtime secret names exist on the target Worker without reading values; use [Workers secret configuration](https://developers.cloudflare.com/workers/configuration/secrets/) as the source for required names. Put this preflight in the shared release script so CI and manual releases fail before database mutation. Wrangler's deploy-time required-secret validation runs after migrations in this sequence.
- Add release metadata as described below so Cloudflare versions can be traced to the checked-out commit and GitHub run.
- After deployment, verify the deployed version and run smoke checks against the health path and a critical route; fail the job when verification fails.
- Use repository secrets and omit the release job's `environment` field; do not create GitHub environments or environment secrets. Automatic deployment on `main` is the default. GitHub environments or manual production approval gates require an explicit user request or project policy. Wrangler environments still select Cloudflare deployment targets independently of GitHub environments.
- Document required secrets, target resources, and the release trigger in the project. Report missing credentials or resources as setup prerequisites; do not claim the pipeline is operational until an authorized run succeeds.

A request for automatic deployment on `main` authorizes the configured CI migrations and deployments on subsequent pushes once enabled. Publishing/enabling the workflow, setting secrets, provisioning resources, and manually triggering an initial release still follow the user's Git and external-action authority. Workflow setup alone does not require a manual release.

## Record release metadata

- Derive the full commit SHA, subject, and author from the checked-out Git commit. In CI, confirm that SHA matches `GITHUB_SHA`. Keep the commit author separate from the actor who initiated the workflow (`GITHUB_ACTOR`) and the actor who triggered the current attempt (`GITHUB_TRIGGERING_ACTOR`); these can differ on reruns. See [GitHub workflow variables](https://docs.github.com/en/actions/reference/workflows-and-actions/variables).
- Use the installed Wrangler's supported [`deploy --tag` and `--message` options](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy): tag the version with the full commit SHA and format its message as `<commit subject>; author: <commit author>`, with the subject first and no prefix or extra provenance. Keep actors and run URLs in the release record and job summary. Construct metadata in the shared release script; check CLI support and [annotation limits](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/versions/methods/create/). Bound messages by UTF-8 bytes, shortening the subject before the author suffix without splitting characters.
- Pass metadata through quoted environment variables or argument arrays. Treat commit text as data rather than interpolating it into executable shell code. For authorized local releases, derive metadata from local Git and label dirty builds in the console, release record, and summary while retaining the compact version message.
- Capture the uploaded version ID using [Wrangler's structured output](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/). Give each deploy invocation a fresh `WRANGLER_OUTPUT_FILE_PATH`; require an unambiguous `deploy` record matching the target Worker and extract its `version_id`. Its `worker_tag` is not the Git SHA annotation. Persist the version ID before reading back that exact version's tag/message to verify the commit association; never assume the newest version belongs to the current run.
- Write a [GitHub job summary](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary) linking the commit and workflow run and recording the commit author, initiating/triggering actors, run attempt, target Worker/environment, Cloudflare version ID, migration result, and smoke-test result. Use an `always()` summary step after an attempted release so later verification or smoke failures preserve the release identifiers and failed stage. Preserve the original release error when capturing output after an upload failure.
- Explain that tags/messages provide Git attribution while Cloudflare's native author/source labels still reflect its deployment identity and upload path. These annotations do not guarantee a change to the dashboard's `by Unknown` or `Manually deployed` labels.

## Release ordering

For an authorized manual release or the configured CI release job:

1. Reconfirm the exact target immediately before mutation.
2. Review pending migration SQL and backup/rollback implications.
3. Run the repository's `deploy` script: validate, build and check the target configuration, verify runtime-secret prerequisites, apply remote D1 migrations through `wrangler d1 migrations apply DB --remote`, then deploy the Worker. In CI, target confirmation and failure checks must be non-interactive. Apply migrations exactly once per release, inside the script.
4. Stop on migration or deployment failure and report the failed stage; a migration failure must prevent Worker deployment.
5. Verify the deployed version, health path, critical route, auth callback if enabled, and database compatibility.
6. Observe logs with Wrangler tail without exposing sensitive payloads.

Do not run remote migrations concurrently with another release. Do not treat Worker version rollback as a database rollback; D1 state is independent of Worker versions.

## CI

- Pin the lockfile and use the latest active LTS Node.js selected by the repository.
- Run formatting, lint, stable typecheck, tests, build, binding type generation, and migration checks.
- Follow the GitHub Actions setup above for release triggers, credentials, concurrency, and migration ordering.
- Avoid automatic production provisioning from pull-request jobs.

## Diagnose

- Use Wrangler deployment/version/status commands with JSON output where available.
- Use `wrangler tail` for request and exception logs.
- Check structured event shape, correlation metadata, redaction, and observability sampling before adding a separate logging service; use `$instrument-cf-observability` when application instrumentation needs work.
- Check binding type drift, compatibility dates, missing secrets, pending migrations, and environment selection before changing code.
- Report the failing layer and evidence before attempting a mutation.

## Verify

Record the release metadata above, package lock state, migration result, and smoke-test result. Stop and report if any verification is ambiguous.
