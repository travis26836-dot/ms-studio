CREATE TABLE `aiGenerations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`generationType` enum('background','element','enhancement','text','layout') NOT NULL,
	`prompt` text NOT NULL,
	`resultUrl` text,
	`resultData` json,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiGenerations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('photo','icon','shape','element','background','pattern') NOT NULL,
	`category` varchar(64),
	`url` text NOT NULL,
	`thumbnailUrl` text,
	`fileKey` varchar(512),
	`width` int,
	`height` int,
	`tags` json,
	`source` varchar(64) DEFAULT 'internal',
	`license` varchar(64) DEFAULT 'royalty-free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brandKits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`colors` json,
	`fonts` json,
	`logos` json,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandKits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`canvasWidth` int NOT NULL DEFAULT 1080,
	`canvasHeight` int NOT NULL DEFAULT 1080,
	`canvasData` json,
	`thumbnailUrl` text,
	`category` varchar(64) DEFAULT 'custom',
	`isTemplate` boolean DEFAULT false,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`subcategory` varchar(64),
	`canvasWidth` int NOT NULL DEFAULT 1080,
	`canvasHeight` int NOT NULL DEFAULT 1080,
	`canvasData` json NOT NULL,
	`thumbnailUrl` text,
	`tags` json,
	`isPremium` boolean DEFAULT false,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userUploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`mimeType` varchar(128),
	`size` int,
	`width` int,
	`height` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userUploads_id` PRIMARY KEY(`id`)
);
