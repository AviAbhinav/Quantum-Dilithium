import "./session-types.js";
import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

function hashPublicKey(pk: string) {
  return crypto.createHash("sha256").update(pk).digest("hex");
}

const router: IRouter = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        publicKey: usersTable.publicKey,
        balance: usersTable.balance,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable);

    res.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        publicKey: u.publicKey,
        balance: parseFloat(u.balance),
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "List users failed");
    res.status(500).json({ error: "internal_error", message: "Failed to list users" });
  }
});

router.get("/users/:publicKey/balance", async (req, res) => {
  try {
    const { publicKey } = req.params;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.publicKeyHash, hashPublicKey(publicKey))).limit(1);

    if (!user) {
      return res.status(404).json({ error: "not_found", message: "User not found" });
    }

    res.json({
      publicKey: user.publicKey,
      username: user.username,
      balance: parseFloat(user.balance),
    });
  } catch (err) {
    req.log.error({ err }, "Get balance failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get balance" });
  }
});

export default router;
