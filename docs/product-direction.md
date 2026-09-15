# Kimen product direction

Status: canonical product and market thesis

Date: 2026-09-15

This document preserves the product decisions behind Kimen's website and the
planned extension from runtime values to bounded operations. It is deliberately
not a protocol RFC or implementation commitment. External demand should decide
whether those are warranted.

## The product in one sentence

Kimen lets software declare what it needs while the owner of each environment
keeps control of the values and external power behind those needs.

For a normal application, Kimen supplies a value:

```text
DATABASE_URL
    -> local binding
    -> value in one application environment
```

For a developer, CI job, workflow or agent, Kimen can instead perform an
operation:

```text
restart this known worker
    -> local binding
    -> fixed implementation
    -> status and receipt, not a credential
```

These are two realizations of the same model:

```text
declared need -> local binding -> temporary realization
```

Kimen is one product. The existing vault and projection model is not a legacy
edition which will be replaced by an agent product. It is the foundation.

## Current commercial product hypothesis

Kimen Operations is a coherent and falsifiable product hypothesis, not yet a
validated product direction. There is no external demand evidence yet.

The refined hypothesis is:

> Kimen puts a small, project-aware access boundary in front of operational
> scripts, APIs and workflows a team already has.

> The operation contract belongs to the project. Its implementation and
> authority belong to the environment.

The possible differentiation is not secret storage, “secrets for agents”, a
friendlier wrapper around one deploy script or a lighter central runbook
platform. It is a stable operation contract in the project, bound outside the
project to an existing implementation, credentials and restrictions.

The direct explanation is:

> Your code can declare `restart_worker(queue)`. It cannot decide how
> `restart_worker` works, where it runs or which credentials it uses.

An operation declared by a developer or agent has no authority until the
environment supplies an approved binding.

Agents make the mismatch between a requested job and a broad credential more
visible, but they are one caller rather than the product category. Developers,
CI jobs, workflow engines and local workers have the same underlying problem.

The strongest alternatives are provider-native IAM, OIDC, protected CI
workflows, internal endpoints and runbook platforms such as Windmill or
Rundeck. If users do not care that the contract belongs to the project and can
be bound across callers and environments, Kimen Operations is likely a useful
open-source feature rather than a commercial product.

The website must test for teams which already have good scripts, APIs or
workflows but still require broad credentials, production access or a
privileged human to invoke routine work. External intent, not further protocol
design, determines whether the hypothesis advances.

## What the name means

`Kimen` means a seed, germ, origin or the small beginning from which something
larger develops. In chemistry it can be the starting point at which a new phase
or crystal forms.

The useful product metaphor is not a literal plant. A repository describes a
program which is still incomplete in a particular environment. Kimen is the
small, concentrated piece which lets that declared form become a running
system there.

The durable internal formulation is:

> Kimen is the small piece that makes the project real in its environment.

The experience should feel like controlled activation, not organic whimsy:

```text
latent -> active -> latent
```

Kimen is quiet by default and active only when invoked. Colour may represent
temporary authority: neutral while latent, a restrained accent while a binding
or permission is active, then withdrawn again.

Avoid seeds, leaves, shields, locks, glowing cyber-security graphics and generic
AI gradients. The visual language is a small origin point causing a precise
structure or connection to become available. Crystallisation and phase change
are better references than illustrated plant growth.

## The existing product

The immediate problem is simple. Developers keep database URLs, API keys and
private files in `.env` or similar files beside the code. `.gitignore` keeps
those files out of Git, but not out of the workspace. Developers must keep them
safe on every machine, and any permitted editor, script, tool or coding agent
can read them.

Kimen moves the values into a local encrypted vault. A committed `.kmap` keeps
the names and mappings visible, so people, programs and agents can understand
what the application expects without storing the values there.

At invocation time Kimen can project those values as environment variables,
files, file paths or stdin. The application keeps using ordinary configuration
mechanisms and does not need a Kimen library.

The direct product explanation is:

1. Store the value in Kimen.
2. Map it to the environment variable or file the application already expects.
3. Start the application through Kimen.

