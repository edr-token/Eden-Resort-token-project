#!/bin/bash
set -e

# Config
RECIPIENT_WALLET="./recipient.json"
MINT_ADDRESS=JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd


echo "Creating token account for recipient..."

spl-token create-account $MINT_ADDRESS --owner $RECIPIENT_WALLET

