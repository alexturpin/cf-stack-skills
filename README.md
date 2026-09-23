# CF Stack Skills

An installable Codex skill suite for building opinionated applications using TanStack Start on Cloudflare Workers with Mantine, TanStack Query and Form, Zod, Drizzle D1, optional Better Auth and Lingui localization, and structured Workers observability.

The plugin contains integration policy and repeatable workflows. It deliberately delegates framework API reference material to maintained package skills, CLIs, and upstream `llms.txt` indexes.

## Install

```sh
codex plugin marketplace add alexturpin/cf-stack-skills
codex plugin add cf-stack@cf-stack-skills
```

Start a new task after installation so Codex receives the bundled skill catalog.

## Update

For installations from GitHub, refresh the marketplace and reinstall the plugin:

```sh
codex plugin marketplace upgrade cf-stack-skills
codex plugin add cf-stack@cf-stack-skills
```

Start a new Codex task to load the updated skills. Updates follow the marketplace's configured Git reference; a pinned tag or commit stays pinned.

You can also ask Codex: **“Use $update-cf-skills to update my CF Stack plugin.”** This skill is available after installing a version that includes it; older installations need the commands above first.

If your marketplace points at a local checkout, reinstalling uses that checkout's current files. Update the checkout separately when you want newer remote changes, then run `codex plugin add cf-stack@cf-stack-skills` and start a new task.

## Identify skill sources

CF Stack is an independent integration plugin, not an official Cloudflare skill collection. Its skills use **CF Stack:** display names. Codex also namespaces bundled skills under the plugin name, for example `cf-stack:build-cf-ui`; existing short skill IDs such as `$build-cf-ui` remain unchanged.

The application-creation workflow separately installs selected upstream Cloudflare skills, such as `workers-best-practices` and `wrangler`, into the project. Those retain their upstream names. Check the project's `skills-lock.json` for their source; updating CF Stack does not update these separately installed skills.

## Create a new application

Start the Codex task from the parent directory where new applications should live, or ensure Codex can write there. Invoke the skill explicitly or ask naturally:

```text
Use $create-cf-app to create a new application.
```

If the request does not already include them, the skill asks for the application name, parent directory, and collaboration style. It converts the name to a kebab-case folder/package name, shows the absolute target path, verifies the destination is absent or empty, and then runs the TanStack CLI to create that directory and configure the stack.

Choose **Developer** for concise technical collaboration with Git and releases left to you; this adds no collaboration section to the generated `AGENTS.md`. Choose **Guided builder** for plain-language updates, routine technical decisions made by Codex, and a runnable application for visual review. Guided mode still requires an explicit request before Codex pushes, deploys, changes secrets, provisions resources, or migrates remote data.

Guided projects also recognize `ENGINE ROOM:` at the start of a message as a one-message codeword for a concise, peer-to-peer technical answer. It does not change the saved collaboration style or authorize external actions.

For example, `Rental Concierge` under `/Users/alex/src` becomes `/Users/alex/src/rental-concierge`. The skill finishes by reporting the selected collaboration style, created path, resolved package versions, validation results, and development command.

## Improve skills after implementation

Use `$improve-cf-skills` to review a recent feature or fix for reusable improvements to CF Stack guidance. It presents evidence and concrete proposed edits, waits for your approval, then applies the selected changes and follows the repository's validation and reinstall rules.

## Develop

```sh
npm run validate
npm run validate:links
```

The plugin source is under `plugins/cf-stack`; `.agents/plugins/marketplace.json` makes this repository a Codex marketplace.
