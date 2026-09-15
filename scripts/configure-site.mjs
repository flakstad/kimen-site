import {existsSync, writeFileSync} from "node:fs";
import {join, resolve} from "node:path";

const config = {
  posthogKey: process.env.KIMEN_POSTHOG_KEY || "",
  posthogHost: process.env.KIMEN_POSTHOG_HOST || "https://eu.i.posthog.com",
};

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch (_error) {
    return false;
  }
}

if (process.env.KIMEN_REQUIRE_EXTERNAL_CONFIG === "1") {
  if (!config.posthogKey.trim()) {
    throw new Error("KIMEN_POSTHOG_KEY must be configured before deployment.");
  }
  if (!isHttpsUrl(config.posthogHost)) {
    throw new Error("KIMEN_POSTHOG_HOST must be an HTTPS URL.");
  }
}

const outputDirectory = resolve(process.env.KIMEN_SITE_OUTPUT_DIR || ".");
if (!existsSync(outputDirectory)) {
  throw new Error(`Site output directory does not exist: ${outputDirectory}`);
}

writeFileSync(
  join(outputDirectory, "site-config.js"),
  `window.KIMEN_SITE_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
  "utf8",
);
