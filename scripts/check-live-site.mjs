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
  ["/guides/", "Start with the problem you have."],
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
if (/"formEndpoint":\s*""/.test(config)) {
  failures.push("the deployed form endpoint is empty");
}
if (/"posthogKey":\s*""/.test(config)) {
  failures.push("the deployed PostHog key is empty");
}

if (failures.length > 0) {
  console.error("Live site check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Live site check passed for ${baseUrl.origin}`);
