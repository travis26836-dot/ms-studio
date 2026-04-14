import { eq, desc, and, like, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  projects, InsertProject,
  templates, InsertTemplate,
  assets, InsertAsset,
  userUploads, InsertUserUpload,
  brandKits, InsertBrandKit,
  aiGenerations, InsertAiGeneration,
  socialConnections, InsertSocialConnection,
  publishHistory, InsertPublishHistory,
  userActivity, InsertUserActivity,
  projectFolders, InsertProjectFolder,
  aiChatSessions, InsertAiChatSession,
  subscriptions, InsertSubscription,
  payments, InsertPayment,
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

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalProjects: 0, totalExports: 0, totalPublished: 0, aiGenerations: 0, storageUsed: 0 };
  
  const [projectCount] = await db.select({ count: count() }).from(projects).where(eq(projects.userId, userId));
  const [uploadCount] = await db.select({ count: count() }).from(userUploads).where(eq(userUploads.userId, userId));
  const [aiCount] = await db.select({ count: count() }).from(aiGenerations).where(eq(aiGenerations.userId, userId));
  const [publishCount] = await db.select({ count: count() }).from(publishHistory).where(and(eq(publishHistory.userId, userId), eq(publishHistory.status, "published")));
  
  return {
    totalProjects: projectCount?.count || 0,
    totalUploads: uploadCount?.count || 0,
    totalPublished: publishCount?.count || 0,
    aiGenerations: aiCount?.count || 0,
    totalExports: 0,
    storageUsed: 0,
  };
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

export async function getStarredProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(and(eq(projects.userId, userId), eq(projects.isStarred, true))).orderBy(desc(projects.updatedAt));
}

export async function toggleProjectStar(id: number, isStarred: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ isStarred }).where(eq(projects.id, id));
}

export async function getProjectsByFolder(userId: number, folderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(and(eq(projects.userId, userId), eq(projects.folderId, folderId))).orderBy(desc(projects.updatedAt));
}

export async function moveProjectToFolder(projectId: number, folderId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ folderId }).where(eq(projects.id, projectId));
}

// ─── Project Folder Queries ─────────────────────────────────

export async function getUserFolders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectFolders).where(eq(projectFolders.userId, userId)).orderBy(desc(projectFolders.createdAt));
}

export async function createFolder(data: InsertProjectFolder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectFolders).values(data);
  return { id: result[0].insertId };
}

export async function updateFolder(id: number, data: Partial<InsertProjectFolder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projectFolders).set(data).where(eq(projectFolders.id, id));
}

export async function deleteFolder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Move projects out of folder first
  await db.update(projects).set({ folderId: null }).where(eq(projects.folderId, id));
  await db.delete(projectFolders).where(eq(projectFolders.id, id));
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

export async function searchTemplates(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).where(like(templates.name, `%${query}%`)).orderBy(desc(templates.usageCount)).limit(50);
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

export async function deleteUserUpload(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userUploads).where(eq(userUploads.id, id));
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

export async function getDefaultBrandKit(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brandKits).where(and(eq(brandKits.userId, userId), eq(brandKits.isDefault, true))).limit(1);
  return result[0];
}

export async function setDefaultBrandKit(userId: number, kitId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Unset all defaults first
  await db.update(brandKits).set({ isDefault: false }).where(eq(brandKits.userId, userId));
  // Set the new default
  await db.update(brandKits).set({ isDefault: true }).where(eq(brandKits.id, kitId));
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
  return db.select().from(aiGenerations).where(eq(aiGenerations.userId, userId)).orderBy(desc(aiGenerations.createdAt)).limit(50);
}

// ─── Social Connection Queries ───────────────────────────────

export async function getUserSocialConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(socialConnections).where(eq(socialConnections.userId, userId)).orderBy(desc(socialConnections.createdAt));
}

export async function getSocialConnection(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(socialConnections).where(eq(socialConnections.id, id)).limit(1);
  return result[0];
}

export async function getSocialConnectionByPlatform(userId: number, platform: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(socialConnections)
    .where(and(eq(socialConnections.userId, userId), eq(socialConnections.platform, platform as any), eq(socialConnections.isActive, true)))
    .limit(1);
  return result[0];
}

