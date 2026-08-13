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
9. Ask only for choices that materially differ from the remaining defaults:
   - npm package manager
   - Better Auth enabled
   - latest active LTS Node.js
   - no demo business feature
10. Keep provisioning, remote migrations, secrets, and deployment out of scaffolding unless explicitly requested.
11. When a stated requirement needs infrastructure beyond the default Workers and D1 stack, use `$choose-cf-infrastructure`. Do not present the full Cloudflare catalog during routine scaffolding.

## Discover before scaffolding

Run current CLIs instead of assuming their options:

```sh
npx @tanstack/cli@latest create --list-add-ons --json
npx @tanstack/cli@latest create --addon-details <candidate> --json
```

Prefer official add-ons for TanStack libraries and integrations when they provide the required current stack. Inspect generated files and dependencies before adding overlapping manual setup.

Use TanStack CLI documentation search for API questions:

```sh
npx @tanstack/cli@latest search-docs "<query>" --library <library> --json
npx @tanstack/cli@latest doc <library> <path> --json
```

Use the versioned indexes only when the CLI or installed package skills do not answer the question:

- https://tanstack.com/start/v1/llms.txt
- https://tanstack.com/router/v1/llms.txt
- https://tanstack.com/query/latest/llms.txt
- https://tanstack.com/form/latest/llms.txt

## Scaffold the base

Use the current CLI from the selected parent directory and include Intent explicitly because blank projects omit it:

```sh
npx @tanstack/cli@latest create <application-slug> --blank --deployment cloudflare --intent -y
```

Run all subsequent commands inside the generated repository. Use locally installed CLIs through package scripts or `npm exec`.

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
3. Install Cloudflare's maintained skills through the locally installed Wrangler CLI after checking `wrangler --help` for `--install-skills`. Prefer a non-deploying command such as type generation.
4. When auth is enabled, install Better Auth's maintained skills with its documented skills installer.
5. Do not vendor Cloudflare, Better Auth, or TanStack reference skills into CF-owned skill folders.

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

1. `npm run cf:typegen`
2. `npm run format`
3. `npm run db:generate`
4. `npm run db:check`
5. `npm run db:migrate:local`
6. `npm run validate`
7. `node <skill-directory>/scripts/audit-cf-project.mjs [--auth|--no-auth] [--guided|--developer]`

Start local development and verify:

- an application request can use the local D1 binding;
- `/cdn-cgi/explorer` can inspect the same D1 database;
- the Explorer API is available at `/cdn-cgi/explorer/api`;
- auth-enabled and auth-disabled builds both have no dead configuration.

Do not deploy as part of this skill.

Finish by reporting the human-readable application name, collaboration style, absolute created directory, resolved package versions, validation results, and the exact command for starting local development.
