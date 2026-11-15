Quantum Pass, QDay Proof, BUILD-REPORT

Status: built and verified, live on testnet. The app is built, tested, and live on Vercel. The live onchain hybrid transaction is done, see Live testnet status, Nov 15 2026 below. Five QoreX address is qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u (Native) and 0xB5b7328A3981431BE72bF1282c0F08A7905fC827 (EVM form, same identity). Verified live Nov 15 with qore-cli on testnet qorechain-diana chain 9800: fresh account at first check, exists false, balances empty, 0 QOR, staked 0 QOR, ML-DSA-87 key not registered yet. Faucet claimed Nov 15 01:00 WAT: exists true, account number 15585, sequence 0, 100 QOR, ML-DSA-87 key still not registered, EVM window found false. Key registration completed Nov 15 01:13 WAT by Five in QoreX: ML-DSA-87 key registered true, sequence 2, balance 99.85 QOR, PQC account found true, algorithm dilithium5, key type hybrid, possession proven true, created at height 10102839. EVM window still false. No transaction hash or contract address is invented here.

## Live testnet status, Nov 15 2026

LIVE, done. The live hybrid transaction is on chain on testnet qorechain-diana, EVM chain 9800. Tx 19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF, height 10105086, code 0. Amount 0.001 QOR from the coin 118 account qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u to itself. Memo: QDAY-PROOF, qorechain-diana, 9800, hybrid secp256k1 plus ML-DSA-87. Extension: /qorechain.pqc.v1.PQCHybridSignature. Coin 118 balance 70.770208 QOR as of about 03:00 WAT, ML-DSA-87 key registered. Live demo: https://qday-proof.vercel.app

What was built

- Folder: ~/workspace/qorechain/qday-proof
- Project: Quantum Pass, QDay Proof, QP-A, solo, testnet only, dark violet and white, minimal proof card, large check mark, mono type for hashes and block numbers.
- Scaffold: create-qorechain-dapp 0.14.0, fullstack-web template, TypeScript, Vite plus React, network testnet, package manager npm. The scaffold succeeded, nothing was substituted for the starter. It added 144 packages in 52s and printed Done, Created qday-proof.
- SDK: @qorechain/sdk 0.14.0, installed from npm, versions checked on npm before scaffolding, 0.14.0 was listed for both create-qorechain-dapp and @qorechain/sdk.
- Added: @noble/curves 1.9.0 and @noble/hashes 1.8.0, added 2 packages in 2s, for classical secp256k1 sign and verify and SHA-256 and keccak256.
- App: src/App.tsx, four steps, connect wallet in demo mode, show current block, send one hybrid signed proof, live testnet transaction pending.
- Library: src/lib/hybrid.ts, proof message, demo identity, hybrid sign, hybrid verify, chain constants, hex helpers.
- Tests: tests/hybrid.test.mjs, 11 checks.
- Scripts: scripts/check-live.mjs, live block and chain id check, and scripts/make-featured.py, featured image generator.
- Featured image: featured.png, 1440 by 810, PNG, 53K, made with Python PIL, dark violet gradient, green check, Quantum Pass, QDAY PROOF, secp256k1 plus ML-DSA-87, testnet qorechain-diana chain 9800.
- Config: vercel.json, rewrites /lcd to https://api-testnet.qore.host, so the REST proxy works in production as well as in dev.
- Docs: README.md, problem first, LICENSE MIT, STORYBOARD.md, five beats, no video recorded.

Exact checks, commands and results

- npm install, result up to date in 3s, 34 packages looking for funding, no errors.
- npm test, result PASS 11 checks, 0 failed. Checks: 1 chain constants testnet diana 9800, 2 proof message format exact, 3 hex helpers round trip, 4 ML-DSA-87 sizes FIPS 204, 5 hybrid extension object uses Dilithium-5, 6 demo identity has valid EVM address and PQC key, 7 hybrid proof signs and verifies both parts, 8 tampered PQC signature fails, 9 tampered classical signature fails, 10 tampered message fails, 11 pqcVerify rejects a truncated signature.
- npm run typecheck, result passed, tsc with no errors printed.
- npm run build, result passed. tsc plus vite build, 1960 modules transformed, built in 36.64s. dist/index.html 0.63 kB, gzip 0.40 kB. dist/assets/index-DMkR_5RN.css 1.95 kB, gzip 0.76 kB. dist/assets/index-D0gL6jIs.js 2983.87 kB, gzip 614.07 kB. Vite warned that a chunk is larger than 500 kB after minification, caused by the SDK and ML-DSA-87 code, not a build failure.
- Local preview, npm run preview, result http://localhost:4173/ HTTP 200, size 633, title Quantum Pass, QDay Proof. JS asset HTTP 200, size 2983909. CSS asset HTTP 200, size 1951. The built JS contains Quantum Pass and VERIFIED, HYBRID SIGNED. Note: the preview server binds localhost only, a curl to 127.0.0.1 returned 000, localhost returned 200, that is a bind detail, not an app failure.
- Live testnet check, npm run check-live, result eth_blockNumber 0x9a180e equals 10098702, eth_chainId 0x2648 equals 9800, network qorechain-diana, expected chain 9800, match true. qor_getHybridSignatureMode was not available from the EVM RPC, error code -32601, method does not exist or is not available. That call is not used by the app flow, the app uses eth_blockNumber, eth_chainId, and eth_getBalance.
- Later live block read, result eth_blockNumber 0x9a18af equals 10098863, chain 9800, same endpoint https://evm-testnet.qore.host.
- Vercel deploy, result deployed to production. Vercel CLI 65.12.1, logged in as tydavid5, project tydavid5/qday-proof, Ready in 40s, first deployment assigned to production. Vercel build ran npm run build again and passed, 146 packages installed in 9s on Vercel, same 1960 modules transformed.
- Live demo verify, result https://qday-proof.vercel.app/ HTTP 200, size 633, time 0.703365s, title Quantum Pass, QDay Proof. JS asset HTTP 200, size 2983909, contains Quantum Pass and VERIFIED, HYBRID SIGNED.