export async function createSocialConnection(data: InsertSocialConnection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialConnections).values(data);
  return { id: result[0].insertId };
}

export async function updateSocialConnection(id: number, data: Partial<InsertSocialConnection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialConnections).set(data).where(eq(socialConnections.id, id));
}

export async function deleteSocialConnection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(socialConnections).where(eq(socialConnections.id, id));
}

// ─── Publish History Queries ─────────────────────────────────

export async function getUserPublishHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishHistory).where(eq(publishHistory.userId, userId)).orderBy(desc(publishHistory.createdAt)).limit(50);
}

export async function getProjectPublishHistory(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishHistory).where(eq(publishHistory.projectId, projectId)).orderBy(desc(publishHistory.createdAt));
}

export async function createPublishRecord(data: InsertPublishHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(publishHistory).values(data);
  return { id: result[0].insertId };
}

export async function updatePublishRecord(id: number, data: Partial<InsertPublishHistory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(publishHistory).set(data).where(eq(publishHistory.id, id));
}

// ─── User Activity Queries ───────────────────────────────────

export async function getUserActivityLog(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userActivity).where(eq(userActivity.userId, userId)).orderBy(desc(userActivity.createdAt)).limit(limit);
}

export async function logActivity(data: InsertUserActivity) {
  const db = await getDb();
  if (!db) return; // Non-critical, don't throw
  try {
    await db.insert(userActivity).values(data);
  } catch (error) {
    console.warn("[Activity] Failed to log:", error);
  }
}

// ─── AI Chat Session Queries ─────────────────────────────────

export async function getUserChatSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiChatSessions).where(eq(aiChatSessions.userId, userId)).orderBy(desc(aiChatSessions.updatedAt)).limit(20);
}

export async function getChatSession(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiChatSessions).where(eq(aiChatSessions.id, id)).limit(1);
  return result[0];
}

export async function createChatSession(data: InsertAiChatSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiChatSessions).values(data);
  return { id: result[0].insertId };
}

export async function updateChatSession(id: number, data: Partial<InsertAiChatSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiChatSessions).set(data).where(eq(aiChatSessions.id, id));
}

export async function deleteChatSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(aiChatSessions).where(eq(aiChatSessions.id, id));
}

// ─── Subscription Queries ───────────────────────────────────

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  return result[0];
}

export async function getSubscriptionByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0];
}

export async function getSubscriptionByStripeSubId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0];
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(data);
  return { id: result[0].insertId };
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function upsertSubscriptionByStripeCustomer(
  stripeCustomerId: string,
  data: Partial<InsertSubscription>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSubscriptionByStripeCustomerId(stripeCustomerId);
  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(subscriptions).values({
      ...data,
      stripeCustomerId,
      userId: data.userId || 0,
    } as InsertSubscription);
    return result[0].insertId;
  }
}

export async function updateUserPlan(userId: number, plan: string, stripeCustomerId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { plan };
  if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0];
}

// ─── Payment Queries ────────────────────────────────────────

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return { id: result[0].insertId };
}

export async function getUserPayments(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function getMonthlyUsage(userId: number) {
  const db = await getDb();
  if (!db) return { exports: 0, aiGenerations: 0, aiMessages: 0, publishes: 0 };
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [aiCount] = await db.select({ count: count() }).from(aiGenerations)
    .where(and(eq(aiGenerations.userId, userId), sql`${aiGenerations.createdAt} >= ${startOfMonth}`));
  const [publishCount] = await db.select({ count: count() }).from(publishHistory)
    .where(and(eq(publishHistory.userId, userId), sql`${publishHistory.createdAt} >= ${startOfMonth}`));
  const [socialCount] = await db.select({ count: count() }).from(socialConnections)
    .where(eq(socialConnections.userId, userId));
  
  return {
    exports: 0, // TODO: track exports separately
    aiGenerations: aiCount?.count || 0,
    aiMessages: 0, // TODO: track from chat sessions
    publishes: publishCount?.count || 0,
    socialConnections: socialCount?.count || 0,
  };
}
