---
name: localize-cf-app
description: Add, modify, or troubleshoot localization in a CF TanStack Start application using Lingui. Use only when the user explicitly requests localization, multiple languages, locale negotiation, translated catalogs, or Lingui. Do not introduce i18n as a default scaffold requirement or ask about it during unrelated application work.
---

# Localize a CF application

Localization is opt-in. Do not add Lingui, locale routing, or translation infrastructure unless the user requested localization or the existing application already uses it.

## Ground the integration

1. Read installed Lingui, React, Vite, and TanStack Start versions; the root SSR/client setup; route search or path conventions; cookie helpers; existing catalogs; and localization scripts.
2. Confirm the requested locales, canonical/source locale, fallback behavior, and whether locale must appear in shareable URLs. Do not invent additional locales.
3. Read current Lingui documentation and installed CLI help before writing APIs: https://lingui.dev/llms.txt.

## Keep one catalog workflow

- Use Lingui extraction and compiled catalogs as the translation source of truth.
- Author messages through extractable Lingui primitives with static IDs and source messages. Do not maintain a parallel handwritten runtime catalog or a duplicate message inventory.
- If the application wraps Lingui components, prove extraction still discovers every message or configure an official extractor. A runtime-only custom wrapper is not sufficient.
- Keep the source locale's messages canonical and preserve translator context where wording is ambiguous.
- Add stable `i18n:extract`, `i18n:compile`, and CI catalog checks using locally installed CLIs and pnpm scripts.

## Negotiate locale safely

- Define one precedence order appropriate to the product, commonly an explicit route choice, then a persisted cookie, then `Accept-Language`, then the source locale.
- Validate every locale against the supported list before loading a catalog or setting a cookie.
- Create request-scoped Lingui state for SSR; do not share one mutable server i18n instance across concurrent requests.
- Activate and load the locale before rendering the provider. Do not call `load` or `activate` during React render.
- Hydrate the client with the same locale used by SSR to avoid content mismatch or a language flash.
- Preserve the current path, typed search parameters, and hash when switching locale. Put locale in the URL only when the product needs shareable or indexable language-specific URLs.

## Translate the complete experience

- Translate visible copy, accessible names, validation and server errors, notifications, email templates, empty states, and document metadata.
- Use locale-aware `Intl` formatting for dates, times, numbers, and plural rules instead of concatenating translated fragments.
- Keep organization and product names untranslated unless the user supplies localized names.
- Design controls and layouts for longer translations and bidirectional text when an RTL locale is actually in scope.

## Verify

- Run extraction and compilation from a clean checkout and fail on missing required translations.
- Test first visit with representative `Accept-Language` headers, invalid locale input, cookie persistence, manual switching, SSR hydration, and fallback behavior.
- Verify every supported locale at narrow and wide viewports, including long labels and validation states.
- Confirm there are no hydration, render-time state update, or missing-message warnings in the browser console.
- Run `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, relevant tests, and `pnpm run build`.
