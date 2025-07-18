import { 
  users, 
  toolUsage, 
  savedData, 
  apiHistory,
  favorites,
  type User, 
  type InsertUser,
  type UpsertUser,
  type ToolUsage,
  type InsertToolUsage,
  type SavedData,
  type InsertSavedData,
  type ApiHistory,
  type InsertApiHistory,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserPlan(userId: string, plan: string, subscriptionEnd?: Date): Promise<User>;
  updateStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;
  incrementDailyUsage(userId: string): Promise<{ allowed: boolean; count: number }>;
  resetDailyUsage(userId: string): Promise<void>;
  
  // Tool usage tracking
  recordToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  getToolUsage(userId: string, toolId: string): Promise<ToolUsage | undefined>;
  getUserToolUsage(userId: string): Promise<ToolUsage[]>;
  
  // Saved data management
  saveData(data: InsertSavedData): Promise<SavedData>;
  getSavedData(userId: string, toolId?: string): Promise<SavedData[]>;
  getUserSavedData(userId: string): Promise<SavedData[]>;
  deleteSavedData(id: number, userId: string): Promise<boolean>;
  
  // API history
  saveApiHistory(history: InsertApiHistory): Promise<ApiHistory>;
  getApiHistory(userId: string, limit?: number): Promise<ApiHistory[]>;
  deleteApiHistory(id: number, userId: string): Promise<boolean>;
  
  // Favorites
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, toolId: string): Promise<boolean>;
  getFavorites(userId: string): Promise<Favorite[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token));
    return user || undefined;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete all user data
    await db.delete(toolUsage).where(eq(toolUsage.userId, id));
    await db.delete(savedData).where(eq(savedData.userId, id));
    await db.delete(apiHistory).where(eq(apiHistory.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserPlan(userId: string, plan: string, subscriptionEnd?: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        plan,
        subscriptionEnd,
        subscriptionStatus: subscriptionEnd ? 'active' : 'expired',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async incrementDailyUsage(userId: string): Promise<{ allowed: boolean; count: number }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }

    // Reset daily usage if it's a new day
    const now = new Date();
    const lastReset = user.lastUsageReset || new Date(0);
    const isNewDay = now.toDateString() !== lastReset.toDateString();
    
    if (isNewDay) {
      await this.resetDailyUsage(userId);
      const currentCount = 1;
      const allowed = user.plan === 'free' ? currentCount <= 100 : true;
      
      await db
        .update(users)
        .set({ dailyUsageCount: currentCount })
        .where(eq(users.id, userId));
      
      return { allowed, count: currentCount };
    }

    // Check usage limits
    const currentCount = (user.dailyUsageCount || 0) + 1;
    const allowed = user.plan === 'free' ? currentCount <= 100 : true;
    
    if (allowed) {
      await db
        .update(users)
        .set({ dailyUsageCount: currentCount })
        .where(eq(users.id, userId));
    }
    
    return { allowed, count: currentCount };
  }

  async resetDailyUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        dailyUsageCount: 0,
        lastUsageReset: new Date()
      })
      .where(eq(users.id, userId));
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

  async getToolUsage(userId: string, toolId: string): Promise<ToolUsage | undefined> {
    const [usage] = await db
      .select()
      .from(toolUsage)
      .where(and(eq(toolUsage.userId, userId), eq(toolUsage.toolId, toolId)));
    return usage || undefined;
  }

  async getUserToolUsage(userId: string): Promise<ToolUsage[]> {
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

  async getSavedData(userId: string, toolId?: string): Promise<SavedData[]> {
    let query = db
      .select()
      .from(savedData)
      .where(eq(savedData.userId, userId));
    
    if (toolId) {
      query = query.where(eq(savedData.toolId, toolId));
    }
    
    return await query.orderBy(desc(savedData.createdAt));
  }
  
  async getLatestSavedData(userId: string, toolId: string): Promise<SavedData | undefined> {
    const [data] = await db
      .select()
      .from(savedData)
      .where(and(eq(savedData.userId, userId), eq(savedData.toolId, toolId)))
      .orderBy(desc(savedData.createdAt))
      .limit(1);
    return data || undefined;
  }

  async getUserSavedData(userId: string): Promise<SavedData[]> {
    return this.getSavedData(userId);
  }

  async deleteSavedData(id: number, userId: string): Promise<boolean> {
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

  async getApiHistory(userId: string, limit: number = 50): Promise<ApiHistory[]> {
    return await db
      .select()
      .from(apiHistory)
      .where(eq(apiHistory.userId, userId))
      .orderBy(desc(apiHistory.createdAt))
      .limit(limit);
  }

  async deleteApiHistory(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(apiHistory)
      .where(and(eq(apiHistory.id, id), eq(apiHistory.userId, userId)));
    return result.rowCount > 0;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, toolId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.toolId, toolId)));
    return result.rowCount > 0;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }
}

export const storage = new DatabaseStorage();
