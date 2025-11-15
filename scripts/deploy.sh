#!/bin/bash

echo "🚀 Deploying HiddenPay Smart Contract"
echo "======================================"
echo ""

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "❌ Insufficient balance. Need at least 2 SOL for deployment."
    echo "Run: ./scripts/airdrop.sh to get more SOL"
    exit 1
fi

# Install npm dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the program
echo ""
echo "🔨 Building Solana program..."
anchor build

# Deploy the program
echo ""
echo "🚀 Deploying to Devnet..."
anchor deploy

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/hiddenpay-keypair.json)

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📝 Program ID: $PROGRAM_ID"
echo ""
echo "Next steps:"
echo "1. Copy the Program ID above"
echo "2. Update lib/solana-config.ts with this Program ID"
echo "3. Run: npm run init:devnet to initialize the platform"