The existing product is useful for local applications, tests, build tools,
one-off commands, process managers and deployment/runtime preparation. Deploy
is an important use case, but not the definition of Kimen.

## The honest projection boundary

Projection keeps a secret out of the repository, ordinary workspace reads,
prompts and shell history. It does not make the receiving process untrusted-proof.

`kimen run` intentionally gives selected values to a caller-selected child
process. That process can read them. If an agent controls the program, command
or code which receives the values, it can make that process print, store or
transmit them.

An unrestricted agent running as the same OS user may also be able to invoke an
unlocked Kimen session or inspect other same-user resources. A same-UID socket
and file permissions do not create a strong security boundary by themselves.

The correct immediate claim is that secrets do not need to be stored in the
workspace or copied into ordinary agent context. Do not claim protection from
an arbitrary compromised same-user process without additional OS, container or
identity isolation.

Do not reduce this risk to “training data.” Once an agent reads a secret it may
enter model context, command output, logs, caches or a provider system. Whether
a specific provider trains on it is only one possible downstream question.

### Today's session is a convenience unlock

The current `kimen session start` writes the vault passphrase, base64-encoded,
to a `0600` session file. This protects it from other Unix users, but a process
running as the same user can read it. All commands then reuse that passphrase.

Therefore today's open session is not an agent boundary. A same-user agent can
use `secret get`, or more simply project a secret into a process it controls
through `run`, `render` or `envfile`.

Preserve the current session semantics for trusted human use if they remain
useful, but do not describe them as scoped agent access.

### An operation session is a broker, not a scoped passphrase file

The agent product requires a second meaning of session:

```text
human enters vault password
    -> Kimen broker holds decrypted authority
    -> session permits selected operations for a limited time
    -> agent may invoke those operations
    -> reveal, projection and administration remain locked
```

Conceptually:

```text
kimen session start --allow deploy_staging,inspect_logs --ttl 2h
```

must authorize only calls such as:

```text
deploy_staging(revision)
inspect_logs(filter, since)
```

It must not expose a reusable vault passphrase or authorize any of these paths
to the same credentials:

```text
secret get
run
render
envfile
operation create / edit
binding or credential changes
```

This is not best understood as “the vault is unlocked with scopes.” Kimen has
the authority; the session may ask Kimen to use selected parts of it.

Credential use therefore needs policy as well as storage semantics. A
credential backing an operation may be usable by the trusted adapter while
being neither revealable nor projectable through that operation session.

## Why bounded operations are needed

Credentials are often a poor interface to the work people actually want to
authorize. A developer, CI job, workflow or coding agent may only need to deploy
one staging revision, but a deployment credential gives its holder every
operation that token permits. It must then be distributed, stored, kept out of
Git, protected from other processes, rotated and revoked.

The real need is often one result: deploy one allowed commit through one staging
workflow. A coding agent makes the mismatch especially visible because it can
use the credential autonomously, but it is not the only caller with this
problem.

Kimen should therefore support a stronger path in addition to projection:

```text
caller asks:
  deploy commit 8d2f74a to staging

Kimen controls:
  repository
  workflow
  environment
  accepted commit rules
  credential
  provider request

caller receives:
  deployment started
  deployment reference
  receipt
```

The caller does not receive a deployment credential, a generic provider client
or a command which runs arbitrary code with the token present.

Pre-registering or binding the operation is necessary because the trusted part
must constrain what receives and uses the credential. If the agent can choose
the command, URL, headers or executable implementation, it can replace the
approved operation with exfiltration. A one-time approval, organization policy
or short-lived grant may authorize an invocation, but none of them may let the
agent redefine the operation itself.

`Kimen Operations` is the product name. An individual unit is an `operation`.
Bounded operation and capability remain useful internal descriptions. Public
copy should normally describe the actual job before teaching the category.

The clearest use-case line is:

> Give access to operations, not credentials.

## Concrete operation examples

### Deploy one staging revision

