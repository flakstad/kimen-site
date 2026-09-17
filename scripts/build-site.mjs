import {cpSync, existsSync, mkdirSync, rmSync} from "node:fs";
import {basename, isAbsolute, join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputArgument = process.argv[2] || "_site";
const outputDirectory = resolve(repositoryRoot, outputArgument);
const relativeOutput = relative(repositoryRoot, outputDirectory);

if (
  isAbsolute(outputArgument) ||
  relativeOutput.startsWith("..") ||
  relativeOutput === "" ||
  basename(outputDirectory) !== "_site"
) {
  throw new Error("The build output must be a directory named _site inside the repository.");
}

const publicFiles = [
  "404.html",
  "CNAME",
  "access/access.css",
  "access/index.html",
  "agents/index.html",
  "docs/index.html",
  "docs/docs.css",
  "docs/profiles-and-runtime-projection/index.html",
  "docs/vaults-secrets-and-sessions/index.html",
  "favicon.svg",
  "home.css",
  "index.html",
  "robots.txt",
  "site-config.js",
  "site.css",
  "site.js",
  "sitemap.xml",
  "styles.css",
];

const publicDirectories = ["guides", "privacy"];

rmSync(outputDirectory, {recursive: true, force: true});
mkdirSync(outputDirectory, {recursive: true});

for (const file of publicFiles) {
  const source = join(repositoryRoot, file);
  if (!existsSync(source)) throw new Error(`Missing public file: ${file}`);
  const destination = join(outputDirectory, file);
  mkdirSync(resolve(destination, ".."), {recursive: true});
  cpSync(source, destination);
}

for (const directory of publicDirectories) {
  const source = join(repositoryRoot, directory);
  if (!existsSync(source)) throw new Error(`Missing public directory: ${directory}`);
  cpSync(source, join(outputDirectory, directory), {recursive: true});
}

console.log(`Built public site at ${relativeOutput}`);
