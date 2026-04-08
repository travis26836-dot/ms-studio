import { eq, desc, and, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  projects, InsertProject,
  templates, InsertTemplate,
  assets, InsertAsset,
  userUploads, InsertUserUpload,
  brandKits, InsertBrandKit,
  aiGenerations, InsertAiGeneration,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User Queries ────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Project Queries ─────────────────────────────────────────

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return { id: result[0].insertId };
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq(projects.id, id));
}

// ─── Template Queries ────────────────────────────────────────

export async function getTemplates(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(templates).where(eq(templates.category, category)).orderBy(desc(templates.usageCount));
  }
  return db.select().from(templates).orderBy(desc(templates.usageCount));
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result[0];
}

export async function createTemplate(data: InsertTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(templates).values(data);
  return { id: result[0].insertId };
}

// ─── Asset Queries ───────────────────────────────────────────

export async function searchAssets(type?: string, category?: string, query?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (type) conditions.push(eq(assets.type, type as any));
  if (category) conditions.push(eq(assets.category, category));
  if (query) conditions.push(like(assets.name, `%${query}%`));
  if (conditions.length > 0) {
    return db.select().from(assets).where(and(...conditions)).limit(50);
  }
  return db.select().from(assets).limit(50);
}

export async function createAsset(data: InsertAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assets).values(data);
  return { id: result[0].insertId };
}

// ─── User Uploads ────────────────────────────────────────────

export async function getUserUploads(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userUploads).where(eq(userUploads.userId, userId)).orderBy(desc(userUploads.createdAt));
}

export async function createUserUpload(data: InsertUserUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userUploads).values(data);
  return { id: result[0].insertId };
}

// ─── Brand Kit Queries ───────────────────────────────────────

export async function getUserBrandKits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brandKits).where(eq(brandKits.userId, userId)).orderBy(desc(brandKits.updatedAt));
}

export async function createBrandKit(data: InsertBrandKit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(brandKits).values(data);
  return { id: result[0].insertId };
}

export async function updateBrandKit(id: number, data: Partial<InsertBrandKit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(brandKits).set(data).where(eq(brandKits.id, id));
}

export async function deleteBrandKit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(brandKits).where(eq(brandKits.id, id));
}

// ─── AI Generation Queries ───────────────────────────────────

export async function createAiGeneration(data: InsertAiGeneration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiGenerations).values(data);
  return { id: result[0].insertId };
}

export async function updateAiGeneration(id: number, data: Partial<InsertAiGeneration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiGenerations).set(data).where(eq(aiGenerations.id, id));
}

export async function getUserAiGenerations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiGenerations).where(eq(aiGenerations.userId, userId)).orderBy(desc(aiGenerations.createdAt)).limit(20);
}