- Fixed repository and staging workflow.
- Agent supplies one immutable commit.
- Binding may require the commit to be reachable from an allowed branch.
- Agent receives deployment status and reference.
- Agent never receives the deployment credential.

### Read recent logs for one service

- Fixed observability provider and allowed services.
- Bounded time window, result size and fields.
- Read-only provider request.
- Output filtering is required because logs may themselves contain secrets.
- Agent never receives the observability API key.

### Restart one staging service

- Fixed environment and allowlisted services.
- Rate limit and explicit repeat behaviour.
- Agent receives operation outcome and receipt.
- Agent never receives a cloud credential or SSH key.

Clean initial examples call a provider or fixed remote workflow directly.
Publishing packages and deploying agent-authored code are harder because
package hooks or deployed code may execute while authority is available. A
generic `run_with_token(command)` is not a Kimen security primitive.

## What a trustworthy bounded operation requires

- A stable operation identity and version.
- A small, typed input space.
- A protected environment-owned mapping to provider, target and credential.
- Validation and policy outside agent-editable files.
- A trusted adapter which constructs the external request itself.
- No arbitrary shell interpolation or repository-controlled hooks with the
  credential present.
- Bounded and filtered output.
- Expiry, revocation and an explicit repeat/idempotency policy.
- An attributable receipt without secret values.
- Separate administration and invocation paths.
- A broker-held key rather than a same-user-readable passphrase/session file.
- Session enforcement across every disclosure path, including `run`, `render`
  and `envfile`, not only `secret get`.

Protection from an arbitrary host process additionally requires the caller to
run in a sandbox, container, VM or different OS identity, or for each sensitive
request to cross a separate human/identity boundary.

The implementation concepts currently worth preserving are requirement,
binding, grant, invocation, adapter and receipt. Their wire formats, command
names and serialization are intentionally undecided.

The public product term is `Kimen Operations`. A single callable unit is an
`operation`. Do not shorten the product name to `Ops` in primary copy.

### Operation definition and lifecycle

An operation is split deliberately between the project and the trusted
environment.

The project may commit a portable contract such as:

```text
operation deploy_staging(revision: git_sha)
```

It declares the operation name and accepted input, but no target, provider,
credential or executable implementation. The environment owner binds that
contract inside Kimen's authenticated local state:

```text
deploy_staging
  adapter     deployment_workflow
  target      staging
  credential  vault.deploy_token
  revision    commit_on_main
```

The concrete local design should store this binding in the encrypted Kimen
vault, by default `~/.config/kimen/vault.kv` or the location selected with
`--vault`. It is modified through password-authorized Kimen administration,
not through an editable file in the project. The credential may be stored in
the same vault or represented by a reference to an external secret store.

The adapter is built into Kimen or installed outside the project as a verified
package pinned by version and digest. Kimen never resolves the privileged
implementation from repository-controlled code.

On invocation Kimen identifies the caller, resolves the protected binding,
validates inputs and policy, obtains approval if required, lets the trusted
adapter use the credential, filters the response and records the outcome. The
caller gets the result. It does not get a credential-bearing process or the
ability to choose another command, target or provider request.

This is the defining difference from a named script. If the caller can edit the
implementation and Kimen injects a credential into it, the caller can disclose
that credential. A protected operation therefore uses an adapter outside the
caller's control, with constrained inputs, a fixed target and bounded output.

Repository scripts still have a useful role. They may build, test, calculate an
artifact digest and invoke `deploy_staging(revision, artifact)`. They remain
caller-editable because they never receive the deployment credential. Kimen
validates the request and crosses into a trusted adapter or runner for the
credential-bearing step. Kimen Operations separates orchestration from protected
execution. It does not attempt to replace deployment workflows.

For one developer, the protected binding lives in the local vault. The project
declaration reaches other developers through Git. A team owner can update the
protected definition and access rules in Kimen Teams. Local Kimen then fetches
a signed snapshot and the verified adapter version during sync, while each
environment keeps its credential reference in its own vault. No secret value
passes through Git or Kimen Teams. Contracts and adapters are versioned, and
changed versions do not silently inherit prior approval.