Live demo URL

- https://qday-proof.vercel.app
- Deployment URL: https://qday-proof-jdp647xas-tydavid5.vercel.app
- Local run URL: http://localhost:4173 for preview, http://localhost:5173 for dev.

What is blocked

- Live hybrid transaction on testnet: done, see Live testnet status, Nov 15 2026 above. Tx 19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF, height 10105086, code 0.
- Live contract: none, this project has no contract, the live proof is a Native transaction, see Live testnet status, Nov 15 2026 above.
- QoreX live connection: not connected in this VM.
- qor_getHybridSignatureMode: not available from the EVM RPC endpoint when called directly, error -32601. The docs still state hybrid signing is required on the native path, and the SDK client exposes the method, so this is a RPC availability note, not a blocker for the demo proof.
- GitHub push: not attempted, no GitHub login in VM.
- Submission on build.qorechain.io: not submitted, not registered.
- Q-Day Drill registration: not registered.

What needs Five

- His QoreX address, received Nov 15, on testnet, in 0x form 0xB5b7328A3981431BE72bF1282c0F08A7905fC827, Native form qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u, already pasted into the app read only check as the default and to use for the live send. Verified live Nov 15 with qore-cli on testnet qorechain-diana chain 9800: fresh account at first check, exists false, balances empty, 0 QOR, staked 0 QOR, ML-DSA-87 key not registered yet. Faucet claimed Nov 15 01:00 WAT: exists true, account number 15585, sequence 0, 100 QOR, ML-DSA-87 key still not registered, EVM window found false. Key registration completed Nov 15 01:13 WAT: ML-DSA-87 key registered true, sequence 2, balance 99.85 QOR, PQC account found true, algorithm dilithium5, key type hybrid, possession proven true, created at height 10102839. EVM window still false.
- Faucet funds for that address, from https://dashboard.qorechain.io/faucet, enough for PQC key registration, about 600,000 gas, plus a hybrid bank send, about 171,600 gas, at the network minimum gas price 0.1 uqor per unit. Funds were 99.85 QOR after registration fees, and the coin 118 balance is 70.770208 QOR as of about 03:00 WAT.
- PQC key registration on chain first, via QoreX, which registers the ML-DSA-87 key for the account. A classical only transaction is refused by the chain. Registration is now done, see above.
- The live hybrid send is done from QoreX, with the transaction hash recorded in Live testnet status, Nov 15 2026 above, and the demo proof in the app compared with the onchain result.
- No private key or seed phrase is needed from Five, and none should be pasted into the app or chat.

## QoreX address wiring, Nov 15

Five QoreX address wired in: qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u, EVM form 0xB5b7328A3981431BE72bF1282c0F08A7905fC827. Verified live Nov 15 with qore-cli on testnet qorechain-diana chain 9800: fresh account at first check, exists false, balances empty, 0 QOR, staked 0 QOR, ML-DSA-87 key not registered yet. Faucet claimed Nov 15 01:00 WAT: exists true, account number 15585, sequence 0, 100 QOR, ML-DSA-87 key still not registered, EVM window found false. Key registration completed Nov 15 01:13 WAT: ML-DSA-87 key registered true, sequence 2, balance 99.85 QOR, PQC account found true, algorithm dilithium5, key type hybrid, possession proven true, created at height 10102839. EVM window still false. No balance, transaction hash or registered key is invented here. No live transaction was sent in this wiring step.

Files changed: README.md, BUILD-REPORT.md, and the app default for the QoreX address, read only, plus STORYBOARD.md or index.html where the address was shown. Tests re-run after the change: 11 pass, 0 fail. Build re-run: passed. Vercel redeployed to production, deployment qday-proof-1m70gb3vj-tydavid5.vercel.app, fresh load of https://qday-proof.vercel.app returns HTTP 200, and the served bundle contains the wired address.

Live hybrid transaction: done, no further step needed for this project. ML-DSA-87 key registration is done. No private key or seed phrase was asked for or used.

## UI polish pass, Nov 15

Framer template used for layout inspiration only, no template code or assets copied, nothing bought: Regolith, free, $0, dark Web3 SaaS, deep contrasts, glowing accents, dashboard and bento grids, https://www.framer.com/marketplace/templates/regolith/. Borrowed its bento proof grid, glowing violet accent, heavy grotesque hero type, generous spacing, and sticky header with a small LIVE pill. Project violet accent kept, PRED yellow not copied. Baheet motion applied in app, no video, no synthesized sound: one claim per beat, hard cuts between states, fast move then hold, one giant bold hero number per screen in violet, the current testnet block number, rolling with blur then snapping sharp and holding, real UI pushing in with a confirmation pill sliding up when verification lands, end state footer with mark plus QDay Proof plus tagline appearing word by word. All buttons and flows unchanged, demo mode labelled, live send button stays disabled and labelled pending, no live transaction sent. Wallet status in README, BUILD-REPORT and app UI updated to 99.85 QOR and ML-DSA-87 key registered true, EVM window still false. No em dashes and no double hyphens in the new prose, UI text or code comments.
