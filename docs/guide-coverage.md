# Kimen public content coverage

Updated 2026-09-17.

This inventory keeps editorial guides separate from product documentation and
prevents the public guide library from collapsing back into a collection of
`.env` articles. It maps the current Kimen CLI and the important product
decisions to concrete public examples.

## Guides

Guides begin with a reader problem, decision or programming environment. They
should teach something useful beyond the Kimen command sequence.

| Guide | Primary job |
| --- | --- |
| `coding-agents-and-local-secrets` | Workspace access, human unlock, sessions, trusted child processes and the boundary to planned Operations |
| `kimen-vs-1password-and-cloud-secret-managers` | Product choice and honest alternatives |
| Python, Node.js and Clojure guides | Practice in real programming environments |
| Git, envfile and runtime configuration guides | Problem education and migration |

## Documentation

Documentation begins with Kimen itself. It is the place for complete syntax,
command coverage, supported modes and operational caveats.

| Page | Primary job |
| --- | --- |
| `/docs/` | Installation, five-minute setup, security boundary and command reference |
| `/docs/vaults-secrets-and-sessions/` | Vault and secret lifecycle, multiple vaults, rekeying, sessions and non-interactive unlock |
| `/docs/profiles-and-runtime-projection/` | Profiles, sources, validation and every runtime projection mode |

## CLI coverage

| Capability | Public example |
| --- | --- |
| `vault init`, `path`, `info` | Vaults, secrets and sessions |
| `vault rekey`, `--dry-run`, `--backup-dir`, `--no-backup` | Vaults, secrets and sessions |
| `--vault`, `KIMEN_VAULT` | Vaults, secrets and sessions |
| `secret set`, interactive and `--stdin` | Vaults, secrets and sessions |
| `secret list`, `mv`, `rm` | Vaults, secrets and sessions |
| `secret get --unsafe-stdout` | Vaults, secrets and sessions, with warning |
| passphrase prompt per vault-opening invocation | Vaults, agents, profiles and every language guide |
| `session start --ttl`, `status`, `lock`, `stop` | Vaults, secrets and sessions |
| `KIMEN_SESSION` | Vaults, secrets and sessions |
| `--passphrase-cmd`, `KIMEN_PASSPHRASE`, stdin unlock | Vaults, secrets and sessions, with boundary warning |
| profile lookup through `.kimen/profiles` | Language and profiles guides |
| explicit `--map` | Profiles and runtime projection |
| `KIMEN_PROFILE_DIR` and profile lookup order | Profiles and runtime projection |
| implicit vault source and `secret:` | Profiles and runtime projection |
| `const:` | Profiles and runtime projection |
| `exec:` | Profiles and runtime projection, including external password manager example |
| `env` | Profiles and all language guides |
| `file` | Profiles and runtime configuration guides |
| `envpath` | Profiles, Clojure and runtime configuration guides |
| `stdin` | Profiles and runtime configuration guides |
| inline `--env`, `--file`, `--envpath`, `--stdin` | Profiles and runtime projection |
| `run` | Agents, profiles and language guides |
| `run --files-dir` | Profiles and runtime projection |
| `render --dir` | Profiles and runtime projection |
| `render --systemd-service`, `--runtime-dir`, `--print-systemd-hints` | Profiles and runtime projection |
| `envfile --out` | Profiles and runtime projection |
| `map lint --strict` | Profiles and language guides |
| `plan` | Agents, profiles and runtime configuration guides |
| `doctor --strict` | Profiles and language guides |

## Product questions covered

- Why Kimen instead of a plaintext local file?
- Why Kimen instead of 1Password CLI?
- Why Kimen instead of a cloud secret manager?
- What must be typed on each invocation?
- What does a session change?
- What can a same-user coding agent still do?
- Which receiving processes can read projected values?
- When is workload identity the better production design?
- Which output modes leave persistent plaintext behind?

## Maintenance rule

When the public CLI gains a command, flag, source type or projection mode,
update this inventory and the relevant documentation. Add or change a guide
only when the feature creates a useful reader problem, decision or practical
workflow. Feature completeness belongs to documentation, not to the guide
library.