Public examples use `snake_case`, such as `deploy_staging(revision)`, because
it reads as a callable operation rather than a shell command. Exact file and
CLI syntax remain illustrative.

## Practical YOLO threat model

For the product story, “YOLO” should mean that the agent can run arbitrary
commands and change files in its working project without per-command human
approval. Kimen should let this agent use selected operations without automatically
gaining secret-disclosure or secret-projection authority.

An operation-only broker session can be a meaningful boundary under that model,
even when the agent and developer share a machine. The password remains a form
of user authorization which the agent does not know.

Do not silently expand the promise to a fully compromised user account. An
agent which can persistently replace the Kimen binary, alter shell startup,
capture later password entry, debug the broker or modify trusted executables is
operating as malware for the logged-in user. Strong protection against that
requires additional OS identity, sandbox, root-owned installation, code
integrity or external user-presence mechanisms.

The concrete public promise is:

> Let the agent work freely in the project. Unlock only the operations it needs.

The stronger deployment option is to combine operation-only sessions with a
sandbox, container, VM, separate OS identity or remote broker. Kimen need not
build the sandbox itself; it can own the narrow bridge out of it.

## Why not just use 1Password, Vault or a cloud secret manager?

If the need is “store a secret and inject it into a trusted process,” Kimen does
not have a decisive functional advantage over mature products. Its benefits are
smallness, local/offline operation, no account, open source and a project-shaped
map, but those alone may not support a substantial commercial product.

The bounded-operation thesis answers a different question:

```text
secret projection:
  this process may use this credential

bounded operation:
  this caller may request this exact effect
```

Kimen does not need to replace existing secret stores. 1Password, Vault, Google
Secret Manager or another system may eventually be a binding backend. Kimen's
possible ownership is the portable contract between a workload and the local
authority which fulfils it.

This position is deliberately narrow. 1Password already offers runtime secret
injection for coding agents without putting values in model context. Infisical
offers an Agent Proxy which adds credentials at the network boundary and limits
destinations. Vault Agentic IAM supports agent identities, on-behalf-of
delegation and request-scoped authorization. The category is validated and
competitive. Kimen cannot win as “secrets for agents” or generic agent IAM.

The candidate differentiation is:

> Portable, workload-declared operations with protected local bindings, usable
> across coding agents, CI, local workers and workflow engines.

This must be tested rather than assumed.

## Relationship to Ro

Ro owns durable work and organizational meaning:

- why work exists;
- which Task or Responsibility authorizes it;
- which human or Agent Actor owns it;
- assignment, claim, run, waiting, review and handoff;
- authority inside the Ro domain;
- durable provenance and business outcomes.

Kimen owns the credential-backed external effect used by that work.

> Ro gives the mandate. Kimen limits the external power used to fulfil it.

A Ro Worker Binding may eventually carry a short-lived, run-scoped grant to
Kimen. The context can identify issuer, Actor, Worker Binding, Task/run, allowed
operation, expiry and authority epoch. Kimen should validate generic claims; it
should not import Tasks, Responsibilities or Ro domain commands.

Ros own run capabilities protect commands inside Ro. They do not by themselves
constrain deployment, cloud, observability or remote-access providers. That external side-effect boundary is the
specific gap Kimen may fill.

Ro's assigned-agent vertical is architecture and planned work, not current
implementation. Kimen should expose a clean future integration boundary rather
than being designed around Ro code which does not exist yet.

## Relationship to Breyta and workflows

Breyta owns deterministic orchestration:

- flow and step definitions;
- schedules and callable interfaces;
- retries, waits and durable run state;
- agent loops and tool allowlists;
- approvals;
- workflow traces and results.

Kimen must not become a second workflow engine. In a combined system, a Breyta
step asks Kimen to perform a bounded external operation. Breyta decides when it
belongs in the flow and how the flow continues. Kimen checks this invocation,
uses the protected credential, performs the provider request and returns a
receipt.

The useful general pattern is:

> Deterministic orchestration outside; probabilistic agent judgment inside
> bounded steps; separately constrained external effects at the Kimen boundary.

