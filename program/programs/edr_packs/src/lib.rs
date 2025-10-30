use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked,
};

declare_id!("H7bsCvtWx5TRF9MztdL9AKkZzhbwdDUQtotjUQPwVCbi");

#[program]
pub mod edr_packs {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, prices: [u64;3], amounts: [u64;3]) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.mint = ctx.accounts.mint.key();
        cfg.bump_config = ctx.bumps.config;
        cfg.bump_vault  = ctx.bumps.vault_authority;
        cfg.prices = prices;
        cfg.amounts = amounts;
        Ok(())
    }

    pub fn buy_pack(ctx: Context<BuyPack>, tier: u8) -> Result<()> {
        require!(tier < 3, ErrorCode::InvalidTier);
        let price  = ctx.accounts.config.prices[tier as usize];
        let amount = ctx.accounts.config.amounts[tier as usize];

        // SOL: buyer -> admin
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.admin.key(),
            price,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // EDR (Token-2022 via token_interface): vault_ata -> buyer_ata
        let bump = ctx.accounts.config.bump_vault;
let mint_key = ctx.accounts.mint.key();
let signer_seeds: &[&[u8]] = &[
    b"vault",
    mint_key.as_ref(),
    &[bump],
];

// format attendu par new_with_signer: &[&[&[u8]]]
let signer = &[signer_seeds];

        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.vault_ata.to_account_info(),
                    to: ctx.accounts.buyer_ata.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                signer,
            ),
            amount,
            ctx.accounts.mint.decimals,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    /// CHECK: PDA
    #[account(seeds = [b"vault", mint.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = vault_authority,
        associated_token::token_program = token_program,
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        space = 8 + Config::SIZE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>, // Token-2022 via interface
}

#[derive(Accounts)]
pub struct BuyPack<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// admin qui reçoit les SOL
    #[account(mut, address = config.admin)]
    pub admin: UncheckedAccount<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    /// CHECK: PDA
    #[account(
        seeds = [b"vault", mint.key().as_ref()],
        bump = config.bump_vault
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vault_authority,
        associated_token::token_program = token_program,
    )]
    pub vault_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program,
    )]
    pub buyer_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(seeds=[b"config"], bump = config.bump_config)]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>, // Token-2022 via interface
}

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub bump_config: u8,
    pub bump_vault: u8,
    pub prices: [u64;3],
    pub amounts: [u64;3],
}
impl Config {
    pub const SIZE: usize = 32 + 32 + 1 + 1 + (8*3) + (8*3);
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid tier")]
    InvalidTier,
}
