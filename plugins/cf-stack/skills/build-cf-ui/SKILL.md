---
name: build-cf-ui
description: Build or refactor CF user interfaces with the latest installed Mantine major, typed TanStack Router navigation, layouts, AppShell, modals, notifications, Tabler icons, skeleton loading states, themes, and CSS Modules. Use for Mantine components, providers, navigation adapters, responsive UI, or visual interaction work. Do not use for TanStack Form behavior or route data architecture unless UI integration requires it.
---

# Build CF UI

Use the installed Mantine major and current documentation. Do not carry Mantine 8 examples into a newer application.

## Ground the change

1. Read installed Mantine versions, provider setup, global style imports, theme, existing link adapters, CSS Modules, and adjacent components.
2. Select documentation matching the installed major. Start with https://mantine.dev/llms.txt and follow only relevant pages.
3. Use official Mantine combobox or custom-component skills when installed and applicable. Do not load Mantine's form skill for CF forms.

## Compose the application shell

- Mount the Mantine provider and required package styles once at the root.
- Install `@mantine/notifications` at the same current major as the other Mantine packages.
- Import `@mantine/notifications/styles.css` once at the root after `@mantine/core/styles.css`.
- Render exactly one `Notifications` component inside `MantineProvider`; it is a component, not a provider wrapper.
- Preserve the modal manager used by the application.
- Keep theme tokens in the theme and component-specific layout in CSS Modules or component props.
- Prefer Mantine responsive APIs and semantic components over ad-hoc div systems.
- Prefer Mantine responsive props or component-scoped CSS Modules whose cascade order is understood. Verify computed visibility when Mantine display utilities and application CSS target the same element.
- Use Tabler React icons consistently; provide accessible labels for icon-only controls.

## Integrate typed navigation

- Adapt Mantine anchors, buttons, and navigation components with TanStack Router's installed typed link API.
- Keep `to`, params, search, hash, and active state typed end to end.
- Centralize reusable link adapters rather than adding casts at every call site.
- Do not suppress link type errors with broad `@ts-expect-error` comments; correct the adapter types or isolate a documented upstream mismatch.
- Use actual links for navigation and buttons for actions.

## Loading and feedback

- Use Skeleton for loading UI and give it the same dimensions as final content to avoid layout shift.
- Use Mantine Notifications for non-blocking success, failure, background-operation, and global feedback. Use a stable notification ID when a pending notification must be updated on completion.
- Keep field validation and persistent actionable errors inline instead of duplicating them as toasts.
- Use the shared Mantine modal manager for confirmations and decisions; use local modal state for feature-local interactions.
- Do not use `alert` or `window.confirm`. For navigation blocking, pair a Mantine confirmation modal with TanStack Router `useBlocker` resolver controls.
- Preserve keyboard operation, focus management, labels, and reduced-motion behavior.

Consult the installed-major notifications documentation before changing setup or APIs: https://mantine.dev/x/notifications/.

## Keep forms separate

Use `$build-cf-forms` for validation and form state. Mantine supplies presentation; TanStack Form owns the form model. Never add `@mantine/form` to a CF application.

## Verify

- Check current Mantine API signatures rather than trusting copied examples.
- Test narrow and wide layouts, keyboard navigation, active links, pending states, notification deduplication/update behavior, and modal focus.
- When browser tooling is available and the product does not define its own viewport matrix, verify representative widths around 360, 768, and 1280 pixels. Check the actual breakpoint boundaries, not only the smallest and largest screenshots.
- Assert that `document.documentElement.scrollWidth <= document.documentElement.clientWidth` unless horizontal scrolling is an intentional, contained interaction. Inspect computed display/visibility for responsive alternatives so hidden controls do not disagree with visible content.
- Verify long translated or user-generated labels at the narrow viewport when that content is in scope.
- Run `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, relevant tests, and `pnpm run build`.
