

# ZapPoll — Web3 Onchain Polling App

A Starknet-powered polling app where users stake STRK tokens on poll options, with winners splitting the pot proportionally.

## Design System

- **Background**: Deep Starknet navy (#06061a)
- **Primary accent**: Starknet orange (#ff6b35) for CTAs, glows, highlights
- **Secondary accent**: Starknet blue (#1c9fde) for poll bars, links
- **Text**: White headings, muted #a0a0b8 for secondary text
- **Style**: Bold geometric sans-serif headings, minimal UI, gradient backgrounds, soft orange glow effects
- **Fully mobile responsive**

## Pages

### 1. Home / Feed
- Grid/list of active poll cards
- Each card shows: question, two options with competing orange vs blue progress bars showing live stake split, total pot size in STRK, countdown timer, quick "Stake" button
- Filter tabs: Active / Ended / My Polls
- Floating "Create Poll" CTA button with orange glow

### 2. Create Poll
- Form: question input, two option labels, deadline picker, 1 STRK creation deposit notice
- Triggers Starkzap social login if not connected
- Gasless submission via Starkzap Paymaster
- Mock on-chain creation (stored in local state/context)

### 3. Poll Detail Page
- Full question display with live stake distribution bars (orange vs blue)
- User's current stake shown per option
- Input to add more stake on chosen option
- List of recent stakers
- Countdown to deadline
- If deadline passed: "Resolve Poll" button visible to creator

### 4. Resolve Poll
- Poll creator selects winning option after deadline
- Mock proportional distribution calculation shown
- Winners see their payout; losers see forfeited amount

### 5. Profile Page
- Connected wallet address (truncated with copy)
- STRK balance display
- Polls created list
- Polls voted on list
- Login/logout button

## Auth & Transaction Flow
- Starkzap SDK initialized with `network: "sepolia"`
- Social login (email, Google, Twitter) via Starkzap Wallets on first interaction
- Silent wallet creation — no seed phrases or popups
- All transactions gasless via Starkzap Paymaster
- ERC20 module with `sepoliaTokens.STRK` for staking

## Data Management
- Since smart contracts are out of scope, polls and stakes stored in React context/state (in-memory mock)
- On-chain resolution logic mocked with proportional payout calculations
- Starkzap SDK integration is real for wallet connection, token balance reads, and transfer calls

## Footer
- "Powered by Starkzap | Built on Starknet" badge on every page

