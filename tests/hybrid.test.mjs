import assert from "node:assert/strict";
import {
  AlgorithmDilithium5,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SECRET_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
  buildHybridSignatureExtension,
  generatePqcKeypair,
  pqcVerify,
} from "@qorechain/sdk";
import {
  TESTNET_CHAIN_ID,
  TESTNET_CHAIN_ID_HEX,
  TESTNET_NAME,
  buildProofMessage,
  createDemoIdentity,
  fromHex,
  isValidEvmAddress,
  parseHexBlock,
  shortHex,
  signHybridProof,
  toHex,
  verifyHybridProof,
} from "../src/lib/hybrid.ts";

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log("ok " + passed + " " + name);
}

check("chain constants are testnet diana 9800", () => {
  assert.equal(TESTNET_NAME, "qorechain-diana");
  assert.equal(TESTNET_CHAIN_ID, 9800);
  assert.equal(TESTNET_CHAIN_ID_HEX, "0x2648");
  assert.equal(parseHexBlock("0x2648"), 9800);
  assert.equal(parseHexBlock("0x9a1791"), 10098577);
});

check("proof message format is exact", () => {
  const msg = buildProofMessage(
    10123456,
    "0x1111111111111111111111111111111111111111",
  );
  assert.equal(
    msg,
    "QDAY-PROOF|qorechain-diana|9800|block:10123456|address:0x1111111111111111111111111111111111111111|hybrid:secp256k1+ML-DSA-87",
  );
  assert.throws(() => buildProofMessage(1, "not an address"));
  assert.throws(() => buildProofMessage(-1, "0x1111111111111111111111111111111111111111"));
});

check("hex helpers round trip", () => {
  const bytes = new Uint8Array([0, 1, 171, 255]);
  assert.equal(toHex(bytes), "0x0001abff");
  assert.deepEqual(fromHex("0x0001abff"), bytes);
  assert.equal(shortHex("0x0001abff"), "0x0001abff");
  assert.equal(shortHex("0x" + "ab".repeat(40)), "0xabababab...abababab");
  assert.equal(isValidEvmAddress("0x1111111111111111111111111111111111111111"), true);
  assert.equal(isValidEvmAddress("0x123"), false);
});

check("ML-DSA-87 sizes are FIPS 204 sizes", () => {
  assert.equal(ML_DSA_87_PUBLIC_KEY_LENGTH, 2592);
  assert.equal(ML_DSA_87_SECRET_KEY_LENGTH, 4896);
  assert.equal(ML_DSA_87_SIGNATURE_LENGTH, 4627);
  const kp = generatePqcKeypair();
  assert.equal(kp.publicKey.length, 2592);
  assert.equal(kp.secretKey.length, 4896);
});

check("hybrid extension object uses Dilithium-5", () => {
  const kp = generatePqcKeypair();
  const sig = new Uint8Array(4627);
  sig[0] = 1;
  const ext = buildHybridSignatureExtension({
    algorithmId: AlgorithmDilithium5,
    signature: sig,
    publicKey: kp.publicKey,
  });
  assert.equal(ext.algorithm_id, AlgorithmDilithium5);
  assert.equal(ext.pqc_signature.length, 4627);
  assert.equal(ext.pqc_public_key.length, 2592);
});

check("demo identity has a valid EVM address and PQC key", () => {
  const id = createDemoIdentity();
  assert.equal(isValidEvmAddress(id.address), true);
  assert.equal(id.classicalPrivateKey.length, 32);
  assert.equal(fromHex(id.classicalPublicKeyCompressedHex).length, 33);
  assert.equal(fromHex(id.classicalPublicKeyUncompressedHex).length, 65);
  assert.equal(id.pqcKeypair.publicKey.length, 2592);
  assert.equal(id.pqcKeypair.secretKey.length, 4896);
  assert.equal(id.pqcPublicKeyHex, toHex(id.pqcKeypair.publicKey));
});

check("hybrid proof signs and verifies both parts", () => {
  const id = createDemoIdentity();
  const proof = signHybridProof(10123456, id);
  assert.equal(proof.blockNumber, 10123456);
  assert.equal(proof.address, id.address);
  assert.equal(fromHex(proof.classicalSignatureHex).length, 64);
  assert.equal(fromHex(proof.pqcSignatureHex).length, 4627);
  assert.equal(fromHex(proof.pqcPublicKeyHex).length, 2592);
  assert.equal(proof.extensionTypeUrl, "/qorechain.pqc.v1.PQCHybridSignature");
  assert.equal(proof.messageSha256Hex.length, 66);
  const v = verifyHybridProof(proof);
  assert.equal(v.messageMatches, true);
  assert.equal(v.classicalValid, true);
  assert.equal(v.pqcValid, true);
  assert.equal(v.classicalSignatureLength, 64);
  assert.equal(v.pqcSignatureLength, 4627);
  assert.equal(v.pqcPublicKeyLength, 2592);
  assert.equal(v.allValid, true);
});

check("tampered PQC signature fails verification", () => {
  const id = createDemoIdentity();
  const proof = signHybridProof(10123456, id);
  const badBytes = fromHex(proof.pqcSignatureHex);
  badBytes[0] = badBytes[0] === 0 ? 1 : 0;
  const bad = { ...proof, pqcSignatureHex: toHex(badBytes) };
  const v = verifyHybridProof(bad);
  assert.equal(v.pqcValid, false);
  assert.equal(v.allValid, false);
  assert.equal(v.classicalValid, true);
});

check("tampered classical signature fails verification", () => {
  const id = createDemoIdentity();
  const proof = signHybridProof(10123456, id);
  const badBytes = fromHex(proof.classicalSignatureHex);
  badBytes[0] = badBytes[0] === 0 ? 1 : 0;
  const bad = { ...proof, classicalSignatureHex: toHex(badBytes) };
  const v = verifyHybridProof(bad);
  assert.equal(v.classicalValid, false);
  assert.equal(v.allValid, false);
  assert.equal(v.pqcValid, true);
});

check("tampered message fails verification", () => {
  const id = createDemoIdentity();
  const proof = signHybridProof(10123456, id);
  const bad = { ...proof, blockNumber: 10123457 };
  const v = verifyHybridProof(bad);
  assert.equal(v.messageMatches, false);
  assert.equal(v.allValid, false);
});

check("pqcVerify rejects a truncated signature", () => {
  const kp = generatePqcKeypair();
  const msg = new TextEncoder().encode("hello proof");
  const sig = new Uint8Array(4627);
  assert.equal(pqcVerify(kp.publicKey, msg, sig.slice(0, 100)), false);
});

console.log("PASS " + passed + " checks, 0 failed");
