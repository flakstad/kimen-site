# Stronger bounded operations

Status: product direction presented on the website; implementation deliberately
deferred until the market test produces external signal.

Date: 2026-09-14

## One product model

Kimen's immediate agent value is workspace and context hygiene:

- secret values live in Kimen's local encrypted vault rather than in the
  repository or working tree;
- a committed `.kmap` lets people and agents understand what the application
  expects without containing the values;
- `kimen run` resolves the selected map and supplies values directly to the
  child process as environment variables, files or stdin;
- the values do not need to be copied into an agent prompt, chat message,
  shell command, or `.env` file.

This is not a security boundary against an agent with unrestricted access to
the current OS user, the Kimen session and arbitrary commands. The child
process receives the projected values. An agent which may choose or modify that
process can make it print, store or transmit them.

The public product story begins with this useful behavior, then extends the
same requirement-to-binding model to bounded operations. Values and operations
are two runtime realizations of one Kimen idea; they are not separate products.

## The stronger problem

Some work reaches an external operation which requires a credential much
broader than the desired outcome. This applies to developers, CI jobs,
workflows, local workers and agents. The current choices are often:

1. give the caller the credential;
2. keep the credential back and perform the operation manually.

A stronger Kimen boundary would let a caller cause one permitted external
effect without receiving the underlying credential and without choosing an
arbitrary process which receives it.

The commercial hypothesis depends on the same named operation being useful
across several callers. If only one workflow engine or provider needs it, that
system's native connection, IAM policy or protected workflow may be the simpler
and better boundary.

Representative examples include restarting one known service or triggering a
server-side backup for one known database. Deploying agent-authored code and
publishing packages are harder examples because the submitted code or package
lifecycle may itself be able to read or abuse runtime authority.

## Why unrestricted `kimen run` is insufficient

`kimen run` deliberately projects values into a process selected by the
caller. This is useful for trusted programs, but it is equivalent to secret
access when an untrusted caller controls the command or its code. The caller
can select a program which prints its environment or alter the intended
program to exfiltrate it.

The stronger boundary therefore requires something outside the agent's control
to constrain what receives or uses the secret. Pre-registering a named action
is one possible interface, but not an architectural requirement. A one-time
human approval, a short-lived grant, a provider integration or a fixed remote
workflow could establish the same constraint. What matters is that the agent
cannot replace the approved operation with arbitrary code.

## Candidate architecture

```text
agent sandbox
    scoped request
          │
          ▼
Kimen broker
    verifies caller and short-lived grant
    validates operation, target and inputs
    retrieves credential from the vault
    invokes trusted adapter
    filters result and records receipt
          │
          ▼
external provider
```

The broker runs outside the agent sandbox and exposes no general secret-read,
render or arbitrary-run capability to the agent channel. A trusted adapter,
not repository-controlled code, receives the credential and performs the
external call.

A portable first adapter could be a deliberately narrow HTTPS request:

- fixed HTTPS host, path and method in trusted local configuration;
- authentication inserted from a vault reference;
- no caller-controlled URL, headers or redirects;
- an explicit schema and bounds for permitted input fields;
- bounded, filtered response data;
- request timeout, size limits and an attributable receipt.

Provider-specific adapters may be safer and easier to explain where a generic
HTTP template would expose too much freedom.

## Where an Action is defined

An Action has two definitions on opposite sides of the trust boundary.

The project carries a portable contract which may be committed with the code:

```text
action deploy_staging(revision: git_sha)
```

This contract gives developers, CI, workflows and agents a stable name and an
input schema. It contains no provider endpoint, deployment target, credential
reference or executable implementation. A caller which can edit the repository
may request a contract change, but cannot thereby change what authority an
already approved Action uses.

The environment owner creates a protected binding outside the writable
project:

```text
deploy_staging
  contract    deploy_staging@1
  target      staging
  adapter     deployment_workflow@3
  credential  vault.deploy_token
  revision    commit_on_main
```

The binding fixes the parts the caller must not control: the trusted adapter,
target, credential, input constraints and result shape. For one developer this
may be local Kimen configuration. For a team it may combine an organization
definition with a local environment and credential binding.

