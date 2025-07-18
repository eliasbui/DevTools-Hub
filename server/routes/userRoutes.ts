import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { db } from '../db';
import { toolUsage } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

const router = Router();

// Get usage statistics
router.get('/api/user/usage-stats', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's usage count
    const todayUsage = await db
      .select({ count: sql<number>`count(*)` })
      .from(toolUsage)
      .where(
        and(
          eq(toolUsage.userId, userId),
          gte(toolUsage.createdAt, today)
        )
      );
    
    // Get total usage
    const totalUsageResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(toolUsage)
      .where(eq(toolUsage.userId, userId));
    
    // Get favorite tools
    const favoriteTools = await db
      .select({
        toolId: toolUsage.toolId,
        usageCount: sql<number>`count(*) as usage_count`
      })
      .from(toolUsage)
      .where(eq(toolUsage.userId, userId))
      .groupBy(toolUsage.toolId)
      .orderBy(desc(sql`usage_count`))
      .limit(10);
    
    res.json({
      toolsUsedToday: todayUsage[0]?.count || 0,
      dailyLimit: 100, // Free tier limit
      totalUsage: totalUsageResult[0]?.count || 0,
      favoriteTools: favoriteTools.map(tool => ({
        toolId: tool.toolId,
        usageCount: tool.usageCount
      }))
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ message: 'Failed to fetch usage statistics' });
  }
});

// Update user profile
router.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { firstName, lastName } = req.body;
    
    const updatedUser = await storage.updateUser(userId, {
      firstName,
      lastName
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Export user data
router.get('/api/user/export', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get user data
    const user = await storage.getUser(userId);
    
    // Get usage data
    const usageData = await db
      .select()
      .from(toolUsage)
      .where(eq(toolUsage.userId, userId));
    
    // Get saved data
    const savedData = await storage.getUserSavedData(userId);
    
    res.json({
      user,
      usage: usageData,
      savedData
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ message: 'Failed to export user data' });
  }
});

// Delete account
router.delete('/api/user/delete', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Delete all user data
    await storage.deleteUser(userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// Get API keys (placeholder for Pro users)
router.get('/api/user/api-keys', isAuthenticated, async (req: any, res) => {
  try {
    // For now, return empty array as API keys are for Pro users
    res.json([]);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: 'Failed to fetch API keys' });
  }
});

export default router;