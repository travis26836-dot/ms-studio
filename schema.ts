
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

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
  type: mysqlEnum("type", ["photo", "icon", "shape", "element", "background", "pattern"]).notNull(),
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