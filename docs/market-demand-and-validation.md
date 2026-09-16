# Kimen market demand and validation

Status: current evidence and validation plan

Date: 2026-09-15

This document records the market distinction, search evidence, traffic model
and validation gates for Kimen Core, Kimen Operations and a possible Kimen
Teams product. It complements [`product-direction.md`](product-direction.md),
which remains the canonical product thesis, and
[`stronger-agent-operations.md`](stronger-agent-operations.md), which records
the proposed security model.

No Kimen-specific traffic or DataForSEO analysis was found in the earlier
product reports. The earlier work documented the problem, architecture,
competitors and market-test design qualitatively. The numbers and acquisition
conclusions below are therefore a new evidence layer.

## Accepted product distinction

Kimen is one product model with two possible realizations:

```text
PROJECT                         ENVIRONMENT

DATABASE_URL              ->   actual value

restart_worker(queue)      ->   trusted implementation
                                credential or workload identity
                                constraints
```

The durable formulation is:

> The operation contract belongs to the project. Its implementation and
> authority belong to the environment.

In direct language:

> Your code can declare `restart_worker(queue)`. It cannot decide how
> `restart_worker` works, where it runs or which credentials it uses.

An operation added by a developer or agent has no authority until an owner or
administrator supplies a protected environment binding.

## Revised commercial hypothesis

Kimen Core solves an observed problem: local runtime secrets are commonly kept
beside source code and merely excluded with `.gitignore`. Kimen already offers
a useful, local and open-source alternative. Commercial demand for team secret
storage remains uncertain because 1Password, Vault, Infisical and cloud secret
managers already solve much of that coordination problem.

Kimen Operations tests a different problem:

> Engineering teams already have scripts, APIs and workflows for routine
> privileged work, but callers still need broad credentials, production access
> or help from one of the few people who have that access.

Kimen would put a narrow access boundary in front of an operation which already
exists. It would not need to own the script, become the workflow engine or
replace the existing secret store.

Examples include:

```text
restart_worker("payments")
run_backfill("invoices", "2026-09")
inspect_logs("api", since="30m")
```

Developers, CI, workflows and agents are peer callers. Agents make the problem
more urgent, but they are not the product category.

The plausible initial customer is a software team with roughly 5 to 50
developers, existing operational scripts and some shared production access,
but no desire to move every task into an internal developer platform or a
central runbook service.

This remains a product hypothesis. There is no external evidence yet that
enough teams want this exact project-aware model.

## Why Kimen, not the existing categories

### Secret managers

1Password, Vault, Infisical and cloud secret managers answer where credentials
should live and how an authorized process obtains them. Kimen Core may use one
of them as a backend in the future.

Operations asks whether the caller should receive a credential at all. If the
caller needs only one known result, Kimen can expose the operation and let a
trusted binding consume the credential.

### Runbook and automation platforms

Rundeck stores and executes Jobs inside a central automation platform.
Windmill can sync scripts and flows from Git, but deploys and runs them inside a
Windmill workspace.

Kimen's proposed distinction is:

> Keep the operation where it already belongs. Put a narrow access boundary in
> front of it.

The repository contains the portable contract. The protected environment binds
that contract to an existing script, fixed API call, workflow or provider
adapter and controls who may invoke it.

This distinction is meaningful only if teams value a stable operation contract
across multiple callers or environments. If GitHub Actions, cloud IAM,
Windmill, Rundeck or an internal endpoint already solves the problem
satisfactorily, Kimen should not try to displace it.

## Product status

### Kimen Core

Status: problem validated, product exists.

The product already solves a real local-development problem. The remaining
questions concern adoption, hardening and whether a commercial opportunity
exists around it.

### Kimen Operations

Status: deeper market test.

The model is coherent and the potential problem is expensive, but its demand
and differentiation are unvalidated. Do not build a general broker, adapter
ecosystem or protocol before qualified external signal.

### Kimen Teams

Status: do not build.

Teams becomes a product only if Operations attracts organizations with a need
for shared bindings, identity, access rules, approvals, revocation and audit.
The paid object is governance of authority bindings, not hosted copies of
secrets or scripts.

## DataForSEO findings

The research used DataForSEO Google Ads search-volume estimates, Google organic
SERPs and Labs domain-rank estimates on 2026-09-15. Search-volume numbers are
directional estimates. A missing value means that DataForSEO did not report
enough data, not proven zero demand.

Selected United States monthly search estimates:

| Query | Monthly searches | Interpretation |
| --- | ---: | --- |
| `secrets manager` | 1,300 | Established and highly competitive category |
| `open source secrets manager` | 140 | Relevant to Core, dominated by established products |
| `secret manager CLI` | 50 | Small but close to Core's form factor |
| `environment variables` | 2,400 | Large, mainly informational intent |
| `dotenv` | 2,900 | Large, broad informational intent |
| `env file` | 2,400 | Large, broad informational intent |
| `git secrets` | 1,300 | Mostly secret scanning and AWS `git-secrets`, not Kimen's runtime model |
| `secret scanning` | 260 | Related problem, different solution |
| `runbook automation` | 140 | Mature category led by central platforms |
| `just in time access` | 480 | Broad enterprise access category |
| `zero standing privileges` | 170 | Enterprise security language |

Selected emerging global English queries:

| Query | Monthly searches | Interpretation |
| --- | ---: | --- |
| `agentic IAM` | 140 | Growing, but enterprise-heavy language |
| `AI agent access control` | 50 | Small and growing |
| `agent identity management` | 50 | Small and growing |
| `coding agent secrets` | no reported data | Not an established search category |
| `secrets management for AI agents` | no reported data | Not an established search category |
| `MCP secrets management` | no reported data | Not an established search category |

