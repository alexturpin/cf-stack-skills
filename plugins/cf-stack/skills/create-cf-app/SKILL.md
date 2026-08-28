---
name: create-cf-app
description: Scaffold or bootstrap a new CF application using current TanStack Start, Cloudflare Workers, Mantine, TanStack Query and Form, Zod, Drizzle D1, and optional Better Auth. Use for new repositories, replacing the old cf-app-starter, choosing current packages, selecting Developer or Guided builder collaboration, installing agent skills, or establishing the standard CF scripts and AGENTS.md contract. Do not use for ordinary feature work in an existing configured CF app.
---

# Create a CF application

Create a current application from maintained CLIs and small integration edits. Do not copy an old starter tree.

## Establish inputs

1. Read the request for an application name, destination, and collaboration style. Do not ask again for inputs that are already explicit.
2. If the application name is missing, ask for it before creating files. If the parent directory is missing and cannot be safely inferred from the current writable workspace, ask for both in one concise question: "What should the application be called, and in which parent directory should I create it?"
3. If the collaboration style is missing, ask: "How should Codex collaborate on this project: Developer (concise technical communication; you control Git and releases) or Guided builder (plain-language updates; Codex makes routine implementation decisions and keeps the app runnable)?" Never infer technical ability from the user's language or label the user as technical or non-technical.
4. Record exactly one collaboration style:
   - `developer`: generate no collaboration-style section in `AGENTS.md`.
   - `guided`: append the Guided builder section from [project-contract.md](references/project-contract.md).
5. Normalize the application name to a valid kebab-case directory and npm package name. Preserve the human-readable name separately when the application needs a display title.
6. Resolve the absolute target as `<parent-directory>/<application-slug>` and show that exact path before mutation. Run the TanStack CLI from the parent directory with the slug as its target.
7. Confirm the target is safe and either absent or empty. Never scaffold into an existing application repository or merge into a non-empty directory.
8. Confirm Codex can write to the parent directory. If the active workspace is rooted elsewhere, request narrowly scoped permission or tell the user to start the task from the intended parent directory; do not create the app inside the current repository as a workaround.
9. Use pnpm exclusively for scaffolding, dependency installation, package scripts, and one-off package CLIs. Do not offer npm, Yarn, or Bun as alternatives. Commit `pnpm-lock.yaml`, set the `packageManager` field in `package.json` to the resolved pnpm version, and do not create or retain another package manager's lockfile.
10. Ask only for choices that materially differ from the remaining defaults:
   - Better Auth enabled
   - no demo business feature
11. Keep provisioning, remote migrations, secrets, and deployment out of scaffolding unless explicitly requested.
12. When a stated requirement needs infrastructure beyond the default Workers and D1 stack, use `$choose-cf-infrastructure`. Do not present the full Cloudflare catalog during routine scaffolding.
13. Do not ask about or add localization by default. When the user explicitly requests multiple languages, locale negotiation, or Lingui, use `$localize-cf-app` after the base scaffold is established.

## Discover before scaffolding

Run current CLIs instead of assuming their options:

```sh
pnpm dlx @tanstack/cli@latest create --list-add-ons --json
pnpm dlx @tanstack/cli@latest create --addon-details <candidate> --json
```

Prefer official add-ons for TanStack libraries and integrations when they provide the required current stack. Inspect generated files and dependencies before adding overlapping manual setup.

Use TanStack CLI documentation search for API questions:

```sh
pnpm dlx @tanstack/cli@latest search-docs "<query>" --library <library> --json
pnpm dlx @tanstack/cli@latest doc <library> <path> --json
```

Use the versioned indexes only when the CLI or installed package skills do not answer the question:

- https://tanstack.com/start/v1/llms.txt
- https://tanstack.com/router/v1/llms.txt
- https://tanstack.com/query/latest/llms.txt
- https://tanstack.com/form/latest/llms.txt

## Scaffold the base

Use the current CLI from the selected parent directory and include Intent explicitly because blank projects omit it:

```sh
pnpm dlx @tanstack/cli@latest create <application-slug> --blank --deployment cloudflare --intent -y
```

Run all subsequent commands inside the generated repository. Verify that the CLI selected pnpm before continuing. Use locally installed CLIs through package scripts or `pnpm exec`.

## Select the Node.js runtime

Resolve the latest active LTS Node.js release at scaffold time through an installed version manager or Node.js's official release index at https://nodejs.org/dist/index.json. Do not copy a version number from this skill or infer LTS status from the newest current release.

1. Write the resolved full `major.minor.patch` version to `.node-version`.
2. Set `package.json#engines.node` to `>=<resolved-version> <<next-major>`.
3. Activate or install that version through the available version manager before installing dependencies.
4. Verify `node --version` exactly matches `.node-version`; stop if the selected runtime cannot be activated.
5. Configure CI to read `.node-version` rather than duplicating the version in a workflow.

The generated-project audit must run under this selected runtime so a globally installed older Node.js cannot produce a misleading successful validation.

## Resolve the latest stack

Inspect `package.json` and the lockfile before adding anything. Install missing packages at `@latest`; update existing stack packages to `@latest`; then commit the resolved lockfile. Do not silently retain an old major or downgrade a conflict.

Require these capabilities, allowing official add-ons to choose exact package splits:

