---
name: improve-cf-skills
description: Review recent implementation work for reusable improvements to CF Stack skills and propose concrete edits for user approval. Use for a post-implementation retrospective, capturing lessons from a feature or fix, or checking what CF guidance should improve after recent work. Do not use for ordinary application code review or automatically after every implementation.
---

# Improve CF Skills

Turn evidence from recent implementation work into focused CF Stack guidance. The first deliverable is a proposal; apply skill changes only after the user approves the specific proposals.

## Establish the evidence

- Use the implementation identified by the user: a feature, fix, diff, commit range, or pull request. Otherwise use the just-completed work in this conversation and state the scope. If the scope remains ambiguous, ask which implementation to examine before drawing conclusions.
- Read the relevant changes, surrounding integration code, applicable project instructions, and available validation results. Separate observed outcomes from assumptions; code that exists is not proof that its approach worked.
- Identify the CF skills that guided the work or should have covered it. Read their relevant instructions and references. Look for missing steps, misleading guidance, repeated friction, stale assumptions, and successful integration patterns worth preserving.
- Locate the editable CF Stack source repository using project context or configured marketplace metadata. Compare its current guidance with the installed copy when both are available: a stale installation may require a refresh rather than a new rule. Treat plugin cache files as evidence, not an editing destination. If source is unavailable, provide proposals against the installed guidance and identify the source access needed to apply them.

## Select reusable improvements

- Prefer durable CF integration policy over application-specific choices, one-off workarounds, copied upstream documentation, or framework API catalogs. Keep project conventions in that project's instructions unless the user requests a broader policy.
- For each candidate, explain how the existing guidance contributed to the issue or failed to cover the need. If the guidance was already sufficient, distinguish an execution mistake from a skill defect; propose clearer wording only when evidence supports it.
- Verify version-sensitive technical claims against the project's installed versions and current primary upstream sources before recommending a rule. Mark unresolved claims as questions, not requirements.
- Propose the smallest useful change to an existing skill or reference. Suggest a new skill only for a distinct, reusable workflow with its own discovery trigger. Consolidate overlapping proposals and omit changes already present in the source.
- A review may find no worthwhile skill changes. Say so with a brief explanation rather than inventing improvements.

## Propose before editing

Present a short numbered list. Each proposal includes:

- **Evidence:** the implementation file, diff, user correction, or validation outcome that motivates it.
- **Target and edit:** the skill/reference path and exact proposed wording or a compact before/after diff.
- **Benefit and scope:** what future implementations gain and when the guidance applies.

Ask which proposals the user wants applied, then wait. A request to review, learn from, or improve the skills authorizes investigation and proposals; it does not approve edits that have not yet been presented. Apply only the selected proposals. If approval refers to concrete proposals already presented in this conversation, proceed without asking again. No proposals means no approval question is needed.

## Apply approved proposals

- Re-read the destination repository's instructions and current target files. If intervening changes materially alter a proposal, present the revised proposal before applying it.
- Edit the source skill or reference, preserving unrelated work. Update discovery metadata and trigger examples when the skill's scope changes. Use the available skill-authoring guidance when needed.
- Follow the source repository's version-bump, validation, and reinstall rules. Validate upstream links when changing sources. Report what was applied, validation results, and whether the installed plugin was refreshed; when refreshed, tell the user to start a new task to load it.
- Keep application fixes and Git publishing outside this retrospective unless separately requested.
