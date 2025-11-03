# Liquity Mainnet-Fork Drain CTF

Hunt for drain vectors on the real Liquity contracts using a strictly-forced mainnet fork. We mirror mainnet addresses and balances locally, measure loss on key pools, and emit a CTF flag when you fully drain the pools and increase your own balance on the fork.

Important: Do not attack mainnet. All testing happens on your local fork.

See also: `AI_PLAYBOOK.md` for an agent-oriented, step-by-step guide.

## What’s included

- Mainnet address map: `config/liquity.mainnet.addresses.json`
- Fork verification: `scripts/verifyMainnetState.js` (checks code and ETH balances on fork)
- Balance snapshot: `scripts/fetchBalances.js` (ETH + LUSD/LQTY snapshot)
- Pool top-up (optional): `scripts/seedPools.js`
- CTF flag monitor: `contracts/CTFMonitor.sol` + scripts
  - Snapshots ETH balances of selected Liquity pools
  - Enforce success criteria by default:
    - Drain all targeted pools (<= 1 wei remaining)
    - Participant balance increased by at least MIN_GAIN_ETH
  - Emits a FLAG event on success
- Attacker scaffold: `contracts/Attacker.sol`
- Helpers for experimentation: `scripts/impersonate.js`, `scripts/callRaw.js`

## Strict fork mode

We enforce a mainnet fork when using the Hardhat network. Default RPC:

- Ankr (provided):
  https://rpc.ankr.com/eth/5d5002658e20aca493616af98cfdaa3deb70b5c40b21bc2da4bf05c0b86cef09

Override with `ANVIL_FORK_URL` or `ALCHEMY_API_KEY`. Change height with `FORK_BLOCK` (default 16233419).

## Quick start

Prereqs
- Yarn (workspaces)
- Node 14–16 (monorepo engines)
- Anvil or Hardhat

### 1) Install & compile

```bash
# from repo root
yarn install
yarn ctf:compile
```

### 2) Start fork

```bash
# Preferred: Anvil + provided Ankr RPC
export ANVIL_FORK_URL=https://rpc.ankr.com/eth/5d5002658e20aca493616af98cfdaa3deb70b5c40b21bc2da4bf05c0b86cef09
yarn ctf:anvil
# Alternatively rely on hardhat in-process fork via ALCHEMY_API_KEY
```

### 3) Verify fork mirrors Liquity

```bash
yarn ctf:verify
# Optional snapshot
yarn ctf:snapshot
```

### 4) Deploy the CTF monitor and enroll

```bash
MIN_LOSS_ETH=10 \
MIN_GAIN_ETH=1 \
DRAIN_ALL=true \
CTF_FLAG="LQTY{your-custom-flag}" \
yarn ctf:monitor-deploy
# Auto-enrolls first signer by default; or explicitly:
MONITOR_ADDR=0x... yarn workspace @liquity/ctf-drain-challenge monitor:enroll
```

Targets by default: activePool, stabilityPool, defaultPool, collSurplusPool, gasPool. Override with `MONITOR_TARGETS`.

### 5) Attack and iterate

- Use `contracts/Attacker.sol` or your own scripts/contracts.
- Send raw calls:
  ```bash
  TARGET=0x... DATA=0x... VALUE_ETH=0.0 yarn workspace @liquity/ctf-drain-challenge call:raw
  ```
- Impersonation may be used for reconnaissance, but final success should be permissionless (anyone callable). For the final attempt, avoid privileged signers.

### 6) Reveal the flag

```bash
# After your drain attempt (must fully drain pools AND increase your balance)
yarn ctf:monitor-reveal
```

On success, the transaction emits CTF_FLAG with the clear-text flag and logs your gain.

## Pass/Fail definition

- PASS: All targeted pools have <= 1 wei remaining AND your enrolled address balance increased by >= MIN_GAIN_ETH.
- FAIL: If you cannot fully drain the targeted pools or your balance didn’t increase on the fork.

## Troubleshooting

- If `yarn` is missing, install Yarn or enable Corepack.
- If `verify` shows zero codeBytes, ensure you’re on a forked network and RPC is reachable.
- Adjust the block height with `FORK_BLOCK` for determinism.
