---
name: update-cf-skills
description: Update or check the installed CF Stack plugin for Codex or Claude Code from its configured marketplace. Use when the user asks to refresh CF Stack skills or check their installed version. Does not update application dependencies, upstream Cloudflare skills, or the agent application.
---

# Update CF Stack Skills

Refresh `cf-stack@cf-stack-skills` from its existing source and verify the installed copy. A request to check the version is read-only; a request to update authorizes the refresh and reinstall.

Use `$migrate-cf-project` when the request is to adopt changed CF guidance in an existing application's committed files. Refreshing this plugin does not migrate application artifacts or project-local skills.

## Identify the installation

1. Identify the active agent from session context. For Codex, run `codex plugin marketplace list` and `codex plugin list`. For Claude Code, inspect `claude plugin --help`, then its marketplace and installed-plugin listings (use JSON output where supported); retain the existing installation scope. Locate CF Stack's marketplace root, source plugin directory, installed status, and version. If the CLI differs, inspect `codex plugin --help` and the relevant subcommand help.
2. Determine whether the configured marketplace source is Git-backed or a local checkout using marketplace metadata and, if needed, only the relevant marketplace configuration. A Git snapshot is also a directory; its path alone does not establish the source type. Preserve the configured source and any ref or SHA pin.
3. Record the installed version or commit/cache identity before updating. Claude's manifest intentionally has no version; do not invent one. For a version-check request, report it and the known source version without refreshing or reinstalling. A cached source cannot establish whether a newer remote version exists.

If the installation or source cannot be identified, report what is missing and ask for the intended source. Do not replace an existing source with the public repository or install another copy by guessing.

## Refresh and reinstall

For a Git-backed marketplace in Codex, run these commands sequentially, proceeding only when each succeeds:

```sh
codex plugin marketplace upgrade cf-stack-skills
codex plugin add cf-stack@cf-stack-skills
```

For Claude Code, inspect current subcommand help and run `claude plugin marketplace update cf-stack-skills` followed by `claude plugin update cf-stack@cf-stack-skills`, retaining the existing scope. Consult https://code.claude.com/docs/en/discover-plugins for current installation/update behavior.

Use the actual marketplace name if the same plugin is registered under a different name. Refresh only that marketplace. A pinned source updates within that pin; moving to another ref needs a user request.

For a local checkout, refresh from that checkout using the active agent's supported update/install command (`codex plugin add cf-stack@cf-stack-skills` for Codex; inspect Claude's update help for its existing local marketplace and scope). Explain that this does not fetch remote changes. Preserve the checkout's edits and branch; pulling or publishing source changes is a separate repository task. Reinstalling a plugin does not require editing its source version.

If refresh or installation fails, report the failed step and actionable cause. Continue only after resolving that cause; avoid uninstalling the working copy or manually rewriting the cache/configuration as a retry.

## Verify and hand off

For Codex, run `codex plugin list` again and confirm the installed version matches the resolved source manifest. Locate the installed cache under the active Codex home (normally `~/.codex/plugins/cache/<marketplace>/cf-stack/<version>/`) and compare its manifest and skill files with the resolved source, using recursive comparison or hashes. Use the actual installed path when reported by Codex. Treat a missing cache, mismatched files, or unchanged version with changed content as unresolved rather than claiming success.

For Claude Code, inspect its plugin listing and installed path after updating; compare the installed manifest and skill files against the resolved source commit or local checkout. Report commit/cache identity instead of a missing manifest version. If the installed path or source cannot be verified, report that limitation rather than claiming a verified update.

Report the previous and installed versions or identities, whether the files matched, and whether the source was remote or local. If nothing changed, say the installation already matched that source. Tell the user to start a new session in the active agent to load the refreshed skill catalog; the current task continues with its existing catalog.