The public examples use `snake_case` for Action identifiers, such as
`deploy_staging(revision)`. This makes the name read like a callable operation
instead of a shell command. The exact declaration and CLI syntax remain
illustrative until implementation work is justified.

## What Kimen does during an invocation

When a caller asks for `deploy_staging(revision: "abc123")`, Kimen is not just
looking up a command name. It:

1. identifies the project, caller and active authorization session;
2. resolves the requested Action contract and its protected binding;
3. validates the revision against the declared type and local restrictions;
4. checks whether this caller may use this Action in this environment;
5. obtains a specific approval if policy requires one;
6. resolves the credential without revealing it to the caller;
7. gives the credential and validated data to the trusted adapter;
8. lets the adapter construct and perform the fixed provider operation;
9. filters the provider response to the bounded result contract;
10. records the decision, target, inputs, adapter version and outcome without
    recording secret values.

The workflow or caller still decides when an operation should happen. Kimen
decides whether this caller may perform it and controls how its protected
authority is used. Kimen is therefore not a general workflow engine.

## Why this is not a named script

A named script normally remains code which the caller can execute, inspect and
often edit. If Kimen injects a deployment token into a repository script, a
caller which controls that script can print or transmit the token. Naming the
script `deploy_staging` does not reduce its authority.

A protected Action has a different call boundary:

```text
caller controls                 Kimen controls

Action name                     trusted adapter
allowed input values            target and provider request
                                credential resolution
                                policy and approval
                                bounded response
```

The caller receives a result, not a child process with the credential in its
environment. A trusted executable pinned by path and digest could be one
adapter implementation, but a caller-writable shell script is not the security
model. Built-in or signed provider adapters provide a clearer final boundary.

## Updates and team distribution

The portable contract and the protected binding have separate lifecycles.

- A project changes an Action name or input schema through an ordinary code
  review. This creates a new contract version.
- An environment owner changes targets, adapters, credentials and constraints
  through the protected administration path.
- A team control plane may publish signed contract approvals, adapter versions
  and access policy to local Kimen installations and runners.
- Secret values do not need to pass through the team control plane. Each
  environment binds the approved Action to its local vault, existing secret
  manager or workload identity.
- Local Kimen verifies signatures and versions before an invocation. A changed
  contract or adapter does not silently inherit approval granted to an older
  version.
- Revocation prevents new invocations after updated policy reaches the local
  Kimen runtime. It cannot undo an external operation which already completed.

This separation lets the same project contract work for a developer laptop, CI
runner, workflow worker or agent environment while each keeps its own trusted
authority binding.

## Session model

Today's `kimen session start` is a convenience unlock: it stores a reusable
base64-encoded vault passphrase in a same-user-readable `0600` file. It gives
all normal Kimen commands the ability to decrypt the vault and is not suitable
as the agent authorization mechanism.

An Action session must instead be broker-held and operation-scoped:

```text
kimen session start --allow deploy_staging,inspect_logs --ttl 2h
```

The broker retains the decrypted key in memory and exposes only the selected
invocations. The session does not authorize raw disclosure, arbitrary
projection through `run`/`render`/`envfile`, binding changes or Action
administration. Credentials backing Actions must be adapter-usable without
becoming revealable or projectable through that session.

This gives three useful modes:

- locked vault: password required;
- trusted human session: ordinary projection and administration;
- Action session: selected invocations only, for a bounded time.

Whether the two session types share a command family is a later CLI decision.

## Required security properties

- Agent-readable repository files may request an operation but cannot define
  its executable implementation, target or credential binding.
- The agent receives a short-lived capability scoped to a concrete operation,
  target and allowed inputs, not ambient access to an unlocked vault.
- Human administration and agent invocation use distinct authorization paths.
- Decrypted vault material is held by the trusted broker and is not written to
  the current same-user session format.
- The adapter never executes repository-controlled hooks or arbitrary shell
  commands with the credential present.
- Responses are filtered so provider output does not accidentally return
  credentials or unrelated sensitive data.
- Invocation, decision, adapter, target and outcome are recorded without secret
  values.
- Revocation and expiry prevent later invocations but do not pretend to undo an
  external operation which already completed.

Strong protection from an arbitrary same-user host process additionally
requires OS or container isolation. File permissions and a same-UID Unix socket
alone do not provide that boundary.

## Kari as a boundary test

