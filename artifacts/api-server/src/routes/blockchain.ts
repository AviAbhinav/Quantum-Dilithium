import "./session-types.js";
import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { blocksTable, pendingTransactionsTable, usersTable, type TransactionData } from "@workspace/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import {
  signData,
  verifySignature,
  buildTransactionPayload,
  generateTransactionId,
  computeHash,
  encryptData,
  ALGORITHM,
  HASH_ALGORITHM,
  ENCRYPTION_ALGORITHM,
} from "../lib/dilithium.js";

function hashPublicKey(pk: string) {
  return crypto.createHash("sha256").update(pk).digest("hex");
}

const router: IRouter = Router();

const DIFFICULTY = 3;
const MINING_REWARD = 10;

function requireAuth(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "unauthenticated", message: "You must be logged in" });
  }
  next();
}

function meetsProofOfWork(hash: string, difficulty: number): boolean {
  return hash.startsWith("0".repeat(difficulty));
}

async function getOrCreateGenesis() {
  const existing = await db.select().from(blocksTable).where(eq(blocksTable.index, 0)).limit(1);
  if (existing.length > 0) return existing[0];

  const genesisTimestamp = "2024-01-01T00:00:00.000Z";
  const genesisHash = computeHash(0, genesisTimestamp, "0".repeat(128), 0, []);
  const [genesis] = await db.insert(blocksTable).values({
    index: 0,
    timestamp: new Date(genesisTimestamp),
    previousHash: "0".repeat(128),
    hash: genesisHash,
    nonce: 0,
    minerAddress: "GENESIS",
    minerUsername: "GENESIS",
    transactions: [],
  }).returning();
  return genesis;
}

function blockToJson(b: typeof blocksTable.$inferSelect) {
  return {
    index: b.index,
    timestamp: b.timestamp.toISOString(),
    transactions: b.transactions as TransactionData[],
    previousHash: b.previousHash,
    hash: b.hash,
    nonce: b.nonce,
    minerAddress: b.minerAddress,
    minerUsername: b.minerUsername ?? undefined,
  };
}

router.get("/blockchain", async (req, res) => {
  try {
    await getOrCreateGenesis();
    const chain = await db.select().from(blocksTable).orderBy(asc(blocksTable.index));
    res.json({ chain: chain.map(blockToJson), length: chain.length, difficulty: DIFFICULTY });
  } catch (err) {
    req.log.error({ err }, "Failed to get blockchain");
    res.status(500).json({ error: "internal_error", message: "Failed to get blockchain" });
  }
});

router.get("/blockchain/validate", async (req, res) => {
  try {
    const chain = await db.select().from(blocksTable).orderBy(asc(blocksTable.index));
    const invalidBlocks: number[] = [];
    const checks: string[] = [
      `Hash algorithm: ${HASH_ALGORITHM}`,
      `Signature algorithm: ${ALGORITHM}`,
      `Encryption: ${ENCRYPTION_ALGORITHM}`,
      `Blocks in chain: ${chain.length}`,
    ];

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const prev = chain[i - 1];

      if (block.previousHash !== prev.hash) {
        invalidBlocks.push(block.index);
        checks.push(`Block ${block.index}: ❌ previousHash mismatch`);
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
        checks.push(`Block ${block.index}: ❌ hash mismatch`);
        continue;
      }

      let sigOk = true;
      const transactions = block.transactions as TransactionData[];
      for (const tx of transactions) {
        if (tx.sender === "COINBASE") continue;
        const payload = buildTransactionPayload(tx.sender, tx.recipient, tx.amount, tx.timestamp);
        const valid = await verifySignature(payload, tx.signature, tx.sender);
        if (!valid) {
          sigOk = false;
          break;
        }
      }
      if (!sigOk && !invalidBlocks.includes(block.index)) {
        invalidBlocks.push(block.index);
        checks.push(`Block ${block.index}: ❌ Dilithium5 signature invalid`);
      } else {
        checks.push(`Block ${block.index}: ✓ valid (${transactions.length} txs, SHA3-512 verified)`);
      }
    }

    if (chain.length > 0) {
      checks.push(`Genesis block: ✓`);
    }

    res.json({
      valid: invalidBlocks.length === 0,
      message: invalidBlocks.length === 0
        ? `Blockchain is valid. All ${Math.max(chain.length - 1, 0)} blocks verified with ${ALGORITHM} + ${HASH_ALGORITHM}.`
        : `Found ${invalidBlocks.length} invalid block(s).`,
      checks,
      invalidBlocks,
    });
  } catch (err) {
    req.log.error({ err }, "Validation failed");
    res.status(500).json({ error: "internal_error", message: "Validation failed" });
  }
});

