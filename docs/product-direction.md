# Kimen product direction

Status: canonical product and market thesis

Date: 2026-09-14

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
deploy staging for this commit
    -> local binding
    -> fixed provider operation
    -> status and receipt, not a credential
```

These are two realizations of the same model:

```text
declared need -> local binding -> temporary realization
```

Kimen is one product. The existing vault and projection model is not a legacy
edition which will be replaced by an agent product. It is the foundation.

## Current commercial product hypothesis

Actions are a coherent and falsifiable product hypothesis, not yet a validated
product direction. There is no external demand evidence yet.

The hypothesis is:

> Kimen lets teams replace broad credentials with named operations that work
> across developers, CI, agents and workflows.

> The project declares what may be done. The environment controls how it is
> done and which authority it uses.

The possible differentiation is not secret storage, “secrets for agents” or a
friendlier wrapper around one deploy script. It is one stable operation across
several callers, with its provider implementation, credentials and restrictions
bound outside those callers' control.

Agents make the mismatch between a requested job and a broad credential more
visible, but they are one caller rather than the product category. Developers,
CI jobs, workflow engines and local workers have the same underlying problem.

The strongest alternative is that provider-native IAM, OIDC, protected CI
workflows and internal endpoints are already sufficient. If users do not care
that an operation is portable across callers, Actions are likely a useful open
source feature rather than a commercial product.

The website must test for people who already have multiple wrappers,
credentials and access rules for the same operational jobs. External intent,
not further protocol design, determines whether the hypothesis advances.

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

### An Action session is a broker, not a scoped passphrase file

The agent product requires a second meaning of session:

```text
human enters vault password
    -> Kimen broker holds decrypted authority
    -> session permits selected Actions for a limited time
    -> agent may invoke those Actions
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
action create / edit
binding or credential changes
```

This is not best understood as “the vault is unlocked with scopes.” Kimen has
the authority; the session may ask Kimen to use selected parts of it.

Credential use therefore needs policy as well as storage semantics. A
credential backing an Action may be usable by the trusted adapter while being
neither revealable nor projectable through that Action session.

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

`Actions` is a possible feature name, not the product thesis. Better internal
terms are bounded operation or capability. Public copy should normally describe
the actual job rather than teach either term first.

The clearest use-case line is:

> Give access to actions, not credentials.

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

The working public term is `Action`. The final name remains open.

### Action definition and lifecycle

An Action is split deliberately between the project and the trusted
environment.

The project may commit a portable contract such as:

```text
action deploy_staging(revision: git_sha)
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
that credential. A protected Action therefore uses an adapter outside the
caller's control, with constrained inputs, a fixed target and bounded output.

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
approval. Kimen should let this agent use selected Actions without automatically
gaining secret-disclosure or secret-projection authority.

An Action-only broker session can be a meaningful boundary under that model,
even when the agent and developer share a machine. The password remains a form
of user authorization which the agent does not know.

Do not silently expand the promise to a fully compromised user account. An
agent which can persistently replace the Kimen binary, alter shell startup,
capture later password entry, debug the broker or modify trusted executables is
operating as malware for the logged-in user. Strong protection against that
requires additional OS identity, sandbox, root-owned installation, code
integrity or external user-presence mechanisms.

The concrete public promise is:

> Let the agent work freely in the project. Unlock only the Actions it needs.

The stronger deployment option is to combine Action-only sessions with a
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

### Kimen operations and team access

Actions are not primarily an agent product. Coding agents are one especially
urgent caller alongside developers, CI and deterministic workflows. The public
path lives at `/access/`; `/agents/` is only a compatibility redirect.

Use the original Kimen article's narrative discipline: begin with an ordinary
workflow and the common workaround, let the practical costs become visible,
and only then introduce Kimen. Do not begin by teaching the solution model.

Lead with the concrete problem:

> Your deployment credential ends up everywhere work happens.

The opening story describes the scaling problem rather than an arbitrary number
of named people:

> Developers, CI jobs, workflows and agents all need to deploy. Each becomes
> another place where the same `DEPLOY_TOKEN` must be stored and protected.

Use one main illustration on the page. Begin with the caller groups which grow
with the organization:

```text
developers -> one DEPLOY_TOKEN copy each
CI jobs    -> more copies
workflows  -> more copies
agents     -> more copies
```

