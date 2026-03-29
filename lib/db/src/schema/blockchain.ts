import { pgTable, text, integer, jsonb, timestamp, serial, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  publicKey: text("public_key").notNull(),
  publicKeyHash: text("public_key_hash").unique(),
  privateKey: text("private_key").notNull(),
  balance: numeric("balance", { precision: 18, scale: 6 }).notNull().default("100"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blocksTable = pgTable("blocks", {
  id: serial("id").primaryKey(),
  index: integer("index").notNull().unique(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  previousHash: text("previous_hash").notNull(),
  hash: text("hash").notNull(),
  nonce: integer("nonce").notNull(),
  minerAddress: text("miner_address").notNull(),
  minerUsername: text("miner_username"),
  transactions: jsonb("transactions").notNull().$type<TransactionData[]>(),
});

export const pendingTransactionsTable = pgTable("pending_transactions", {
  id: text("id").primaryKey(),
  sender: text("sender").notNull(),
  senderUsername: text("sender_username"),
  recipient: text("recipient").notNull(),
  recipientUsername: text("recipient_username"),
  amount: text("amount").notNull(),
  encryptedData: text("encrypted_data"),
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  verified: integer("verified").notNull().default(1),
});

export type TransactionData = {
  id: string;
  sender: string;
  senderUsername?: string;
  recipient: string;
  recipientUsername?: string;
  amount: number;
  encryptedData?: string;
  signature: string;
  timestamp: string;
  verified?: boolean;
};

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const insertBlockSchema = createInsertSchema(blocksTable).omit({ id: true });
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Block = typeof blocksTable.$inferSelect;

export type PendingTransaction = typeof pendingTransactionsTable.$inferSelect;
export const insertPendingTransactionSchema = createInsertSchema(pendingTransactionsTable);
export type InsertPendingTransaction = z.infer<typeof insertPendingTransactionSchema>;
