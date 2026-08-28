---
name: instrument-cf-observability
description: Add, standardize, or troubleshoot structured application logging and Cloudflare Workers observability. Use for console event schemas, request correlation, redaction, sampling, Wrangler observability configuration, mutation or auth audit events, and production log verification. Do not use for client-only debugging or selecting a separate analytics product.
---

# Instrument CF observability

Use Workers' built-in observability and standard `console.*` methods before adding another logging service. Keep events useful for operations without turning logs into a copy of application data.

## Ground the change

1. Read Wrangler configuration, environment overrides, server entry points, middleware, auth hooks, server functions, existing logger helpers, and tests.
2. Inspect the installed Wrangler schema and help before changing observability fields.
3. Use current Workers observability documentation for behavior and limits: https://developers.cloudflare.com/workers/observability/.

## Define one event contract

- Emit JSON-serializable objects through the appropriate `console.debug`, `console.info`, `console.warn`, or `console.error` method.
- Give every event a stable dotted name and an explicit outcome when an operation can succeed or fail.
- Add a bounded request correlation ID, method, and normalized route where request context exists. Prefer an existing trusted request ID or Cloudflare Ray ID; generate a local fallback when necessary.
- Log stable internal identifiers only when they materially help investigation. Do not log raw request or response bodies, query strings, cookies, authorization headers, OTPs, tokens, passwords, secrets, email addresses, or email bodies.
- Centralize recursive key redaction and safe error-code extraction in a server-only logger helper. Treat unknown errors as untrusted data; do not serialize whole error objects or stacks by default.
- Keep field names and event shapes stable enough for filtering. Avoid prose-only log messages for meaningful application events.

## Instrument useful boundaries

Instrument:

- authentication and authorization outcomes without credentials or identity PII;
- privileged or administrative changes;
- server-side writes and their final outcomes;
- queue, workflow, mail, or other external handoffs; and
- unexpected failures at a boundary that can attach correlation metadata.

Do not log every successful read, static asset request, health check, validation keystroke, or render. Avoid duplicate events from both a generic wrapper and the wrapped operation unless they represent distinct lifecycle stages.

## Configure sampling

- Enable Workers observability in Wrangler configuration for applications with server behavior worth operating.
- Make sampling an explicit environment decision. Local and preview environments can favor complete visibility; production sampling should reflect traffic, cost, and incident needs.
- Keep configuration in version control and environment-specific differences explicit. Do not create remote destinations, Logpush jobs, or paid analytics resources without authorization.

## Verify

- Test event names, outcomes, correlation fields, redaction, and safe error handling.
- Exercise representative success, rejection, and failure paths locally and inspect emitted structured events.
- Confirm sensitive fixtures never appear in captured output.
- Run `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, relevant tests, and `pnpm run build`.
- When a deployment is authorized, verify representative events with Wrangler tail without exposing payloads.
