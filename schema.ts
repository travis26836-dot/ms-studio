
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  company: varchar("company", { length: 255 }),
  website: varchar("website", { length: 512 }),
  plan: mysqlEnum("plan", ["free", "pro", "business"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  storageUsed: int("storageUsed").default(0),
  storageLimit: int("storageLimit").default(524288000), // 500MB default
  preferences: json("preferences"), // UI preferences, theme, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Stripe subscriptions */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  plan: mysqlEnum("plan", ["free", "pro", "business"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete", "incomplete_expired", "paused", "unpaid"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  canceledAt: timestamp("canceledAt"),
  trialStart: timestamp("trialStart"),
  trialEnd: timestamp("trialEnd"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/** Payment history */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: mysqlEnum("status", ["succeeded", "pending", "failed", "refunded"]).default("pending").notNull(),
  description: text("description"),
  receiptUrl: text("receiptUrl"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/** Design projects (canvases) */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  canvasWidth: int("canvasWidth").notNull().default(1080),
  canvasHeight: int("canvasHeight").notNull().default(1080),
  canvasData: json("canvasData"),
  thumbnailUrl: text("thumbnailUrl"),
  category: varchar("category", { length: 64 }).default("custom"),
  isTemplate: boolean("isTemplate").default(false),
  isPublic: boolean("isPublic").default(false),
  isStarred: boolean("isStarred").default(false),
  folderId: int("folderId"),
  tags: json("tags"),
  exportCount: int("exportCount").default(0),
  lastExportedAt: timestamp("lastExportedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/** Project folders for organization */
export const projectFolders = mysqlTable("projectFolders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  parentId: int("parentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectFolder = typeof projectFolders.$inferSelect;
export type InsertProjectFolder = typeof projectFolders.$inferInsert;

/** Pre-built templates */
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(),
  subcategory: varchar("subcategory", { length: 64 }),
  canvasWidth: int("canvasWidth").notNull().default(1080),
  canvasHeight: int("canvasHeight").notNull().default(1080),
  canvasData: json("canvasData").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  tags: json("tags"),
  isPremium: boolean("isPremium").default(false),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/** Royalty-free asset library */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["photo", "icon", "shape", "element", "background", "pattern", "illustration", "texture", "frame", "sticker"]).notNull(),
  category: varchar("category", { length: 64 }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  fileKey: varchar("fileKey", { length: 512 }),
  width: int("width"),
  height: int("height"),
  tags: json("tags"),
  source: varchar("source", { length: 64 }).default("internal"),
  license: varchar("license", { length: 64 }).default("royalty-free"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/** User-uploaded files */
export const userUploads = mysqlTable("userUploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  size: int("size"),
  width: int("width"),
  height: int("height"),
  folderId: int("folderId"),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserUpload = typeof userUploads.$inferSelect;
export type InsertUserUpload = typeof userUploads.$inferInsert;

/** Brand kits - expanded with gradients, voice, patterns */
export const brandKits = mysqlTable("brandKits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  colors: json("colors"),     // BrandColor[]
  fonts: json("fonts"),       // BrandFont[]
  logos: json("logos"),        // BrandLogo[]
  gradients: json("gradients"), // BrandGradient[]
  voice: json("voice"),       // BrandVoice
  patterns: json("patterns"), // string[] (URLs)
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandKitRow = typeof brandKits.$inferSelect;
export type InsertBrandKit = typeof brandKits.$inferInsert;

/** AI generation history */
export const aiGenerations = mysqlTable("aiGenerations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  generationType: mysqlEnum("generationType", [
    "background", "element", "enhancement", "text", "layout",
    "color-palette", "font-pairing", "copy", "social-caption",
    "pattern", "style-transfer", "design-critique", "mockup",
  ]).notNull(),
  prompt: text("prompt").notNull(),
  resultUrl: text("resultUrl"),
  resultData: json("resultData"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiGeneration = typeof aiGenerations.$inferSelect;
export type InsertAiGeneration = typeof aiGenerations.$inferInsert;

/** Social media connections */
export const socialConnections = mysqlTable("socialConnections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "tiktok", "twitter", "linkedin", "pinterest", "youtube"]).notNull(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenExpiry: timestamp("tokenExpiry"),
  profileImageUrl: text("profileImageUrl"),
  permissions: json("permissions"),
  pageId: varchar("pageId", { length: 255 }), // For Facebook Pages
  pageName: varchar("pageName", { length: 255 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialConnectionRow = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = typeof socialConnections.$inferInsert;

/** Social media publish history */
export const publishHistory = mysqlTable("publishHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "tiktok", "twitter", "linkedin", "pinterest", "youtube"]).notNull(),
  connectionId: int("connectionId"),
  postId: varchar("postId", { length: 255 }),
  postUrl: text("postUrl"),
  caption: text("caption"),
  hashtags: json("hashtags"),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["published", "scheduled", "failed", "draft"]).default("draft"),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  error: text("error"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PublishHistoryRow = typeof publishHistory.$inferSelect;
export type InsertPublishHistory = typeof publishHistory.$inferInsert;

/** User activity log for dashboard */
export const userActivity = mysqlTable("userActivity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "project_created", "project_edited", "project_exported",
    "project_published", "template_used", "ai_generated",
    "upload", "brand_kit_updated", "social_connected",
    "social_published", "folder_created", "profile_updated",
  ]).notNull(),
  description: text("description").notNull(),
  projectId: int("projectId"),
  projectName: varchar("projectName", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserActivityRow = typeof userActivity.$inferSelect;
export type InsertUserActivity = typeof userActivity.$inferInsert;

/** AI chat sessions for persistent conversation history */
export const aiChatSessions = mysqlTable("aiChatSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).default("New Chat"),
  messages: json("messages").notNull(), // Array of {role, content, timestamp}
  projectId: int("projectId"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAiChatSession = typeof aiChatSessions.$inferInsert;
