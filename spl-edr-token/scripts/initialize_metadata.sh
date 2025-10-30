#!/bin/bash
set -e

# Config
TOKEN_MINT_ADDRESS=JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd
TOKEN_NAME="Eden Resort Token"
TOKEN_SYMBOL="EDR"
TOKEN_URI=https://gateway.lighthouse.storage/ipfs/bafkreigqwkeo7owvr6tkifpz3uxetmrbzkj66wb2kszag36zzbzdlta5uy

echo "Initializing metadata for token mint $TOKEN_MINT_ADDRESS"

spl-token initialize-metadata "$TOKEN_MINT_ADDRESS" "$TOKEN_NAME" "$TOKEN_SYMBOL" "$TOKEN_URI"
