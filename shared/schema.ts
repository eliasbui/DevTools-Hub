import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const toolUsage = pgTable("tool_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  toolName: text("tool_name").notNull(),
  usageCount: integer("usage_count").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedData = pgTable("saved_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  title: text("title").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiHistory = pgTable("api_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  method: text("method").notNull(),
  url: text("url").notNull(),
  headers: json("headers"),
  body: text("body"),
  responseStatus: integer("response_status"),
  responseTime: integer("response_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  toolUsage: many(toolUsage),
  savedData: many(savedData),
  apiHistory: many(apiHistory),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;
export type SavedData = typeof savedData.$inferSelect;
export type InsertSavedData = z.infer<typeof insertSavedDataSchema>;
export type ApiHistory = typeof apiHistory.$inferSelect;
export type InsertApiHistory = z.infer<typeof insertApiHistorySchema>;
