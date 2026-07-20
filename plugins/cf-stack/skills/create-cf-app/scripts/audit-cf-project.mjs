import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const fail = (message) => failures.push(message);
const hasAuth = process.argv.includes("--auth");
const hasNoAuth = process.argv.includes("--no-auth");
const hasGuided = process.argv.includes("--guided");
const hasDeveloper = process.argv.includes("--developer");
if (hasAuth && hasNoAuth) fail("pass only one of --auth or --no-auth");
if (hasGuided && hasDeveloper) fail("pass only one of --guided or --developer");
const expectedAuth = hasAuth ? true : hasNoAuth ? false : undefined;
const expectedCollaboration = hasGuided ? "guided" : hasDeveloper ? "developer" : undefined;

const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const packages = { ...pkg.dependencies, ...pkg.devDependencies };
const requiredPackages = [
  "@mantine/core",
  "@mantine/notifications",
  "@tanstack/react-form",
  "@tanstack/react-query",
  "@tanstack/react-router",
  "@tanstack/react-start",
  "drizzle-kit",
  "drizzle-orm",
  "oxfmt",
  "oxlint",
  "oxlint-tsgolint",
  "typescript",
  "wrangler",
  "zod",
];
const forbiddenPackages = ["better-sqlite3", "eslint", "prettier", "@mantine/form"];

for (const name of requiredPackages) if (!packages[name]) fail(`missing package: ${name}`);
for (const name of forbiddenPackages) if (packages[name]) fail(`forbidden default package: ${name}`);
if (expectedAuth === true && !packages["better-auth"]) fail("auth audit requested but better-auth is absent");
if (expectedAuth === false && packages["better-auth"]) fail("no-auth audit requested but better-auth is present");

const requiredScripts = [
  "build", "cf:typegen", "db:check", "db:generate", "db:migrate:local",
  "db:migrate:remote", "db:query:local", "db:status:local", "db:status:remote",
  "dev", "format", "format:check", "lint", "lint:fix", "test", "typecheck", "validate",
];
for (const name of requiredScripts) if (!pkg.scripts?.[name]) fail(`missing package script: ${name}`);

if (!/--local/.test(pkg.scripts?.["db:migrate:local"] ?? "")) fail("db:migrate:local must pass --local");
if (!/--remote/.test(pkg.scripts?.["db:migrate:remote"] ?? "")) fail("db:migrate:remote must pass --remote");
if (!/tsc\s+--noEmit/.test(pkg.scripts?.typecheck ?? "")) fail("typecheck must use stable tsc --noEmit");
if (!/oxfmt/.test(pkg.scripts?.["format:check"] ?? "")) fail("format:check must use oxfmt");
if (!/oxlint/.test(pkg.scripts?.lint ?? "")) fail("lint must use oxlint");

try {
  await stat(resolve(root, "package-lock.json"));
} catch {
  fail("npm project must commit package-lock.json");
}

const agentText = await readFile(resolve(root, "AGENTS.md"), "utf8").catch(() => "");
for (const cli of ["tanstack", "wrangler", "drizzle-kit", "oxlint", "oxfmt", "tsc", "vitest"]) {
  if (!agentText.includes(cli)) fail(`AGENTS.md does not expose CLI: ${cli}`);
}
const collaborationHeading = "## Collaboration style";
const guidedSignals = [
  "The primary user prefers guided product development.",
  "Communicate in plain language",
  "When a message begins with `ENGINE ROOM:`",
  "Apply this override to that message only",
  "When the user asks to publish, share, or go live",
  "Do not push, deploy, modify secrets, provision resources, or migrate remote data unless the user explicitly asks",
];
if (expectedCollaboration === "guided") {
  if (!agentText.includes(collaborationHeading)) fail("guided AGENTS.md is missing its collaboration heading");
  for (const signal of guidedSignals) {
    if (!agentText.includes(signal)) fail(`guided AGENTS.md is missing: ${signal}`);
  }
}
if (expectedCollaboration === "developer" && agentText.includes(collaborationHeading)) {
  fail("developer AGENTS.md must omit the collaboration-style section");
}

const ignored = new Set([".git", ".wrangler", "dist", "node_modules", ".output", "coverage"]);
const textExtensions = new Set([".js", ".json", ".jsonc", ".md", ".mjs", ".mts", ".ts", ".tsx", ".toml", ".yaml", ".yml"]);
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    if (entry.name === "package-lock.json") continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if ([...textExtensions].some((extension) => entry.name.endsWith(extension))) files.push(path);
  }
}
await walk(root);

let notificationStyles = 0;
let notificationComponents = 0;
for (const file of files) {
  const text = await readFile(file, "utf8");
  const name = relative(root, file);
  if (text.includes(".wrangler/state")) fail(`${name} reaches into private Wrangler state`);
  if (text.includes("better-sqlite3")) fail(`${name} references better-sqlite3`);
  if (/drizzle-kit\s+(migrate|push)/.test(text)) fail(`${name} applies D1 through Drizzle Kit`);
  if (/\.(?:[cm]?[jt]s|tsx|jsx)$/.test(name)) {
    if (/addEventListener\s*\(\s*["']beforeunload["']/.test(text)) {
      fail(`${name} hand-rolls beforeunload instead of using TanStack Router useBlocker`);
    }
    if (/\b(?:window\.)?(?:alert|confirm)\s*\(/.test(text)) {
      fail(`${name} uses alert/confirm instead of Mantine UI`);
    }
    notificationStyles += text.split("@mantine/notifications/styles.css").length - 1;
    notificationComponents += text.match(/<Notifications(?:\s|\/|>)/g)?.length ?? 0;
  }
}

if (notificationStyles !== 1) fail(`expected one Mantine notifications stylesheet import; found ${notificationStyles}`);
if (notificationComponents !== 1) fail(`expected one root Notifications component; found ${notificationComponents}`);

const wranglerConfig = files.find((file) => /wrangler\.(jsonc?|toml)$/.test(file));
if (!wranglerConfig) fail("missing Wrangler configuration");
else {
  const text = await readFile(wranglerConfig, "utf8");
  if (!text.includes("migrations_dir")) fail("Wrangler D1 binding is missing migrations_dir");
  if (!text.includes("migrations_pattern")) warnings.push("Wrangler config has no migrations_pattern; confirm migrations are top-level SQL files");
}

if (warnings.length) console.warn(warnings.map((message) => `warning: ${message}`).join("\n"));
if (failures.length) {
  console.error(failures.map((message) => `- ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("CF project contract passed.");
}
