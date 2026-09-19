# Generated CF project contract

## Dependencies and versions

- Resolve every named stack package from the current stable npm tag at scaffold time.
- Use pnpm exclusively and commit `pnpm-lock.yaml`; do not retain npm, Yarn, or Bun lockfiles.
- Set the `packageManager` field in `package.json` to the resolved pnpm version.
- Resolve the latest active LTS Node.js release at scaffold time from an installed version manager or Node.js's official release index; do not bake a version into the skill.
- Write the resolved full version to `.node-version`, set `engines.node` to `>=<resolved-version> <<next-major>`, activate it before dependency installation, and configure CI to read the same file.
- Use TypeScript 7 or newer, Mantine 9 or newer, and Wrangler with Local Explorer support.
- Start with latest stable releases. When a verified incompatibility blocks a required integration, use the smallest supported compatibility adjustment within the user’s authorized scope. Document the conflicting versions, evidence, selected pin, and condition for removing it. Validate the resulting combination. Ask only when resolution would change requirements or violate an explicit version constraint. Never silently downgrade or bypass peer checks.

## Required scripts

| Script | Command behavior |
|---|---|
| `dev` | Run the TanStack Start development server with Cloudflare bindings. |
| `build` | Create the production Worker build. |
| `test` | Run Vitest non-interactively. |
| `lint` | Run type-aware Oxlint and deny warnings. |
| `lint:fix` | Apply Oxlint safe fixes only. |
| `format` | Run Oxfmt in write mode. |
| `format:check` | Run Oxfmt in check mode. |
| `typecheck` | Run stable TypeScript `tsc --noEmit`. |
| `validate` | Check formatting, lint, types, tests, and build. |
| `cf:typegen` | Run `wrangler types`. |
| `db:generate` | Run `drizzle-kit generate`. |
| `db:check` | Run `drizzle-kit check`. |
| `db:migrate:local` | Run `wrangler d1 migrations apply DB --local`. |
| `db:migrate:remote` | Run `wrangler d1 migrations apply DB --remote`. |
| `db:query:local` | Pass arguments to `wrangler d1 execute DB --local`. |
| `db:status:local` | Run `wrangler d1 migrations list DB --local`. |
| `db:status:remote` | Run `wrangler d1 migrations list DB --remote`. |
| `deploy` | Validate, migrate remote D1, then deploy only with explicit authority. |
| `tail` | Run Wrangler tail for the configured Worker. |

Add `auth:generate` and `auth:info` only when Better Auth is enabled.

## TypeScript and Oxc

- Use TypeScript's stable `tsc --noEmit` for type checking.
- Enable Oxlint's type-aware rules with `oxlint-tsgolint`.
- Do not use Oxlint's experimental combined type checker as the only type check.
- Use Oxfmt for source, config, Markdown, CSS, and package formatting.
- Do not install ESLint or Prettier.

## D1 and migrations

- Initialize runtime Drizzle from `env.DB` with `drizzle-orm/d1`.
- Keep Drizzle config generate-only: schema, SQLite dialect, and migration output.
- Let Drizzle Kit generate SQL and snapshots.
- Let Wrangler apply both local and remote migrations and own the migration ledger.
- Set `migrations_pattern` when Drizzle emits nested migration SQL.
- Use explicit `--local` and `--remote` flags.
- Use Wrangler Local Explorer for local browsing and ad-hoc SQL.
- Never scan `.wrangler/state`, use `better-sqlite3`, or make `db:push` the default.

## Workers observability

- Enable Workers observability in Wrangler configuration.
- Instrument authentication and authorization outcomes, privileged changes, server-side writes, external handoffs, and unexpected boundary failures when those operations exist.
- Emit structured `console.*` events with stable names, outcomes, and bounded request correlation metadata.
- Do not log raw request or response bodies, query strings, cookies, authorization headers, OTPs, tokens, passwords, secrets, email addresses, or email bodies.
- Keep redaction and safe error serialization in a server-only helper and cover them with focused tests.
- Make production sampling an explicit operational choice; do not provision another logging product by default.

## Agent guidance

Generate a short `AGENTS.md` that lists:

- the stack identity;
- the stable package scripts;
- the installed `tanstack`, `wrangler`, `drizzle-kit`, `auth`, `oxlint`, `oxfmt`, `tsc`, and `vitest` CLIs;
- the requirement to run `pnpm run validate` after changes;
- the local environment convention: use gitignored `.env`, keep `.env.example` updated with safe placeholders, and preserve this choice during later integrations instead of introducing source `.dev.vars` files;
- the rule that production provisioning, secrets, remote migrations, and deploys need explicit authority.

Do not copy framework documentation into `AGENTS.md`.

### Collaboration style

Ask the user to choose Developer or Guided builder during scaffolding. Do not infer their technical ability.

- For Developer, do not add a collaboration-style heading or instructions to `AGENTS.md`.
- For Guided builder, append this section exactly:

```md
## Collaboration style

The primary user prefers guided product development.

- Communicate in plain language and explain outcomes without unnecessary jargon.
- When a message begins with `ENGINE ROOM:` (case-insensitive), answer that message as a technical peer: be concise and direct, lead with the mechanism and relevant code, APIs, or commands, and include material assumptions or tradeoffs. Apply this override to that message only; do not change the saved collaboration style or treat it as authorization for external actions.
- Implement requested features rather than giving the user technical setup instructions.
- Make routine implementation and architecture decisions using the repository conventions.
- Ask the user about product behavior, visual preferences, accounts, credentials, costs, and irreversible decisions.
- Keep the application runnable, start the development server when visual review is useful, and provide the local URL.
- Validate completed work and explain what changed, what was verified, and what remains.
- When the user asks to publish, share, or go live, use the repository's validated deployment workflow.
- Do not push, deploy, modify secrets, provision resources, or migrate remote data unless the user explicitly asks for that external action.
```

Do not add automatic commit instructions in either mode. A publish request may create a sensible commit after validation as part of the explicitly requested delivery workflow.

## Navigation and feedback

- Install `@mantine/notifications` with the other Mantine packages.
- Import notification styles after Mantine core styles and render one `Notifications` component inside `MantineProvider`.
- Use notifications for transient non-blocking outcomes, inline UI for field/persistent errors, and Mantine modals for confirmations.
- Use TanStack Router `useBlocker` for unsaved-change guards instead of manual `beforeunload` listeners.
- Use blocker resolver controls with a Mantine modal for in-app decisions; leave reload/tab-close prompts to the browser-controlled `beforeunload` integration.
- Do not use `alert` or `window.confirm`.
