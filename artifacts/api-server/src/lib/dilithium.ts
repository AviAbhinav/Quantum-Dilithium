import crypto from "crypto";

let dilithiumInstance: DilithiumAPI | null = null;

interface DilithiumAPI {
  generateKeys(kind: number): { publicKey: Uint8Array; privateKey: Uint8Array };
  sign(message: Uint8Array, privateKey: Uint8Array, kind: number): { signature: Uint8Array };
  verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array, kind: number): { result: number };
}

async function getDilithium(): Promise<DilithiumAPI> {
  if (dilithiumInstance) return dilithiumInstance;
  const mod = await import("dilithium-crystals-js");
  const dilithium = await (mod.default as unknown as Promise<DilithiumAPI>);
  dilithiumInstance = dilithium;
  return dilithium;
}

export const DILITHIUM_KIND = 2;
export const ALGORITHM = "CRYSTALS-Dilithium2 (ML-DSA-44)";

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string; algorithm: string }> {
  const dilithium = await getDilithium();
  const { publicKey, privateKey } = dilithium.generateKeys(DILITHIUM_KIND);
  return {
    publicKey: Buffer.from(publicKey).toString("hex"),
    privateKey: Buffer.from(privateKey).toString("hex"),
    algorithm: ALGORITHM,
  };
}

export async function signData(data: string, privateKeyHex: string): Promise<string> {
  const dilithium = await getDilithium();
  const message = Buffer.from(data, "utf8");
  const privateKey = Buffer.from(privateKeyHex, "hex");
  const { signature } = dilithium.sign(message, privateKey, DILITHIUM_KIND);
  return Buffer.from(signature).toString("hex");
}

export async function verifySignature(
  data: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const dilithium = await getDilithium();
    const message = Buffer.from(data, "utf8");
    const signature = Buffer.from(signatureHex, "hex");
    const publicKey = Buffer.from(publicKeyHex, "hex");
    const { result } = dilithium.verify(signature, message, publicKey, DILITHIUM_KIND);
    return result === 0;
  } catch {
    return false;
  }
}

export function buildTransactionPayload(
  sender: string,
  recipient: string,
  amount: number,
  data: string | undefined,
  timestamp: string
): string {
  return JSON.stringify({ sender, recipient, amount, data: data ?? "", timestamp });
}

export function generateTransactionId(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function computeHash(
  index: number,
  timestamp: string,
  previousHash: string,
  nonce: number,
  transactions: object[]
): string {
  const content = JSON.stringify({ index, timestamp, previousHash, nonce, transactions });
  return crypto.createHash("sha256").update(content).digest("hex");
}
