# Project review provenance

Use a committed `.cf-stack/skills-state.json` to remember a completed comparison. This is a review cursor, not proof that every CF convention has been adopted. Read the application files on every run.

## Fields

| Field | Meaning |
|---|---|
| `schemaVersion` | `1` for this format. Preserve unknown fields; report unsupported schema versions rather than silently rewriting them. |
| `source` | Git source URL whose history was reviewed; normally `https://github.com/alexturpin/cf-stack-skills.git`. |
| `reviewedCommit` | Full SHA of the target reviewed comprehensively for applicable project artifacts. |
| `pluginVersion` | Version from that commit's `plugins/cf-stack/.codex-plugin/plugin.json`; informational, not the installed plugin version. |
| `exceptions` | Intentional deviations, each with `sourcePath`, `requirement`, and `reason`. |
| `pending` | Unresolved or deferred requirements, each with `sourcePath`, `requirement`, and `reason`. |

Use source paths relative to the CF Stack repository. Record only migration rationale; keep credentials, secret values, machine-specific paths, and temporary checkout locations out of the record.

For example, a project may retain a deliberate tooling exception and defer a broader UI conversion. Store the actual verified SHA and manifest version when writing this shape:

```json
{
  "schemaVersion": 1,
  "source": "https://github.com/alexturpin/cf-stack-skills.git",
  "reviewedCommit": "<verified full target SHA>",
  "pluginVersion": "<version from the target manifest>",
  "exceptions": [],
  "pending": []
}
```

## Reading a baseline

- Verify the recorded source and commit in the source history. A plugin timestamp version may help locate a candidate commit, but matching the version alone does not establish project adoption.
- A user-supplied baseline can replace an absent record; disclose that it is supplied rather than independently established. An inferred candidate remains uncertain until supported by project provenance or confirmed by the user.
- `exceptions` and `pending` always re-enter the comparison. Check whether their rationale still applies against current guidance and project code; preserve intentional deviations unless the user authorizes changing them.

## Writing the cursor

- Write only during an authorized project update, after all applicable artifact guidance was reviewed and applied edits passed validation. An initial baseline-unknown comparison can establish the first cursor under the same conditions.
- A complete review may leave explicitly recorded exceptions or pending items. This advances the review cursor, not a claim of full compliance; report those items to the user. Retain each item until resolved or explicitly withdrawn.
- A narrowly scoped request, unavailable evidence, interrupted comparison, or failed validation does not justify moving a comprehensive cursor. Keep the previous cursor (or leave it absent), and report any partial changes and remaining work.
- If a later run finds no relevant policy changes and no outstanding items, keep the record unchanged. Avoid timestamp-only churn.
