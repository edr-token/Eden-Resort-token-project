import * as fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const RPC = process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("YQq8nbpA6Dbp7YySBMtaUynBRAEJMySnfwU37UbHdvW");
const MINT = new PublicKey("JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd");

(async () => {
  const connection = new Connection(RPC, "confirmed");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const idlPath = "target/idl/users_tommyedr_edr_packs.json";
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  const walletPub = provider.wallet.publicKey;
  const initIx = idl.instructions.find((i) => i.name === "initialize");
  const accounts = {};

  for (const acc of initIx.accounts) {
    const name = acc.name;
    if (["admin", "authority", "initializer", "payer", "owner"].includes(name)) accounts[name] = walletPub;
    else if (name === "systemProgram") accounts[name] = SystemProgram.programId;
    else if (name === "tokenProgram") accounts[name] = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    else if (name === "associatedTokenProgram") accounts[name] = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
    else if (name === "rent") accounts[name] = new PublicKey("SysvarRent111111111111111111111111111111111");
    else if (name === "mint") accounts[name] = MINT;
    else if (name === "vault" || name === "sellerAta" || name === "sourceAta") {
      const ata = getAssociatedTokenAddressSync(MINT, walletPub, false);
      accounts[name] = ata;
    } else if (name === "config" || name === "configPda") {
      const [cfg] = PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID);
      accounts[name] = cfg;
    }
  }

  console.log("🔎 Accounts utilisés :");
  console.table(Object.fromEntries(Object.entries(accounts).map(([k, v]) => [k, (v as PublicKey).toBase58 ? (v as PublicKey).toBase58() : v])));

  try {
    const sig = await program.methods.initialize().accounts(accounts).rpc();
    console.log("✅ initialize tx:", sig);
    console.log(`🔗 https://solscan.io/tx/${sig}?cluster=devnet`);
  } catch (e) {
    console.error("❌ Erreur:", e);
  }
})();
