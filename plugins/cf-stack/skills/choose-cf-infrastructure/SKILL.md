---
name: choose-cf-infrastructure
description: Select the smallest suitable Cloudflare infrastructure for a TanStack Start or Workers application. Use when a request needs a new Cloudflare capability or asks which Cloudflare service to use for files, caching, asynchronous work, durable state, realtime coordination, analytics, AI, external databases, media, bot protection, networking, or platform architecture. Do not use for routine D1 schema and migration work, ordinary application features, or deployments with an already-selected infrastructure design.
---

# Choose CF infrastructure

Choose services from the current Cloudflare catalog without treating the catalog as a default stack. Recommend the smallest design that meets the stated requirement, then hand implementation to the relevant Cloudflare skill and product documentation.

## Discover the relevant services

1. Read the application's requirements, existing Wrangler configuration and bindings, package dependencies, data model, deployment environment, and operational constraints.
2. Use https://developers.cloudflare.com/llms.txt only to discover candidate products. It is an index, not API reference material.
3. Read each plausible product's own `llms.txt` before making a recommendation. Prefer installed Cloudflare skills and current Wrangler help for implementation details.
4. Avoid loading `llms-full.txt` during normal work. It is for offline indexing or unusually large-context use.

Consider a focused candidate when the requirement matches its core model:

- object/blob data: R2
- global, read-heavy key/value data: KV
- queued asynchronous work: Queues
- coordinated or per-entity state, alarms, or realtime sessions: Durable Objects
- durable, multi-step background processes: Workflows
- globally distributed access to an existing external database: Hyperdrive
- vector search or hosted inference: Vectorize or Workers AI
- high-cardinality application events: Workers Analytics Engine
- image or video delivery pipelines: Images or Stream
- human verification: Turnstile

Do not infer a service solely from a keyword. Compare the user's consistency, latency, retention, query, fan-out, scheduling, and operational requirements against the current product documentation.

## Recommend before changing infrastructure

For each viable design, assess:

- functional fit and failure behavior;
- data location, consistency, retention, and access patterns;
- local development and test support;
- binding/configuration impact and ongoing operations; and
- current limits, pricing, and availability when material to the decision.

State one recommended design, meaningful alternatives with their tradeoffs, the affected bindings/resources, and what remains uncertain. Do not turn a simple application into a multi-service architecture without a concrete requirement.

## Implement with explicit authority

- Obtain explicit authorization before provisioning, enabling paid services, creating remote resources, changing production bindings, or migrating remote data.
- After a service is selected, read its product index and use its maintained Cloudflare skill or Wrangler workflow. Do not copy its API catalog into this skill.
- Hand D1 schema and migration work to `$manage-cf-data`; use `$deploy-cf-app` for release preparation and deployment.
