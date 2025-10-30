import {  
  Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair  
} from "https://esm.sh/@solana/web3.js@1.95.3";  
import {  
  getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID  
} from "https://esm.sh/@solana/spl-token@0.4.6";  
  
/** ===== Constants (Devnet) ===== */  
const RPC = "https://api.devnet.solana.com";  
const PROGRAM_ID = new PublicKey("H7bsCvtWx5TRF9MztdL9AKkZzhbwdDUQtotjUQPwVCbi");  
const MINT = new PublicKey("JQ9KrVjKC8FFVq17bxf2V98RLw8x3AahbUeotAKLxfd");  
const CONFIG_PDA = new PublicKey("7Dytk9sj2mwX6P2T4VnfaneurVwsGPTtxRhq7nEboLCt");  
const VAULT_AUTH = new PublicKey("DPALpmfJTRReZdywbHBz28e6AJ29tYQe44ErqAgFSaUe");  
/* VAULT_ATA is derivable but we keep it here if needed:  
const VAULT_ATA = new PublicKey("HMcAGVaMnAYWbCoCitkJ5wENiy4WDebt6iETrCE4drpM");  
*/  
const TIERS = [  
  { name: "Silver",   priceSol: 0.25, edr: 1000 },  
  { name: "Gold",     priceSol: 0.50, edr: 5000 },  
  { name: "Platinum", priceSol: 1.00, edr: 10000 },  
];  
  
const conn = new Connection(RPC, "confirmed");  
  
/** ===== UI helpers ===== */  
const $ = (q) => document.querySelector(q);  
const logs = $("#logs");  
const walletStatus = $("#walletStatus");  
const solBal = $("#solBal");  
const edrBal = $("#edrBal");  
const toast = $("#toast");  
  
function log(line, type="info"){  
  const div = document.createElement("div");  
  div.className = `log ${type}`;  
  div.textContent = line;  
  logs.prepend(div);  
}  
function showToast(text, ms=2500){  
  toast.textContent = text;  
  toast.classList.remove("hidden");  
  setTimeout(()=> toast.classList.add("hidden"), ms);  
}  
  
/** ===== Wallets ===== */  
let buyerPk = null; // PublicKey  
let sellerPubFromJson = null; // optional (display only)  
  
// ======== SELLER JSON CONNECTION ========
let SELLER = null;

// open the hidden file picker when clicking the button
const btnSellerEl = document.getElementById("btnSeller");
const sellerInputEl = document.getElementById("sellerFile");
if (btnSellerEl && sellerInputEl) {
  btnSellerEl.addEventListener("click", () => sellerInputEl.click());
}

// handle the selected keypair file (array of 64 integers)
sellerInputEl?.addEventListener("change", async (e) => {
  try {
    const file = e.target.files?.[0];
    if (!file) { log("❌ Aucun fichier sélectionné.", "err"); return; }

    const text = await file.text();
    const arr = JSON.parse(text);

    if (!Array.isArray(arr) || arr.length !== 64) {
      throw new Error("Format de clé invalide — il faut un tableau de 64 entiers.");
    }

    const secret = Uint8Array.from(arr);
    SELLER = Keypair.fromSecretKey(secret);

    // expose public key for existing flow that expects sellerPubFromJson
    sellerPubFromJson = SELLER.publicKey;

    log("✅ Seller JSON chargé avec succès !", "ok");
    log(`🔑 Adresse: ${SELLER.publicKey.toBase58()}`, "info");
  } catch (err) {
    SELLER = null;
    log(`❌ Erreur de chargement Seller JSON : ${err.message}`, "err");
  }
});
  
