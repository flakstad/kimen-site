# kimen-site

Standalone static site for [Kimen](https://github.com/flakstad/kimen), kept
separate from the CLI/runtime repository.

## Scope

- Product and market-probe homepage
- One-page manual at `/docs/`
- Honest separation between shipped vault/projection features and the proposed
  constrained-actions direction
- Production pages have no JavaScript, build system, analytics or runtime service
- Three deliberately different design studies live at `/studies/`

The primary domain is `kimen.systems`; `CNAME` prepares the GitHub Pages custom
domain mapping.

## Local preview

```bash
python3 -m http.server 8080
```

Then open:

- <http://localhost:8080/>
- <http://localhost:8080/docs/>
- <http://localhost:8080/404.html>
- <http://localhost:8080/studies/> — three alternative composition studies
- <http://localhost:8080/studies/synthesis/> — complete product-story study

## Validation

Run the local site check:

```bash
./scripts/check-site.sh
```

The check validates internal links, referenced local files, document titles,
HTML parsing and that planned Actions are marked as exploration.

## GitHub Pages handoff

The workflow at `.github/workflows/pages.yml` deploys static files from the
repository root after a push to `main`.

Andreas performs publication and external configuration:

1. Review and merge the site branch.
2. Push `main` to GitHub.
3. In repository settings, select GitHub Actions as the Pages source.
4. Configure the `kimen.systems` DNS records GitHub requests.
5. Verify the custom domain and HTTPS in Pages settings.

Do not put credentials or private workflow details in the public Actions
discovery issue linked from the homepage.
