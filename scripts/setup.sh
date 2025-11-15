#!/bin/bash

echo "🚀 HiddenPay Smart Contract Setup Script"
echo "========================================="
echo ""

# Check if Solana is installed
if ! command -v solana &> /dev/null
then
    echo "📦 Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
else
    echo "✅ Solana CLI already installed"
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null
then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust already installed"
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null
then
    echo "📦 Installing Anchor CLI..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
else
    echo "✅ Anchor CLI already installed"
fi

# Setup Solana for Devnet
echo ""
echo "🔧 Configuring Solana for Devnet..."
solana config set --url https://api.devnet.solana.com

# Check if wallet exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Generating new wallet..."
    solana-keygen new --outfile ~/.config/solana/id.json
else
    echo "✅ Wallet already exists"
fi

# Show wallet address
echo ""
echo "📍 Your Wallet Address:"
solana address

# Check balance
echo ""
echo "💰 Current Balance:"
solana balance

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/airdrop.sh (to get Devnet SOL)"
echo "2. Run: ./scripts/deploy.sh (to deploy smart contract)"
