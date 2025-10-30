#!/bin/bash
set -e

# Config
SELLER_KEYPAIR="./seller.json"
MINT_ADDRESS=JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd


echo "Creating token account for seller..."

spl-token create-account $MINT_ADDRESS --owner $SELLER_KEYPAIR

