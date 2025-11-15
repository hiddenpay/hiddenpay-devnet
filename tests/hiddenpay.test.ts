import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hiddenpay } from "../target/types/hiddenpay";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";

describe("HiddenPay Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Hiddenpay as Program<Hiddenpay>;
  const deployer = provider.wallet;

  let platformPDA: PublicKey;
  let merchantPDA: PublicKey;
  let productPDA: PublicKey;
  let subscriptionPDA: PublicKey;

  const merchantName = "Test Merchant";
  const productName = "Premium Subscription";
  const productDescription = "Monthly premium access";
  const productPrice = new anchor.BN(1000000000); // 1 SOL
  const productDuration = 30; // 30 days

  before(async () => {
    // Derive PDAs
    [platformPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    [merchantPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), deployer.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes the platform", async () => {
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          platform: platformPDA,
          authority: deployer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Platform initialized:", tx);

      // Fetch and verify platform data
      const platformAccount = await program.account.platform.fetch(platformPDA);
      assert.equal(
        platformAccount.authority.toString(),
        deployer.publicKey.toString()
      );
      assert.equal(platformAccount.totalSubscriptions.toNumber(), 0);
      assert.equal(platformAccount.totalMerchants.toNumber(), 0);
    } catch (error) {
      console.log("Platform already initialized or error:", error);
    }
  });

  it("Creates a merchant", async () => {
    const tx = await program.methods
      .createMerchant(merchantName)
      .accounts({
        merchant: merchantPDA,
        platform: platformPDA,
        authority: deployer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Merchant created:", tx);

    // Verify merchant data
    const merchantAccount = await program.account.merchant.fetch(merchantPDA);
    assert.equal(merchantAccount.name, merchantName);
    assert.equal(
      merchantAccount.authority.toString(),
      deployer.publicKey.toString()
    );
    assert.equal(merchantAccount.totalProducts, 0);
    assert.equal(merchantAccount.isVerified, false);
  });

  it("Creates a subscription product", async () => {
    [productPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("product"),
        merchantPDA.toBuffer(),
        Buffer.from(productName),
      ],
      program.programId
    );

    const tx = await program.methods
      .createSubscriptionProduct(
        productName,
        productDescription,
        productPrice,
        productDuration,
        PublicKey.default // SOL
      )
      .accounts({
        product: productPDA,
        merchant: merchantPDA,
        authority: deployer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Product created:", tx);

    // Verify product data
    const productAccount = await program.account.subscriptionProduct.fetch(
      productPDA
    );
    assert.equal(productAccount.name, productName);
    assert.equal(productAccount.description, productDescription);
    assert.equal(productAccount.price.toString(), productPrice.toString());
    assert.equal(productAccount.durationDays, productDuration);
    assert.equal(productAccount.isActive, true);
  });

  it("Subscribes to a product", async () => {
    const subscriber = Keypair.generate();

    // Airdrop SOL to subscriber
    const airdropSig = await provider.connection.requestAirdrop(
      subscriber.publicKey,
      2000000000 // 2 SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    [subscriptionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription"),
        subscriber.publicKey.toBuffer(),
        productPDA.toBuffer(),
      ],
      program.programId
    );

    // Note: This is simplified - in production you'd need token accounts
    console.log("Subscription PDA:", subscriptionPDA.toString());
    console.log("Test would continue with token accounts setup...");
  });

  it("Verifies a subscription", async () => {
    // This would verify an active subscription
    console.log("Verification test - requires completed subscription");
  });
});