For example:

```text
Ro Responsibility: keep staging operational
    -> Breyta collects health and metrics
    -> agent diagnoses ambiguous symptoms
    -> Breyta selects an allowed restart step
    -> Kimen restarts one allowed staging service
    -> Breyta verifies recovery
    -> Ro records the meaningful result and ownership
```

If an operation exists only inside one Breyta flow, Breyta's packaged steps and
connections may already be sufficient. Kimen has separate value only when the
same operation and authority boundary should be reusable from several surfaces
or when credentials must remain outside the engine.

The durable division is:

```text
Ro       why this work is authorized
Breyta   how and when the work runs
Kimen    which exact external effect it may cause
Provider final enforcement in the external system
```

## Tool, library and shared-code direction

Do not embed the primary implementation as a library in Ro and Breyta. That
would collapse the process boundary and make every host own credential custody,
adapter lifecycle and audit behaviour.

The likely shape, if validated, is a hybrid:

- a standalone local Kimen broker/runtime;
- a small language-neutral invocation protocol;
- thin clients or integration steps for Ro, Breyta, CLI, CI and agent tools;
- trusted provider adapters;
- canonical examples and cross-language test vectors.

Share neutral request, decision and receipt mechanics. Do not share Ro's domain model,
Breyta's workflow runtime or Kimen's vault internals. A protocol matters more
than forcing three codebases and languages to use the same library.

Do not create a separate product name or repository yet. This is a natural
extension of Kimen. Packaging can be revisited only when real integrations make
the boundary concrete.

## Commercial thesis

An individual developer should be able to use a complete local Kimen without an
account or subscription.

### Kimen Core

- Open source and free.
- Local vault, maps, sessions and projection.
- Local bounded operations and bindings if they are built.
- Local receipts.
- External secret backends where useful.

The paid problem appears when an organization has many developers, CI jobs,
workflows, agents, repositories and environments. It does not want every
developer or automation surface to receive broad credentials or invent a
different wrapper, credential strategy and safety model for deploys, log
queries, restarts and backups.

### Kimen Teams

- Shared operation/capability inventory.
- Organization policies distributed to local Kimen runtimes.
- Human, agent, CI and workflow identity.
- Approvals and revocation.
- Central audit and provenance.
- Environment and project management.

Credentials and execution may remain local or in the organization's existing
secret store. The hosted product can be a control plane for policy, identity,
approval and audit rather than a vault which receives all secret values.

### Kimen Enterprise

- SSO, OIDC and SCIM.
- SIEM export and longer retention.
- Signed/managed operation definitions.
- Self-hosted control plane.
- Support, SLA and custom integrations.

Do not show a price on the first market surface. The category and buyer are not
yet established well enough for a number to be informative. If the team model
validates, per-human/team pricing is preferable to per-invocation pricing
because usage should not penalize successful automation.

The possible B2B buying argument is:

> Let developers, CI, workflows and agents do useful work without every person
> or system receiving broad credentials or inventing separate security rules.

If only solo developers care, Kimen may remain a good free OSS tool without a
strong business. That is an acceptable fallback.

## Website and communication decisions

The website has two clear paths within one product:

### Kimen for developers

Start with the concrete existing problem:

> Move secrets out of your project.

Show `.env`, the vault, the committed map, `kimen run`, and an environment box
which visibly contains both the application and its truncated environment
values. Show editors, scripts and coding agents as peers which can work in the
project without plaintext values being stored there. Make clear that local
development, tests, tools, files and process managers are use cases; this is not
only deployment and not primarily an agent product.

Use the same calm, single-column editorial rhythm as the Operations page. The
hero should establish the ordinary `.env` problem and explain Kimen in direct
language. Do not make the visitor decode a system diagram before understanding
the product. Show the runtime illustration later, after the store, map and run
sequence has made its purpose clear. Present runtime targets as simple rows,
not a dashboard or grid of cards.

### Kimen Operations and team access

