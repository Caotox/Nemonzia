import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChampionEvaluationSchema, partialChampionEvaluationSchema, insertDraftSchema, insertScrimSchema, insertPlayerSchema, insertPlayerAvailabilitySchema, insertChampionSynergySchema, insertPatchNoteSchema } from "@shared/schema";

interface DataDragonChampion {
  id: string;
  key: string;
  name: string;
  image: {
    full: string;
  };
}

interface DataDragonResponse {
  data: Record<string, DataDragonChampion>;
}

async function seedChampions() {
  try {
    const existingChampions = await storage.getChampions();
    if (existingChampions.length > 0) {
      console.log(`Database already has ${existingChampions.length} champions, skipping seed.`);
      return;
    }

    console.log("Fetching champions from Data Dragon...");
    const versionsResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = await versionsResponse.json() as string[];
    const latestVersion = versions[0];
    console.log(`Latest version: ${latestVersion}`);

    const championsResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
    );
    const championsData = await championsResponse.json() as DataDragonResponse;
    
    const championsList = Object.values(championsData.data);
    console.log(`Found ${championsList.length} champions. Seeding database...`);

    for (const champion of championsList) {
      const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`;
      await storage.createChampion({
        id: champion.id,
        name: champion.name,
        imageUrl,
        key: champion.key,
      });
    }

    console.log(`Successfully seeded ${championsList.length} champions!`);
  } catch (error) {
    console.error("Error seeding champions:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/champions", async (_req, res) => {
    try {
      const champions = await storage.getChampions();
      res.json(champions);
    } catch (error) {
      console.error("Error fetching champions:", error);
      res.status(500).json({ error: "Failed to fetch champions" });
    }
  });

  app.put("/api/champions/:id/roles", async (req, res) => {
    try {
      const { roles } = req.body;
      
      if (!Array.isArray(roles)) {
        return res.status(400).json({ error: "Roles must be an array" });
      }
      
      const validRoles = ["TOP", "JGL", "MID", "ADC", "SUP"];
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      
      if (invalidRoles.length > 0) {
        return res.status(400).json({ error: "Invalid roles", invalidRoles });
      }
      
      const champion = await storage.updateChampionRoles(req.params.id, roles);
      res.json(champion);
    } catch (error: any) {
      console.error("Error updating champion roles:", error);
      res.status(500).json({ error: "Failed to update champion roles" });
    }
  });

  app.post("/api/champions/evaluate", async (req, res) => {
    try {
      const validatedInput = partialChampionEvaluationSchema.parse(req.body);
      
      const existingEvaluation = await storage.getChampionEvaluation(validatedInput.championId);
      const evaluationData = {
        championId: validatedInput.championId,
        prioLane: validatedInput.prioLane ?? existingEvaluation?.prioLane ?? 0,
        strongside: validatedInput.strongside ?? existingEvaluation?.strongside ?? 0,
        weakside: validatedInput.weakside ?? existingEvaluation?.weakside ?? 0,
        engage: validatedInput.engage ?? existingEvaluation?.engage ?? 0,
        peeling: validatedInput.peeling ?? existingEvaluation?.peeling ?? 0,
        split: validatedInput.split ?? existingEvaluation?.split ?? 0,
        hypercarry: validatedInput.hypercarry ?? existingEvaluation?.hypercarry ?? 0,
        controle: validatedInput.controle ?? existingEvaluation?.controle ?? 0,
      };

      const evaluation = await storage.upsertChampionEvaluation(evaluationData);
      res.json(evaluation);
    } catch (error: any) {
      console.error("Error updating evaluation:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid evaluation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update evaluation" });
    }
  });

  app.get("/api/drafts", async (_req, res) => {
    try {
      const drafts = await storage.getDrafts();
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      res.status(500).json({ error: "Failed to fetch drafts" });
    }
  });

  app.post("/api/drafts", async (req, res) => {
    try {
      const draftData = insertDraftSchema.parse(req.body);
      
      if (!draftData.name || draftData.name.trim().length === 0) {
        return res.status(400).json({ error: "Draft name is required" });
      }
      
      const draft = await storage.createDraft(draftData);
      res.json(draft);
    } catch (error: any) {
      console.error("Error creating draft:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid draft data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create draft" });
    }
  });

  app.put("/api/drafts/:id", async (req, res) => {
    try {
      const draftData = insertDraftSchema.partial().parse(req.body);
      
      if (draftData.name !== undefined && draftData.name.trim().length === 0) {
        return res.status(400).json({ error: "Draft name cannot be empty" });
      }
      
      const draft = await storage.updateDraft(req.params.id, draftData);
      res.json(draft);
    } catch (error: any) {
      console.error("Error updating draft:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid draft data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update draft" });
    }
  });

  app.delete("/api/drafts/:id", async (req, res) => {
    try {
      await storage.deleteDraft(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting draft:", error);
      res.status(500).json({ error: "Failed to delete draft" });
    }
  });

  app.get("/api/scrims", async (_req, res) => {
    try {
      const scrims = await storage.getScrims();
      res.json(scrims);
    } catch (error) {
      console.error("Error fetching scrims:", error);
      res.status(500).json({ error: "Failed to fetch scrims" });
    }
  });

  app.post("/api/scrims", async (req, res) => {
    try {
      const scrimData = insertScrimSchema.parse(req.body);
      
      if (!scrimData.opponent || scrimData.opponent.trim().length === 0) {
        return res.status(400).json({ error: "Opponent name is required" });
      }
      
      if (!scrimData.score || scrimData.score.trim().length === 0) {
        return res.status(400).json({ error: "Score is required" });
      }
      
      const scrim = await storage.createScrim(scrimData);
      res.json(scrim);
    } catch (error: any) {
      console.error("Error creating scrim:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid scrim data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create scrim" });
    }
  });

  app.put("/api/scrims/:id", async (req, res) => {
    try {
      const scrimData = insertScrimSchema.partial().parse(req.body);
      
      if (scrimData.opponent !== undefined && scrimData.opponent.trim().length === 0) {
        return res.status(400).json({ error: "Opponent name cannot be empty" });
      }
      
      if (scrimData.score !== undefined && scrimData.score.trim().length === 0) {
        return res.status(400).json({ error: "Score cannot be empty" });
      }
      
      const scrim = await storage.updateScrim(req.params.id, scrimData);
      res.json(scrim);
    } catch (error: any) {
      console.error("Error updating scrim:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid scrim data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update scrim" });
    }
  });

  app.put("/api/scrims/:id", async (req, res) => {
    try {
      const scrimData = {
        ...req.body,
        id: req.params.id,
      };
      const updatedScrim = await storage.updateScrim(req.params.id, scrimData);
      res.json(updatedScrim);
    } catch (error) {
      console.error("Error updating scrim:", error);
      res.status(500).json({ error: "Failed to update scrim" });
    }
  });

  app.delete("/api/scrims/:id", async (req, res) => {
    try {
      await storage.deleteScrim(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting scrim:", error);
      res.status(500).json({ error: "Failed to delete scrim" });
    }
  });

  app.get("/api/scrims/statistics", async (_req, res) => {
    try {
      const scrims = await storage.getScrims();
      const drafts = await storage.getDrafts();
      
      const totalScrims = scrims.length;
      const wins = scrims.filter(s => s.isWin === true).length;
      const losses = scrims.filter(s => s.isWin === false).length;
      const winrate = totalScrims > 0 ? Math.round((wins / totalScrims) * 100) : 0;
      
      // Statistiques des drafts utilisés en scrim
      const draftUsage: Record<string, { wins: number; losses: number; total: number }> = {};
      scrims.forEach(scrim => {
        if (scrim.drafts && Array.isArray(scrim.drafts)) {
          scrim.drafts.forEach((gameDraft: any) => {
            if (gameDraft.draftId) {
              if (!draftUsage[gameDraft.draftId]) {
                draftUsage[gameDraft.draftId] = { wins: 0, losses: 0, total: 0 };
              }
              draftUsage[gameDraft.draftId].total++;
              if (scrim.isWin) {
                draftUsage[gameDraft.draftId].wins++;
              } else {
                draftUsage[gameDraft.draftId].losses++;
              }
            }
          });
        }
      });
      
      const draftPerformance = Object.entries(draftUsage)
        .map(([draftId, stats]) => ({
          draftId,
          ...stats,
          winrate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);
      
      const championUsage: Record<string, number> = {};
      drafts.forEach(draft => {
        [draft.teamTopChampionId, draft.teamJglChampionId, draft.teamMidChampionId, 
         draft.teamAdcChampionId, draft.teamSupChampionId].forEach(championId => {
          if (championId) {
            championUsage[championId] = (championUsage[championId] || 0) + 1;
          }
        });
      });
      
      const topChampions = Object.entries(championUsage)
        .map(([championId, count]) => ({ championId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const scrimsByDate = scrims.reduce((acc, scrim) => {
        const dateKey = new Date(scrim.date).toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = { victories: 0, defeats: 0 };
        }
        if (scrim.isWin) {
          acc[dateKey].victories++;
        } else {
          acc[dateKey].defeats++;
        }
        return acc;
      }, {} as Record<string, { victories: number; defeats: number }>);
      
      const performanceOverTime = Object.entries(scrimsByDate)
        .map(([date, stats]) => ({
          date,
          ...stats,
          total: stats.victories + stats.defeats,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      res.json({
        totalScrims,
        wins,
        losses,
        winrate,
        draftPerformance,
        topChampions,
        performanceOverTime,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get("/api/players", async (_req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      
      if (!playerData.name || playerData.name.trim().length === 0) {
        return res.status(400).json({ error: "Player name is required" });
      }
      
      if (!playerData.role || playerData.role.trim().length === 0) {
        return res.status(400).json({ error: "Player role is required" });
      }
      
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error: any) {
      console.error("Error creating player:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid player data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create player" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      await storage.deletePlayer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  app.get("/api/availability", async (_req, res) => {
    try {
      const availability = await storage.getAvailability();
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  app.post("/api/availability", async (req, res) => {
    try {
      const availabilityData = insertPlayerAvailabilitySchema.parse(req.body);
      
      if (!availabilityData.playerId || typeof availabilityData.playerId !== 'string') {
        return res.status(400).json({ error: "playerId is required" });
      }
      
      if (typeof availabilityData.dayOfWeek !== 'number' || availabilityData.dayOfWeek < 0 || availabilityData.dayOfWeek > 6) {
        return res.status(400).json({ error: "dayOfWeek must be between 0 and 6" });
      }
      
      const availability = await storage.upsertAvailability(availabilityData);
      res.json(availability);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid availability data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update availability" });
    }
  });

  app.get("/api/synergies", async (_req, res) => {
    try {
      const synergies = await storage.getSynergies();
      res.json(synergies);
    } catch (error) {
      console.error("Error fetching synergies:", error);
      res.status(500).json({ error: "Failed to fetch synergies" });
    }
  });

  app.post("/api/synergies", async (req, res) => {
    try {
      const synergyData = insertChampionSynergySchema.parse(req.body);
      
      if (!synergyData.champion1Id || synergyData.champion1Id.trim().length === 0) {
        return res.status(400).json({ error: "Champion 1 ID is required" });
      }
      
      if (!synergyData.champion2Id || synergyData.champion2Id.trim().length === 0) {
        return res.status(400).json({ error: "Champion 2 ID is required" });
      }
      
      const synergy = await storage.createSynergy(synergyData);
      res.json(synergy);
    } catch (error: any) {
      console.error("Error creating synergy:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid synergy data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create synergy" });
    }
  });

  app.delete("/api/synergies/:id", async (req, res) => {
    try {
      await storage.deleteSynergy(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting synergy:", error);
      res.status(500).json({ error: "Failed to delete synergy" });
    }
  });

  app.get("/api/patchnotes", async (_req, res) => {
    try {
      const patchNotes = await storage.getPatchNotes();
      res.json(patchNotes);
    } catch (error) {
      console.error("Error fetching patch notes:", error);
      res.status(500).json({ error: "Failed to fetch patch notes" });
    }
  });

  app.post("/api/patchnotes", async (req, res) => {
    try {
      const patchNoteData = insertPatchNoteSchema.parse(req.body);
      
      if (!patchNoteData.version || patchNoteData.version.trim().length === 0) {
        return res.status(400).json({ error: "Version is required" });
      }
      
      if (!patchNoteData.title || patchNoteData.title.trim().length === 0) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const patchNote = await storage.createPatchNote(patchNoteData);
      res.json(patchNote);
    } catch (error: any) {
      console.error("Error creating patch note:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid patch note data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create patch note" });
    }
  });

  app.delete("/api/patchnotes/:id", async (req, res) => {
    try {
      await storage.deletePatchNote(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting patch note:", error);
      res.status(500).json({ error: "Failed to delete patch note" });
    }
  });

  const httpServer = createServer(app);

  seedChampions().catch(console.error);

  return httpServer;
}
