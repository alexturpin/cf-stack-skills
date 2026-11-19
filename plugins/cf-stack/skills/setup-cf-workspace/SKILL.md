---
name: setup-cf-workspace
description: Prepare a computer and accounts for CF Stack development. Use for first-time onboarding, missing Git/Node/pnpm tools, GitHub account or repository setup, opening an agent workspace, or Cloudflare account/authentication prerequisites. Does not scaffold the app or deploy it.
---

# Set up a CF workspace

Inspect first and complete only the missing setup needed for the current task. Local development, GitHub backup, and Cloudflare publishing are stages of one workflow, not collaboration modes. Reuse working installations and accounts; defer Cloudflare setup until publishing is requested.

## Establish the workspace

- Identify the active agent, operating system, shell, writable workspace, installed tools, and existing repository. Use platform-appropriate official installation instructions; avoid assuming macOS or a particular package manager.
- Read existing project instructions and the user's stated collaboration preference. If absent, use the Developer / Guided builder choice in `create-cf-app`; do not infer ability or add another mode. Explain that Guided builder includes automatic verified commits and backups, while publishing follows the user's request. Honor narrower instructions.
- Ask what the user wants to build and, for a visual product, its intended look and feel. Ask a few questions at a time. Existing-site URLs and design examples are useful when relevant, not mandatory onboarding fields.
- Choose a dedicated application directory with the user, suggesting a sensible writable location when they have no preference. Keep applications outside this skill repository. Preserve existing files and unrelated machine settings.
- Perform available setup yourself within the request's authority. For account signup, browser authentication, installation permissions, or workspace selection that require the human, give the exact next action and wait only for the dependent work. Never ask for passwords or tokens in chat.

## Prepare local development

1. Check Git, Node.js, pnpm, and (when GitHub is in scope) `gh`. Install missing tools from official sources; reuse the existing version manager. Follow `create-cf-app` for the selected Node LTS and pinned pnpm versions rather than maintaining a second version policy here.
2. Verify tool versions in the shell the agent will actually use. Resolve PATH or runtime activation problems before claiming readiness.
3. Open or select the application folder in the active agent when tools permit. Otherwise give one short action to open it and resume. An installed CLI does not prove the agent has access to the folder.
4. Hand off scaffolding to `create-cf-app`. Keep the target empty until scaffolding; write application notes and initialize its repository afterwards. Local progress need not wait for optional account setup.

Done when the tools run and the agent can work in the intended location. Verify the local app URL after scaffolding, not before an app exists.

## Connect GitHub

1. Inspect `gh auth status`, repository state, and remotes without exposing credentials. Help the user create an account if needed and use `gh auth login` with browser authentication. Confirm the intended account and repository owner.
2. Confirm Git author identity; prefer repository-local configuration and respect email privacy preferences. Initialize Git only after scaffolding when no repository exists.
3. Create a private repository by default when repository creation is authorized by the setup request, or connect the intended existing remote. Check ignored secrets and review staged files before the first commit.
4. Follow the project's collaboration style for commits and pushes. Guided builder's backup policy is in the project contract; Developer keeps control of Git unless explicitly delegated. Inspect CI and hosting integrations before assuming any branch is safe for backup.
5. Verify an authorized push reached the intended remote branch. If pushing is not authorized or authentication is pending, report that state rather than claiming backup is configured.

## Prepare Cloudflare when needed

1. Help the user create or sign in to their own Cloudflare account. Check current plan limits and costs for the requested application; obtain approval before enabling paid services.
2. Use the project's local Wrangler and current CLI help for authentication. Preserve any configured named profile; honor project-specific profile instructions. Verify the intended account before provisioning resources.
3. If credentials are missing or expired, report the actual error and guide the required browser authentication; pause dependent operations until account verification succeeds. Keep secrets out of chat, logs, and Git.
4. Hand off to `deploy-cf-app` for resources, CI credentials, and deployment. Explain the publishing branch and public visibility before enabling automatic deployment. Account setup alone does not authorize a release or DNS change.

Done when authentication to the intended account is verified. Deployment readiness and the first live release are verified by `deploy-cf-app`.

## Preserve continuity

Record durable choices in the application's `AGENTS.md` after scaffolding: collaboration style, repository and deployment targets, and relevant account/profile identifiers, never credentials. Use the project contract's Claude instruction-loading rule. For Guided builder, keep brief progress notes and link them from `AGENTS.md` for resumed sessions.

Report what works, the preview URL when available, whether work is backed up or published, and any specific remaining human action. Do not claim installations, sign-ins, pushes, or deployments that were not verified.
