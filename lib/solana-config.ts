import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export const SOLANA_NETWORK = "devnet";
export const SOLANA_RPC_URL = clusterApiUrl(SOLANA_NETWORK);

// Replace the address below with your deployed program ID from Devnet/Mainnet
export const HIDDENPAY_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111" // Replace after deployment
);

// Platform PDA
export const [PLATFORM_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("platform")],
  HIDDENPAY_PROGRAM_ID
);

// SPL Token mints on Devnet
export const SUPPORTED_TOKENS = {
  SOL: {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    mint: PublicKey.default, // Native SOL
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    mint: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"), // Devnet USDC
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    mint: new PublicKey("EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"), // Devnet USDT
  },
};

export function getSolanaConnection() {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

export function getSolanaExplorerUrl(address: string) {
  return `https://explorer.solana.com/address/${address}?cluster=${SOLANA_NETWORK}`;
}
