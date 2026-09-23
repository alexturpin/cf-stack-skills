---
name: update-cf-skills
description: Update or check the installed CF Stack Codex plugin from its configured marketplace. Use when the user asks to refresh CF Stack skills or check their installed version. Does not update application dependencies, upstream Cloudflare skills, or the Codex app.
---

# Update CF Stack Skills

Refresh `cf-stack@cf-stack-skills` from its existing source and verify the installed copy. A request to check the version is read-only; a request to update authorizes the refresh and reinstall.

## Identify the installation

1. Run `codex plugin marketplace list` and `codex plugin list`. Locate CF Stack's marketplace root, source plugin directory, installed status, and version. If the CLI differs, inspect `codex plugin --help` and the relevant subcommand help.
2. Determine whether the configured marketplace source is Git-backed or a local checkout using marketplace metadata and, if needed, only the relevant marketplace configuration. A Git snapshot is also a directory; its path alone does not establish the source type. Preserve the configured source and any ref or SHA pin.
3. Record the installed version before updating. For a version-check request, report it and the known source version without refreshing or reinstalling. A cached source cannot establish whether a newer remote version exists.

If the installation or source cannot be identified, report what is missing and ask for the intended source. Do not replace an existing source with the public repository or install another copy by guessing.

## Refresh and reinstall

For a Git-backed marketplace, run these commands sequentially, proceeding only when each succeeds:

```sh
codex plugin marketplace upgrade cf-stack-skills
codex plugin add cf-stack@cf-stack-skills
```

Use the actual marketplace name if the same plugin is registered under a different name. Refresh only that marketplace. A pinned source updates within that pin; moving to another ref needs a user request.

For a local checkout, reinstall its current files with `codex plugin add cf-stack@cf-stack-skills`. Explain that this does not fetch remote changes. Preserve the checkout's edits and branch; pulling or publishing source changes is a separate repository task. Reinstalling a plugin does not require editing its source version.

If refresh or installation fails, report the failed step and actionable cause. Continue only after resolving that cause; avoid uninstalling the working copy or manually rewriting the cache/configuration as a retry.

## Verify and hand off

Run `codex plugin list` again and confirm the installed version matches the resolved source manifest. Locate the installed cache under the active Codex home (normally `~/.codex/plugins/cache/<marketplace>/cf-stack/<version>/`) and compare its manifest and skill files with the resolved source, using recursive comparison or hashes. Use the actual installed path when reported by Codex. Treat a missing cache, mismatched files, or unchanged version with changed content as unresolved rather than claiming success.

Report the previous and installed versions, whether the files matched, and whether the source was remote or local. If nothing changed, say the installation already matched that source. Tell the user to start a new Codex task to load the refreshed skill catalog; the current task continues with its existing catalog.
