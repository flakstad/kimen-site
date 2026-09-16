#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
site_root="${1:-$repository_root}"

cd "$site_root"

python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlparse


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.title_depth = 0
        self.title = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            self.ids.add(values["id"])
        if tag == "a" and "href" in values:
            self.links.append(values["href"])
        if tag == "title":
            self.title_depth += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.title_depth -= 1

    def handle_data(self, data):
        self.text.append(data)
        if self.title_depth:
            self.title.append(data)


pages = {}
for path in sorted(Path(".").rglob("*.html")):
    if ".git" in path.parts or "_site" in path.parts:
        continue
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    if not "".join(parser.title).strip():
        raise SystemExit(f"missing title: {path}")
    if re.search(r"\bActions?\b", " ".join(parser.text)):
        raise SystemExit(f"obsolete product term in public text: {path}")
    pages[path.resolve()] = parser

for source, parser in pages.items():
    for href in parser.links:
        parsed = urlparse(href)
        if parsed.scheme or href.startswith("//"):
            continue
        target_text = unquote(parsed.path)
        if not target_text:
            target = source
        else:
            target = (source.parent / target_text).resolve()
            if target.is_dir():
                target = target / "index.html"
            elif not target.suffix:
                target = target / "index.html"
        if not target.exists():
            raise SystemExit(f"broken local link: {source} -> {href}")
        if parsed.fragment and target.suffix == ".html":
            target_parser = pages.get(target)
            if target_parser is None:
                target_parser = PageParser()
                target_parser.feed(target.read_text(encoding="utf-8"))
            if parsed.fragment not in target_parser.ids:
                raise SystemExit(
                    f"missing fragment: {source} -> {href}"
                )

homepage = Path("index.html").read_text(encoding="utf-8")
required = [
    "Kimen",
    ".kmap",
    "kimen run",
]
for text in required:
    if text not in homepage:
        raise SystemExit(f"homepage is missing required product text: {text}")

access_page = Path("access/index.html").read_text(encoding="utf-8")
access_required = [
    "Kimen Operations",
    'restart_worker("payments")',
    "The work already exists. Access is the problem.",
    "The project names it. The environment makes it real.",
    "Why this is more than a named script",
    "Keep the automation you already have.",
    "Change the binding once for the whole team.",
]
for text in access_required:
    if text not in access_page:
        raise SystemExit(f"access page is missing required product text: {text}")

if 'mailto:hello@kimen.systems' not in access_page:
    raise SystemExit("access page is missing the Operations email CTA")
if 'kimen_operations_contact_clicked' not in access_page:
    raise SystemExit("access page is missing contact intent measurement")

site_javascript = Path("site.js").read_text(encoding="utf-8")
if 'capture("kimen_site_page_viewed")' not in site_javascript:
    raise SystemExit("site analytics is missing the namespaced page-view event")
if '!event.startsWith("kimen_")' not in site_javascript:
    raise SystemExit("site analytics does not enforce the Kimen event namespace")
for path, parser in pages.items():
    contents = path.read_text(encoding="utf-8")
    for event in re.findall(r'data-event="([^"]+)"', contents):
        if not event.startswith("kimen_"):
            raise SystemExit(f"analytics event is missing Kimen namespace: {path} -> {event}")

for required_file in (
    "home.css",
    "robots.txt",
    "sitemap.xml",
    "site-config.js",
    "site.js",
):
    if not Path(required_file).is_file():
        raise SystemExit(f"site is missing required file: {required_file}")

em_dash = chr(0x2014)
em_dash_entities = ("&" + "mdash;", "&#" + "8212;")
for pattern in ("*.html", "*.md"):
    for path in sorted(Path(".").rglob(pattern)):
        if ".git" in path.parts or "_site" in path.parts:
            continue
        contents = path.read_text(encoding="utf-8")
        if em_dash in contents or any(entity in contents for entity in em_dash_entities):
            raise SystemExit(f"em dash is not allowed: {path}")

indexed_pages = {
    "index.html": "https://kimen.systems/",
    "access/index.html": "https://kimen.systems/access/",
    "docs/index.html": "https://kimen.systems/docs/",
    "guides/index.html": "https://kimen.systems/guides/",
    "guides/keep-development-secrets-out-of-git/index.html":
        "https://kimen.systems/guides/keep-development-secrets-out-of-git/",
    "guides/env-files-are-not-secret-management/index.html":
        "https://kimen.systems/guides/env-files-are-not-secret-management/",
    "guides/runtime-configuration-without-env-files/index.html":
        "https://kimen.systems/guides/runtime-configuration-without-env-files/",
    "guides/python-environment-variables-without-env-files/index.html":
        "https://kimen.systems/guides/python-environment-variables-without-env-files/",
    "guides/nodejs-environment-variables-without-env-files/index.html":
        "https://kimen.systems/guides/nodejs-environment-variables-without-env-files/",
    "guides/clojure-repl-secrets-with-kimen/index.html":
        "https://kimen.systems/guides/clojure-repl-secrets-with-kimen/",
    "privacy/index.html": "https://kimen.systems/privacy/",
}
for filename, canonical in indexed_pages.items():
    contents = Path(filename).read_text(encoding="utf-8")
    if '<meta name="robots" content="index,follow"' not in contents:
        raise SystemExit(f"indexed page is missing robots directive: {filename}")
    if f'<link rel="canonical" href="{canonical}"' not in contents:
        raise SystemExit(f"indexed page has wrong canonical URL: {filename}")

sitemap = Path("sitemap.xml").read_text(encoding="utf-8")
for canonical in indexed_pages.values():
    if canonical not in sitemap:
        raise SystemExit(f"sitemap is missing indexed page: {canonical}")

print(f"checked {len(pages)} HTML pages")
PY
