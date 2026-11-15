People claim a transaction is quantum safe but cannot prove it was hybrid signed.

## Live testnet status, Nov 15 2026

LIVE, done. The live hybrid transaction is on chain on testnet qorechain-diana, EVM chain 9800. Tx 19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF, height 10105086, code 0. Amount 0.001 QOR from the coin 118 account qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u to itself. Memo: QDAY-PROOF, qorechain-diana, 9800, hybrid secp256k1 plus ML-DSA-87. Extension: /qorechain.pqc.v1.PQCHybridSignature. Coin 118 balance 70.770208 QOR as of about 03:00 WAT, ML-DSA-87 key registered. Live demo: https://qday-proof.vercel.app

Quantum Pass, QDay Proof, QP-A, is a small web app for QoreChain Build Before Q-Day, solo, testnet only. It shows the current testnet block, signs one proof with secp256k1 plus ML-DSA-87, then verifies both signatures on screen with a large check mark.

Live demo: https://qday-proof.vercel.app
Featured image: featured.png, 1440 by 810, in this folder.
Style: dark violet and white, Regolith inspired bento proof grid, glowing violet accent, heavy grotesque hero type, generous spacing, sticky header with a small LIVE pill, giant violet block number that rolls with blur then snaps sharp, confirmation pill that slides up when verification lands, end card with mark plus QDay Proof plus tagline word by word. Baheet motion in app, no video, no synthesized sound, demo mode clearly labelled.

How it works

1. Connect wallet in demo mode. The app makes a throwaway demo identity in the browser only, kept in memory only. It makes a secp256k1 key with @noble/curves, derives a 0x address from the keccak256 hash of the public key, and makes an ML-DSA-87 keypair with generatePqcKeypair from @qorechain/sdk. No demo key is saved, sent, or logged. A QoreX address can also be pasted, read only, to check its testnet balance. The app never asks for a private key or a seed phrase.
2. Show the current block. The app uses createClient from @qorechain/sdk, network testnet, and reads eth_blockNumber and eth_chainId from the testnet EVM RPC at https://evm-testnet.qore.host. The expected chain is qorechain-diana, chain id 9800, hex 0x2648.
3. Sign one hybrid proof. The proof message is canonical text: QDAY-PROOF, qorechain-diana, 9800, block number, address, hybrid secp256k1 plus ML-DSA-87. The classical half signs the SHA-256 hash of that message with secp256k1, 64 bytes. The post-quantum half signs the same message bytes with ML-DSA-87, 4627 bytes, using pqcSign from the SDK. The app also builds the on chain hybrid extension object with buildHybridSignatureExtension, type URL /qorechain.pqc.v1.PQCHybridSignature, algorithm Dilithium-5, which is ML-DSA-87.
4. Verify on screen. The app rechecks the message, verifies the classical signature with secp256k1.verify, and verifies the ML-DSA-87 signature with pqcVerify from the SDK. It shows VERIFIED, HYBRID SIGNED only when the message matches and both signatures verify, with the exact byte lengths 64, 4627, and 2592 for the public key. Tampered signatures and tampered messages fail, and the tests cover those cases.
5. Live testnet transaction, done. Five gave his QoreX address on Nov 15: qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u (Native) and 0xB5b7328A3981431BE72bF1282c0F08A7905fC827 (EVM form, same identity). Verified live Nov 15 with qore-cli on testnet qorechain-diana chain 9800: fresh account at first check, exists false, balances empty, 0 QOR, staked 0 QOR, ML-DSA-87 key not registered yet. Faucet claimed Nov 15 01:00 WAT: exists true, account number 15585, sequence 0, 100 QOR, ML-DSA-87 key still not registered, EVM window found false. Key registration completed Nov 15 01:13 WAT by Five in QoreX: ML-DSA-87 key registered true, sequence 2, balance 99.85 QOR, PQC account found true, algorithm dilithium5, key type hybrid, possession proven true, created at height 10102839. The live hybrid transaction is on chain, see Live testnet status, Nov 15 2026 above. Tx 19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF, height 10105086, code 0. The docs say every native path transaction must carry the hybrid signature, the PQC key must be registered on chain first, registration takes about 600,000 gas, and a classical only transaction is refused. No transaction hash is invented here.

What it does

