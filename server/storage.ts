import {
  champions,
  championEvaluations,
  drafts,
  draftVariants,
  scrims,
  players,
  playerAvailability,
  championSynergies,
  patchNotes,
  type Champion,
  type InsertChampion,
  type ChampionEvaluation,
  type InsertChampionEvaluation,
  type Draft,
  type InsertDraft,
  type DraftVariant,
  type InsertDraftVariant,
  type Scrim,
  type InsertScrim,
  type Player,
  type InsertPlayer,
  type PlayerAvailability,
  type InsertPlayerAvailability,
  type ChampionSynergy,
  type InsertChampionSynergy,
  type PatchNote,
  type InsertPatchNote,
  type DraftWithDetails,
  type ChampionWithEvaluation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";

export interface IStorage {
  getChampions(): Promise<ChampionWithEvaluation[]>;
  createChampion(champion: InsertChampion): Promise<Champion>;
  updateChampionRole(championId: string, role: string): Promise<Champion>;
  getChampionEvaluation(championId: string): Promise<ChampionEvaluation | undefined>;
  upsertChampionEvaluation(evaluation: InsertChampionEvaluation): Promise<ChampionEvaluation>;
  
  getDrafts(): Promise<DraftWithDetails[]>;
  createDraft(draft: InsertDraft): Promise<Draft>;
  updateDraft(id: string, draft: Partial<InsertDraft>): Promise<Draft>;
  deleteDraft(id: string): Promise<void>;
  
  getScrims(): Promise<Scrim[]>;
  createScrim(scrim: InsertScrim): Promise<Scrim>;
  updateScrim(id: string, scrim: Partial<InsertScrim>): Promise<Scrim>;
  deleteScrim(id: string): Promise<void>;
  
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  deletePlayer(id: string): Promise<void>;
  
  getAvailability(): Promise<PlayerAvailability[]>;
  upsertAvailability(availability: InsertPlayerAvailability): Promise<PlayerAvailability>;
  
  getSynergies(): Promise<ChampionSynergy[]>;
  createSynergy(synergy: InsertChampionSynergy): Promise<ChampionSynergy>;
  deleteSynergy(id: string): Promise<void>;
  
  getPatchNotes(): Promise<PatchNote[]>;
  createPatchNote(patchNote: InsertPatchNote): Promise<PatchNote>;
  deletePatchNote(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getChampions(): Promise<ChampionWithEvaluation[]> {
    const allChampions = await db.select().from(champions);
    const allEvaluations = await db.select().from(championEvaluations);
    
    return allChampions.map((champion) => ({
      ...champion,
      evaluation: allEvaluations.find((e) => e.championId === champion.id),
    }));
  }

  async createChampion(champion: InsertChampion): Promise<Champion> {
    const [newChampion] = await db
      .insert(champions)
      .values(champion)
      .returning();
    return newChampion;
  }

  async updateChampionRole(championId: string, role: string): Promise<Champion> {
    const [updatedChampion] = await db
      .update(champions)
      .set({ role })
      .where(eq(champions.id, championId))
      .returning();
    return updatedChampion;
  }

  async getChampionEvaluation(championId: string): Promise<ChampionEvaluation | undefined> {
    const [evaluation] = await db
      .select()
      .from(championEvaluations)
      .where(eq(championEvaluations.championId, championId));
    return evaluation;
  }

  async upsertChampionEvaluation(evaluation: InsertChampionEvaluation): Promise<ChampionEvaluation> {
    const existing = await this.getChampionEvaluation(evaluation.championId);
    
    if (existing) {
      const fieldsToUpdate = Object.fromEntries(
        Object.entries(evaluation).filter(([_, value]) => value !== undefined)
      ) as Partial<InsertChampionEvaluation>;
      
      const [updated] = await db
        .update(championEvaluations)
        .set(fieldsToUpdate)
        .where(eq(championEvaluations.championId, evaluation.championId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(championEvaluations)
        .values(evaluation)
        .returning();
      return created;
    }
  }

  async getDrafts(): Promise<DraftWithDetails[]> {
    const allDrafts = await db.select().from(drafts);
    const allVariants = await db.select().from(draftVariants);
    const allChampions = await db.select().from(champions);
    
    return allDrafts.map((draft) => ({
      ...draft,
      variants: allVariants.filter((v) => v.draftId === draft.id),
      teamTopChampion: draft.teamTopChampionId ? allChampions.find((c) => c.id === draft.teamTopChampionId) : undefined,
      teamJglChampion: draft.teamJglChampionId ? allChampions.find((c) => c.id === draft.teamJglChampionId) : undefined,
      teamMidChampion: draft.teamMidChampionId ? allChampions.find((c) => c.id === draft.teamMidChampionId) : undefined,
      teamAdcChampion: draft.teamAdcChampionId ? allChampions.find((c) => c.id === draft.teamAdcChampionId) : undefined,
      teamSupChampion: draft.teamSupChampionId ? allChampions.find((c) => c.id === draft.teamSupChampionId) : undefined,
      enemyTopChampion: draft.enemyTopChampionId ? allChampions.find((c) => c.id === draft.enemyTopChampionId) : undefined,
      enemyJglChampion: draft.enemyJglChampionId ? allChampions.find((c) => c.id === draft.enemyJglChampionId) : undefined,
      enemyMidChampion: draft.enemyMidChampionId ? allChampions.find((c) => c.id === draft.enemyMidChampionId) : undefined,
      enemyAdcChampion: draft.enemyAdcChampionId ? allChampions.find((c) => c.id === draft.enemyAdcChampionId) : undefined,
      enemySupChampion: draft.enemySupChampionId ? allChampions.find((c) => c.id === draft.enemySupChampionId) : undefined,
    }));
  }

  async createDraft(draft: InsertDraft): Promise<Draft> {
    const [newDraft] = await db.insert(drafts).values(draft).returning();
    return newDraft;
  }

  async updateDraft(id: string, draft: Partial<InsertDraft>): Promise<Draft> {
    const [updatedDraft] = await db
      .update(drafts)
      .set(draft)
      .where(eq(drafts.id, id))
      .returning();
    return updatedDraft;
  }

  async deleteDraft(id: string): Promise<void> {
    await db.delete(drafts).where(eq(drafts.id, id));
  }

  async getScrims(): Promise<Scrim[]> {
    return await db.select().from(scrims).orderBy(scrims.date);
  }

  async createScrim(scrim: InsertScrim): Promise<Scrim> {
    const [newScrim] = await db.insert(scrims).values(scrim).returning();
    return newScrim;
  }

  async updateScrim(id: string, scrim: Partial<InsertScrim>): Promise<Scrim> {
    const [updatedScrim] = await db
      .update(scrims)
      .set(scrim)
      .where(eq(scrims.id, id))
      .returning();
    return updatedScrim;
  }

  async deleteScrim(id: string): Promise<void> {
    await db.delete(scrims).where(eq(scrims.id, id));
  }

  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async deletePlayer(id: string): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async getAvailability(): Promise<PlayerAvailability[]> {
    return await db.select().from(playerAvailability);
  }

  async upsertAvailability(availability: InsertPlayerAvailability): Promise<PlayerAvailability> {
    const [existing] = await db
      .select()
      .from(playerAvailability)
      .where(
        and(
          eq(playerAvailability.playerId, availability.playerId),
          eq(playerAvailability.dayOfWeek, availability.dayOfWeek)
        )
      );
    
    if (existing) {
      const [updated] = await db
        .update(playerAvailability)
        .set({ isAvailable: availability.isAvailable })
        .where(eq(playerAvailability.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(playerAvailability)
        .values(availability)
        .returning();
      return created;
    }
  }

  async getSynergies(): Promise<ChampionSynergy[]> {
    return await db.select().from(championSynergies);
  }

  async createSynergy(synergy: InsertChampionSynergy): Promise<ChampionSynergy> {
    const [newSynergy] = await db.insert(championSynergies).values(synergy).returning();
    return newSynergy;
  }

  async deleteSynergy(id: string): Promise<void> {
    await db.delete(championSynergies).where(eq(championSynergies.id, id));
  }

  async getPatchNotes(): Promise<PatchNote[]> {
    return await db.select().from(patchNotes).orderBy(desc(patchNotes.createdAt));
  }

  async createPatchNote(patchNote: InsertPatchNote): Promise<PatchNote> {
    const [newPatchNote] = await db.insert(patchNotes).values(patchNote).returning();
    return newPatchNote;
  }

  async deletePatchNote(id: string): Promise<void> {
    await db.delete(patchNotes).where(eq(patchNotes.id, id));
  }
}

export const storage = new DatabaseStorage();
