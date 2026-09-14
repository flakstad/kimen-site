# Stronger bounded agent operations

Status: product and architecture exploration, deliberately separate from the
current website story.

Date: 2026-09-14

## Decision for the current product story

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

The public product story should explain this useful behavior directly. It
should not depend on a speculative Actions architecture.

## The stronger problem

Some agent work reaches an external operation which requires a credential much
broader than the desired outcome. The current choices are often:

1. give the agent the credential;
2. keep the credential back and perform the operation manually.

A stronger Kimen boundary would let an agent cause one permitted external
effect without receiving the underlying credential and without choosing an
arbitrary process which receives it.

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
