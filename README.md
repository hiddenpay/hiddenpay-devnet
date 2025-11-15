![HiddenPay cover](./image/cover.jpg)

## HiddenPay (devnet)

Comprehensive developer guide for the HiddenPay devnet repository.

This repository contains a Solana Anchor program (on-chain program) and a TypeScript/React client used to interact with it. The project includes scripts to build, deploy, test, and bootstrap a development environment on devnet.

## Repository layout

- `Anchor.toml` — Anchor workspace configuration.
- `programs/hiddenpay/` — Anchor program (Rust) source.
- `lib/` — TypeScript client helpers and configuration.
- `scripts/` — Convenience scripts for airdrops, deploys, setup, and init.
- `tests/` — Integration and unit tests (uses Anchor + mocha/ts where applicable).
- `package.json` — Node scripts and JS dependencies.

## Quickstart — high level

1. Install prerequisites (Rust, Solana CLI, Anchor CLI, Node.js).
2. Configure a Solana keypair and set the RPC to `devnet`.
3. Install JS dependencies and build the Anchor program.
4. Deploy to devnet or run the provided TypeScript deploy script.
5. Run tests or start the web client.

This README contains full, step-by-step instructions for each of these steps.

## Prerequisites

The following tools are required. Commands below include examples for Windows (cmd.exe) and Unix-like shells where relevant.

- Rust and Cargo (for Anchor program builds): https://www.rust-lang.org/tools/install
- Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools
- Anchor CLI (coral-xyz/anchor): https://book.anchor-lang.com (install via cargo)
- Node.js (LTS) and npm or yarn
- `ts-node` for running TypeScript deploy scripts (used by `scripts/deploy-devnet.ts`).
- A shell capable of running the included `*.sh` scripts (Git Bash, WSL, or macOS/Linux Terminal). Many `scripts/*.sh` use `chmod` and assume a POSIX shell.

Notes for Windows users
- The repository includes shell scripts (`.sh`). On Windows, either use WSL, Git Bash, or run the TypeScript deploy script directly with `npm run deploy:devnet` (see below) to avoid running the `.sh` scripts.

## Install instructions

Follow these steps in order.

1) Install Rust and Cargo

Follow official instructions. Verify with:

```cmd
rustc --version
cargo --version
```

2) Install Solana CLI

Follow the Solana docs. Verify with:

```cmd
solana --version
```

Set network to `devnet`:

```cmd
solana config set --url https://api.devnet.solana.com
```

Create or locate your keypair file (the default is `~/.config/solana/id.json`):

```cmd
solana-keygen new --outfile %USERPROFILE%\.config\solana\id.json
```

3) Install Anchor CLI

Anchor builds and tests the on-chain Rust program. Installation via Cargo (may require `--locked` flags depending on Anchor version):

```bash
# Recommended to run in a POSIX shell (WSL or macOS/Linux)
cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli --locked
```

After installing, verify:

```cmd
anchor --version
```

If you run into installation issues, check the Anchor docs for the latest installation method.

4) Install Node.js and JS dependencies

Install Node.js (LTS) from nodejs.org. From the repository root:

```cmd
npm install
# or, if you prefer yarn:
# yarn
```

The repository uses `ts-node` for `deploy-devnet.ts`. If you don't have `ts-node` installed globally, you can run `npx ts-node` or use the npm script `deploy:devnet`.

## Build the Anchor program

From repository root you can run the package script that calls Anchor:

```cmd
npm run build:program
```

This runs `anchor build` which compiles the Rust program in `programs/hiddenpay` and places the program artifacts in `target/` (Anchor workspace layout).

If you prefer to run it directly in a POSIX shell:

```bash
cd programs/hiddenpay
anchor build
```

## Deploying

This repo has a few deployment options.

- Use the shell deploy script (POSIX): `scripts/deploy.sh` (requires `chmod +x` and a POSIX shell).
- Use the TypeScript devnet deploy helper: `npm run deploy:devnet` (uses `ts-node` to run `scripts/deploy-devnet.ts`).

Recommended: for Windows (cmd.exe) users, run the TypeScript deploy script which avoids shell scripts:

```cmd
npm run deploy:devnet
```

For POSIX environments (macOS, Linux, WSL, Git Bash):

```bash
./scripts/deploy.sh
```