The Operations phrases developed during product exploration, including
`secure script execution`, `developer production access` and
`project-declared operations`, had no meaningful reported search demand.

Estimated monthly United States organic traffic for selected whole domains:

| Domain | Estimated organic visits | Ranking keywords |
| --- | ---: | ---: |
| `1password.com` | 240,984 | 8,512 |
| `windmill.dev` | 3,310 | 1,143 |
| `infisical.com` | 2,064 | 872 |
| `doppler.com` | 834 | 784 |
| `rundeck.com` | 454 | 549 |
| `dotenvx.com` | 183 | 114 |
| `openscope.dev` | 9 | 4 |
| `dmno.dev` | 4 | 18 |

These are DataForSEO estimates, not site analytics, and whole-domain numbers
are not directly comparable. They show that organic discovery in these niches
is concentrated and that a credible developer product can still have a very
small SEO footprint.

DataForSEO reported no meaningful ranking footprint for `kimen.systems` or the
Kimen article on `andreasflakstad.no`. That does not establish zero visitors.
It establishes that there is no visible organic baseline in the tool.

## Acquisition conclusion

Core and Operations require different acquisition strategies.

### Core: content and open-source adoption

Core can meet existing search language around `.env`, environment variables,
API-key handling, local development secrets and open-source secret managers.
The product page should not attempt to win the broad `secrets manager`
category through generic copy.

The original article, *Shhh, Don't Put Secrets in the Repo*, is the right
editorial model. It starts with a recognizable developer practice, explains
why `.gitignore` is incomplete, then introduces a different runtime model.

Useful future content areas include:

- keeping local-development secrets outside a repository;
- runtime configuration without committed environment files;
- what `.env.example` describes and who owns the values;
- coding agents and plaintext values in a writable workspace;
- honest comparisons with 1Password CLI and other existing choices.

Search traffic is a patient adoption channel for Core, not evidence of an
immediate large market.

### Operations: directed, qualified traffic

Operations does not yet have an established search vocabulary. Calling it
`runbook automation` for keyword volume would put Kimen in the wrong category.

The `/access/` page should be a conversion surface for traffic from:

- direct outreach to engineering teams;
- existing Kimen and article readers;
- GitHub and release communication;
- the founder's professional network;
- relevant developer and platform-engineering communities;
- concrete writing about production scripts, access handoffs and agent use.

The goal is not page views. It is a credible description of an operation which
currently requires broad credentials, production access or a privileged human.

## Instrumentation required before distribution

At the time of the traffic review, the static site had no analytics, its
Operations response path was not connected and there was no `robots.txt` or
`sitemap.xml`. Consequently, no traffic or conversion baseline exists yet.

The repository now includes a prefilled email response path, privacy-conscious
event capture, source attribution, `robots.txt` and `sitemap.xml`. Event capture
remains inactive until the site is published with Radar's configured PostHog
token. Radar is a shared analytics project. Kimen stays separate through a
`kimen_` event namespace, the property `product: "kimen"` and its own
dashboard.

Before sending meaningful traffic, complete the remaining external setup:

- verify that the public contact address receives the prefilled Operations email;
- Google Search Console after publication.

Radar's project key is already configured as `KIMEN_POSTHOG_KEY`, and a pinned
Kimen dashboard already contains separate Core, Operations, guide and site
activity insights.

Recommended events:

```text
kimen_site_page_viewed
kimen_source_clicked
kimen_install_clicked
kimen_operations_clicked
kimen_operations_contact_clicked
```

Do not record email contents in analytics. The CTA event measures the opening of
an email draft, not a completed send. Actual received emails are the stronger
conversion signal.

The prefilled email should ask:

1. What operation does the team still run through a script, console or person
   with production access?
2. How is access controlled today?
3. Who needs to run it: developers, CI, workflows, agents or several of them?
4. What is awkward or risky about the current setup?

Warn respondents not to include credentials or sensitive infrastructure
details.

## Directed validation experiment

Send qualified traffic to `/access/`, including direct contact with roughly 20
to 30 people or teams matching the candidate profile. Ask about the existing
workflow before selling Kimen.

Strong evidence:

- a team has several operational scripts or manual tasks requiring broad
  production access;
- only a few people can run them safely;
- the same job is needed by developers, CI, workflows or agents;
- current IAM, CI or runbook tooling is cumbersome or deliberately avoided;
- the team wants to configure one real operation with Kimen;
- someone asks about team policy, audit, approval or price.

Disconfirming evidence:

- provider-native IAM or CI already gives the desired boundary;
- the operation is used by only one trusted person and needs no delegation;
- the team prefers to move the task into Windmill, Rundeck or an internal
  platform;
- the implementation would still execute caller-controlled code with the
  credential present;
- respondents like the model but will not change a real workflow.

One credible team can justify one concierge design or narrow prototype.
Multiple independent teams and repeated use are required before building a
general Operations product. Teams work begins only when coordination itself is
an observed problem.

## References

- Original Kimen article: <https://andreasflakstad.no/posts/kimen/>
- DataForSEO search volume API:
  <https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/>
- DataForSEO domain rank overview:
  <https://docs.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live/>
- Rundeck Jobs:
  <https://docs.rundeck.com/docs/learning/getting-started/jobs/what-is-a-job.html>
- Windmill Git sync:
  <https://www.windmill.dev/docs/advanced/git_sync>