Kari demonstrates where bounded operations do and do not fit an existing Kimen
user. It currently uses Kimen to start a development REPL, run realtime
scenarios and prepare production configuration during deployment.

### REPL remains value projection

The Kari REPL genuinely needs runtime configuration and provider credentials.
Starting it through an Action would not create a safer boundary: code evaluated
inside the credential-bearing REPL can read its environment. This remains a
`kimen run` use case. Safer agent access should instead use a reduced profile,
mock providers or a separate REPL without sensitive credentials.

### Realtime scenarios are conditional

A bounded operation such as:

```text
run_realtime_scenario(revision, scenario, model)
```

could restrict scenario identity, model choice, run count, cost and returned
artifacts while keeping the provider credential from the caller. It is only a
real boundary if the runner is trusted and pinned. Running agent-editable Kari
code with an injected API key would let that code disclose the key and would be
ordinary projection under another name.

### Deployment is the strongest initial case

Kari's current deployment combines unprivileged tests and build steps with
production config materialization, root SSH, file upload, service control and
health checks. A bounded design would keep test/build in Kari or a workflow
engine and expose only a fixed operation such as:

```text
deploy_kari_production(revision, artifact_digest)
```

The trusted binding fixes the host, paths, services, config profiles,
credential and blue/green procedure. The caller supplies only an approved
revision and matching artifact and receives deployment status and a receipt.

The adapter cannot simply execute a deployment script from the writable
repository with credentials. It must be built into Kimen, installed and pinned
outside the repository, or delegated to a fixed remote operation.

Deployment also exposes a second boundary: deployed application code receives
Kari's production runtime secrets. Protecting the deployment credential does
not make arbitrary agent-authored production code safe. Production invocation
therefore still requires human approval or an independently trusted revision,
even when the deployment mechanism itself is a bounded operation.

Kari therefore supplies one strong case, one conditional case and one clear
non-case. That is enough to make the hypothesis concrete, but not external
evidence for a general product.

## Relationship to Ro

Ro and Kimen should remain independently useful:

- Ro determines which Task an agent is performing, its durable identity, run
  scope and authority inside Ro.
- Kimen controls which external credential-backed operation that run may use.

A Ro Worker Binding could request a Task- and run-scoped Kimen capability. A
standalone Kimen user could create the same kind of grant locally without Ro.
Potential shared code is limited to neutral mechanics such as capability
envelopes, bounded local IPC and receipts. Ro's domain commands, Task model and
Workspace authority do not belong in Kimen.

## Relationship to Breyta and other workflow engines

Breyta already owns deterministic orchestration, agent loops, retries, waits,
approvals and durable run state. Kimen must not duplicate those concerns. A
Breyta integration would invoke Kimen through a narrow packaged step: Breyta
decides when the operation belongs in the flow; Kimen decides whether this
specific external effect is allowed and performs it without releasing the
credential.

This integration is only meaningful as a general Kimen product if the same
capability also needs to work from other execution surfaces such as coding
agents, CI, local workers or another workflow engine. If a capability exists
only inside one Breyta flow, the engine's own connections and packaged steps
may already provide the simpler boundary.

## Validation order

The website and directed conversations come before a protocol RFC or broker
implementation. The market test must establish whether developers and teams
recognize both of these needs:

- one operation should be usable across several agents, workflows or runtimes;
- an organization wants shared policy, revocation and audit without moving its
  credentials into a Kimen-hosted control plane.

Only credible external intent justifies specifying grant formats, canonical
serialization, client libraries or a general adapter API.

## Questions to answer before productizing

- Which real operation do users repeatedly withhold from an agent?
- Is a fixed HTTPS/provider operation sufficient, or is sandboxed command
  execution required?
- Should approval happen once during binding, once per agent run, or at every
  invocation?
- How is an agent placed outside the trusted host boundary on macOS, Linux and
  CI systems?
- What response data is genuinely needed by the agent?
- Does the same operation need portable bindings across laptop, CI, VM and Ro?

## Gates

A narrow prototype is justified when one user has a repeated credential-bound
handoff, wants the agent to complete it, and accepts a concrete constrained
adapter for that operation.

A general product direction requires repeated use, more than one independent
user and evidence that the project-request/local-binding model is useful across
different environments or providers.
