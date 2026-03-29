import { pgTable, text, integer, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blocksTable = pgTable("blocks", {
  id: serial("id").primaryKey(),
  index: integer("index").notNull().unique(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  previousHash: text("previous_hash").notNull(),
  hash: text("hash").notNull(),
  nonce: integer("nonce").notNull(),
  minerAddress: text("miner_address").notNull(),
  transactions: jsonb("transactions").notNull().$type<TransactionData[]>(),
});

export const pendingTransactionsTable = pgTable("pending_transactions", {
  id: text("id").primaryKey(),
  sender: text("sender").notNull(),
  recipient: text("recipient").notNull(),
  amount: text("amount").notNull(),
  data: text("data"),
  signature: text("signature").notNull(),
  publicKey: text("public_key").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
});

export type TransactionData = {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  data?: string;
  signature: string;
  timestamp: string;
};

export const insertBlockSchema = createInsertSchema(blocksTable).omit({ id: true });
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Block = typeof blocksTable.$inferSelect;
export type PendingTransaction = typeof pendingTransactionsTable.$inferSelect;

export const insertPendingTransactionSchema = createInsertSchema(pendingTransactionsTable);
export type InsertPendingTransaction = z.infer<typeof insertPendingTransactionSchema>;
