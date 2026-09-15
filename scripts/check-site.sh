#!/usr/bin/env bash

set -euo pipefail

site_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
    if ".git" in path.parts:
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
    "deploy_staging(revision)",
    "Keep the deployment script. Remove the credential from it.",
    "What Kimen Teams sends to developers",
]
for text in access_required:
    if text not in access_page:
        raise SystemExit(f"access page is missing required product text: {text}")

em_dash = chr(0x2014)
em_dash_entities = ("&" + "mdash;", "&#" + "8212;")
for pattern in ("*.html", "*.md"):
    for path in sorted(Path(".").rglob(pattern)):
        if ".git" in path.parts:
            continue
        contents = path.read_text(encoding="utf-8")
        if em_dash in contents or any(entity in contents for entity in em_dash_entities):
            raise SystemExit(f"em dash is not allowed: {path}")

print(f"checked {len(pages)} HTML pages")
PY
