import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { keccak_256 } from "@noble/hashes/sha3";
import {
  AlgorithmDilithium5,
  HYBRID_SIG_TYPE_URL,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SECRET_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
  buildHybridSignatureExtension,
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  type PqcKeypair,
} from "@qorechain/sdk";

export const TESTNET_NAME = "qorechain-diana";
export const TESTNET_CHAIN_ID = 9800;
export const TESTNET_CHAIN_ID_HEX = "0x2648";
export const EVM_RPC_URL = "https://evm-testnet.qore.host";
export const REST_URL = "https://api-testnet.qore.host";
export const FAUCET_URL = "https://dashboard.qorechain.io/faucet";
export const DOCS_URL = "https://docs.qorechain.io/sdk/quickstart";
export const HYBRID_LABEL = "secp256k1 plus ML-DSA-87";
export const HYBRID_EXTENSION_TYPE_URL = HYBRID_SIG_TYPE_URL;

export const PQC_PUBLIC_KEY_LENGTH = ML_DSA_87_PUBLIC_KEY_LENGTH;
export const PQC_SECRET_KEY_LENGTH = ML_DSA_87_SECRET_KEY_LENGTH;
export const PQC_SIGNATURE_LENGTH = ML_DSA_87_SIGNATURE_LENGTH;

export function toHex(bytes: Uint8Array): string {
  let out = "0x";
  for (const b of bytes) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Hex string must have an even length.");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function parseHexBlock(value: string): number {
  const trimmed = value.trim();
  const n = trimmed.startsWith("0x") || trimmed.startsWith("0X")
    ? parseInt(trimmed, 16)
    : parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Block value is not a valid non negative number.");
  }
  return n;
}

export function shortHex(hex: string): string {
  if (hex.length <= 18) {
    return hex;
  }
  return hex.slice(0, 10) + "..." + hex.slice(hex.length - 8);
}

export function isValidEvmAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address.trim());
}

export function buildProofMessage(blockNumber: number, address: string): string {
  if (!Number.isInteger(blockNumber) || blockNumber < 0) {
    throw new Error("Block number must be a non negative integer.");
  }
  if (!isValidEvmAddress(address)) {
    throw new Error("Address must be a 0x address with 40 hex characters.");
  }
  return (
    "QDAY-PROOF|" +
    TESTNET_NAME +
    "|9800|block:" +
    String(blockNumber) +
    "|address:" +
    address.toLowerCase() +
    "|hybrid:secp256k1+ML-DSA-87"
  );
}

export interface DemoIdentity {
  classicalPrivateKey: Uint8Array;
  classicalPublicKeyCompressedHex: string;
  classicalPublicKeyUncompressedHex: string;
  address: string;
  pqcKeypair: PqcKeypair;
  pqcPublicKeyHex: string;
}

export function createDemoIdentity(): DemoIdentity {
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  const uncompressed = secp256k1.getPublicKey(privateKey, false);
  const compressed = secp256k1.getPublicKey(privateKey, true);
  const hash = keccak_256(uncompressed.slice(1));
  const addressBytes = hash.slice(hash.length - 20);
  const address = toHex(addressBytes);
  const pqcKeypair = generatePqcKeypair();
  return {
    classicalPrivateKey: privateKey,
    classicalPublicKeyCompressedHex: toHex(compressed),
    classicalPublicKeyUncompressedHex: toHex(uncompressed),
    address,
    pqcKeypair,
    pqcPublicKeyHex: toHex(pqcKeypair.publicKey),
  };
}

export interface HybridProof {
  message: string;
  messageSha256Hex: string;
  blockNumber: number;
  address: string;
  classicalSignatureHex: string;
  classicalPublicKeyHex: string;
  pqcSignatureHex: string;
  pqcPublicKeyHex: string;
  extensionTypeUrl: string;
  extensionAlgorithmId: number;
}

export function signHybridProof(
  blockNumber: number,
  identity: DemoIdentity,
): HybridProof {
  const message = buildProofMessage(blockNumber, identity.address);
  const messageBytes = textToBytes(message);
  const messageHash = sha256(messageBytes);
  const classicalSignature = secp256k1.sign(messageHash, identity.classicalPrivateKey);
  const classicalBytes = classicalSignature.toCompactRawBytes();
  const pqcSignature = pqcSign(identity.pqcKeypair.secretKey, messageBytes);
  const extension = buildHybridSignatureExtension({
    algorithmId: AlgorithmDilithium5,
    signature: pqcSignature,
    publicKey: identity.pqcKeypair.publicKey,
  });
  return {
    message,
    messageSha256Hex: toHex(messageHash),
    blockNumber,
    address: identity.address,
    classicalSignatureHex: toHex(classicalBytes),
    classicalPublicKeyHex: identity.classicalPublicKeyCompressedHex,
    pqcSignatureHex: toHex(pqcSignature),
    pqcPublicKeyHex: toHex(identity.pqcKeypair.publicKey),
    extensionTypeUrl: HYBRID_SIG_TYPE_URL,
    extensionAlgorithmId: extension.algorithm_id as number,
  };
}

export interface HybridVerification {
  messageMatches: boolean;
  classicalValid: boolean;
  pqcValid: boolean;
  classicalSignatureLength: number;
  pqcSignatureLength: number;
  pqcPublicKeyLength: number;
  allValid: boolean;
}

export function verifyHybridProof(proof: HybridProof): HybridVerification {
  const expectedMessage = buildProofMessage(proof.blockNumber, proof.address);
  const messageMatches = expectedMessage === proof.message;
  const messageBytes = textToBytes(proof.message);
  const messageHash = sha256(messageBytes);
  let classicalValid = false;
  try {
    classicalValid = secp256k1.verify(
      fromHex(proof.classicalSignatureHex),
      messageHash,
      fromHex(proof.classicalPublicKeyHex),
    );
  } catch {
    classicalValid = false;
  }
  let pqcValid = false;
  try {
    pqcValid = pqcVerify(
      fromHex(proof.pqcPublicKeyHex),
      messageBytes,
      fromHex(proof.pqcSignatureHex),
    );
  } catch {
    pqcValid = false;
  }
  const classicalSignatureLength = fromHex(proof.classicalSignatureHex).length;
  const pqcSignatureLength = fromHex(proof.pqcSignatureHex).length;
  const pqcPublicKeyLength = fromHex(proof.pqcPublicKeyHex).length;
  return {
    messageMatches,
    classicalValid,
    pqcValid,
    classicalSignatureLength,
    pqcSignatureLength,
    pqcPublicKeyLength,
    allValid:
      messageMatches &&
      classicalValid &&
      pqcValid &&
      classicalSignatureLength === 64 &&
      pqcSignatureLength === ML_DSA_87_SIGNATURE_LENGTH &&
      pqcPublicKeyLength === ML_DSA_87_PUBLIC_KEY_LENGTH,
  };
}
