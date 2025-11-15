#!/bin/bash

echo "💸 Requesting Devnet SOL Airdrop"
echo "================================="
echo ""

# Airdrop 2 SOL
echo "Requesting 2 SOL from Devnet faucet..."
solana airdrop 2

# Wait a bit
sleep 2

# Check balance
echo ""
echo "Current balance:"
solana balance

echo ""
echo "If airdrop failed, visit: https://faucet.solana.com/"
echo "Your wallet address:"
solana address
