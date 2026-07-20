import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const pluginRoot = new URL("../plugins/cf-stack/", import.meta.url);
const skillsRoot = new URL("../plugins/cf-stack/skills/", import.meta.url);
const expectedSkills = [
  "build-cf-forms",
  "build-cf-routes",
  "build-cf-ui",
  "create-cf-app",
  "deploy-cf-app",
  "integrate-cf-auth",
  "maintain-cf-tooling",
  "manage-cf-data",
];

const failures = [];
const fail = (message) => failures.push(message);
const readJson = async (url) => JSON.parse(await readFile(url, "utf8"));

const plugin = await readJson(new URL(".codex-plugin/plugin.json", pluginRoot));
if (plugin.name !== "cf-stack") fail("plugin name must be cf-stack");
if (!/^0\.1\.0(?:\+codex\.[0-9A-Za-z.-]+)?$/.test(plugin.version)) {
  fail("plugin version must use the 0.1.0 base and at most one Codex cachebuster");
}
if (plugin.skills !== "./skills/") fail("plugin skills path must be ./skills/");
if (!plugin.author?.name || !plugin.interface?.displayName) fail("plugin publisher metadata is incomplete");

const marketplace = await readJson(new URL(".agents/plugins/marketplace.json", root));
const entry = marketplace.plugins?.find((item) => item.name === "cf-stack");
if (!entry) fail("marketplace is missing cf-stack");
if (entry?.source?.path !== "./plugins/cf-stack") fail("marketplace source must be ./plugins/cf-stack");
if (!entry?.policy?.installation || !entry?.policy?.authentication || !entry?.category) {
  fail("marketplace entry is missing policy or category metadata");
}

const triggerEvals = await readJson(new URL("evals/skill-triggers.json", root));
for (const name of expectedSkills) {
  const cases = triggerEvals[name];
  if (!cases || cases.positive?.length < 2 || cases.negative?.length < 1) {
    fail(`${name} needs at least two positive and one negative trigger eval`);
  }
}

const createSkill = await readFile(new URL("create-cf-app/SKILL.md", skillsRoot), "utf8");
const projectContract = await readFile(new URL("create-cf-app/references/project-contract.md", skillsRoot), "utf8");
const projectAudit = await readFile(new URL("create-cf-app/scripts/audit-cf-project.mjs", skillsRoot), "utf8");
for (const phrase of ["Developer", "Guided builder", "Never infer technical ability"]) {
  if (!createSkill.includes(phrase)) fail(`create-cf-app must define collaboration choice: ${phrase}`);
}
for (const phrase of [
  "## Collaboration style",
  "The primary user prefers guided product development.",
  "When a message begins with `ENGINE ROOM:`",
  "Apply this override to that message only",
  "Do not push, deploy, modify secrets, provision resources, or migrate remote data unless the user explicitly asks",
]) {
  if (!projectContract.includes(phrase)) fail(`project contract is missing guided behavior: ${phrase}`);
}
for (const flag of ["--guided", "--developer"]) {
  if (!projectAudit.includes(flag)) fail(`project audit must support ${flag}`);
}

const foundSkills = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
if (JSON.stringify(foundSkills) !== JSON.stringify(expectedSkills)) {
  fail(`expected skills ${expectedSkills.join(", ")}; found ${foundSkills.join(", ")}`);
}

for (const name of expectedSkills) {
  const skillDir = new URL(`${name}/`, skillsRoot);
  const markdown = await readFile(new URL("SKILL.md", skillDir), "utf8");
  const yaml = await readFile(new URL("agents/openai.yaml", skillDir), "utf8");
  const lines = markdown.split(/\r?\n/).length;
  if (lines > 500) fail(`${name}/SKILL.md has ${lines} lines; maximum is 500`);
  if (!markdown.startsWith(`---\nname: ${name}\n`)) fail(`${name} has invalid frontmatter name`);
  if (!/^description: .+/m.test(markdown)) fail(`${name} has no description`);
  if (markdown.includes("[TODO:")) fail(`${name} contains a TODO placeholder`);
  if (!yaml.includes(`$${name}`)) fail(`${name}/agents/openai.yaml default prompt must mention $${name}`);
}

for (const legacyPath of [".opencode", join(".github", "skills")]) {
  try {
    await readdir(new URL(`../${legacyPath}/`, import.meta.url));
    fail(`legacy path must not exist: ${legacyPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

if (failures.length) {
  console.error(failures.map((message) => `- ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated cf-stack plugin and ${expectedSkills.length} skills.`);
}