Notes about Anchor deploy
- Anchor uses the `ANCHOR_PROVIDER_URL` and `ANCHOR_WALLET` environment variables or the values in `Anchor.toml`. If you need to explicitly set them:

```bash
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
export ANCHOR_WALLET=~/.config/solana/id.json
anchor deploy
```

## Airdrops and funding local wallet

There is a helper script at `scripts/airdrop.sh`. On devnet you can request SOL airdrops with the Solana CLI directly:

```cmd
solana airdrop 2
```

Or run the script (POSIX):

```bash
./scripts/airdrop.sh
```

## Running tests

This repository includes tests using Anchor. The `package.json` exposes a script for Solana tests:

```cmd
npm run test:solana
```

Under the hood that runs `anchor test` which will build the program, run a local validator for tests, and execute the test suite defined in `tests/` (for integration tests, e.g. `tests/hiddenpay.test.ts`).

Notes when running tests:
- Tests may require additional environment variables (wallet path, cluster URL). Check `Anchor.toml` and the test code.
- Anchor will spawn a local validator. Ensure you have sufficient resources.

## Development (client)

This repo contains a TypeScript/React client that uses `@solana/web3.js` and utilities in `lib/`.

Start the dev server (Next.js is used in `package.json`):

```cmd
npm run dev
```

Build the production client:

```cmd
npm run build
npm run start
```

## Important scripts (from `package.json`)

- `npm run build:program` — runs `anchor build` to compile the on-chain program.
- `npm run deploy` — runs `scripts/deploy.sh` (POSIX script).
- `npm run deploy:devnet` — runs the TypeScript deploy helper (`ts-node scripts/deploy-devnet.ts`).
- `npm run test:solana` — runs `anchor test`.
- `npm run setup` — runs `scripts/setup.sh` to prepare the environment (POSIX).

If you're on Windows and cannot run the `.sh` scripts, prefer `deploy:devnet` and other TypeScript/Node-based helpers when available.

## Environment variables and configuration

- `ANCHOR_PROVIDER_URL` — optional override for provider RPC URL.
- `ANCHOR_WALLET` — path to the wallet keypair used by Anchor.

Anchor also reads from `Anchor.toml`; review it to see workspace-level settings (cluster, program ids, etc.).

## Architecture overview

- On-chain program: `programs/hiddenpay/src/lib.rs` — Rust program written for the Solana blockchain using Anchor.
- Client/library: `lib/` — TypeScript helpers to connect to the program, config (`solana-config.ts`), and program wrapper (`solana-program.ts`).
- Tests: `tests/hiddenpay.test.ts` — integration tests that exercise the Anchor program.

Read the code in those folders to understand account layouts, entrypoints, and helper functions.

## Troubleshooting

- Anchor build fails with Rust/cargo errors: ensure you have a compatible Rust toolchain (use `rustup update` and `rustup default stable`).
- Anchor CLI installation problems: check cargo install logs and try installing a specific tag that matches Anchor docs.
- `chmod` or shell script execution on Windows: use WSL or Git Bash, or use the Node/TypeScript scripts instead.
- Tests failing locally: ensure Solana CLI and Anchor are correctly installed and your wallet has funds (use `solana airdrop` on devnet).

If you hit an error, capture the full output and check:

1. `solana config get`
2. `anchor --version`
3. `rustc --version`
4. `node --version` and `npm --version`

Share those with maintainers when opening an issue.

## Contributing

1. Fork the repo and create a feature branch.
2. Build the program and run tests locally.
3. Open a PR with a clear description and tests for behavior changes.

## Security and secrets

- Do not commit your `id.json` or any wallet keypairs.
- Use environment variables or a secure key management solution for private keys in CI.

## License

This repository does not include an explicit license file. If you intend to make this public, add a `LICENSE` file to declare terms.

## Where to go next

- Inspect `programs/hiddenpay/src/lib.rs` to understand program accounts and instructions.
- Inspect `tests/hiddenpay.test.ts` to see example flows and test harness usage.
- Use `npm run deploy:devnet` to deploy to devnet and `npm run test:solana` to run tests.

---

If you'd like, I can also:
- add a short `CONTRIBUTING.md` and `LICENSE` file,
- create scripts to simplify Windows usage (PowerShell), or
- generate a minimal local Docker environment for reproducible builds.

Let me know which of those you'd like next.
