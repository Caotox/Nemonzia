import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const champions = pgTable("champions", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  key: text("key").notNull(),
});

export const championEvaluations = pgTable("champion_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  championId: varchar("champion_id").notNull().references(() => champions.id),
  prioLane: integer("prio_lane").notNull().default(0),
  strongside: integer("strongside").notNull().default(0),
  weakside: integer("weakside").notNull().default(0),
  engage: integer("engage").notNull().default(0),
  peeling: integer("peeling").notNull().default(0),
  split: integer("split").notNull().default(0),
  hypercarry: integer("hypercarry").notNull().default(0),
  controle: integer("controle").notNull().default(0),
});

export const drafts = pgTable("drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  teamTopChampionId: varchar("team_top_champion_id"),
  teamJglChampionId: varchar("team_jgl_champion_id"),
  teamMidChampionId: varchar("team_mid_champion_id"),
  teamAdcChampionId: varchar("team_adc_champion_id"),
  teamSupChampionId: varchar("team_sup_champion_id"),
  enemyTopChampionId: varchar("enemy_top_champion_id"),
  enemyJglChampionId: varchar("enemy_jgl_champion_id"),
  enemyMidChampionId: varchar("enemy_mid_champion_id"),
  enemyAdcChampionId: varchar("enemy_adc_champion_id"),
  enemySupChampionId: varchar("enemy_sup_champion_id"),
  teamBans: text("team_bans").array().notNull().default(sql`ARRAY[]::text[]`),
  enemyBans: text("enemy_bans").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const draftVariants = pgTable("draft_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  draftId: varchar("draft_id").notNull().references(() => drafts.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  topChampionId: varchar("top_champion_id"),
  jglChampionId: varchar("jgl_champion_id"),
  midChampionId: varchar("mid_champion_id"),
  adcChampionId: varchar("adc_champion_id"),
  supChampionId: varchar("sup_champion_id"),
});

export const scrims = pgTable("scrims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  opponent: text("opponent").notNull(),
  isWin: boolean("is_win").notNull(),
  score: text("score").notNull(),
  comments: text("comments").notNull().default(''),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  role: text("role").notNull(),
});

export const playerAvailability = pgTable("player_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(),
  isAvailable: boolean("is_available").notNull().default(false),
});

export const championSynergies = pgTable("champion_synergies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  champion1Id: varchar("champion1_id").notNull().references(() => champions.id),
  champion2Id: varchar("champion2_id").notNull().references(() => champions.id),
  synergyType: text("synergy_type").notNull(),
  rating: integer("rating").notNull().default(0),
  notes: text("notes").notNull().default(''),
});

export const patchNotes = pgTable("patch_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  version: text("version").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const championRelations = relations(champions, ({ many }) => ({
  evaluations: many(championEvaluations),
}));

export const championEvaluationRelations = relations(championEvaluations, ({ one }) => ({
  champion: one(champions, {
    fields: [championEvaluations.championId],
    references: [champions.id],
  }),
}));

export const draftRelations = relations(drafts, ({ many }) => ({
  variants: many(draftVariants),
}));

export const draftVariantRelations = relations(draftVariants, ({ one }) => ({
  draft: one(drafts, {
    fields: [draftVariants.draftId],
    references: [drafts.id],
  }),
}));

export const playerRelations = relations(players, ({ many }) => ({
  availability: many(playerAvailability),
}));

export const playerAvailabilityRelations = relations(playerAvailability, ({ one }) => ({
  player: one(players, {
    fields: [playerAvailability.playerId],
    references: [players.id],
  }),
}));

export const insertChampionSchema = createInsertSchema(champions).omit({ id: true });
export const insertChampionEvaluationSchema = createInsertSchema(championEvaluations).omit({ id: true });
export const partialChampionEvaluationSchema = z.object({
  championId: z.string().min(1),
  prioLane: z.number().int().min(0).max(3).optional(),
  strongside: z.number().int().min(0).max(3).optional(),
  weakside: z.number().int().min(0).max(3).optional(),
  engage: z.number().int().min(0).max(3).optional(),
  peeling: z.number().int().min(0).max(3).optional(),
  split: z.number().int().min(0).max(3).optional(),
  hypercarry: z.number().int().min(0).max(3).optional(),
  controle: z.number().int().min(0).max(3).optional(),
});
export const insertDraftSchema = createInsertSchema(drafts).omit({ id: true, createdAt: true });
export const insertDraftVariantSchema = createInsertSchema(draftVariants).omit({ id: true });
export const insertScrimSchema = createInsertSchema(scrims).omit({ id: true, date: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export const insertPlayerAvailabilitySchema = createInsertSchema(playerAvailability).omit({ id: true });
export const insertChampionSynergySchema = createInsertSchema(championSynergies).omit({ id: true });
export const insertPatchNoteSchema = createInsertSchema(patchNotes).omit({ id: true, createdAt: true });

export type Champion = typeof champions.$inferSelect;
export type InsertChampion = z.infer<typeof insertChampionSchema>;
export type ChampionEvaluation = typeof championEvaluations.$inferSelect;
export type InsertChampionEvaluation = z.infer<typeof insertChampionEvaluationSchema>;
export type Draft = typeof drafts.$inferSelect;
export type InsertDraft = z.infer<typeof insertDraftSchema>;
export type DraftVariant = typeof draftVariants.$inferSelect;
export type InsertDraftVariant = z.infer<typeof insertDraftVariantSchema>;
export type Scrim = typeof scrims.$inferSelect;
export type InsertScrim = z.infer<typeof insertScrimSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type PlayerAvailability = typeof playerAvailability.$inferSelect;
export type InsertPlayerAvailability = z.infer<typeof insertPlayerAvailabilitySchema>;
export type ChampionSynergy = typeof championSynergies.$inferSelect;
export type InsertChampionSynergy = z.infer<typeof insertChampionSynergySchema>;
export type PatchNote = typeof patchNotes.$inferSelect;
export type InsertPatchNote = z.infer<typeof insertPatchNoteSchema>;

export type DraftWithDetails = Draft & {
  variants: DraftVariant[];
  teamTopChampion?: Champion;
  teamJglChampion?: Champion;
  teamMidChampion?: Champion;
  teamAdcChampion?: Champion;
  teamSupChampion?: Champion;
  enemyTopChampion?: Champion;
  enemyJglChampion?: Champion;
  enemyMidChampion?: Champion;
  enemyAdcChampion?: Champion;
  enemySupChampion?: Champion;
};

export type ChampionWithEvaluation = Champion & {
  evaluation?: ChampionEvaluation;
};
