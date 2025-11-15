#!/bin/bash

echo "⚙️  Initializing HiddenPay Platform"
echo "===================================="
echo ""

# Run the TypeScript initialization script
npx ts-node scripts/deploy-devnet.ts

echo ""
echo "✅ Platform initialized!"
echo "You can now use the dashboard to create subscriptions and verify payments."
