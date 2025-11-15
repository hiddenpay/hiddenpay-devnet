"use client";

import { useWallet } from "@/lib/wallet-context";
import { getSolanaConnection, HIDDENPAY_PROGRAM_ID, PLATFORM_PDA } from "./solana-config";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

export function useSolanaProgram() {
  const { publicKey, signTransaction } = useWallet();

  const createMerchant = async (merchantName: string) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }

    const connection = getSolanaConnection();
    
    // Derive merchant PDA
    const [merchantPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), publicKey.toBuffer()],
      HIDDENPAY_PROGRAM_ID
    );

    console.log("Creating merchant with PDA:", merchantPDA.toString());

    // In a real implementation, this would use Anchor IDL
    // For now, return the merchant PDA
    return {
      merchantPDA: merchantPDA.toString(),
      signature: "simulated-tx-" + Date.now(),
    };
  };

  const createProduct = async (
    merchantPDA: string,
    name: string,
    description: string,
    price: number,
    durationDays: number,
    tokenMint: string
  ) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }

    const merchantKey = new PublicKey(merchantPDA);
    
    // Derive product PDA
    const [productPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), merchantKey.toBuffer(), Buffer.from(name)],
      HIDDENPAY_PROGRAM_ID
    );

    console.log("Creating product with PDA:", productPDA.toString());

    return {
      productPDA: productPDA.toString(),
      signature: "simulated-tx-" + Date.now(),
    };
  };

  const subscribe = async (productPDA: string, amount: number) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }

    const productKey = new PublicKey(productPDA);
    
    // Derive subscription PDA
    const [subscriptionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("subscription"), publicKey.toBuffer(), productKey.toBuffer()],
      HIDDENPAY_PROGRAM_ID
    );

    console.log("Creating subscription with PDA:", subscriptionPDA.toString());

    return {
      subscriptionPDA: subscriptionPDA.toString(),
      signature: "simulated-tx-" + Date.now(),
    };
  };

  const verifySubscription = async (subscriptionPDA: string) => {
    const connection = getSolanaConnection();
    
    // Check if subscription account exists and is valid
    try {
      const subscriptionKey = new PublicKey(subscriptionPDA);
      const accountInfo = await connection.getAccountInfo(subscriptionKey);
      
      return accountInfo !== null;
    } catch (error) {
      console.error("Error verifying subscription:", error);
      return false;
    }
  };

  return {
    createMerchant,
    createProduct,
    subscribe,
    verifySubscription,
  };
}