- Connect wallet in demo mode, with a throwaway in browser identity.
- Show the current block, live from testnet.
- Send one hybrid signed proof, secp256k1 plus ML-DSA-87, in the browser.
- Show the verification result on screen, with both signature checks named.
- Read a pasted QoreX address balance, read only, and try its PQC key status.
- Label demo mode clearly, and label the live onchain transaction as done, with the hash in Live testnet status, Nov 15 2026 above.

What it does not do

- It does not broadcast a transaction to testnet from the demo app. The live hybrid transaction was sent by Five in QoreX, see Live testnet status, Nov 15 2026 above.
- It does not deploy a contract yet.
- It does not connect to a real QoreX wallet in the app yet.
- It does not use real money, testnet only.

How to run

Prerequisites: Node.js 20 or later, npm.

Install:
npm install

Run locally for development:
npm run dev
Then open http://localhost:5173

Build and preview the production build:
npm run build
npm run preview
Then open http://localhost:4173

Typecheck:
npm run typecheck

Tests, 11 checks, no network needed:
npm test

Live testnet check, reads block and chain id:
npm run check-live

Make the featured image again:
npm run make-featured

Environment, in .env, public testnet endpoints only, no secrets:
VITE_QORE_REST_URL is /lcd, proxied in dev and preview to https://api-testnet.qore.host, and in production Vercel rewrites /lcd to the same host, see vercel.json.
VITE_QORE_EVM_RPC_URL is https://evm-testnet.qore.host

Which QoreChain kits it uses

- create-qorechain-dapp 0.14.0, fullstack-web template, TypeScript, Vite plus React. The scaffold succeeded, it was not substituted.
- @qorechain/sdk 0.14.0, createClient, generatePqcKeypair, pqcSign, pqcVerify, buildHybridSignatureExtension, AlgorithmDilithium5, HYBRID_SIG_TYPE_URL, ML-DSA-87 size constants.
- QoreX wallet, official QoreChain wallet, for the live step. QoreX signs native transfers hybrid and registers the PQC key. Five QoreX address is qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u (Native) and 0xB5b7328A3981431BE72bF1282c0F08A7905fC827 (EVM form, same identity).
- Docs: https://docs.qorechain.io/sdk/quickstart
- Faucet: https://dashboard.qorechain.io/faucet
- Other libraries: @noble/curves 1.9.0 and @noble/hashes 1.8.0, for the classical secp256k1 sign and verify and the SHA-256 and keccak256 hashes.

Testnet contracts and addresses

- Network: qorechain-diana, testnet, EVM chain id 9800, hex 0x2648.
- EVM RPC: https://evm-testnet.qore.host
- REST: https://api-testnet.qore.host
- Faucet: https://dashboard.qorechain.io/faucet
- QoreX address: qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u (Native) and 0xB5b7328A3981431BE72bF1282c0F08A7905fC827 (EVM form, same identity). Verified live Nov 15 with qore-cli on testnet qorechain-diana chain 9800: fresh account at first check, exists false, balances empty, 0 QOR, staked 0 QOR, ML-DSA-87 key not registered yet. Faucet claimed Nov 15 01:00 WAT: exists true, account number 15585, sequence 0, 100 QOR, ML-DSA-87 key still not registered, EVM window found false. Key registration completed Nov 15 01:13 WAT: ML-DSA-87 key registered true, sequence 2, balance 99.85 QOR, PQC account found true, algorithm dilithium5, key type hybrid, possession proven true, created at height 10102839. The live hybrid transaction is on chain, see Live testnet status, Nov 15 2026 above.
- Live transaction hash: 19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF, height 10105086, code 0, see Live testnet status, Nov 15 2026 above.
- Live contract address: Pending, no contract is deployed yet
- Demo address: made fresh in the browser each time, throwaway, not a live address.

Files

- src/App.tsx, the proof card UI, steps 1 to 4.
- src/lib/hybrid.ts, proof message, demo identity, hybrid sign, hybrid verify, chain constants.
- src/index.css, dark violet and white style.
- tests/hybrid.test.mjs, 11 checks.
- scripts/check-live.mjs, live block and chain id check.
- scripts/make-featured.py, makes featured.png, 1440 by 810.
- featured.png, featured image.
- BUILD-REPORT.md, what was built, exact checks, live URL, what is blocked, what needs Five.
- STORYBOARD.md, demo video storyboard, five beats, no video recorded.
- LICENSE, MIT.
