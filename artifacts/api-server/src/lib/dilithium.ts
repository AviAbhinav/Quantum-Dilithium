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

export const DILITHIUM_KIND = 3;
export const ALGORITHM = "CRYSTALS-Dilithium3 (ML-DSA-65)";
export const HASH_ALGORITHM = "SHA3-512";
export const ENCRYPTION_ALGORITHM = "AES-256-GCM";

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
  timestamp: string
): string {
  return JSON.stringify({ sender, recipient, amount, timestamp });
}

export function generateTransactionId(payload: string): string {
  return computeHash(payload);
}

export function computeHash(...parts: unknown[]): string {
  const content = parts.map(p => typeof p === "string" ? p : JSON.stringify(p)).join("|");
  return crypto.createHash("sha3-512").update(content).digest("hex");
}

const AES_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_AUTH_TAG_BYTES = 16;

export function encryptData(data: string): { encrypted: string; key: string } {
  const key = crypto.randomBytes(AES_KEY_BYTES);
  const iv = crypto.randomBytes(GCM_IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return {
    encrypted: combined.toString("base64"),
    key: key.toString("hex"),
  };
}

export function decryptData(encryptedBase64: string, keyHex: string): string {
  const key = Buffer.from(keyHex, "hex");
  const combined = Buffer.from(encryptedBase64, "base64");
  const iv = combined.subarray(0, GCM_IV_BYTES);
  const authTag = combined.subarray(GCM_IV_BYTES, GCM_IV_BYTES + GCM_AUTH_TAG_BYTES);
  const encrypted = combined.subarray(GCM_IV_BYTES + GCM_AUTH_TAG_BYTES);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
