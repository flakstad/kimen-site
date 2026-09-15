# kimen-site

Standalone static site for [Kimen](https://github.com/flakstad/kimen), kept
separate from the CLI/runtime repository.

## Scope

- Product homepage
- One-page manual at `/docs/`
- A direct developer story based on keeping plaintext values out of the
  workspace and projecting them only when a runtime starts
- A separate `/access/` product path for Kimen Operations and team governance
- Search-oriented Core guides at `/guides/`
- A privacy explanation at `/privacy/`
- Production pages remain static and use a small plain-JavaScript layer for
  optional privacy-conscious analytics
- Three deliberately different design studies live at `/studies/`

The `/access/` page uses a prefilled email to `hello@andreasflakstad.no` instead
of a form backend. PostHog can record the contact click, but it never receives
the draft or sent email contents.

The Kimen Operations path tests whether teams want the same named operation to
work across developers, CI, workflows and agents without distributing the
credential behind it. It extends the same model from project-declared values to
project-declared operations. The
implementation boundary and security questions are recorded in
[`docs/stronger-agent-operations.md`](docs/stronger-agent-operations.md), but
protocol design and broker implementation wait for external product signal.

The complete product, positioning, commercial, design and validation thesis is
kept in [`docs/product-direction.md`](docs/product-direction.md). Update that
document when a product decision changes so the reasoning is not trapped in a
chat transcript.

Search demand, competitor category boundaries, acquisition channels,
instrumentation and validation gates are recorded in
[`docs/market-demand-and-validation.md`](docs/market-demand-and-validation.md).

The exact external publication, PostHog and Search Console steps
are recorded in [`docs/launch-handoff.md`](docs/launch-handoff.md).

The primary domain is `kimen.systems`; `CNAME` prepares the GitHub Pages custom
domain mapping.

## Local preview

```bash
python3 -m http.server 8080
```

Then open:

- <http://localhost:8080/>
- <http://localhost:8080/docs/>
- <http://localhost:8080/access/>
- <http://localhost:8080/guides/>
- <http://localhost:8080/privacy/>
- <http://localhost:8080/404.html>
- <http://localhost:8080/studies/>, three alternative composition studies
- <http://localhost:8080/studies/synthesis/>, complete product-story study

## Validation

Run the local site check:

```bash
./scripts/check-site.sh
node scripts/build-site.mjs
./scripts/check-site.sh _site
```

The check validates internal links, referenced local files, document titles and
HTML parsing.

After publication, verify the live pages and deployed configuration:

```bash
node scripts/check-live-site.mjs https://kimen.systems/
```

## Measurement configuration

[`site.js`](site.js) records anonymous page and intent events only when a
PostHog key is configured and the visitor has not enabled Global Privacy
Control or Do Not Track. It disables person profiles and IP-based geolocation.
The Operations email draft and its contents never enter analytics.

Local source keeps all external configuration empty in
[`site-config.js`](site-config.js). The Pages workflow generates the deployed
configuration from:

- repository variable `KIMEN_POSTHOG_KEY`;
- optional repository variable `KIMEN_POSTHOG_HOST`, which defaults to the EU
  PostHog endpoint.

Creating the analytics project is an external configuration step for Andreas.
The repository does not create or mutate that service.

## GitHub Pages handoff

The workflow at `.github/workflows/pages.yml` creates a public `_site` artifact
after a push to `main`. Only production pages and assets are copied. Internal
reports, design studies and retired variants are not published.

Andreas performs publication and external configuration:

1. Review and merge the site branch.
2. Push `main` to GitHub.
3. In repository settings, select GitHub Actions as the Pages source.
4. Configure the `kimen.systems` DNS records GitHub requests.
5. Configure the PostHog variables described above.
6. Verify the custom domain and HTTPS in Pages settings.
7. Follow the measurement and indexing checks in
   [`docs/launch-handoff.md`](docs/launch-handoff.md).
