# kimen-site

Standalone static site for [Kimen](https://github.com/flakstad/kimen), kept
separate from the CLI/runtime repository.

## Scope

- Product homepage
- One-page manual at `/docs/`
- A direct developer story based on keeping plaintext values out of the
  workspace and projecting them only when a runtime starts
- A separate `/agents/` product path for bounded operations and team governance
- Production pages have no JavaScript, build system, analytics or runtime service
- Three deliberately different design studies live at `/studies/`

The agent product path extends the same model from project-declared values to
project-declared operations. The implementation boundary and security questions
are recorded in
[`docs/stronger-agent-operations.md`](docs/stronger-agent-operations.md), but
protocol design and broker implementation wait for external product signal.

The complete product, positioning, commercial, design and validation thesis is
kept in [`docs/product-direction.md`](docs/product-direction.md). Update that
document when a product decision changes so the reasoning is not trapped in a
chat transcript.

The primary domain is `kimen.systems`; `CNAME` prepares the GitHub Pages custom
domain mapping.

## Local preview

```bash
python3 -m http.server 8080
```

Then open:

- <http://localhost:8080/>
- <http://localhost:8080/docs/>
- <http://localhost:8080/agents/>
- <http://localhost:8080/404.html>
- <http://localhost:8080/studies/> — three alternative composition studies
- <http://localhost:8080/studies/synthesis/> — complete product-story study

## Validation

Run the local site check:

```bash
./scripts/check-site.sh
```

The check validates internal links, referenced local files, document titles and
HTML parsing.

## GitHub Pages handoff

The workflow at `.github/workflows/pages.yml` deploys static files from the
repository root after a push to `main`.

Andreas performs publication and external configuration:

1. Review and merge the site branch.
2. Push `main` to GitHub.
3. In repository settings, select GitHub Actions as the Pages source.
4. Configure the `kimen.systems` DNS records GitHub requests.
5. Verify the custom domain and HTTPS in Pages settings.
