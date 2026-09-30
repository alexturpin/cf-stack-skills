const urls = [
  "https://github.com/alexturpin/cf-stack-skills",
  "https://nodejs.org/dist/index.json",
  "https://tanstack.com/start/v1/llms.txt",
  "https://tanstack.com/router/v1/llms.txt",
  "https://tanstack.com/router/v1/docs/api/router/useBlockerHook",
  "https://tanstack.com/query/latest/llms.txt",
  "https://tanstack.com/form/latest/llms.txt",
  "https://mantine.dev/llms.txt",
  "https://mantine.dev/dates/getting-started/",
  "https://mantine.dev/x/notifications/",
  "https://lingui.dev/llms.txt",
  "https://orm.drizzle.team/llms.txt",
  "https://better-auth.com/llms.txt",
  "https://zod.dev/llms.txt",
  "https://developers.cloudflare.com/workers/llms.txt",
  "https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/",
  "https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments",
  "https://docs.github.com/en/actions/reference/workflows-and-actions/variables",
  "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary",
  "https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy",
  "https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/",
  "https://developers.cloudflare.com/workers/configuration/secrets/",
  "https://developers.cloudflare.com/workers/observability/",
  "https://developers.cloudflare.com/d1/llms.txt",
  "https://oxc.rs/docs/guide/usage/linter.md",
  "https://oxc.rs/docs/guide/usage/formatter.md",
];

const failures = [];
for (const url of urls) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "cf-stack-skills-link-check" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) failures.push(`${url}: HTTP ${response.status}`);
    else console.log(`ok ${response.status} ${url}`);
  } catch (error) {
    failures.push(`${url}: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (failures.length) {
  console.error(failures.map((message) => `- ${message}`).join("\n"));
  process.exitCode = 1;
}
