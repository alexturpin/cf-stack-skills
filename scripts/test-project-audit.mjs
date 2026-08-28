import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const auditPath = join(
  repositoryRoot,
  "plugins/cf-stack/skills/create-cf-app/scripts/audit-cf-project.mjs",
);
const fixture = await mkdtemp(join(tmpdir(), "cf-project-audit-"));
const runtimeVersion = process.versions.node;
const runtimeMajor = Number(runtimeVersion.split(".")[0]);

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

async function put(path, contents = "") {
  const target = join(fixture, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents);
}

function runAudit() {
  return spawnSync(process.execPath, [auditPath, "--no-auth", "--developer"], {
    cwd: fixture,
    encoding: "utf8",
  });
}

try {
  await put(
    "package.json",
    `${JSON.stringify(
      {
        name: "audit-fixture",
        private: true,
        packageManager: "pnpm@11.0.0",
        engines: { node: `>=${runtimeVersion} <${runtimeMajor + 1}` },
        scripts: Object.fromEntries(
          [
            "build",
            "cf:typegen",
            "db:check",
            "db:generate",
            "db:migrate:local",
            "db:migrate:remote",
            "db:query:local",
            "db:status:local",
            "db:status:remote",
            "dev",
            "format",
            "format:check",
            "lint",
            "lint:fix",
            "test",
            "typecheck",
            "validate",
          ].map((name) => [name, "true"]),
        ),
        dependencies: Object.fromEntries(requiredPackages.map((name) => [name, "latest"])),
      },
      null,
      2,
    )}\n`,
  );
  const manifest = JSON.parse(await readFile(join(fixture, "package.json"), "utf8"));
  manifest.scripts["db:migrate:local"] = "wrangler d1 migrations apply DB --local";
  manifest.scripts["db:migrate:remote"] = "wrangler d1 migrations apply DB --remote";
  manifest.scripts.typecheck = "tsc --noEmit";
  manifest.scripts["format:check"] = "oxfmt --check .";
  manifest.scripts.lint = "oxlint .";
  await put("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
  await put("pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
  await put(".node-version", `${runtimeVersion}\n`);
  await put(
    "AGENTS.md",
    "Use tanstack, wrangler, drizzle-kit, oxlint, oxfmt, tsc, and vitest through package scripts.\n",
  );
  await put(
    "src/root.tsx",
    'import "@mantine/notifications/styles.css";\nexport const root = <Notifications />;\n',
  );
  await put(
    "wrangler.jsonc",
    '{ "observability": { "enabled": true }, "d1_databases": [{ "migrations_dir": "drizzle" }] }\n',
  );
  await put("drizzle/0000_initial.sql", "SELECT 1;\n");
  await put(
    ".agents/skills/upstream/SKILL.md",
    "Vendored guidance may mention better-sqlite3, drizzle-kit migrate, and .wrangler/state.\n",
  );
  await put(
    "agent/skills/upstream/SKILL.md",
    "Vendored guidance may mention better-sqlite3, drizzle-kit push, and .wrangler/state.\n",
  );

  const passing = runAudit();
  if (passing.status !== 0 || !passing.stdout.includes("CF project contract passed.")) {
    throw new Error(`expected valid fixture to pass\n${passing.stdout}\n${passing.stderr}`);
  }
  if (passing.stderr.includes("migrations_pattern")) {
    throw new Error(`top-level SQL should not require migrations_pattern\n${passing.stderr}`);
  }

  await put("src/forbidden.ts", 'export const driver = "better-sqlite3";\n');
  const failing = runAudit();
  if (failing.status === 0 || !failing.stderr.includes("src/forbidden.ts references better-sqlite3")) {
    throw new Error(`expected application violation to fail\n${failing.stdout}\n${failing.stderr}`);
  }

  console.log("Validated generated-project audit behavior.");
} finally {
  await rm(fixture, { recursive: true, force: true });
}
