# CF Stack Skills

This repository packages reusable Codex skills for TanStack Start applications on Cloudflare Workers.

- Keep each `SKILL.md` concise and below 500 lines.
- Put durable CF integration policy in the skills; defer framework API catalogs to upstream skills, CLIs, and `llms.txt` indexes.
- Run `npm run validate` after any change and `npm run validate:links` when changing upstream sources.
- Every change set in this repository must also bump `plugins/cf-stack/.codex-plugin/plugin.json`'s `version`: preserve the base version and replace the `+codex.<UTC timestamp>` suffix with a fresh timestamp so Codex can refresh its installed copy.
- After validation, reinstall the updated plugin yourself with `codex plugin add cf-stack@cf-stack-skills`. If this checkout is not registered as the marketplace, first run `codex plugin marketplace add <absolute repository root>`. Verify the installed version and skill files match this checkout, then tell the user to start a new Codex task to load the update.
- For requested changes and approved improvements in this repository, automatically commit the task's changes and push the current branch to its remote after the version bump, validation, and verified reinstall. This is standing authorization; preserve unrelated work and honor any explicit request to leave changes uncommitted or unpushed.
- Do not add starter application code, copied upstream documentation, `.opencode/skills`, or `.github/skills`.
