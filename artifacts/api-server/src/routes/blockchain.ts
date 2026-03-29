import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { blocksTable, pendingTransactionsTable, type TransactionData } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  generateKeyPair,
  signData,
  verifySignature,
  buildTransactionPayload,
  generateTransactionId,
  computeHash,
} from "../lib/dilithium.js";
import crypto from "crypto";

const router: IRouter = Router();

const DIFFICULTY = 3;
const MINING_REWARD = 50;

function meetsProofOfWork(hash: string, difficulty: number): boolean {
  return hash.startsWith("0".repeat(difficulty));
}

async function getOrCreateGenesis() {
  const existing = await db
    .select()
    .from(blocksTable)
    .where(eq(blocksTable.index, 0))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const genesisHash = computeHash(0, "2024-01-01T00:00:00.000Z", "0".repeat(64), 0, []);
  const [genesis] = await db
    .insert(blocksTable)
    .values({
      index: 0,
      timestamp: new Date("2024-01-01T00:00:00.000Z"),
      previousHash: "0".repeat(64),
      hash: genesisHash,
      nonce: 0,
      minerAddress: "genesis",
      transactions: [],
    })
    .returning();

  return genesis;
}

router.get("/blockchain", async (req, res) => {
  try {
    await getOrCreateGenesis();
    const chain = await db.select().from(blocksTable).orderBy(asc(blocksTable.index));

    res.json({
      chain: chain.map((b) => ({
        index: b.index,
        timestamp: b.timestamp.toISOString(),
        transactions: b.transactions as TransactionData[],
        previousHash: b.previousHash,
        hash: b.hash,
        nonce: b.nonce,
        minerAddress: b.minerAddress,
      })),
      length: chain.length,
      difficulty: DIFFICULTY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get blockchain");
    res.status(500).json({ error: "internal_error", message: "Failed to get blockchain" });
  }
});

router.get("/blockchain/validate", async (req, res) => {
  try {
    const chain = await db.select().from(blocksTable).orderBy(asc(blocksTable.index));
    const invalidBlocks: number[] = [];

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previousBlock = chain[i - 1];

      if (block.previousHash !== previousBlock.hash) {
        invalidBlocks.push(block.index);
        continue;
      }

      const recomputed = computeHash(
        block.index,
        block.timestamp.toISOString(),
        block.previousHash,
        block.nonce,
        block.transactions as object[]
      );
      if (recomputed !== block.hash) {
        invalidBlocks.push(block.index);
        continue;
      }

      const transactions = block.transactions as TransactionData[];
      for (const tx of transactions) {
        if (tx.sender === "COINBASE") continue;
        const payload = buildTransactionPayload(tx.sender, tx.recipient, tx.amount, tx.data, tx.timestamp);
        const valid = await verifySignature(payload, tx.signature, tx.sender);
        if (!valid) {
          if (!invalidBlocks.includes(block.index)) {
            invalidBlocks.push(block.index);
          }
          break;
        }
      }
    }

    res.json({
      valid: invalidBlocks.length === 0,
      message:
        invalidBlocks.length === 0
          ? "Blockchain is valid. All Dilithium signatures verified."
          : `Found ${invalidBlocks.length} invalid block(s).`,
      invalidBlocks,
    });
  } catch (err) {
    req.log.error({ err }, "Validation failed");
    res.status(500).json({ error: "internal_error", message: "Validation failed" });
  }
});

router.post("/blockchain/mine", async (req, res) => {
  try {
    const { minerAddress } = req.body as { minerAddress: string };
    if (!minerAddress) {
      return res.status(400).json({ error: "bad_request", message: "minerAddress is required" });
    }

    const pending = await db.select().from(pendingTransactionsTable);

    const coinbaseTimestamp = new Date().toISOString();
    const coinbaseTx: TransactionData = {
      id: crypto.randomUUID(),
      sender: "COINBASE",
      recipient: minerAddress,
      amount: MINING_REWARD,
      signature: "COINBASE_REWARD",
      timestamp: coinbaseTimestamp,
    };

    const transactions: TransactionData[] = [
      coinbaseTx,
      ...pending.map((p) => ({
        id: p.id,
        sender: p.sender,
        recipient: p.recipient,
        amount: parseFloat(p.amount),
        data: p.data ?? undefined,
        signature: p.signature,
        timestamp: p.timestamp.toISOString(),
      })),
    ];

    const chain = await db.select().from(blocksTable).orderBy(asc(blocksTable.index));
    const lastBlock = chain[chain.length - 1];
    const newIndex = lastBlock.index + 1;
    const timestamp = new Date();

    let nonce = 0;
    let hash: string;
    do {
      hash = computeHash(newIndex, timestamp.toISOString(), lastBlock.hash, nonce, transactions);
      nonce++;
    } while (!meetsProofOfWork(hash, DIFFICULTY));
    nonce--;

    const [newBlock] = await db
      .insert(blocksTable)
      .values({
        index: newIndex,
        timestamp,
        previousHash: lastBlock.hash,
        hash,
        nonce,
        minerAddress,
        transactions,
      })
      .returning();

    await db.delete(pendingTransactionsTable);

    res.json({
      index: newBlock.index,
      timestamp: newBlock.timestamp.toISOString(),
      transactions,
      previousHash: newBlock.previousHash,
      hash: newBlock.hash,
      nonce: newBlock.nonce,
      minerAddress: newBlock.minerAddress,
    });
  } catch (err) {
    req.log.error({ err }, "Mining failed");
    res.status(500).json({ error: "internal_error", message: "Mining failed" });
  }
});

router.get("/transactions/pending", async (req, res) => {
  try {
    const pending = await db.select().from(pendingTransactionsTable);
    res.json({
      transactions: pending.map((p) => ({
        id: p.id,
        sender: p.sender,
        recipient: p.recipient,
        amount: parseFloat(p.amount),
        data: p.data ?? undefined,
        signature: p.signature,
        timestamp: p.timestamp.toISOString(),
      })),
      count: pending.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get pending transactions");
    res.status(500).json({ error: "internal_error", message: "Failed to get pending transactions" });
  }
});

router.post("/transactions/sign", async (req, res) => {
  try {
    const { sender, recipient, amount, data, privateKey } = req.body as {
      sender: string;
      recipient: string;
      amount: number;
      data?: string;
      privateKey: string;
    };

    if (!sender || !recipient || amount == null || !privateKey) {
      return res.status(400).json({ error: "bad_request", message: "Missing required fields" });
    }

    const timestamp = new Date().toISOString();
    const payload = buildTransactionPayload(sender, recipient, amount, data, timestamp);
    const signature = await signData(payload, privateKey);

    res.json({
      sender,
      recipient,
      amount,
      data: data ?? "",
      signature,
      publicKey: sender,
      timestamp,
    });
  } catch (err) {
    req.log.error({ err }, "Signing failed");
    res.status(400).json({ error: "sign_error", message: "Failed to sign transaction. Check your private key." });
  }
});

router.post("/transactions/submit", async (req, res) => {
  try {
    const { sender, recipient, amount, data, signature, publicKey, timestamp } = req.body as {
      sender: string;
      recipient: string;
      amount: number;
      data?: string;
      signature: string;
      publicKey: string;
      timestamp: string;
    };

    if (!sender || !recipient || amount == null || !signature || !publicKey || !timestamp) {
      return res.status(400).json({ error: "bad_request", message: "Missing required fields" });
    }

    const payload = buildTransactionPayload(sender, recipient, amount, data, timestamp);
    const valid = await verifySignature(payload, signature, publicKey);

    if (!valid) {
      return res.status(400).json({ error: "invalid_signature", message: "Dilithium signature verification failed" });
    }

    const txId = generateTransactionId(payload + signature);

    await db.insert(pendingTransactionsTable).values({
      id: txId,
      sender,
      recipient,
      amount: String(amount),
      data: data ?? null,
      signature,
      publicKey,
      timestamp: new Date(timestamp),
    });

    res.json({
      success: true,
      transactionId: txId,
      message: "Transaction verified and added to pending pool",
    });
  } catch (err) {
    req.log.error({ err }, "Submit failed");
    res.status(500).json({ error: "internal_error", message: "Failed to submit transaction" });
  }
});

router.post("/keys/generate", async (req, res) => {
  try {
    const keyPair = await generateKeyPair();
    res.json(keyPair);
  } catch (err) {
    req.log.error({ err }, "Key generation failed");
    res.status(500).json({ error: "internal_error", message: "Key generation failed" });
  }
});

export default router;