Kimen Operations is not primarily an agent product. Coding agents are one especially
urgent caller alongside developers, CI and deterministic workflows. The public
path lives at `/access/`; `/agents/` is only a compatibility redirect.

Use the original Kimen article's narrative discipline: begin with an ordinary
workflow and the common workaround, let the practical costs become visible,
and only then introduce Kimen. Do not begin by teaching the solution model.

Lead with the concrete problem:

> You should not need production credentials to run one routine operation.

The opening story describes work which already exists as a script, API,
workflow, console procedure or handoff to someone with production access. The
team does not need another automation platform. It needs a safer way to let
more callers perform that existing work.

Start with operations which commonly fall outside a protected deployment path:

```text
restart_worker("payments")
run_backfill("invoices", "2026-09")
inspect_logs("api", since="30m")
```

State the ordinary workaround and its cost plainly:

> A developer needs to restart one worker. The available route is an SSH key,
> a cloud credential or a message to the person who has production access.

Then introduce the operation, not the architecture:

> Give the developer `restart_worker("payments")`, not general access to the
> production system.

Use one restrained typographic example instead of an architecture diagram. Do
not make deployment the page's main story. Mature teams often already protect
deployment through pull requests, CI, environment rules and short-lived
identity.

The public page has one story:

1. The team already has routine privileged work implemented somewhere.
2. Running that work still requires a broad credential, production access or a
   privileged human.
3. The caller needs one operation, not access to the whole underlying system.
4. The project can declare the operation contract safely.
5. The environment binds it to a trusted implementation, credential and fixed
   restrictions.
6. Developers, CI, workflows and agents can call the same narrow operation.
7. A team product can govern the bindings, access, approvals and audit without
   becoming another vault or automation platform.

The essential model appears only after the problem is understood:

```text
PROJECT                         ENVIRONMENT

restart_worker(queue)      ->   existing script, API or workflow
                                credential or workload identity
                                allowed services and environment
```

The copy immediately below it should say:

> The operation contract belongs to the project. Its implementation and
> authority belong to the environment.

And then make the boundary concrete:

> Your code can declare `restart_worker(queue)`. It cannot decide how
> `restart_worker` works, where it runs or which credentials it uses.

Keep the page single-column and left-aligned. After the dark opening, use one
continuous light reading surface through the product and team story. Dark code
may appear once if it clarifies that a repository script calls Kimen only for
the sensitive step. Use green for product identity and code, and orange only
where protected access is crossed. Avoid repeated cards, chips, full-width
color bands, table-like comparisons and section headers whose columns do not
align with the content below them.

All deeper architecture, session semantics, threat-model explanation, provider
design and implementation constraints remain in product documentation. They
must make the public promise true but do not each deserve a marketing section.
A single restrained boundary note is sufficient on the access page.

Explain that the operation may still be implemented by a repository script,
but the credential-bearing step cannot be caller-controlled. Kimen may bind the
contract to a pinned local adapter, a protected runner, a fixed API request or
an existing workflow. The caller supplies validated parameters and receives a
limited result.

Show developers, CI, workflows and coding agents as peer callers. Agent
autonomy is a reason the problem is becoming more urgent, not the definition of
the category.

Avoid public-first abstractions such as authority boundary, execution surface,
workload contract, capability architecture and delegated authority. They are
useful internally but force a visitor to translate the product. Prefer
production access, existing script, operation, application, environment, log
window, service and result.

Use operation in public-first copy. `Kimen Operations` names the product area.
Show only a few concrete calls:

```text
restart_worker(queue)
run_backfill(dataset, period)
inspect_logs(service, since)
```

The implementation is deliberately generic in the primary story. Kimen may
call an existing script, internal API, CI workflow, cloud provider or service.
Vendor names can appear in integrations and documentation later, but the
product must not read as an add-on for one agent or source-control vendor.

Do not use numbered `01 / 02 / 03` decoration, oversized headings in narrow
columns, unexplained code boxes, eyebrows above headings or generic security
imagery. Code examples for current Kimen must be verified against the real CLI.
Planned operation syntax may be shown when it materially explains the model, but it
must be explicitly labelled illustrative rather than presented as settled API
design.