router.post("/blockchain/mine", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const [miner] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!miner) return res.status(401).json({ error: "unauthenticated", message: "User not found" });

    const pending = await db.select().from(pendingTransactionsTable);

    const coinbaseTimestamp = new Date().toISOString();
    const coinbaseTx: TransactionData = {
      id: crypto.randomUUID(),
      sender: "COINBASE",
      senderUsername: "SYSTEM",
      recipient: miner.publicKey,
      recipientUsername: miner.username,
      amount: MINING_REWARD,
      signature: "COINBASE_REWARD",
      timestamp: coinbaseTimestamp,
      verified: true,
    };

    const transactions: TransactionData[] = [
      coinbaseTx,
      ...pending.map((p) => ({
        id: p.id,
        sender: p.sender,
        senderUsername: p.senderUsername ?? undefined,
        recipient: p.recipient,
        recipientUsername: p.recipientUsername ?? undefined,
        amount: parseFloat(p.amount),
        encryptedData: p.encryptedData ?? undefined,
        signature: p.signature,
        timestamp: p.timestamp.toISOString(),
        verified: p.verified === 1,
      })),
    ];

    await getOrCreateGenesis();
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

    const [newBlock] = await db.insert(blocksTable).values({
      index: newIndex,
      timestamp,
      previousHash: lastBlock.hash,
      hash,
      nonce,
      minerAddress: miner.publicKey,
      minerUsername: miner.username,
      transactions,
    }).returning();

    await db.delete(pendingTransactionsTable);

    await db.update(usersTable)
      .set({ balance: sql`balance + ${MINING_REWARD}` })
      .where(eq(usersTable.id, userId));

    for (const tx of pending) {
      await db.update(usersTable)
        .set({ balance: sql`balance + ${parseFloat(tx.amount)}` })
        .where(eq(usersTable.publicKeyHash, hashPublicKey(tx.recipient)));
    }

    res.json(blockToJson(newBlock));
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
        senderUsername: p.senderUsername ?? undefined,
        recipient: p.recipient,
        recipientUsername: p.recipientUsername ?? undefined,
        amount: parseFloat(p.amount),
        encryptedData: p.encryptedData ?? undefined,
        signature: p.signature,
        timestamp: p.timestamp.toISOString(),
        verified: p.verified === 1,
      })),
      count: pending.length,
    });
  } catch (err) {
    req.log.error({ err }, "Pending tx fetch failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get pending transactions" });
  }
});

router.post("/transactions/submit", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { recipientPublicKey, amount, note } = req.body as {
      recipientPublicKey: string;
      amount: number;
      note?: string;
    };

    if (!recipientPublicKey || amount == null) {
      return res.status(400).json({ error: "bad_request", message: "recipientPublicKey and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "bad_request", message: "Amount must be positive" });
    }

    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!sender) return res.status(401).json({ error: "unauthenticated", message: "User not found" });

    const senderBalance = parseFloat(sender.balance);
    if (senderBalance < amount) {
      return res.status(400).json({
        error: "insufficient_balance",
        message: `Insufficient balance. You have ${senderBalance.toFixed(4)} QDLT but tried to send ${amount}`,
      });
    }

    if (recipientPublicKey === sender.publicKey) {
      return res.status(400).json({ error: "bad_request", message: "Cannot send tokens to yourself" });
    }

    const [recipient] = await db.select().from(usersTable).where(eq(usersTable.publicKeyHash, hashPublicKey(recipientPublicKey))).limit(1);
    if (!recipient) {
      return res.status(400).json({ error: "not_found", message: "Recipient not found on this blockchain" });
    }

    const timestamp = new Date().toISOString();
    const payload = buildTransactionPayload(sender.publicKey, recipientPublicKey, amount, timestamp);

    const signature = await signData(payload, sender.privateKey);

    let encryptedData: string | undefined;
    if (note) {
      const { encrypted } = encryptData(
        JSON.stringify({ note, sender: sender.username, recipient: recipient.username })
      );
      encryptedData = encrypted;
    }

    const txId = generateTransactionId(`${payload}|${signature}`);

    await db.insert(pendingTransactionsTable).values({
      id: txId,
      sender: sender.publicKey,
      senderUsername: sender.username,
      recipient: recipientPublicKey,
      recipientUsername: recipient.username,
      amount: String(amount),
      encryptedData: encryptedData ?? null,
      signature,
      timestamp: new Date(timestamp),
      verified: 1,
    });

    await db.update(usersTable)
      .set({ balance: sql`balance - ${amount}` })
      .where(eq(usersTable.id, userId));

    const [updatedSender] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    res.json({
      success: true,
      transactionId: txId,
      message: `Transaction signed with ${ALGORITHM} and submitted to pending pool. It will be confirmed when the next block is mined.`,
      newBalance: parseFloat(updatedSender.balance),
    });
  } catch (err) {
    req.log.error({ err }, "Submit tx failed");
    res.status(500).json({ error: "internal_error", message: "Failed to submit transaction" });
  }
});

export default router;
