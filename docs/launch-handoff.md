# Kimen site launch and measurement handoff

Status: local implementation complete, external configuration and publication
remain with Andreas.

This document separates publication, measurement and acquisition. A deployed
site is not yet a useful market sensor unless the private form and analytics
are working. Analytics do not create organic traffic without search-oriented
content and distribution.

## What the repository already provides

- Static Core, Operations, docs, guides and privacy pages.
- Canonical URLs, index directives, descriptions and Open Graph metadata.
- `robots.txt` and an XML sitemap containing every intended indexed page.
- A GitHub Pages workflow which builds only public files. Design studies,
  variants and internal Markdown reports are excluded from the artifact.
- A private Operations form client with validation, honeypot, attribution and
  clear failure states.
- Anonymous PostHog events with person profiles and IP geolocation disabled.
- Global Privacy Control and Do Not Track handling.
- Three search-oriented Core guides.
- Local link, metadata, sitemap and content checks.

## External work for Andreas

### GitHub Pages and domain

1. Review and merge the site branch.
2. Push `main` to GitHub.
3. Select GitHub Actions as the Pages source in repository settings.
4. Add the DNS records requested by GitHub for `kimen.systems`.
5. Verify the custom domain and enable HTTPS.
6. Confirm these live URLs:
   - `https://kimen.systems/`
   - `https://kimen.systems/access/`
   - `https://kimen.systems/docs/`
   - `https://kimen.systems/guides/`
   - `https://kimen.systems/privacy/`
   - `https://kimen.systems/robots.txt`
   - `https://kimen.systems/sitemap.xml`
7. Run `node scripts/check-live-site.mjs https://kimen.systems/`.

The domain currently resolves to a GoDaddy-hosted site. Its DNS records must be
replaced with the records required by GitHub Pages before the Kimen Pages site
can serve the domain.

Only Andreas publishes or changes DNS.

### Private Operations form

1. Create a private HTTPS form receiver. It must accept browser `multipart/form-data`
   POST requests and return a successful HTTP status.
2. Make sure it permits requests from `https://kimen.systems`.
3. Store its URL as the GitHub Actions secret `KIMEN_FORM_ENDPOINT`.
4. Submit one test response without sensitive infrastructure information.
5. Verify receipt, the browser success message and the absence of a public copy.
6. Test one rejected or unavailable request and verify the failure message.

The receiver gets operation text, current access method, caller categories,
work email, source path, UTM values and referring origin. Operation text and
email are not sent to PostHog.

### PostHog

1. Create a dedicated Kimen project in PostHog's European region. Do not reuse
   another product's project because that contaminates funnels and acquisition
   data.
2. Store the project token as the repository variable `KIMEN_POSTHOG_KEY`.
3. The repository already defaults `KIMEN_POSTHOG_HOST` to
   `https://eu.i.posthog.com`. Set the variable only if the project uses a
   different ingestion host.
4. Publish and confirm events in PostHog's live events view.
5. Check that form text and email never appear as event properties.

Expected events:

- `site_page_viewed`
- `install_clicked`
- `source_clicked`
- `guides_clicked`
- `guide_opened`
- `guide_install_clicked`
- `operations_clicked`
- `operations_explanation_clicked`
- `operations_form_cta_clicked`
- `operations_form_started`
- `operations_form_attempted`
- `operations_form_submitted`
- `operations_form_failed`

Create these initial funnels:

1. Core page view to `install_clicked`.
2. Core page view to `operations_clicked`.
3. Guide page view to `guide_install_clicked`.
4. Operations page view to `operations_form_started` to
   `operations_form_submitted`.

Break down page views and funnels by `utm_source`, `utm_medium`, `utm_campaign`
and `referrer`. The site stores only a session-scoped anonymous identifier.

Official reference: <https://posthog.com/docs/libraries/js>

The Pages workflow intentionally fails before deployment if the form endpoint
or PostHog key is missing. This prevents qualified traffic from reaching an
unmeasured page or a disconnected response form.

### Google Search Console

1. Create a Domain property for `kimen.systems`.
2. Add the DNS TXT verification record provided by Google.
3. Submit `https://kimen.systems/sitemap.xml`.
4. Use URL Inspection for the homepage, Operations page, docs and each guide.
5. Request indexing after the live pages have been verified.

Review weekly at first:

- indexed pages and exclusions;
- queries and landing pages;
- impressions, clicks, position and click-through rate;
- unexpected queries which reveal different user language;
- guides which receive impressions but need a clearer title or answer.

Official references:

- <https://support.google.com/webmasters/answer/34592?hl=en>
- <https://support.google.com/webmasters/answer/7451001?hl=en>

## Acquisition model

Core and Operations require different traffic strategies.

### Core

Core maps to existing search language such as `.env`, environment variables,
local development secrets, runtime configuration and open source secret-manager
CLI tools. The guides are the organic acquisition surface. The homepage and
manual are conversion and product-usage surfaces.

The first published guides are:

- keeping local development secrets out of Git;
- why `.env` files are not a secret-management strategy;
- runtime configuration without committing `.env` files.

The existing article at <https://andreasflakstad.no/posts/kimen/> should link
prominently to the Kimen homepage and the most relevant Kimen guide. Do not
republish the same article verbatim on both domains.

### Operations

DataForSEO found no meaningful search volume for the language unique to Kimen
Operations. Do not judge Operations by organic traffic. Send qualified traffic
through direct outreach, relevant conversations, the Core audience and tagged
links.

Use a separate UTM campaign for each distribution attempt. Example:

```text
https://kimen.systems/access/?utm_source=direct-outreach&utm_medium=message&utm_campaign=operations-discovery-01
```

The valuable result is not a page view. It is a specific description of a
routine privileged operation, the current access model and a willingness to
continue the conversation.

## First review points

Review the implementation immediately after publication, then review evidence
after enough qualified exposure to interpret it.

The first review asks:

- Is every intended page indexed or indexable?
- Do PostHog events and the private form work end to end?
- Which guide queries appear in Search Console?
- Which sources lead to installation clicks?
- Do Operations visitors start and submit the form?
- Are submissions concrete enough to reveal an existing access problem?

Do not interpret silence before qualified traffic has actually reached the
site.