$("#btnWallet").addEventListener("click", async ()=>{  
  try{  
    const wallet = await getWallet();  
    await wallet.connect();  
    buyerPk = wallet.publicKey;  
    walletStatus.textContent = `🟢 Wallet: ${abbr(buyerPk.toBase58())}`;  
    log(`✅ Wallet connected: ${buyerPk.toBase58()}`, "ok");  
    await refreshBalances();  
    enableBuyButtons(true);  
  }catch(err){  
    log(`❌ Wallet connect failed: ${err.message}`, "err");  
    showToast("Wallet connect failed", 2000);  
  }  
});  
  
function abbr(x){ return x.slice(0,4)+"…"+x.slice(-4); }  
  
async function getWallet(){  
  if (window.solflare?.isSolflare) return window.solflare;  
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana;  
  throw new Error("No compatible wallet (install Solflare or Phantom).");  
}  
  
/** ===== Balances ===== */  
async function refreshBalances(){  
  if(!buyerPk) return;  
  const lam = await conn.getBalance(buyerPk);  
  solBal.textContent = `SOL: ${(lam/1e9).toFixed(3)}`;  
  // buyer ATA (token-2022)  
  try{  
    const ata = await getAssociatedTokenAddress(MINT, buyerPk, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);  
    const bal = await conn.getTokenAccountBalance(ata);  
    edrBal.textContent = `EDR: ${bal.value.uiAmountString}`;  
  }catch{  
    edrBal.textContent = `EDR: 0`;  
  }  
}  
  
/** ===== Carousel ===== */  
const carousel = $("#carousel");  
let idx = 0;  
const total = carousel.children.length;  
$("#prev").addEventListener("click", ()=> move(-1));  
$("#next").addEventListener("click", ()=> move(+1));  
  
function move(delta){  
  idx = (idx + delta + total) % total;  
  const width = carousel.children[0].getBoundingClientRect().width + 16; // card + gap  
  carousel.scrollTo({ left: width * idx, behavior: "smooth" });  
}  
  
/** ===== Buy actions ===== */  
document.querySelectorAll(".card .btn").forEach(btn=>{  
  btn.addEventListener("click", async ()=>{  
    const tier = Number(btn.getAttribute("data-tier")||"0");  
    await confirmAndBuy(tier);  
  });  
});  
enableBuyButtons(false);  
function enableBuyButtons(on){  
  document.querySelectorAll(".card .btn").forEach(b=> b.disabled = !on);  
}  
  
async function confirmAndBuy(tier){  
  if(buyerPk == null){ showToast("Connect wallet first"); return; }  
  const p = TIERS[tier];  
  const ok = await modalConfirm(`Confirm Purchase 🛒`, `You are about to buy the ${p.name} Pack for ${p.priceSol} SOL and receive ${p.edr} EDR.`);  
  if(!ok) return;  
  try{  
    const sig = await buyPack(tier);  
    await modalSuccess(`Transaction Successful 🎉`, `You purchased the ${p.name} Pack and received ${p.edr} EDR.`, sig);  
    window.open(`https://solscan.io/tx/${sig}?cluster=devnet`, "_blank");  
    await refreshBalances();  
  }catch(err){  
    await modalError("Transaction Failed ❌", err.message || String(err));  
  }  
}  
  
