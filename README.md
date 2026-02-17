# kimen-site

Standalone static site for Kimen (marketing + docs gateway), intentionally separate from the CLI/runtime repository.

## Scope

- Product landing page
- Brand narrative including "why the name Kimen"
- Current product scope/positioning (local-first, no required signup)
- Links to canonical repo/docs (replace placeholders before launch)

## Local preview

```bash
cd /Users/andreas/Projects/kimen-site
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (GitHub Pages)

A workflow is included at `.github/workflows/pages.yml`.

1. Push this repo to GitHub.
2. In repository settings, enable GitHub Pages and set source to GitHub Actions.
3. Workflow deploys static files from repo root.

## Customization checklist

- Replace placeholder GitHub/docs links in `index.html`.
- Add your canonical social preview image and meta tags.
- Optional: add custom domain and `CNAME`.
