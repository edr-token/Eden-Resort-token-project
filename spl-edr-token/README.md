#Eden Resort Token (EDR) - Devnet Demo

#Purpose

This repo contains scripts and instructions to create an SPL token on Solana Devnet, pre-mint the full supply into a seller wallet, and run a basic transfer test.
A small self-contained demo for the hackathon

#Summery (deliverables)

-token: Eden Resort Token(EDR)
-decimals: 9
-total supply (devnet demo): 1B EDR
-everything is on Solana Devnet and uses a disposable seller wallet

#Guide Instruction 

-create seller accout and airdrop
-create recipient account and airdrop
-upload token image to webstore
    get url
-upload metadata.json to webstore
    get url
-run create_mint.sh
    get mint address, tx
-run initialize_metadata.sh
    get tx
-run create_ata_seller.sh
    get ata for seller
-run create_ata_recipient.sh
    get ata for recipient
-run mint_supply.sh
    get tx
-run transfer_test.sh
    get tx

#Deliverables to provide

-Git repo
-Devnet mint address:JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd
-Seller wallet address:2Ku21RtZMxPQ24pVDmm4VkkxV4Xx4zVnpFDZYBKjzTn4
-Seller ATA: H4wHWGqtHB55jSX5sbU8P3hcNmFC774QdAmtxtT27LHr
-Recipient address: AhPJtbMZsuvsxPLYTJC8GBaAiSzuD87tjMn756t9ED2U
-Recipient ATA: 6JaHZb6HmHoZLXg2iQ5ZN7i2P4cfJM5aUczXw9kfwP3z
-Tx hashes:
    *mint creation tx:pbR2DWTfnpQ32iZwminSmvFLP4YE7RNwSC4WNUjCsknk4z4uVWT9TDDki1dnSKk3Fz6D9ZamTH1c6qFN4ErVaoa
    *initialize metadata tx:5kMnQva9NMyuuLC4YRbTVuBReZuAWCtL3kgmEY6V8yRHxWwK45A6zpT1bVMpLSTJNhSQt1jVuwbugprCF9mPmUoJ
    *seller ata creation tx:5qZauEwpAZNEx1acUhbPNiGzukDiQtYic2CewbooWP5jR9y8fE8K7MNTjzBawC9M28SYa6d4ezG7o85zWz5PKKY8
    *recipient ata creation tx: 4CZ8gLQRQU3goGJWn2yf4gqyAmoVvDHAMzQgjvJhrneehBcDqzc6d9n9W6bJwQoYFMKftaunW7U4FSEzTs4g3zDs
    *pre-mint tx(minting supply to seller):2953sDwbW7yLZmgTLcjRn4WvR4PKKyvtrsfzbN23H4r9aNCmwc1DZS2r3qopHUQLHsU5JJsr7FjzKFHm3hvxUFKw
    *transfer test tx:5HZhGonoxMEf54mnxjjSgVsuqyHaPtBNq2qxou8AQbsU3ipe12GfpUR8Ptt4ncB7jDhD7FUc9vjHXBZSPpP9Yr2Q





