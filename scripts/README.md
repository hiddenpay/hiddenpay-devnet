# HiddenPay Deployment Scripts

Automated scripts to simplify HiddenPay deployment process.

## Available Scripts

### 1. setup.sh - Complete Environment Setup

Installs all required dependencies:
- Solana CLI
- Rust & Cargo
- Anchor CLI
- Configures Solana for Devnet
- Generates wallet if needed

**Usage:**
\`\`\`bash
npm run setup
\`\`\`

or

\`\`\`bash
chmod +x scripts/setup.sh
./scripts/setup.sh
\`\`\`

### 2. airdrop.sh - Get Devnet SOL

Requests SOL from Devnet faucet.

**Usage:**
\`\`\`bash
npm run airdrop
\`\`\`

or

\`\`\`bash
chmod +x scripts/airdrop.sh
./scripts/airdrop.sh
\`\`\`

### 3. deploy.sh - Deploy Smart Contract

Builds and deploys the Solana program to Devnet.

**Usage:**
\`\`\`bash
npm run deploy
\`\`\`

or

\`\`\`bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
\`\`\`

### 4. init-platform.sh - Initialize Platform

Runs the initialization script to set up platform on-chain.

**Usage:**
\`\`\`bash
npm run init:platform
\`\`\`

or

\`\`\`bash
chmod +x scripts/init-platform.sh
./scripts/init-platform.sh
\`\`\`

## Complete Deployment Flow

Run these commands in order:

\`\`\`bash
# 1. Install everything
npm run setup

# 2. Get Devnet SOL (free)
npm run airdrop

# 3. Deploy smart contract
npm run deploy

# 4. Initialize platform
npm run init:platform
\`\`\`

## Manual Alternative

If scripts don't work, use NPM commands:

\`\`\`bash
# Install dependencies
npm install

# Build program
npm run build:program

# Deploy to Devnet
anchor deploy

# Initialize
npm run deploy:devnet
\`\`\`

## Notes

- Scripts automatically handle permissions (chmod +x)
- All scripts output clear status messages
- Errors will be displayed with troubleshooting tips
- Program ID will be displayed after deployment

## Troubleshooting

If scripts fail:

1. **Check permissions:**
   \`\`\`bash
   chmod +x scripts/*.sh
   \`\`\`

2. **Run manually:**
   \`\`\`bash
   ./scripts/setup.sh
   \`\`\`

3. **Check logs** for specific error messages
