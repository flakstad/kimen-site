const baseUrl = new URL(process.argv[2] || "https://kimen.systems/");
const failures = [];

async function fetchText(path, expectedStatus = 200) {
  const url = new URL(path, baseUrl);
  try {
    const response = await fetch(url, {redirect: "follow"});
    if (response.status !== expectedStatus) {
      failures.push(`${url.href} returned ${response.status}, expected ${expectedStatus}`);
    }
    return {response, text: await response.text(), url};
  } catch (error) {
    failures.push(`${url.href} could not be fetched: ${error.message}`);
    return {response: null, text: "", url};
  }
}

const pages = [
  ["/", "Keep secrets out of your project."],
  ["/access/", "The work already exists. Access is the problem."],
  ["/docs/", "Five-minute setup"],
  ["/guides/", "Start with the Kimen workflow."],
  ["/guides/coding-agents-and-local-secrets/", "Coding agents can read more than code."],
  ["/guides/kimen-vaults-secrets-and-sessions/", "Expect a passphrase prompt for every invocation."],
  ["/guides/kimen-profiles-and-runtime-projection/", "One profile. Four ways to supply a runtime."],
  ["/guides/kimen-vs-1password-and-cloud-secret-managers/", "Use the secret system which fits the owner and the runtime."],
  ["/guides/python-environment-variables-without-env-files/", "Keep the Python code. Change how it starts."],
  ["/guides/nodejs-environment-variables-without-env-files/", "Start the same Node.js application through Kimen."],
  ["/guides/clojure-repl-secrets-with-kimen/", "Clojure projects assemble configuration in several ways."],
  ["/guides/keep-development-secrets-out-of-git/", "Separate the requirement from the value."],
  ["/guides/env-files-are-not-secret-management/", "The file becomes a distribution system."],
  ["/guides/runtime-configuration-without-env-files/", "The application only needs the value while it runs."],
  ["/privacy/", "Anonymous website analytics"],
];

for (const [path, expectedText] of pages) {
  const {response, text, url} = await fetchText(path);
  if (response && !response.headers.get("content-type")?.includes("text/html")) {
    failures.push(`${url.href} is not served as HTML`);
  }
  if (!text.includes(expectedText)) {
    failures.push(`${url.href} is missing expected content: ${expectedText}`);
  }
  if (text.includes('name="robots" content="noindex')) {
    failures.push(`${url.href} is unexpectedly marked noindex`);
  }
}

const {text: robots} = await fetchText("/robots.txt");
if (!robots.includes("Sitemap: https://kimen.systems/sitemap.xml")) {
  failures.push("robots.txt does not reference the production sitemap");
}

const {text: sitemap} = await fetchText("/sitemap.xml");
for (const [path] of pages) {
  if (path === "/privacy/") continue;
  const canonical = new URL(path, "https://kimen.systems").href;
  if (!sitemap.includes(canonical)) {
    failures.push(`sitemap.xml is missing ${canonical}`);
  }
}

const {text: config} = await fetchText("/site-config.js");
if (/"posthogKey":\s*""/.test(config)) {
  failures.push("the deployed PostHog key is empty");
}

if (failures.length > 0) {
  console.error("Live site check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Live site check passed for ${baseUrl.origin}`);
