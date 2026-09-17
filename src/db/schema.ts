import {
  bigserial,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 16 }).notNull().default("user"),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user1Id: uuid("user_1_id").references(() => users.id, { onDelete: "set null" }),
  user2Id: uuid("user_2_id").references(() => users.id, { onDelete: "set null" }),
  participant1: varchar("participant_1", { length: 96 }).notNull(),
  participant2: varchar("participant_2", { length: 96 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
});

export const matchQueue = pgTable("match_queue", {
  participantToken: varchar("participant_token", { length: 96 }).primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  state: varchar("state", { length: 16 }).notNull().default("waiting"),
  peerToken: varchar("peer_token", { length: 96 }),
  chatSessionId: uuid("chat_session_id").references(() => chatSessions.id, { onDelete: "set null" }),
  isInitiator: boolean("is_initiator").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const signals = pgTable("signals", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  chatSessionId: uuid("chat_session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  senderToken: varchar("sender_token", { length: 96 }).notNull(),
  receiverToken: varchar("receiver_token", { length: 96 }).notNull(),
  type: varchar("type", { length: 24 }).notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  chatSessionId: uuid("chat_session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  senderToken: varchar("sender_token", { length: 96 }).notNull(),
  message: varchar("message", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id").references(() => users.id, { onDelete: "set null" }),
  reportedUserId: uuid("reported_user_id").references(() => users.id, { onDelete: "set null" }),
  chatSessionId: uuid("chat_session_id").references(() => chatSessions.id, { onDelete: "set null" }),
  reason: varchar("reason", { length: 64 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Report = typeof reports.$inferSelect;