async function buyPack(tier){  
  const wallet = await getWallet();  
  const buyer = wallet.publicKey;  
  const admin = sellerPubFromJson ?? buyer; // fallback if no seller json loaded (only for display/admin key)  
  
  // Derive ATAs  
  log("🧩 Deriving PDAs & ATAs…", "info");  
  const vaultAta = await getAssociatedTokenAddress(MINT, VAULT_AUTH, true,  TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);  
  const buyerAta = await getAssociatedTokenAddress(MINT, buyer,      false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);  
  
  // Discriminator "global:buy_pack" (8 bytes)  
  const disc = await sha256_8("global:buy_pack");  
  const data = new Uint8Array(9);  
  data.set(disc, 0);  
  data[8] = tier & 0xff;  
  
  // Accounts (order must match program)  
  const keys = [  
    { pubkey: buyer,        isSigner: true,  isWritable: true },  
    { pubkey: admin,        isSigner: false, isWritable: true },  
    { pubkey: MINT,         isSigner: false, isWritable: false },  
    { pubkey: VAULT_AUTH,   isSigner: false, isWritable: false },  
    { pubkey: vaultAta,     isSigner: false, isWritable: true },  
    { pubkey: buyerAta,     isSigner: false, isWritable: true },  
    { pubkey: CONFIG_PDA,   isSigner: false, isWritable: false },  
    { pubkey: SystemProgram.programId,     isSigner: false, isWritable: false },  
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },  
    { pubkey: TOKEN_2022_PROGRAM_ID,       isSigner: false, isWritable: false },  
  ];  
  
  const ix = new TransactionInstruction({ programId: PROGRAM_ID, keys, data });  
  const tx = new Transaction().add(ix);  
  tx.feePayer = buyer;  
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;  
  
  log(`💰 Sending ${TIERS[tier].priceSol} SOL for ${TIERS[tier].name}…`, "info");  
  const signed = await wallet.signTransaction(tx);  
  const sig = await conn.sendRawTransaction(signed.serialize(), { skipPreflight:false });  
  log(`🔗 Tx: https://solscan.io/tx/${sig}?cluster=devnet`, "ok");  
  await conn.confirmTransaction(sig, "confirmed");  
  log("✅ Confirmed", "ok");  
  return sig;  
}  
  
/** ===== Modals ===== */  
const modal = $("#modal");  
const modalTitle = $("#modalTitle");  
const modalMsg = $("#modalMsg");  
const modalOk = $("#modalOk");  
const modalCancel = $("#modalCancel");  
  
function modalConfirm(title, msg){  
  modalTitle.textContent = title;  
  modalMsg.textContent = msg;  
  modal.classList.remove("hidden");  
  return new Promise((resolve)=>{  
    const onOk = ()=>{ cleanup(); resolve(true); };  
    const onCancel = ()=>{ cleanup(); resolve(false); };  
    modalOk.textContent = "Confirm";  
    modalOk.onclick = onOk;  
    modalCancel.onclick = onCancel;  
    modalCancel.classList.remove("hidden");  
  });  
}  
function modalSuccess(title, msg, sig){  
  modalTitle.textContent = title;  
  modalMsg.innerHTML = `${msg}<br><br><a href="https://solscan.io/tx/${sig}?cluster=devnet" target="_blank" rel="noopener">View on Solscan ↗</a>`;  
  modal.classList.remove("hidden");  
  return new Promise((resolve)=>{  
    const onOk = ()=>{ cleanup(); resolve(true); };  
    modalOk.textContent = "Close";  
    modalOk.onclick = onOk;  
    modalCancel.classList.add("hidden");  
  });  
}  
function modalError(title, msg){  
  modalTitle.textContent = title;  
  modalMsg.textContent = msg;  
  modal.classList.remove("hidden");  
  return new Promise((resolve)=>{  
    const onOk = ()=>{ cleanup(); resolve(true); };  
    modalOk.textContent = "Close";  
    modalOk.onclick = onOk;  
    modalCancel.classList.add("hidden");  
  });  
}  
function cleanup(){  
  modal.classList.add("hidden");  
  modalOk.onclick = null;  
  modalCancel.onclick = null;  
}  
  
$("#clear").addEventListener("click", ()=> logs.innerHTML = "");  
  
/** ===== Utils ===== */  
async function sha256_8(str){  
  const enc = new TextEncoder().encode(str);  
  const dig = await crypto.subtle.digest("SHA-256", enc);  
  return new Uint8Array(dig).slice(0,8);  
}  
  
/** ===== Init ===== */  
log("⚙️ Initializing…", "info");  
enableBuyButtons(false);  
refreshBalances().catch(()=>{});  
walletStatus.textContent = "🔴 Wallet: disconnected";  
