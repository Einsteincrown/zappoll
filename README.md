ZapPoll

Onchain prediction polls built on Starknet. You get to stake STRK on the outcome you believe in, winners split the pot.

## Live Demo

https://zappoll.vercel.app

## What is ZapPoll?

ZapPoll is a lightweight prediction market where anyone can create a poll, stake STRK on an outcome, and earn from being right. 

Built for the Starkzap Developer Bounty.

## How It Works

1. Sign in with email or Twitter — wallet created silently in the background
2. Create a poll with two options and a deadline
3. Stake STRK on the outcome you believe in
4. When the poll closes, the creator resolves it
5. Winners split the entire pot proportionally to their stake

## Features

- Social login via Privy — email and Twitter/X supported
- Invisible wallet creation — no seed phrases, no popups
- Gasless transactions via AVNU Paymaster
- STRK staking and transfers via Starkzap ERC20 module
- Live stake distribution bar showing real-time poll positions
- Poll creation, voting, and resolution in one app
- Fully deployed on Starknet Sepolia testnet

- (## known issue: 

Login Flow Inconsistency

Users may experience inconsistent login success after authentication.

The login button responds, but session persistence occasionally fails.

Status:

Auth flow is connected and triggers correctly

Issue likely tied to session handling or state synchronization

Next Steps:

Refine session management logic

Improve error handling and user feedback

Continue debugging auth response flow
)

## Tech Stack

- React + TypeScript
- Starkzap SDK v2 — wallet, paymaster, ERC20
- Privy — social login and embedded wallet
- Starknet Sepolia testnet
- Vite
- Vercel

## Getting Started

```bash
git clone https://github.com/Einsteincrown/zappoll
cd zappoll
npm install --legacy-peer-deps
npm run dev
```

## Environment Variables

Create a `.env` file in the root:

```
VITE_PRIVY_APP_ID=your_privy_app_id
```

## Testing the App

1. Go to https://zappoll.vercel.app
2. Sign in with email or Twitter
3. Get free Sepolia STRK from https://starknet-faucet.vercel.app
4. Create a poll or stake on an existing one
5. Wait for the deadline and claim winnings

## Built With

- [Starkzap](https://docs.starknet.io/build/starkzap) — TypeScript SDK for Starknet
- [Privy](https://privy.io) — Embedded wallets and social login
- [Starknet](https://starknet.io) — Layer 2 ZK rollup
- [AVNU](https://avnu.fi) — Gasless transaction paymaster

