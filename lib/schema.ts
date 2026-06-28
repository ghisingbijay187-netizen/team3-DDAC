import { sql } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  real,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const scamTypes = pgTable("scam_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  warningSigns: text("warning_signs").notNull().default("[]"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  platform: text("platform").notNull(),
  scamTypeId: integer("scam_type_id").notNull().references(() => scamTypes.id),
  userId: integer("user_id").references(() => users.id),
  financialLoss: real("financial_loss"),
  reporterAge: text("reporter_age"),
  status: text("status").notNull().default("received"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type ScamType = typeof scamTypes.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type Tip = typeof tips.$inferSelect;