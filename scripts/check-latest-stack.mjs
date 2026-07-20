import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const directory = await mkdtemp(join(tmpdir(), "cf-latest-stack-"));
const packages = [
  "@better-auth/drizzle-adapter",
  "@cloudflare/vite-plugin",
  "@cloudflare/vitest-pool-workers",
  "@mantine/core",
  "@mantine/hooks",
  "@mantine/modals",
  "@mantine/notifications",
  "@tabler/icons-react",
  "@tanstack/cli",
  "@tanstack/intent",
  "@tanstack/react-form",
  "@tanstack/react-query",
  "@tanstack/react-router",
  "@tanstack/react-start",
  "better-auth",
  "drizzle-kit",
  "drizzle-orm",
  "oxfmt",
  "oxlint",
  "oxlint-tsgolint",
  "react",
  "react-dom",
  "typescript",
  "vite",
  "vitest",
  "wrangler",
  "zod",
];

const manifest = {
  name: "cf-latest-stack-compatibility",
  private: true,
  type: "module",
  dependencies: Object.fromEntries(packages.map((name) => [name, "latest"])),
};

try {
  await writeFile(join(directory, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const result = spawnSync(
    "npm",
    ["install", "--ignore-scripts", "--strict-peer-deps", "--no-audit", "--no-fund"],
    { cwd: directory, encoding: "utf8", timeout: 300_000 },
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  else {
    const lock = JSON.parse(await readFile(join(directory, "package-lock.json"), "utf8"));
    for (const name of packages) {
      const version = lock.packages?.[`node_modules/${name}`]?.version;
      console.log(`${name}@${version ?? "unresolved"}`);
      if (!version) process.exitCode = 1;
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}

