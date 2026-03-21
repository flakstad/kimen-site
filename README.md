# kimen-site

Standalone static site for Kimen, intentionally separate from the CLI/runtime repository.

## Scope

- Home page
- Docs page at `/docs/`
- Links to the canonical GitHub source and release/docs material

## Local preview

```bash
cd /Users/andreas/Projects/kimen-site
python3 -m http.server 8080
# then open http://localhost:8080 and http://localhost:8080/docs/
```

## Deploy (GitHub Pages)

A workflow is included at `.github/workflows/pages.yml`.

1. Push this repo to GitHub.
2. In repository settings, enable GitHub Pages and set source to GitHub Actions.
3. Workflow deploys static files from repo root.

## Notes

- The site is deliberately simple and text-first.
- Root page is `index.html`.
- Docs page is `docs/index.html`.
- Adjust external repo/docs links if the canonical URLs change.
