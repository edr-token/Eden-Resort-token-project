# Eden Resort Token -- Anchor Program (EDR Packs)

This folder contains the **on-chain Solana program** used in the
Eden Resort Token Demo for the Hackathon 2025.

The program is written in **Rust** using the **Anchor
framework**, and deployed on **Devnet**.

---

##  Program Information

- **Program Name:** `edr_packs`
- **Cluster:** `devnet`
- **Program ID:** `H7bsCvtWx5TRF9MztdL9AKkZzhbwdDUQtotjUQPwVCbi`
- **Deployed Address:**
[View on Solana
Explorer](https://explorer.solana.com/address/H7bsCvtWx5TRF9MztdL9AKkZzhbwdDUQtotjUQPwVCbi?cluster=devnet)
- **IDL Path (auto-generated):** `target/idl/edr_packs.json`

---

##  Token Information (EDRB)

- **Token Symbol:** EDRB
- **Mint Address:** `JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd`
- **Decimals:** `9`
- **Supply:** `100,000,000 EDRB`
- **Owner / Mint Authority:** Seller wallet
- **Logo:** [View on
IPFS](https://ipfs.io/ipfs/bafybeigep5kmo455mf77k332uic4guossykat424knnzk7yn2rzie2icha)
- **Metadata (IPFS):** [EDRB Metadata
JSON](https://ipfs.io/ipfs/bafkreib5o3awvf3w675xqayqewyqzfsqaesxrblm6ezokr5n2ngdg432ya)

---

##  Program Overview

The program handles the sale and distribution of **EDR token packs**
(Silver, Gold, Platinum) directly on-chain.

### Core Instruction
- **`buy_pack`**
Transfers SOL from the buyer to the seller and sends the corresponding
amount of EDRB tokens.
Initializes the ATA for the buyer if it does not exist.

### Pack Details (Demo Values)
| Pack | Price (SOL) | Tokens (EDR) | Description |
|------|-------------|---------------|--------------|
| Silver | 0.5 | 1,000 | Entry-level pack for first-time users |
| Gold | 1.0 | 5,000 | Mid-tier pack with exclusive resort benefits
|
| Platinum | 2.0 | 12,000 | Premium pack with top-tier access and
perks |

---

##  Related Wallets (Devnet)

| Role | Public Address | Description |
|------|----------------|--------------|
| Seller (Resort) | `2Ku21RtZMxPQ24pVDmm4VkZ5oVbV8yE52V4pz8zTn4` |
Holds EDRB supply and receives SOL payments |
| Recipient (Client) |
`AkJEX67JGjSXZJkZFVpGRUervsYQL4p5X5EiqAGi4GQM` | Used for demo
purchase transactions |
| Buyer Wallet (via Front) | Solflare (Devnet) | Connected from the
landing page |

---

## ️ Build & Deploy Commands

```bash
# Build (Apple Silicon users must use Docker amd64)
anchor build

# Deploy
anchor deploy