- TanStack Start, Router, Query, and Form
- React and Vite
- Mantine core, hooks, notifications, and modals
- Tabler React icons
- Zod
- Drizzle ORM and Drizzle Kit
- Cloudflare Wrangler
- TypeScript, Oxfmt, Oxlint, and `oxlint-tsgolint`
- Vitest and the current Cloudflare Worker test integration when Worker bindings are tested
- Better Auth and its current Drizzle adapter when auth is enabled

Use latest stable releases together. If installation or validation reveals a peer conflict, stop with the exact packages and ranges. Do not solve it by silently pinning an older release.

## Install maintained agent knowledge

1. Preserve the TanStack Intent setup produced by `--intent`.
2. Inspect the installed Intent CLI before invoking its mapping/install command.
3. From the generated repository, inspect the current Skills CLI and available Cloudflare skills:

   ```sh
   pnpm dlx skills add --help
   pnpm dlx skills add https://github.com/cloudflare/skills --list
   ```

4. Install the focused Workers baseline at project scope for every generated application:

   ```sh
   pnpm dlx skills add https://github.com/cloudflare/skills --skill workers-best-practices wrangler --agent '*' -y
   ```

5. Add only skills justified by requirements already in scope:
   - `cloudflare-email-service` for sending or receiving email;
   - `durable-objects` when Durable Objects were selected;
   - `turnstile-spin` for requested bot protection;
   - `agents-sdk` for an Agents SDK application;
   - `web-perf` for requested performance auditing;
   - the applicable `sandbox-*` skill for Cloudflare Sandbox work; and
   - `cloudflare-one` or `cloudflare-one-migrations` for Cloudflare One work.

   Append applicable names to the Cloudflare `--skill` list. Do not install the broad `cloudflare` umbrella by default; `$choose-cf-infrastructure` and the focused CF skills own service selection and retrieval.
6. When auth is enabled, install Better Auth's security skill:

   ```sh
   pnpm dlx skills add https://github.com/better-auth/skills --skill better-auth-security-best-practices --agent '*' -y
   ```

   Add `email-and-password-best-practices`, `organization-best-practices`, or `two-factor-authentication-best-practices` only when the corresponding feature is already requested. Do not install generic `create-auth` or `better-auth-best-practices`; `$integrate-cf-auth` owns the CF/D1 integration and reads current Better Auth documentation directly.
7. Do not pass `-g` or `--global`. Verify that the installer created project-local agent skill directories and that `skills-lock.json` records only the selected skills.
8. Let the installer manage repository-local agent directories; do not copy upstream skill contents into custom CF skill folders.

## Apply the CF contract

Read [project-contract.md](references/project-contract.md) and implement every applicable item. In particular:

- Use Mantine's latest-major provider and style imports.
- Install `@mantine/notifications`, import its styles after Mantine core styles, and render one `Notifications` component inside `MantineProvider`.
- Use Mantine notifications for transient feedback and Mantine modals for confirmations; do not scaffold `alert`, `window.confirm`, or hand-written `beforeunload` handling.
- Use TanStack Router `useBlocker` for unsaved-change navigation when needed, including its supported browser `beforeunload` integration.
- Use TanStack Form, never `@mantine/form`.
- Use `import * as z from "zod"` as the local convention.
- Use `drizzle-orm/d1` with the typed `env.DB` binding.
- Generate SQL with Drizzle Kit and apply it with Wrangler.
- Configure Wrangler's `migrations_dir` and `migrations_pattern` to match generated Drizzle files.
- Use Local Explorer or Wrangler commands for local D1 inspection.
- Generate binding types after Wrangler configuration changes.
- Enable Workers observability in Wrangler configuration. When auth or server-side writes exist, use `$instrument-cf-observability` to add structured outcome events, request correlation, and redaction without logging credentials, identity PII, or raw request data.
- Keep `AGENTS.md` short and CLI-oriented.
- Generate the collaboration section selected during setup: omit it entirely for Developer mode; append the exact Guided builder section from the project contract for Guided mode.
- In Guided mode, include the one-message `ENGINE ROOM:` technical-response override exactly as defined in the project contract.
- Keep Git pushes, deployments, secrets, provisioning, and remote migrations explicitly authorized even in Guided mode.

For Better Auth, inspect the current CLI and TanStack integration docs before writing integration code:

- https://better-auth.com/llms.txt
- https://better-auth.com/docs/concepts/cli
- https://better-auth.com/docs/integrations/tanstack

Generate the auth schema through the current Auth CLI, then generate a Drizzle migration and apply it through Wrangler. Do not introduce `better-sqlite3` to make the auth CLI load.

## Verify

Run the repository's commands in this order:

1. `pnpm run cf:typegen`
2. `pnpm run format`
3. `pnpm run db:generate`
4. `pnpm run db:check`
5. `pnpm run db:migrate:local`
6. `pnpm run validate`
7. Run `node <skill-directory>/scripts/audit-cf-project.mjs [--auth|--no-auth] [--guided|--developer]` under the Node.js version in `.node-version`.

Start local development and verify:

- an application request can use the local D1 binding;
- `/cdn-cgi/explorer` can inspect the same D1 database;
- the Explorer API is available at `/cdn-cgi/explorer/api`;
- auth-enabled and auth-disabled builds both have no dead configuration.

Do not deploy as part of this skill.

Finish by reporting the human-readable application name, collaboration style, absolute created directory, resolved package versions, validation results, and the exact command for starting local development.
