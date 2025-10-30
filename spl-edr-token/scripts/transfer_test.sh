#!/bin/bash
set -e

# Config
SELLER_KEYPAIR="./seller.json"
RECIPIENT_WALLET="./recipient.json"
MINT_ADDRESS="JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd"
AMOUNT=100 # 1 EDR with 9 decimals

echo "Transferring $AMOUNT units to recipient.."

spl-token transfer $MINT_ADDRESS $AMOUNT $RECIPIENT_WALLET