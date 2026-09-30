---
name: migrate-cf-project
description: Bring an existing CF application's committed guidance, project-local skills, and configuration up to date with CF Stack policy using public Git history. Use for adopting recent CF skill changes in an initialized repo or auditing scaffold drift. Does not merely refresh the installed plugin or upgrade all dependencies.
---

# Migrate a CF project

Translate changes in CF Stack guidance into focused updates to an existing application. The public source is [alexturpin/cf-stack-skills](https://github.com/alexturpin/cf-stack-skills); neither an installed CF Stack plugin nor its author’s local checkout is required for comparison.

## Establish scope and provenance

1. Read the application's instructions, Git status, `AGENTS.md`, package scripts, relevant configuration, `skills-lock.json`, and project-local skill sources. Preserve unrelated edits, application-specific conventions, explicit CF skill exclusions, and the existing collaboration style.
2. Distinguish the request: an audit/check produces findings without changing project files; a request to migrate/update the project authorizes relevant local edits and validation. Plugin refreshes belong to `$update-cf-skills`. A generic request to “update skills” that leaves the destination unclear needs clarification before mutation.
3. Default to artifacts produced or prescribed by CF skills: agent guidance, selected upstream skills, package scripts, runtime/CI settings, provider/style setup, and Wrangler/Drizzle configuration. Include application behavior only when a changed rule requires it and the request covers it; identify wider refactors separately. Preserve optional feature choices such as auth, email, and localization.
4. Read `.cf-stack/skills-state.json` if present; use [provenance.md](references/provenance.md) for its meaning and update rules. Prefer a recorded reviewed commit or a user-specified baseline. The currently installed plugin version and the application's creation date do not prove which guidance its files incorporated.

## Resolve the upstream comparison

Use an isolated temporary checkout of the public repository with history available:

```sh
git clone --filter=blob:none https://github.com/alexturpin/cf-stack-skills.git <temporary-source-directory>
git -C <temporary-source-directory> rev-parse HEAD
```

Respect a user-selected source/ref or explicit pin instead of moving it. Otherwise use the public default branch. Resolve the target to a full commit SHA once and read files at that commit throughout the migration. A local source is usable when explicitly selected; use committed snapshots and identify any requested uncommitted guidance separately. Do not edit the source checkout or installed plugin cache.

For a verified baseline, inspect both the net diff and the intervening commits:

```sh
git -C <temporary-source-directory> log --reverse --format='%H %s' <baseline>..<target> -- plugins/cf-stack/skills
git -C <temporary-source-directory> diff <baseline> <target> -- plugins/cf-stack/skills
```

- Verify both commits exist and the baseline is an ancestor of the target. For a missing commit, changed source, or divergent history, establish a compatible comparison or use the baseline-unknown workflow; report the limitation.
- Read changed instructions, references, and helpers at the pinned target. Use commit patches for intent and artifact mapping. Apply the final policy, accounting for later reversals or replacements, rather than replaying every intermediate edit.
- With no reliable baseline, compare current project artifacts against the target's applicable artifact-producing guidance, starting with `create-cf-app` and its project contract. Use relevant path history to explain differences; label this an initial audit rather than inventing a “since last update” range. Arbitrary last-N commits or a timestamp cutoff cannot establish complete coverage.
- A fetched source snapshot or GitHub commit/compare API is an alternative when cloning is unavailable. Pin reads to the same SHA and disclose missing history or files. If evidence is incomplete, report supported findings without claiming a complete comparison or advancing the review baseline.

## Map policy to project files

Account for every upstream change in the comparison range and every outstanding item in the recorded state. Group related changes into a compact mapping of source path/commit, project artifact, and disposition: needs an edit, already satisfied, guidance-only, intentional exception, outside scope, or unresolved. For an initial audit, cover every applicable artifact requirement instead of every historical commit.

Examples of artifact effects include updated `AGENTS.md` sections, a changed focused Skills CLI selection, a corrected package script, or required Mantine stylesheet/provider setup. Improvements to how an agent discovers an API may need no committed project change.

- Compare the old upstream requirement, the new requirement, and the project's actual implementation when a baseline exists. Preserve local customization while carrying forward the policy change; generated files are not safe to overwrite wholesale.
- Use the target guidance for affected areas. Load corresponding installed CF skills when available and consistent with that target; otherwise read the relevant source skill/reference directly. Inspect the project's installed packages and verify version-sensitive APIs against primary documentation before changing code.
- Treat latest-version resolution during initial scaffolding as a creation default, not permission to upgrade every package in an existing app. Make dependency changes only when necessary for an applicable policy migration or separately requested.
- Use `skills-lock.json` and installer metadata to distinguish upstream project skills from the CF Stack plugin. Inspect the current Skills CLI help before refreshing the selected named skills at project scope for Codex. Preserve unrelated skills, custom contents, intentional pins, and other agents' setup; avoid an indiscriminate update of all skills. CF Stack's commit SHA is not the upstream skill repositories' revision.
- A new optional-service rule applies only when that service is already in scope. Preserve resource names, account identifiers, environment structure, migration history, and secret values.

For an audit, deliver this mapping and stop without writing provenance. For an update, explain the concrete edits briefly and apply the authorized local work. Ask only about unresolved choices that materially change requirements; continue independent edits while waiting.

## Apply and verify

- Edit application artifacts in place. Let the appropriate generators own route trees, binding types, auth schemas, and migration snapshots. Let installers own upstream skill files; review their resulting diff for local customization loss before accepting it.
- Update lockfiles when dependencies change. Run relevant project checks and `pnpm run validate` where defined. Keep failing checks and pre-existing findings distinct; resolve migration-caused failures before claiming completion.
- The target's `create-cf-app/scripts/audit-cf-project.mjs` can help find contract drift. Read it before execution and interpret its results against the existing project's scope and exceptions: an initial-scaffold audit is evidence, not permission to rebuild the app or add optional features.
- Keep remote migrations, provisioning, secrets, deployments, commits, and pushes within the user's existing authorization and repository instructions. A project migration alone does not authorize those actions.
- After a complete comparison and successful validation of applied changes, update the provenance record. Preserve unresolved items and deliberate exceptions so the next run revisits them even if their originating changes precede the new baseline. A partial or failed migration must not advance the baseline.

Report the source and baseline/target SHAs, updated artifacts, validation results, preserved exceptions, and outstanding work. If no edits are needed, say whether the project already meets the compared policy. Mention a new Codex task only when installed skills or active agent guidance changed and need reloading.
