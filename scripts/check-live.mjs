const RPC = "https://evm-testnet.qore.host";

async function call(method, params) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(method + " error " + data.error.code + ": " + data.error.message);
  }
  return data.result;
}

const blockHex = await call("eth_blockNumber", []);
const chainHex = await call("eth_chainId", []);
const block = parseInt(blockHex, 16);
const chain = parseInt(chainHex, 16);
console.log("eth_blockNumber " + blockHex + " = " + block);
console.log("eth_chainId " + chainHex + " = " + chain);
console.log("network qorechain-diana, expected chain 9800, match " + String(chain === 9800));
let hybridMode = "not available";
try {
  hybridMode = JSON.stringify(await call("qor_getHybridSignatureMode", []));
} catch (err) {
  hybridMode = "not available from EVM RPC: " + err.message;
}
console.log("qor_getHybridSignatureMode " + hybridMode);
