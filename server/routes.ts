import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertToolUsageSchema, 
  insertSavedDataSchema, 
  insertApiHistorySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tool usage tracking
  app.post("/api/tool-usage", async (req, res) => {
    try {
      const usage = insertToolUsageSchema.parse(req.body);
      const result = await storage.recordToolUsage(usage);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid tool usage data" });
    }
  });

  app.get("/api/tool-usage/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const usage = await storage.getUserToolUsage(userId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tool usage" });
    }
  });

  // Saved data management
  app.post("/api/saved-data", async (req, res) => {
    try {
      const data = insertSavedDataSchema.parse(req.body);
      const result = await storage.saveData(data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid saved data" });
    }
  });

  app.get("/api/saved-data/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const toolId = req.query.toolId as string;
      const data = await storage.getSavedData(userId, toolId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved data" });
    }
  });

  app.delete("/api/saved-data/:id/:userId", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const success = await storage.deleteSavedData(id, userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved data" });
    }
  });

  // API history
  app.post("/api/api-history", async (req, res) => {
    try {
      const history = insertApiHistorySchema.parse(req.body);
      const result = await storage.saveApiHistory(history);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid API history data" });
    }
  });

  app.get("/api/api-history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getApiHistory(userId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API history" });
    }
  });

  app.delete("/api/api-history/:id/:userId", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const success = await storage.deleteApiHistory(id, userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API history" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
