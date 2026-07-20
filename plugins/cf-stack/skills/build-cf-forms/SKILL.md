---
name: build-cf-forms
description: Build or modify CF forms using TanStack Form, Mantine field components, and Zod validation on client and server. Use for form state, reusable field adapters, submission, validation, server errors, accessibility, or replacing Mantine Form. Do not use for read-only UI or database schema changes without a form.
---

# Build CF forms

Use TanStack Form for state and Mantine for presentation. Do not install or use `@mantine/form`.

## Ground the form

1. Read installed TanStack Form, Mantine, and Zod versions plus existing field adapters.
2. Use installed Intent knowledge or TanStack CLI docs before writing APIs:

```sh
npm exec tanstack -- search-docs "<query>" --library form --framework react --json
```

3. Fall back to https://tanstack.com/form/latest/llms.txt, https://mantine.dev/llms.txt, and https://zod.dev/llms.txt.

## Model validation

- Import Zod as `import * as z from "zod"` for CF consistency.
- Prefer top-level Zod APIs. Consider Zod Mini only for an explicit, measured bundle constraint.
- Define one domain schema when client and server rules are truly identical.
- Keep authorization, uniqueness, database state, and other trusted checks on the server.
- Convert server validation failures into typed field or form errors without exposing internals.

## Compose fields

- Build small adapters that translate TanStack field state into current Mantine input props.
- Set accessible labels, descriptions, required state, and error messages.
- Mark touched/dirty state according to the installed TanStack Form API.
- Keep value conversion explicit for dates, numbers, booleans, and nullable values.
- Use stable field names aligned with the submitted schema.
- Avoid a universal field abstraction that hides materially different widgets.

## Submit safely

- Add `noValidate` to the HTML form when Zod/TanStack Form owns validation, while preserving accessible errors.
- Disable or indicate submission without making the form impossible to recover after failure.
- Prevent double submission for non-idempotent operations.
- Call a validated server function rather than writing directly to a database from the client.
- Reset or redirect only after confirmed success.
- Preserve entered values when the server returns a correctable error.

For dirty forms that can lose work, use TanStack Router `useBlocker` rather than attaching `beforeunload` manually. Use resolver mode with a Mantine confirmation modal for in-app navigation, keep browser-controlled `beforeunload` behavior for reload/tab close, and disable the blocker after a successful submission or discard.

## Verify

- Test valid, invalid, empty, boundary, and server-rejected submissions.
- Test keyboard-only use, focus on errors, async pending state, and repeated submission.
- When navigation blocking is present, test proceed, cancel, save, discard, reload, and tab-close behavior.
- Confirm the server rejects invalid input independently of client validation.
- Run `npm run typecheck`, relevant tests, and `npm run build`.
