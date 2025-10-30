import fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("YQq8nbpA6Dbp7YySBMtaUynBRAEJMySnfwU37UbHdvW");
const MINT = new PublicKey("JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd");

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const wallet = provider.wallet;
const walletPub = wallet.publicKey;

const idlPath = fs.existsSync("target/idl/users_tommyedr_edr_packs.json")
  ? "target/idl/users_tommyedr_edr_packs.json"
  : "target/idl/edr_packs.json";
const idl = JSON.parse(fs.readFileSync(idlPath,"utf8"));
const program = new anchor.Program(idl, PROGRAM_ID, provider);

// lire la vraie liste des comptes attendus
const initIx = idl.instructions.find(i=>i.name==="initialize");
if(!initIx){ throw new Error('IDL: instruction "initialize" introuvable'); }

// helpers
const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ATOKEN_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const RENT_SYSVAR = new PublicKey("SysvarRent111111111111111111111111111111111");
const cfgPda = PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID)[0];
const sellerAta = getAssociatedTokenAddressSync(MINT, walletPub, false);

// construit l’objet accounts en injectant TOUTES les variantes (snake + camel)
const out = {};
function setBoth(k, v){
  out[k]=v;
  const camel = k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
  out[camel]=v;
}

for(const a of initIx.accounts){
  const n=a.name;
  if (["admin","authority","initializer","payer","owner"].includes(n)) setBoth(n, walletPub);
  else if (n==="system_program") setBoth(n, SystemProgram.programId);
  else if (n==="systemProgram") setBoth(n, SystemProgram.programId);
  else if (n==="token_program") setBoth(n, TOKEN_PROGRAM);
  else if (n==="tokenProgram") setBoth(n, TOKEN_PROGRAM);
  else if (n==="associated_token_program") setBoth(n, ATOKEN_PROGRAM);
  else if (n==="associatedTokenProgram") setBoth(n, ATOKEN_PROGRAM);
  else if (n==="rent") setBoth(n, RENT_SYSVAR);
  else if (n==="mint") setBoth(n, MINT);
  else if (["vault","seller_ata","sellerAta","source_ata","sourceAta"].includes(n)) setBoth(n, sellerAta);
  else if (["config","config_pda","configPda"].includes(n)) setBoth(n, cfgPda);
  else {
    // si autre nom exotique demandé par l’IDL → tente wallet par défaut
    setBoth(n, walletPub);
  }
}

console.log("ACCOUNTS ->");
for (const [k,v] of Object.entries(out)) {
  if (typeof v?.toBase58 === "function") console.log(k, v.toBase58());
}

const tx = await program.methods.initialize().accounts(out).signers([wallet.payer]).rpc();
console.log("TX:", tx);
console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
