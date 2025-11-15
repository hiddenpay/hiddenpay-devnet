use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("HiddenPayProgram11111111111111111111111111");

#[program]
pub mod hiddenpay {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.total_subscriptions = 0;
        platform.total_merchants = 0;
        platform.bump = ctx.bumps.platform;
        
        msg!("HiddenPay platform initialized");
        Ok(())
    }

    pub fn create_merchant(
        ctx: Context<CreateMerchant>,
        merchant_name: String,
    ) -> Result<()> {
        require!(merchant_name.len() <= 50, ErrorCode::NameTooLong);
        
        let merchant = &mut ctx.accounts.merchant;
        merchant.authority = ctx.accounts.authority.key();
        merchant.name = merchant_name;
        merchant.total_products = 0;
        merchant.total_revenue = 0;
        merchant.is_verified = false;
        merchant.bump = ctx.bumps.merchant;
        
        let platform = &mut ctx.accounts.platform;
        platform.total_merchants += 1;
        
        msg!("Merchant created: {}", merchant.name);
        Ok(())
    }

    pub fn create_subscription_product(
        ctx: Context<CreateSubscriptionProduct>,
        name: String,
        description: String,
        price: u64,
        duration_days: u32,
        token_mint: Pubkey,
    ) -> Result<()> {
        require!(name.len() <= 50, ErrorCode::NameTooLong);
        require!(description.len() <= 200, ErrorCode::DescriptionTooLong);
        require!(price > 0, ErrorCode::InvalidPrice);
        require!(duration_days > 0, ErrorCode::InvalidDuration);
        
        let product = &mut ctx.accounts.product;
        product.merchant = ctx.accounts.merchant.key();
        product.name = name;
        product.description = description;
        product.price = price;
        product.duration_days = duration_days;
        product.token_mint = token_mint;
        product.total_subscribers = 0;
        product.is_active = true;
        product.bump = ctx.bumps.product;
        
        let merchant = &mut ctx.accounts.merchant;
        merchant.total_products += 1;
        
        msg!("Subscription product created: {}", product.name);
        Ok(())
    }

    pub fn subscribe(ctx: Context<Subscribe>) -> Result<()> {
        let product = &ctx.accounts.product;
        require!(product.is_active, ErrorCode::ProductInactive);
        
        // Transfer payment from user to merchant
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, product.price)?;
        
        // Create subscription pass
        let subscription = &mut ctx.accounts.subscription;
        subscription.user = ctx.accounts.user.key();
        subscription.product = product.key();
        subscription.merchant = product.merchant;
        subscription.start_time = Clock::get()?.unix_timestamp;
        subscription.end_time = subscription.start_time + (product.duration_days as i64 * 86400);
        subscription.is_active = true;
        subscription.proof_hash = [0; 32]; // Will be updated with ZK proof
        subscription.bump = ctx.bumps.subscription;
        
        // Update counters
        let product = &mut ctx.accounts.product;
        product.total_subscribers += 1;
        
        let merchant = &mut ctx.accounts.merchant;
        merchant.total_revenue += product.price;
        
        let platform = &mut ctx.accounts.platform;
        platform.total_subscriptions += 1;
        
        msg!("Subscription created for user: {}", subscription.user);
        Ok(())
    }

    pub fn verify_subscription(ctx: Context<VerifySubscription>) -> Result<bool> {
        let subscription = &ctx.accounts.subscription;
        let current_time = Clock::get()?.unix_timestamp;
        
        let is_valid = subscription.is_active && current_time <= subscription.end_time;
        
        msg!("Subscription verified: {}", is_valid);
        Ok(is_valid)
    }

    pub fn update_zk_proof(
        ctx: Context<UpdateZKProof>,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        subscription.proof_hash = proof_hash;
        
        msg!("ZK proof updated for subscription");
        Ok(())
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        subscription.is_active = false;
        
        msg!("Subscription cancelled");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Platform::LEN,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMerchant<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Merchant::LEN,
        seeds = [b"merchant", authority.key().as_ref()],
        bump
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubscriptionProduct<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + SubscriptionProduct::LEN,
        seeds = [b"product", merchant.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub product: Account<'info, SubscriptionProduct>,
    
    #[account(
        mut,
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant.bump,
        has_one = authority
    )]
    pub merchant: Account<'info, Merchant>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Subscribe<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Subscription::LEN,
        seeds = [b"subscription", user.key().as_ref(), product.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    
    #[account(mut)]
    pub product: Account<'info, SubscriptionProduct>,
    
    #[account(mut)]
    pub merchant: Account<'info, Merchant>,
    
    #[account(mut)]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub merchant_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifySubscription<'info> {
    pub subscription: Account<'info, Subscription>,
}

#[derive(Accounts)]
pub struct UpdateZKProof<'info> {
    #[account(
        mut,
        has_one = user
    )]
    pub subscription: Account<'info, Subscription>,
    
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(
        mut,
        has_one = user
    )]
    pub subscription: Account<'info, Subscription>,
    
    pub user: Signer<'info>,
}

#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub total_subscriptions: u64,
    pub total_merchants: u64,
    pub bump: u8,
}

impl Platform {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

#[account]
pub struct Merchant {
    pub authority: Pubkey,
    pub name: String,
    pub total_products: u32,
    pub total_revenue: u64,
    pub is_verified: bool,
    pub bump: u8,
}

impl Merchant {
    pub const LEN: usize = 32 + (4 + 50) + 4 + 8 + 1 + 1;
}

#[account]
pub struct SubscriptionProduct {
    pub merchant: Pubkey,
    pub name: String,
    pub description: String,
    pub price: u64,
    pub duration_days: u32,
    pub token_mint: Pubkey,
    pub total_subscribers: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl SubscriptionProduct {
    pub const LEN: usize = 32 + (4 + 50) + (4 + 200) + 8 + 4 + 32 + 8 + 1 + 1;
}

#[account]
pub struct Subscription {
    pub user: Pubkey,
    pub product: Pubkey,
    pub merchant: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
    pub proof_hash: [u8; 32],
    pub bump: u8,
}

impl Subscription {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 1 + 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid duration")]
    InvalidDuration,
    #[msg("Product is inactive")]
    ProductInactive,
}
