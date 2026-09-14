# kimen-site

Standalone static site for [Kimen](https://github.com/flakstad/kimen), kept
separate from the CLI/runtime repository.

## Scope

- Product homepage
- One-page manual at `/docs/`
- A direct agent story based on keeping plaintext values out of the workspace
  and projecting them only when a process starts
- Production pages have no JavaScript, build system, analytics or runtime service
- Three deliberately different design studies live at `/studies/`

Stronger credential-backed agent operations remain a separate product and
architecture exploration in
[`docs/stronger-agent-operations.md`](docs/stronger-agent-operations.md). They
are not required to explain or use Kimen's current vault and projection model.

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
