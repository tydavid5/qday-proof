# AI Usage, QDay Proof

## Agent used

Muse, called Little 5, Meta's personal AI agent. It worked from the brief and concept pick of the human builder, Five (Taiwo John), in a chat session on Nov 14 to 15, 2026.

## Workflow

1. Five picked the concept, QP-A QDay Proof, and the Quantum Pass category.
2. Little 5 scaffolded the demo app, the test suite and the docs, and ran the tests locally.
3. Five did every wallet and chain step himself in QoreX: faucet claim, ML-DSA-87 key registration, and the live hybrid transaction.
4. Little 5 verified the transaction on chain from the public explorer and REST API, then wrote the live status into the README and build report.
5. Five approved the demo video narration and the final submission.

## What the AI generated

- The demo web app (Vite, TypeScript, React), including the hybrid signing demo that verifies secp256k1 plus ML-DSA-87 on screen.
- The test suite, 11 tests, all passing.
- The deploy helper scripts and the deploy page used to coordinate the live steps.
- The README, BUILD-REPORT and STORYBOARD drafts, and the narration script for the demo video.

## Human contribution

- The concept, the category choice and every design decision.
- All signing: the live hybrid transaction was sent by Five in QoreX, tx 19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF, height 10105086, 0.001 QOR, memo "QDAY-PROOF, qorechain-diana, 9800, hybrid secp256k1 plus ML-DSA-87".
- Key management and the faucet claim.
- Approval of the demo video and of the final submission.

## Verification

No transaction hash, balance or verification result in this repo was invented. The live transaction above was read back from the QoreChain testnet explorer and REST API by the agent and is checkable at https://explore.qore.network/tx/19F5866B70F717AE998EEC2BC7ACDC4E43598BE1E4424221F7D06049606DDFBF
