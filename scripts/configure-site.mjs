import {writeFileSync} from "node:fs";

const config = {
  formEndpoint: process.env.KIMEN_FORM_ENDPOINT || "",
  posthogKey: process.env.KIMEN_POSTHOG_KEY || "",
  posthogHost: process.env.KIMEN_POSTHOG_HOST || "https://eu.i.posthog.com",
};

writeFileSync(
  "site-config.js",
  `window.KIMEN_SITE_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
  "utf8",
);
