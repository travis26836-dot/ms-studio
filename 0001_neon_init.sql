-- MS Studio — Initial PostgreSQL schema for Neon
-- Run via: npx drizzle-kit push  OR  psql $DATABASE_URL -f 0001_neon_init.sql

-- ─── Enums ───────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE plan AS ENUM ('free', 'pro', 'business');
CREATE TYPE subscription_status AS ENUM (
  'active', 'canceled', 'past_due', 'trialing',
  'incomplete', 'incomplete_expired', 'paused', 'unpaid'
);
CREATE TYPE payment_status AS ENUM ('succeeded', 'pending', 'failed', 'refunded');
CREATE TYPE asset_type AS ENUM (
  'photo', 'icon', 'shape', 'element', 'background',
  'pattern', 'illustration', 'texture', 'frame', 'sticker'
);
CREATE TYPE ai_generation_type AS ENUM (
  'background', 'element', 'enhancement', 'text', 'layout',
  'color-palette', 'font-pairing', 'copy', 'social-caption',
  'pattern', 'style-transfer', 'design-critique', 'mockup'
);
CREATE TYPE ai_generation_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE social_platform AS ENUM (
  'facebook', 'instagram', 'tiktok', 'twitter', 'linkedin', 'pinterest', 'youtube'
);
CREATE TYPE publish_status AS ENUM ('published', 'scheduled', 'failed', 'draft');
CREATE TYPE activity_type AS ENUM (
  'project_created', 'project_edited', 'project_exported',
  'project_published', 'template_used', 'ai_generated',
  'upload', 'brand_kit_updated', 'social_connected',
  'social_published', 'folder_created', 'profile_updated'
);

