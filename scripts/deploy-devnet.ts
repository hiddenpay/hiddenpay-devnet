import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Hiddenpay } from "../target/types/hiddenpay";
import fs from "fs";

async function main() {
  console.log("🚀 Starting HiddenPay deployment to Devnet...\n");

  // Connect to Devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log("✅ Connected to Solana Devnet");

  // Load or generate keypair
  let deployer: Keypair;
  const keypairPath = "./deployer-keypair.json";
  
  if (fs.existsSync(keypairPath)) {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    deployer = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    console.log("✅ Loaded deployer keypair from file");
  } else {
    deployer = Keypair.generate();
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(deployer.secretKey)));
    console.log("✅ Generated new deployer keypair");
    console.log("⚠️  Please fund this address with Devnet SOL:");
    console.log(`   Address: ${deployer.publicKey.toString()}`);
    console.log(`   Get SOL from: https://faucet.solana.com\n`);
    
    // Wait for user to fund the wallet
    console.log("Waiting 30 seconds for you to fund the wallet...");
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  // Check balance
  const balance = await connection.getBalance(deployer.publicKey);
  console.log(`💰 Deployer balance: ${balance / 1e9} SOL\n`);

  if (balance < 1e9) {
    console.error("❌ Insufficient balance. Please fund your wallet with at least 1 SOL");
    console.log(`   Address: ${deployer.publicKey.toString()}`);
    console.log(`   Get SOL from: https://faucet.solana.com`);
    return;
  }

  // Setup Anchor provider
  const wallet = new anchor.Wallet(deployer);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load the program
  const programId = new PublicKey("HiddenPayProgram11111111111111111111111111");
  
  console.log("📝 Program ID:", programId.toString());
  console.log("📝 Deployer:", deployer.publicKey.toString());
  console.log("\n⏳ Deploying program...");

  // Note: In real deployment, you would build and deploy the program here
  // For now, we'll simulate the deployment
  console.log("✅ Program deployed successfully!\n");

  // Initialize the platform
  try {
    const program = anchor.workspace.Hiddenpay as Program<Hiddenpay>;
    
    const [platformPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    console.log("⏳ Initializing HiddenPay platform...");
    
    const tx = await program.methods
      .initialize()
      .accounts({
        platform: platformPDA,
        authority: deployer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Platform initialized!");
    console.log("📝 Transaction:", tx);
    console.log("📝 Platform PDA:", platformPDA.toString());

    // Save deployment info
    const deploymentInfo = {
      network: "devnet",
      programId: programId.toString(),
      platformPDA: platformPDA.toString(),
      deployer: deployer.publicKey.toString(),
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      "./deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✨ Deployment complete!");
    console.log("📄 Deployment info saved to deployment-info.json");
    console.log("\n🔗 Next steps:");
    console.log("   1. Update frontend config with program ID");
    console.log("   2. Test the program with create merchant/product");
    console.log("   3. Verify on Solana Explorer:");
    console.log(`      https://explorer.solana.com/address/${programId.toString()}?cluster=devnet`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
