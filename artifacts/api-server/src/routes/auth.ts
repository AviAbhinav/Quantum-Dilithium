import "./session-types.js";
import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { generateKeyPair } from "../lib/dilithium.js";

function hashPublicKey(pubKey: string): string {
  return crypto.createHash("sha256").update(pubKey).digest("hex");
}

const router: IRouter = Router();
const SALT_ROUNDS = 12;

function userToProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    publicKey: user.publicKey,
    balance: parseFloat(user.balance),
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: "bad_request", message: "Username and password are required" });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: "bad_request", message: "Username must be 3–32 characters" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: "bad_request", message: "Username may only contain letters, numbers and underscores" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "bad_request", message: "Password must be at least 6 characters" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "username_taken", message: "Username is already taken" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { publicKey, privateKey } = await generateKeyPair();

    const [user] = await db
      .insert(usersTable)
      .values({ username, passwordHash, publicKey, publicKeyHash: hashPublicKey(publicKey), privateKey, balance: "100" })
      .returning();

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.publicKey = user.publicKey;

    res.json({ user: userToProfile(user), message: "Account created successfully. You have been granted 100 QDLT tokens." });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "internal_error", message: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: "bad_request", message: "Username and password are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid username or password" });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.publicKey = user.publicKey;

    res.json({ user: userToProfile(user), message: `Welcome back, ${user.username}!` });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/auth/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "unauthenticated", message: "Not logged in" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "unauthenticated", message: "Session expired" });
    }

    res.json(userToProfile(user));
  } catch (err) {
    req.log.error({ err }, "Get me failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get user" });
  }
});

export default router;
