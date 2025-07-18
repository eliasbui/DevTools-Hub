import { 
  users, 
  toolUsage, 
  savedData, 
  apiHistory,
  type User, 
  type InsertUser,
  type ToolUsage,
  type InsertToolUsage,
  type SavedData,
  type InsertSavedData,
  type ApiHistory,
  type InsertApiHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tool usage tracking
  recordToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  getToolUsage(userId: number, toolId: string): Promise<ToolUsage | undefined>;
  getUserToolUsage(userId: number): Promise<ToolUsage[]>;
  
  // Saved data management
  saveData(data: InsertSavedData): Promise<SavedData>;
  getSavedData(userId: number, toolId?: string): Promise<SavedData[]>;
  deleteSavedData(id: number, userId: number): Promise<boolean>;
  
  // API history
  saveApiHistory(history: InsertApiHistory): Promise<ApiHistory>;
  getApiHistory(userId: number, limit?: number): Promise<ApiHistory[]>;
  deleteApiHistory(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async recordToolUsage(usage: InsertToolUsage): Promise<ToolUsage> {
    const [existing] = await db
      .select()
      .from(toolUsage)
      .where(and(eq(toolUsage.userId, usage.userId), eq(toolUsage.toolId, usage.toolId)));
    
    if (existing) {
      const [updated] = await db
        .update(toolUsage)
        .set({ 
          usageCount: (existing.usageCount || 1) + 1,
          lastUsed: new Date()
        })
        .where(eq(toolUsage.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newUsage] = await db
      .insert(toolUsage)
      .values(usage)
      .returning();
    return newUsage;
  }

  async getToolUsage(userId: number, toolId: string): Promise<ToolUsage | undefined> {
    const [usage] = await db
      .select()
      .from(toolUsage)
      .where(and(eq(toolUsage.userId, userId), eq(toolUsage.toolId, toolId)));
    return usage || undefined;
  }

  async getUserToolUsage(userId: number): Promise<ToolUsage[]> {
    return await db
      .select()
      .from(toolUsage)
      .where(eq(toolUsage.userId, userId))
      .orderBy(desc(toolUsage.lastUsed));
  }

  async saveData(data: InsertSavedData): Promise<SavedData> {
    const [saved] = await db
      .insert(savedData)
      .values(data)
      .returning();
    return saved;
  }

  async getSavedData(userId: number, toolId?: string): Promise<SavedData[]> {
    let query = db
      .select()
      .from(savedData)
      .where(eq(savedData.userId, userId));
    
    if (toolId) {
      query = query.where(eq(savedData.toolId, toolId));
    }
    
    return await query.orderBy(desc(savedData.createdAt));
  }

  async deleteSavedData(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(savedData)
      .where(and(eq(savedData.id, id), eq(savedData.userId, userId)));
    return result.rowCount > 0;
  }

  async saveApiHistory(history: InsertApiHistory): Promise<ApiHistory> {
    const [saved] = await db
      .insert(apiHistory)
      .values(history)
      .returning();
    return saved;
  }

  async getApiHistory(userId: number, limit: number = 50): Promise<ApiHistory[]> {
    return await db
      .select()
      .from(apiHistory)
      .where(eq(apiHistory.userId, userId))
      .orderBy(desc(apiHistory.createdAt))
      .limit(limit);
  }

  async deleteApiHistory(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(apiHistory)
      .where(and(eq(apiHistory.id, id), eq(apiHistory.userId, userId)));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
