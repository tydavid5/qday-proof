import { useMemo, useState } from "react";
import { createClient, type QoreChainClient } from "@qorechain/sdk";
import {
  EVM_RPC_URL,
  FAUCET_URL,
  REST_URL,
  TESTNET_CHAIN_ID,
  TESTNET_NAME,
  createDemoIdentity,
  isValidEvmAddress,
  parseHexBlock,
  shortHex,
  signHybridProof,
  verifyHybridProof,
  type DemoIdentity,
  type HybridProof,
  type HybridVerification,
} from "./lib/hybrid.js";

const REST_URL_VALUE = import.meta.env.VITE_QORE_REST_URL ?? "/lcd";
const EVM_RPC_URL_VALUE =
  import.meta.env.VITE_QORE_EVM_RPC_URL ?? EVM_RPC_URL;
const QOREX_NATIVE = "qor1kkmn9z3es9p3heet7y5zcrcg57g9ljp8909r5u";
const QOREX_EVM = "0xB5b7328A3981431BE72bF1282c0F08A7905fC827";
const TAGLINE_WORDS = ["Proof", "you", "can", "check,", "before", "Q-Day."];

export function App(): JSX.Element {
  const client: QoreChainClient = useMemo(
    () =>
      createClient({
        network: "testnet",
        endpoints: { rest: REST_URL_VALUE, evmRpc: EVM_RPC_URL_VALUE },
      }),
    [],
  );

  const [identity, setIdentity] = useState<DemoIdentity | null>(null);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [blockHex, setBlockHex] = useState<string>("");
  const [chainIdHex, setChainIdHex] = useState<string>("");
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [qorexAddress, setQorexAddress] = useState(QOREX_EVM);
  const [qorexBalance, setQorexBalance] = useState<string | null>(null);
  const [qorexNote, setQorexNote] = useState<string | null>(null);
  const [proof, setProof] = useState<HybridProof | null>(null);
  const [verification, setVerification] = useState<HybridVerification | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  async function refreshBlock(): Promise<void> {
    setBlockError(null);
    setBlockLoading(true);
    try {
      const hex = await client.evm.ethBlockNumber();
      const chain = await client.evm.ethChainId();
      setBlockHex(hex);
      setChainIdHex(chain);
      setBlockNumber(parseHexBlock(hex));
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : String(err));
    } finally {
      setBlockLoading(false);
    }
  }

  async function checkQorexAddress(): Promise<void> {
    setQorexNote(null);
    setQorexBalance(null);
    if (!isValidEvmAddress(qorexAddress)) {
      setQorexNote("Paste a 0x address with 40 hex characters.");
      return;
    }
    try {
      const balanceHex = await client.evm.ethGetBalance(qorexAddress.trim());
      const wei = BigInt(balanceHex);
      const whole = wei / 1000000000000000000n;
      const remainder = wei % 1000000000000000000n;
      const remainderText = remainder.toString().padStart(18, "0").slice(0, 6);
      setQorexBalance(balanceHex + " wei, about " + whole.toString() + "." + remainderText + " QOR");
      try {
        const status = await client.qor.getPqcKeyStatus(qorexAddress.trim());
        setQorexNote("PQC key status read: " + JSON.stringify(status).slice(0, 240));
      } catch {
        setQorexNote("Balance read ok. PQC key status is not available from this RPC endpoint right now, so registration still needs a check in QoreX.");
      }
    } catch (err) {
      setQorexNote(err instanceof Error ? err.message : String(err));
    }
  }

  function connectDemo(): void {
    const next = createDemoIdentity();
    setIdentity(next);
    setProof(null);
    setVerification(null);
    setProofError(null);
  }

  function forgetDemo(): void {
    setIdentity(null);
    setProof(null);
    setVerification(null);
    setProofError(null);
  }

  async function sendHybridProof(): Promise<void> {
    setProofError(null);
    setProof(null);
    setVerification(null);
    if (!identity) {
      setProofError("Connect the demo wallet first.");
      return;
    }
    if (blockNumber === null) {
      setProofError("Show the current block first.");
      return;
    }
    setProofLoading(true);
    try {
      const nextProof = signHybridProof(blockNumber, identity);
      const nextVerification = verifyHybridProof(nextProof);
      setProof(nextProof);
      setVerification(nextVerification);
    } catch (err) {
      setProofError(err instanceof Error ? err.message : String(err));
    } finally {
      setProofLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="sitehead">
        <span className="brand"><span className="mark">QP</span> Quantum Pass</span>
        <span className="spacer" />
        <span className="livepill"><span className="livedot" /> LIVE, TESTNET</span>
        <span className="badge ghost">Demo mode</span>
      </header>

      <section className="hero">
        <p className="eyebrow">QDAY PROOF, QP-A, TESTNET ONLY</p>
        <h1>Prove it was <span className="accent">hybrid signed.</span></h1>
        <p className="problem">People claim a transaction is quantum safe but cannot prove it was hybrid signed.</p>
        <p className="sub">This app signs one proof with secp256k1 plus ML-DSA-87, then verifies both signatures on screen.</p>
        <p>
          <span className="badge">Demo mode</span>
          <span className="badge ghost">Network {TESTNET_NAME}</span>
          <span className="badge ghost">Chain {TESTNET_CHAIN_ID}</span>
        </p>
      </section>

      <div className="bento">
        <section className="card">
          <p className="step">STEP 1</p>
          <h2>Connect wallet, demo mode</h2>
          <p>Demo keys are made in this browser only, kept in memory only, and never sent anywhere. They are throwaway keys, never use them for real funds.</p>
          {!identity && (
            <button className="primary" onClick={connectDemo}>Connect demo wallet</button>
          )}
          {identity && (
            <div>
              <p><span className="label">Demo address</span><br /><code>{identity.address}</code></p>
              <p><span className="label">ML-DSA-87 public key</span><br /><code>{shortHex(identity.pqcPublicKeyHex)}</code> <span className="muted">2592 bytes</span></p>
              <button onClick={forgetDemo}>Forget demo wallet</button>
            </div>
          )}
          <div className="qorex">
            <h3>Your QoreX address, read only, optional</h3>
            <p>Paste the address from QoreX on your phone to read its testnet balance. This app never asks for a private key or a seed phrase.</p>
            <input
              value={qorexAddress}
              onChange={(e) => setQorexAddress(e.target.value)}
              placeholder="0x..."
              aria-label="QoreX address"
            />
            <button onClick={checkQorexAddress}>Check balance</button>
            {qorexBalance && <p><span className="label">Balance</span><br /><code>{qorexBalance}</code></p>}
            {qorexNote && <p className="muted">{qorexNote}</p>}
          </div>
        </section>

        <section className="card glow">
          <p className="step">STEP 2</p>
          <h2>Show the current block</h2>
          <p>Live read from the testnet EVM RPC at <code>{EVM_RPC_URL_VALUE}</code>. REST is <code>{REST_URL}</code>.</p>
          <button className="primary" onClick={refreshBlock} disabled={blockLoading}>
            {blockLoading ? "Reading block..." : "Show current block"}
          </button>
          {blockNumber === null && (
            <p className="heronumber idle">00000000</p>
          )}
          {blockNumber !== null && (
            <div>
              <p className="heronumber" key={blockNumber}>{blockNumber}</p>
              <p className="blockline">Block <code>{blockHex}</code> <span className="muted">Chain <code>{chainIdHex}</code></span></p>
            </div>
          )}
          {blockError && <p className="error" role="alert">{blockError}</p>}
        </section>

        <section className="card wide">
          <p className="step">STEP 3</p>
          <h2>Send one hybrid signed proof</h2>
          <p>One click signs the current block proof twice, once with secp256k1 and once with ML-DSA-87, using the SDK in this browser. This is a signed proof, not a broadcast transaction.</p>
          <button className="primary" onClick={sendHybridProof} disabled={proofLoading || !identity || blockNumber === null}>
            {proofLoading ? "Signing..." : "Sign hybrid proof"}
          </button>
          {proofError && <p className="error" role="alert">{proofError}</p>}
          {proof && verification && (
            <div className="proof">
              <div className={verification.allValid ? "check ok" : "check bad"} aria-label={verification.allValid ? "Verified" : "Not verified"}>
                {verification.allValid ? "✓" : "✕"}
              </div>
              <p className="verdict">{verification.allValid ? "VERIFIED, HYBRID SIGNED" : "NOT VERIFIED"}</p>
              <p className="pillwrap"><span className="confirmpill">✓ Verified on screen, both signatures checked</span></p>
              <p><span className="label">Proof message</span><br /><code>{proof.message}</code></p>
              <p><span className="label">Message SHA-256</span><br /><code>{proof.messageSha256Hex}</code></p>
              <p><span className="label">Classical, secp256k1, 64 bytes</span><br /><code>{shortHex(proof.classicalSignatureHex)}</code> <span className={verification.classicalValid ? "good" : "bad"}>{verification.classicalValid ? "valid" : "invalid"}</span></p>
              <p><span className="label">Post-quantum, ML-DSA-87, 4627 bytes</span><br /><code>{shortHex(proof.pqcSignatureHex)}</code> <span className={verification.pqcValid ? "good" : "bad"}>{verification.pqcValid ? "valid" : "invalid"}</span></p>
              <p><span className="label">Hybrid extension</span><br /><code>{proof.extensionTypeUrl}</code></p>
              <p className="muted">Full signatures are 64 bytes classical and 4627 bytes ML-DSA-87. Shortened here for display, verification used the full bytes.</p>
            </div>
          )}
        </section>

        <section className="card">
          <p className="step">VERIFIED WALLET STATUS</p>
          <h2>Five QoreX address, read only</h2>
          <p><span className="label">Native</span><br /><code>{QOREX_NATIVE}</code></p>
          <p><span className="label">EVM form</span><br /><code>{QOREX_EVM}</code></p>
          <div className="statusgrid">
            <div className="statuscell">
              <span className="label">Balance</span>
              <p className="value violet">99.85 QOR</p>
            </div>
            <div className="statuscell">
              <span className="label">ML-DSA-87 key</span>
              <p className="value">Registered, true</p>
            </div>
            <div className="statuscell">
              <span className="label">Sequence</span>
              <p className="value">2</p>
            </div>
            <div className="statuscell">
              <span className="label">EVM window</span>
              <p className="value">Still false</p>
            </div>
          </div>
          <p className="muted">Verified live Nov 15 01:13 WAT with qore-cli on testnet qorechain-diana chain 9800. PQC account found true, algorithm dilithium5, key type hybrid, possession proven true, created at height 10102839. Balance is 99.85 QOR after 0.15 QOR in registration fees from the 100 QOR faucet claim. First check was exists false, 0 QOR, key not registered. EVM window still false, so an EVM window must be opened in QoreX before any EVM deploy or transaction.</p>
        </section>

        <section className="card">
          <p className="step">STEP 4</p>
          <h2>Live testnet transaction, pending</h2>
          <p>A live hybrid transaction on testnet is pending, not done. No live transaction has been sent, and no transaction hash is invented here.</p>
          <p><a href={FAUCET_URL}>Faucet: dashboard.qorechain.io/faucet</a></p>
          <p><span className="label">Five QoreX address</span><br /><code>{QOREX_EVM}</code><br /><code>{QOREX_NATIVE}</code></p>
          <p><span className="label">Live transaction hash</span><br /><code>None yet, no live transaction has been sent</code></p>
          <p><span className="label">Live contract address</span><br /><code>Pending, no contract is deployed yet</code></p>
          <button disabled title="Needs an EVM window in QoreX first">Send live hybrid transaction, pending</button>
        </section>
      </div>

      <section className="endcard">
        <span className="mark">QP</span>
        <h2>QDay Proof</h2>
        <p className="tagline">
          {TAGLINE_WORDS.map((word, i) => (
            <span key={word} style={{ animationDelay: (i * 0.14).toString() + "s" }}>{word}</span>
          ))}
        </p>
      </section>

      <footer>
        <p>Testnet only, no real money. SDK @qorechain/sdk 0.14.0, starter create-qorechain-dapp 0.14.0, fullstack-web template. Docs: docs.qorechain.io/sdk/quickstart</p>
      </footer>
    </main>
  );
}
