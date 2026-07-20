---
name: build-cf-routes
description: Build or modify CF TanStack Start routes, layouts, loaders, server functions, middleware, SSR data prefetching, TanStack Query integration, redirects, errors, and protected route boundaries. Use when work touches file-based routing, route context, createServerFn, loader data, Query hydration, or authentication guards. Do not use for isolated Mantine styling or database-only schema work.
---

# Build CF routes

Follow the APIs of the installed TanStack versions. Keep this skill focused on CF composition rather than duplicating the route reference.

## Ground the change

1. Read `package.json`, the lockfile, router construction, root route, route tree generation, Query client setup, and nearby routes.
2. Inspect installed Intent skills and TanStack CLI documentation first:

```sh
npm exec tanstack -- search-docs "<query>" --library start --json
npm exec tanstack -- search-docs "<query>" --library router --framework react --json
npm exec tanstack -- doc <library> <path> --json
```

3. Fall back to https://tanstack.com/start/v1/llms.txt and https://tanstack.com/router/v1/llms.txt.
4. Confirm exact signatures from the installed package before writing code.

## Compose routes

- Preserve file-router conventions and generated route-tree ownership.
- Put reusable server operations in focused server-function modules rather than route components.
- Validate server-function inputs at the boundary with the installed Zod integration.
- Keep authorization checks on the server even when a route also redirects unauthenticated users.
- Use middleware for genuinely shared request/session concerns; avoid hiding route-specific behavior in global middleware.
- Use route context for request-scoped services such as the Query client.
- Return typed domain data or redirects/errors using current TanStack primitives; do not introduce obsolete JSON helpers.

## Coordinate Query and loaders

- Create a Query client per request/router instance, never as shared mutable SSR state.
- Define stable array query keys and reusable query option factories.
- Prefetch loader-required data with `ensureQueryData` or the installed equivalent.
- Use `useSuspenseQuery` when the loader guarantees the query; use ordinary pending/error handling when it does not.
- Keep loader dependencies explicit so searches, filters, and params invalidate correctly.
- Avoid fetching the same data independently in a loader and component.

## Protect routes

- Resolve sessions through a server-only helper.
- Redirect in `beforeLoad` or the current route guard for navigation UX.
- Recheck authorization inside protected server functions.
- Preserve the intended return location without accepting an unsafe external redirect.
- Keep public auth routes outside protected layout loops.

## Block unsafe navigation

- Use the installed TanStack Router `useBlocker` hook for unsaved changes and other conditional navigation guards; do not hand-roll `window.beforeunload` listeners.
- Verify the installed API because the current `useBlocker` API is experimental: https://tanstack.com/router/v1/docs/api/router/useBlockerHook.
- Let `useBlocker` manage browser `beforeunload` behavior through `enableBeforeUnload`. Keep it enabled only while data is actually at risk.
- For in-app navigation, use resolver mode and connect the blocker's `proceed` and `reset` controls to a Mantine confirmation modal. Do not use `window.confirm`, `alert`, or a custom browser-event implementation.
- Keep the native browser prompt for tab close, reload, and cross-origin exits; browsers do not allow a custom Mantine modal for that boundary.
- Disable or reset blocking immediately after a successful save or intentional discard.

## Handle states

- Define route-level pending, not-found, and error behavior where it improves the user experience.
- Let expected domain failures remain typed and actionable.
- Avoid leaking internal errors, secrets, SQL, or stack traces to route responses.
- Use Mantine skeletons with stable dimensions for pending layouts; use `$build-cf-ui` for nontrivial visual work.

## Verify

- Regenerate the route tree through the normal dev/build command; never edit generated route files.
- Test direct SSR navigation, client navigation, loader invalidation, and error behavior.
- Test blocked in-app navigation, proceed, cancel, successful-save reset, reload, and tab-close behavior when a blocker is used.
- Test unauthenticated and authenticated navigation for guarded routes.
- Run `npm run typecheck`, relevant tests, and `npm run build`.
