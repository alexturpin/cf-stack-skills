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
if (!/^pnpm@\d/.test(pkg.packageManager ?? "")) {
  fail("package.json packageManager must pin pnpm");
}
const selectedNodeVersion = await readFile(resolve(root, ".node-version"), "utf8")
  .then((value) => value.trim().replace(/^v/, ""))
  .catch(() => "");
if (!/^\d+\.\d+\.\d+$/.test(selectedNodeVersion)) {
  fail(".node-version must contain the resolved active-LTS Node.js version");
} else {
  const selectedNodeMajor = Number(selectedNodeVersion.split(".")[0]);
  if (process.versions.node !== selectedNodeVersion) {
    fail(
      `audit must run with Node.js ${selectedNodeVersion} from .node-version; found ${process.versions.node}`,
    );
  }
  const engineRange = pkg.engines?.node ?? "";
  const expectedEngineRange = `>=${selectedNodeVersion} <${selectedNodeMajor + 1}`;
  if (engineRange !== expectedEngineRange) {
    fail(`package.json engines.node must be ${expectedEngineRange}`);
  }
}
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
  await stat(resolve(root, "pnpm-lock.yaml"));
} catch {
  fail("pnpm project must commit pnpm-lock.yaml");
}
for (const lockfile of ["package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "bun.lock", "bun.lockb"]) {
  try {
    await stat(resolve(root, lockfile));
    fail(`pnpm project must not retain ${lockfile}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
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

const ignored = new Set([".git", ".wrangler", "coverage", "dist", "node_modules", ".output"]);
const ignoredProjectSkillRoots = new Set([".agents", ".claude", ".codex", "agent"]);
const textExtensions = new Set([".js", ".json", ".jsonc", ".md", ".mjs", ".mts", ".ts", ".tsx", ".toml", ".yaml", ".yml"]);
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    if (directory === root && ignoredProjectSkillRoots.has(entry.name)) continue;
    if (entry.name === "pnpm-lock.yaml") continue;
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
  const observabilityEnabled =
    /["']?observability["']?\s*:\s*\{[^}]*["']?enabled["']?\s*:\s*true/.test(text) ||
    /^\[observability\][\s\S]*?^enabled\s*=\s*true/m.test(text);
  if (!observabilityEnabled) {
    fail("Wrangler configuration must enable Workers observability");
  }
  const migrationsDirectory = text.match(
    /["']?migrations_dir["']?\s*[:=]\s*["']([^"']+)["']/,
  )?.[1];
  if (migrationsDirectory && !text.includes("migrations_pattern")) {
    const migrationRoot = resolve(root, migrationsDirectory);
    const sqlFiles = [];
    async function collectSql(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) await collectSql(path);
        else if (entry.name.endsWith(".sql")) sqlFiles.push(path);
      }
    }
    try {
      await collectSql(migrationRoot);
      if (sqlFiles.some((file) => /[\\/]/.test(relative(migrationRoot, file)))) {
        warnings.push("Wrangler config needs migrations_pattern for nested migration SQL");
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      warnings.push(`migration directory does not exist: ${migrationsDirectory}`);
    }
  }
}

if (warnings.length) console.warn(warnings.map((message) => `warning: ${message}`).join("\n"));
if (failures.length) {
  console.error(failures.map((message) => `- ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("CF project contract passed.");
}
