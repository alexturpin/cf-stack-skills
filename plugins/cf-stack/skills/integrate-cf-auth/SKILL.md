---
name: integrate-cf-auth
description: Add, generate, upgrade, or troubleshoot Better Auth in a CF TanStack Start application using Drizzle and Cloudflare D1. Use for auth schema generation, catch-all auth routes, client SDK setup, cookie integration, sessions, providers, middleware, protected layouts, login/signup flows, or auth migrations. Do not use for generic authorization rules unrelated to Better Auth.
---

# Integrate CF authentication

Use Better Auth's maintained skill and current documentation for APIs. Keep this skill focused on its CF boundaries.

## Ground the integration

1. Read installed Better Auth, adapter, Drizzle, TanStack Start, and Wrangler versions.
2. Read the existing auth config, client, catch-all route, session helper, middleware, schema, and migration scripts.
3. Install or invoke Better Auth's maintained skill when available.
4. Consult:
   - https://better-auth.com/llms.txt
   - https://better-auth.com/docs/concepts/cli
   - https://better-auth.com/docs/integrations/tanstack

Confirm exact imports from installed packages. Prefer the current minimal Drizzle adapter package/import when supported.

## Configure the server

- Keep the Better Auth configuration in a server-only module with a narrow import graph the CLI can load.
- Use the Drizzle adapter so auth tables share the application schema and migration workflow.
- Mount the catch-all handler at the current TanStack Start `/api/auth/$` route convention.
- Place `tanstackStartCookies()` last in the Better Auth plugin array when current docs require it.
- Keep secrets and provider credentials in Cloudflare secrets or local development variables, never committed files.
- Generate a high-entropy secret through the Auth CLI or an approved secret tool.

## Generate the schema

Use the current Auth CLI instead of hand-writing Better Auth tables:

```sh
npx auth@latest info --json
npx auth@latest generate --config <auth-config> --output <schema-output> --yes
npm run db:generate
npm run db:check
npm run db:migrate:local
```

The Auth CLI supports TypeScript path aliases and stubs `cloudflare:workers`; do not add `better-sqlite3` or a private Wrangler SQLite path just to load the configuration.

Never use the Auth CLI's direct migrate command for the Drizzle adapter. Drizzle generates SQL and Wrangler applies it.

## Integrate sessions

- Use the Better Auth client SDK for browser login, signup, logout, and client session state.
- Resolve trusted sessions in a server-only helper from request headers/cookies.
- Use TanStack middleware for shared session context where it reduces duplication.
- Redirect unauthenticated navigation at protected route boundaries.
- Recheck authentication and authorization inside protected server functions.
- Keep authentication separate from domain authorization; a valid session does not grant every action.

## Verify

- Test schema generation from a clean checkout.
- Apply auth migrations to local D1 with Wrangler.
- Test signup, login, logout, session refresh, invalid credentials, expired sessions, and protected direct navigation.
- Test cookie behavior in local development and the deployed HTTPS environment configuration.
- Run `npm run typecheck`, relevant tests, and `npm run build`.
- Do not provision providers, write remote secrets, apply remote migrations, or deploy without explicit authority.

