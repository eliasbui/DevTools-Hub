import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with Replit Auth and subscription fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit sub (user ID)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan").default('free'), // free, pro, team, enterprise
  subscriptionStatus: varchar("subscription_status").default('active'), // active, cancelled, expired
  subscriptionEnd: timestamp("subscription_end"),
  dailyUsageCount: integer("daily_usage_count").default(0),
  lastUsageReset: timestamp("last_usage_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const toolUsage = pgTable("tool_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  toolName: text("tool_name").notNull(),
  usageCount: integer("usage_count").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedData = pgTable("saved_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  title: text("title").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiHistory = pgTable("api_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  method: text("method").notNull(),
  url: text("url").notNull(),
  headers: json("headers"),
  body: text("body"),
  responseStatus: integer("response_status"),
  responseTime: integer("response_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  toolUsage: many(toolUsage),
  savedData: many(savedData),
  apiHistory: many(apiHistory),
  favorites: many(favorites),
}));

export const toolUsageRelations = relations(toolUsage, ({ one }) => ({
  user: one(users, {
    fields: [toolUsage.userId],
    references: [users.id],
  }),
}));

export const savedDataRelations = relations(savedData, ({ one }) => ({
  user: one(users, {
    fields: [savedData.userId],
    references: [users.id],
  }),
}));

export const apiHistoryRelations = relations(apiHistory, ({ one }) => ({
  user: one(users, {
    fields: [apiHistory.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  dailyUsageCount: true,
  lastUsageReset: true,
  plan: true,
  subscriptionStatus: true,
});

// UpsertUser for Replit Auth
export type UpsertUser = typeof users.$inferInsert;

export const insertToolUsageSchema = createInsertSchema(toolUsage).omit({ 
  id: true, 
  createdAt: true, 
  lastUsed: true 
});

export const insertSavedDataSchema = createInsertSchema(savedData).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertApiHistorySchema = createInsertSchema(apiHistory).omit({ 
  id: true, 
  createdAt: true 
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;
export type SavedData = typeof savedData.$inferSelect;
export type InsertSavedData = z.infer<typeof insertSavedDataSchema>;
export type ApiHistory = typeof apiHistory.$inferSelect;
export type InsertApiHistory = z.infer<typeof insertApiHistorySchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
