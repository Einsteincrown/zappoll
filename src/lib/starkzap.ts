import { StarkZap, sepoliaTokens } from "starkzap";

export const sdk = new StarkZap({ network: "sepolia" });
export const STRK = sepoliaTokens.STRK;