-- ─── Tables ──────────────────────────────────────────────────

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  "openId"        VARCHAR(64) NOT NULL UNIQUE,
  name            TEXT,
  email           VARCHAR(320),
  "loginMethod"   VARCHAR(64),
  role            user_role NOT NULL DEFAULT 'user',
  "avatarUrl"     TEXT,
  bio             TEXT,
  company         VARCHAR(255),
  website         VARCHAR(512),
  plan            plan NOT NULL DEFAULT 'free',
  "stripeCustomerId" VARCHAR(255),
  "storageUsed"   INTEGER DEFAULT 0,
  "storageLimit"  INTEGER DEFAULT 524288000,
  preferences     JSON,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn"  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id                      SERIAL PRIMARY KEY,
  "userId"                INTEGER NOT NULL,
  "stripeCustomerId"      VARCHAR(255) NOT NULL,
  "stripeSubscriptionId"  VARCHAR(255),
  "stripePriceId"         VARCHAR(255),
  "stripeProductId"       VARCHAR(255),
  plan                    plan NOT NULL DEFAULT 'free',
  status                  subscription_status NOT NULL DEFAULT 'active',
  "currentPeriodStart"    TIMESTAMP,
  "currentPeriodEnd"      TIMESTAMP,
  "cancelAtPeriodEnd"     BOOLEAN DEFAULT FALSE,
  "canceledAt"            TIMESTAMP,
  "trialStart"            TIMESTAMP,
  "trialEnd"              TIMESTAMP,
  metadata                JSON,
  "createdAt"             TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id                        SERIAL PRIMARY KEY,
  "userId"                  INTEGER NOT NULL,
  "stripePaymentIntentId"   VARCHAR(255),
  "stripeInvoiceId"         VARCHAR(255),
  amount                    INTEGER NOT NULL,
  currency                  VARCHAR(3) NOT NULL DEFAULT 'usd',
  status                    payment_status NOT NULL DEFAULT 'pending',
  description               TEXT,
  "receiptUrl"              TEXT,
  metadata                  JSON,
  "createdAt"               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id              SERIAL PRIMARY KEY,
  "userId"        INTEGER NOT NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  "canvasWidth"   INTEGER NOT NULL DEFAULT 1080,
  "canvasHeight"  INTEGER NOT NULL DEFAULT 1080,
  "canvasData"    JSON,
  "thumbnailUrl"  TEXT,
  category        VARCHAR(64) DEFAULT 'custom',
  "isTemplate"    BOOLEAN DEFAULT FALSE,
  "isPublic"      BOOLEAN DEFAULT FALSE,
  "isStarred"     BOOLEAN DEFAULT FALSE,
  "folderId"      INTEGER,
  tags            JSON,
  "exportCount"   INTEGER DEFAULT 0,
  "lastExportedAt" TIMESTAMP,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "projectFolders" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER NOT NULL,
  name        VARCHAR(255) NOT NULL,
  color       VARCHAR(7) DEFAULT '#6366f1',
  "parentId"  INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE templates (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT,
  category        VARCHAR(64) NOT NULL,
  subcategory     VARCHAR(64),
  "canvasWidth"   INTEGER NOT NULL DEFAULT 1080,
  "canvasHeight"  INTEGER NOT NULL DEFAULT 1080,
  "canvasData"    JSON NOT NULL,
  "thumbnailUrl"  TEXT,
  tags            JSON,
  "isPremium"     BOOLEAN DEFAULT FALSE,
  "usageCount"    INTEGER DEFAULT 0,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL UNIQUE,
  type            asset_type NOT NULL,
  category        VARCHAR(64),
  url             TEXT NOT NULL,
  "thumbnailUrl"  TEXT,
  "fileKey"       VARCHAR(512),
  width           INTEGER,
  height          INTEGER,
  tags            JSON,
  source          VARCHAR(64) DEFAULT 'internal',
  license         VARCHAR(64) DEFAULT 'royalty-free',
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "userUploads" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER NOT NULL,
  name        VARCHAR(255) NOT NULL,
  url         TEXT NOT NULL,
  "fileKey"   VARCHAR(512) NOT NULL,
  "mimeType"  VARCHAR(128),
  size        INTEGER,
  width       INTEGER,
  height      INTEGER,
  "folderId"  INTEGER,
  tags        JSON,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "brandKits" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  colors      JSON,
  fonts       JSON,
  logos       JSON,
  gradients   JSON,
  voice       JSON,
  patterns    JSON,
  "isDefault" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "aiGenerations" (
  id                SERIAL PRIMARY KEY,
  "userId"          INTEGER NOT NULL,
  "generationType"  ai_generation_type NOT NULL,
  prompt            TEXT NOT NULL,
  "resultUrl"       TEXT,
  "resultData"      JSON,
  status            ai_generation_status DEFAULT 'pending',
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "socialConnections" (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL,
  platform            social_platform NOT NULL,
  "accountId"         VARCHAR(255) NOT NULL,
  "accountName"       VARCHAR(255),
  "accessToken"       TEXT NOT NULL,
  "refreshToken"      TEXT,
  "tokenExpiry"       TIMESTAMP,
  "profileImageUrl"   TEXT,
  permissions         JSON,
  "pageId"            VARCHAR(255),
  "pageName"          VARCHAR(255),
  "isActive"          BOOLEAN DEFAULT TRUE,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "publishHistory" (
  id              SERIAL PRIMARY KEY,
  "userId"        INTEGER NOT NULL,
  "projectId"     INTEGER NOT NULL,
  platform        social_platform NOT NULL,
  "connectionId"  INTEGER,
  "postId"        VARCHAR(255),
  "postUrl"       TEXT,
  caption         TEXT,
  hashtags        JSON,
  "imageUrl"      TEXT,
  status          publish_status DEFAULT 'draft',
  "scheduledAt"   TIMESTAMP,
  "publishedAt"   TIMESTAMP,
  error           TEXT,
  metadata        JSON,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "userActivity" (
  id              SERIAL PRIMARY KEY,
  "userId"        INTEGER NOT NULL,
  type            activity_type NOT NULL,
  description     TEXT NOT NULL,
  "projectId"     INTEGER,
  "projectName"   VARCHAR(255),
  metadata        JSON,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "aiChatSessions" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER NOT NULL,
  title       VARCHAR(255) DEFAULT 'New Chat',
  messages    JSON NOT NULL,
  "projectId" INTEGER,
  "isActive"  BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