The bounded-operations product should be presented as a coherent Kimen product
promise, not as an apologetic internal “commercial probe.” Discreetly identify
named operations as a planned extension. Explicitly distinguish any proposed
operation-only session from today's convenience session, which unlocks the
vault for the user's Kimen operations. Do not claim that unimplemented commands
can be installed and run today.

The site should not send sensitive infrastructure descriptions into public
GitHub issues or use an email link as its primary CTA. A private form or another
intent-capture mechanism must be chosen before the public market test depends
on conversion data. The form should ask which routine operation still requires
broad access, how access is controlled today, which callers need it and for an
email address. Never ask for credentials or sensitive infrastructure details.

A short section may distinguish Kimen from a runbook platform:

> Kimen does not become your automation platform. Keep your existing scripts,
> APIs, workflows and secret store. Kimen binds project-declared operations to
> trusted implementations and controls who may invoke them.

The page should end with the research question which tests the wedge:

> What does your team still run through scripts, consoles or someone with
> production access?

## Validation order

Do not write a general authority RFC, build a broker, add many secret backends
or implement a team control plane before external signal.

The order is:

1. Present the complete product story on `kimen.systems`.
2. Connect a private form and privacy-conscious analytics before meaningful
   distribution begins.
3. Send qualified developers and engineering/platform leaders to `/access/`.
4. Observe which problem produces intent: `.env` hygiene, an existing
   privileged operation or team governance.
5. Ask for the exact caller, operation, implementation, current access method
   and overly broad credential.
6. Design one operation with the first credible design partner.
7. Build the smallest bounded adapter only after that demand remains concrete.
8. Generalize the protocol only after multiple users or execution surfaces
   require it.

A single user can justify one narrow prototype. Multiple independent users and
repeated use are needed to justify a general product direction.

The most important disconfirmation questions are:

- Would the user simply choose 1Password, Vault, Infisical, provider-native IAM,
  a CI workflow, Windmill or Rundeck instead?
- Does the same operation actually need to work across more than one developer,
  CI job, agent, workflow engine or runtime?
- Will a team pay for common policy and audit, or are local wrappers sufficient?
- Does the boundary reduce real credential distribution or let more callers
  use work which is currently restricted to privileged humans?
- Can the desired operation be implemented without running agent-controlled code
  with a credential present?

Detailed search evidence, measurement events, traffic channels and validation
gates are maintained in
[`market-demand-and-validation.md`](market-demand-and-validation.md).

## Non-goals

- Replacing 1Password, Vault or every cloud secret manager.
- Becoming a general IAM platform.
- Becoming a workflow engine, scheduler or agent harness.
- Importing Ro's business objects into Kimen.
- Importing Breyta's run state, retries or approval workflow into Kimen.
- Treating arbitrary shell wrappers as secure capabilities.
- Claiming protection against unrestricted same-user malware.
- Building a hosted vault before customers demonstrate that they need one.

## Current portfolio status

Kimen is an existing useful open-source product plus an active commercial
hypothesis.

The OSS fallback is good: the vault, map and projection workflow remains useful
even if the agent/team market does not respond. A small bounded-operation layer
may also remain useful for the owner's own agents and workflows.

The upside is a provider-independent operation layer shared by developers, CI,
coding agents, deterministic workflows and organizational workers, with a
natural paid control plane for team rules, approvals and audit.

Nothing in Ro or Breyta counts as external market evidence. Their value here is
to prove that the boundaries are coherent and to reveal what Kimen must not
become.

## Reference links

- Original Kimen article: <https://andreasflakstad.no/posts/kimen/>
- 1Password trusted access for Codex:
  <https://1password.com/blog/1password-trusted-access-layer-for-openai-codex>
- Infisical Agent Proxy: <https://infisical.com/blog/agent-proxy>
- HashiCorp Agentic IAM: <https://developer.hashicorp.com/vault/ai/iam>
- Detailed Kimen security exploration:
  [`stronger-agent-operations.md`](stronger-agent-operations.md)
