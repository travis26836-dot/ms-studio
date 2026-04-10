-- ManuScript Studio v2.0 Expansion Migration
-- Adds: social connections, publish history, user activity, project folders, AI chat sessions
-- Expands: users table with profile fields, projects with starring/folders, brand kits with gradients/voice

-- ── Expand users table ──
ALTER TABLE `users` ADD COLUMN `avatarUrl` text AFTER `role`;
ALTER TABLE `users` ADD COLUMN `bio` text AFTER `avatarUrl`;
ALTER TABLE `users` ADD COLUMN `company` varchar(255) AFTER `bio`;
ALTER TABLE `users` ADD COLUMN `website` varchar(512) AFTER `company`;
ALTER TABLE `users` ADD COLUMN `plan` enum('free','pro','enterprise') DEFAULT 'free' NOT NULL AFTER `website`;
ALTER TABLE `users` ADD COLUMN `storageUsed` int DEFAULT 0 AFTER `plan`;
ALTER TABLE `users` ADD COLUMN `storageLimit` int DEFAULT 524288000 AFTER `storageUsed`;
ALTER TABLE `users` ADD COLUMN `preferences` json AFTER `storageLimit`;

--> statement-breakpoint

-- ── Expand projects table ──
ALTER TABLE `projects` ADD COLUMN `isStarred` boolean DEFAULT false AFTER `isPublic`;
ALTER TABLE `projects` ADD COLUMN `folderId` int AFTER `isStarred`;
ALTER TABLE `projects` ADD COLUMN `tags` json AFTER `folderId`;
ALTER TABLE `projects` ADD COLUMN `exportCount` int DEFAULT 0 AFTER `tags`;
ALTER TABLE `projects` ADD COLUMN `lastExportedAt` timestamp AFTER `exportCount`;

--> statement-breakpoint

-- ── Expand brand kits table ──
ALTER TABLE `brandKits` ADD COLUMN `description` text AFTER `name`;
ALTER TABLE `brandKits` ADD COLUMN `gradients` json AFTER `logos`;
ALTER TABLE `brandKits` ADD COLUMN `voice` json AFTER `gradients`;
ALTER TABLE `brandKits` ADD COLUMN `patterns` json AFTER `voice`;

--> statement-breakpoint

-- ── Expand user uploads table ──
ALTER TABLE `userUploads` ADD COLUMN `folderId` int AFTER `height`;
ALTER TABLE `userUploads` ADD COLUMN `tags` json AFTER `folderId`;

--> statement-breakpoint

-- ── Expand AI generations enum ──
ALTER TABLE `aiGenerations` MODIFY COLUMN `generationType` enum(
  'background','element','enhancement','text','layout',
  'color-palette','font-pairing','copy','social-caption',
  'pattern','style-transfer','design-critique','mockup'
) NOT NULL;

--> statement-breakpoint

-- ── Expand assets enum ──
ALTER TABLE `assets` MODIFY COLUMN `type` enum(
  'photo','icon','shape','element','background','pattern',
  'illustration','texture','frame','sticker'
) NOT NULL;

--> statement-breakpoint

-- ── Project folders ──
CREATE TABLE `projectFolders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) DEFAULT '#6366f1',
  `parentId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `projectFolders_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint

-- ── Social media connections ──
CREATE TABLE `socialConnections` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `platform` enum('facebook','instagram','tiktok','twitter','linkedin','pinterest','youtube') NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `accountName` varchar(255),
  `accessToken` text NOT NULL,
  `refreshToken` text,
  `tokenExpiry` timestamp,
  `profileImageUrl` text,
  `permissions` json,
  `pageId` varchar(255),
  `pageName` varchar(255),
  `isActive` boolean DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `socialConnections_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint

-- ── Publish history ──
CREATE TABLE `publishHistory` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `projectId` int NOT NULL,
  `platform` enum('facebook','instagram','tiktok','twitter','linkedin','pinterest','youtube') NOT NULL,
  `connectionId` int,
  `postId` varchar(255),
  `postUrl` text,
  `caption` text,
  `hashtags` json,
  `imageUrl` text,
  `status` enum('published','scheduled','failed','draft') DEFAULT 'draft',
  `scheduledAt` timestamp,
  `publishedAt` timestamp,
  `error` text,
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `publishHistory_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint

-- ── User activity log ──
CREATE TABLE `userActivity` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `type` enum(
    'project_created','project_edited','project_exported',
    'project_published','template_used','ai_generated',
    'upload','brand_kit_updated','social_connected',
    'social_published','folder_created','profile_updated'
  ) NOT NULL,
  `description` text NOT NULL,
  `projectId` int,
  `projectName` varchar(255),
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `userActivity_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint

-- ── AI chat sessions ──
CREATE TABLE `aiChatSessions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `title` varchar(255) DEFAULT 'New Chat',
  `messages` json NOT NULL,
  `projectId` int,
  `isActive` boolean DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `aiChatSessions_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint

-- ── Indexes for performance ──
CREATE INDEX `idx_projects_userId` ON `projects` (`userId`);
CREATE INDEX `idx_projects_folderId` ON `projects` (`folderId`);
CREATE INDEX `idx_projects_starred` ON `projects` (`userId`, `isStarred`);
CREATE INDEX `idx_userUploads_userId` ON `userUploads` (`userId`);
CREATE INDEX `idx_brandKits_userId` ON `brandKits` (`userId`);
CREATE INDEX `idx_socialConnections_userId` ON `socialConnections` (`userId`);
CREATE INDEX `idx_socialConnections_platform` ON `socialConnections` (`userId`, `platform`);
CREATE INDEX `idx_publishHistory_userId` ON `publishHistory` (`userId`);
CREATE INDEX `idx_publishHistory_projectId` ON `publishHistory` (`projectId`);
CREATE INDEX `idx_userActivity_userId` ON `userActivity` (`userId`);
CREATE INDEX `idx_aiChatSessions_userId` ON `aiChatSessions` (`userId`);
CREATE INDEX `idx_aiGenerations_userId` ON `aiGenerations` (`userId`);
CREATE INDEX `idx_projectFolders_userId` ON `projectFolders` (`userId`);