Then show the same groups sharing `deploy_staging(revision)` while Kimen keeps
the one credential and provider setup behind the operation. This is the
strongest concrete expression of both the immediate problem and the
cross-caller product hypothesis. The visual must show that access becomes
narrower, not merely that the credential text is hidden. Do not add broker,
session, lifecycle or team diagrams elsewhere.

Keep the rest of the page single-column and left-aligned. Avoid repeated card
grids, table-like comparisons and section headers whose columns do not align
with the content below them.

The public page has one story:

1. Every new caller of one routine staging deployment becomes another holder
   of the deployment credential.
2. Each copy must be installed, kept out of source control, protected, rotated
   and revoked; the credential also permits more than the intended job.
3. The callers do not need the token. They need
   `deploy_staging(revision)`.
4. Kimen validates and performs that fixed deployment and returns its outcome.
5. Access can then be granted, revoked, changed and audited around the actual
   job rather than around copies of a key.
6. The same mismatch appears around log inspection, restarts and backups.
7. Local Kimen remains free; a team product coordinates these operations
   across people, CI, workflows and agents.

All deeper architecture, session semantics, threat-model explanation, provider
design and implementation constraints remain in product documentation. They
must make the public promise true but do not each deserve a marketing section.
A single restrained boundary note is sufficient on the access page.

Sell the credential-distribution problem before explaining the implementation:
a token grants more than one job and must be copied, stored, kept out of Git,
rotated and revoked everywhere it is held. The first scenario is a developer
who may deploy staging but should not need the deployment token on the laptop.
Present the concrete replacement immediately:

> Let the developer call `deploy_staging(revision)`. Keep the deployment
> credential in Kimen.

Then explain only the minimum model needed: the project declares the operation and
the environment binds its provider, restrictions and credential locally. Show
developers, CI and coding agents as peer callers. Agent autonomy is a reason the
problem is becoming more urgent, not the definition of the category.

Avoid public-first abstractions such as authority boundary, execution surface,
workload contract, capability architecture and delegated authority. They are
useful internally but force a visitor to translate the product. Prefer
deployment credential, `deploy_staging(revision)`, application, environment,
log window, service and result.

Use named operation in public-first copy. `Action` remains a possible feature
or implementation name, but the final product terminology is open. Show only a
few concrete calls:

```text
deploy_staging(revision)
inspect_logs(service, since, filter)
restart_staging(service)
```

The provider is deliberately generic in the primary story. Kimen may call a
deployment platform, CI system, cloud provider or internal service. Vendor
names can appear in integrations and documentation later, but the product must
not read as an add-on for one agent or source-control vendor.

Do not use numbered `01 / 02 / 03` decoration, oversized headings in narrow
columns, unexplained code boxes, eyebrows above headings or generic security
imagery. Code examples for current Kimen must be verified against the real CLI.
Planned Action syntax may be shown when it materially explains the model, but it
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
on conversion data. The form should ask which person or system needs access,
which operation it should perform, how access is provided today and for an
email address. Never ask for credentials or sensitive infrastructure details.

## Validation order

Do not write a general authority RFC, build a broker, add many secret backends
or implement a team control plane before external signal.

The order is:

1. Present the complete product story on `kimen.systems`.
2. Send qualified developers and engineering/platform leaders to `/access/`.
3. Observe which problem produces intent: `.env` hygiene, a withheld operation,
   or team governance.
4. Ask for the exact caller, operation, provider, current workaround and overly
   broad credential.
5. Design one operation with the first credible design partner.
6. Build the smallest bounded adapter only after that demand remains concrete.
7. Generalize the protocol only after multiple users or execution surfaces
   require it.

A single user can justify one narrow prototype. Multiple independent users and
repeated use are needed to justify a general product direction.

The most important disconfirmation questions are:

- Would the user simply choose 1Password, Vault, Infisical or a provider-native
  workflow instead?
- Does the same operation actually need to work across more than one developer,
  CI job, agent, workflow engine or runtime?
- Will a team pay for common policy and audit, or are local wrappers sufficient?
- Does the boundary reduce real credential distribution or let automation
  complete work which humans currently take over?
- Can the desired operation be implemented without running agent-controlled code
  with a credential present?

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
