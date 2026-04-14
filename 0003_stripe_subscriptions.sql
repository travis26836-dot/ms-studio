-- ═══════════════════════════════════════════════════════════════
-- ManuScript Studio — Stripe Subscriptions & Billing Migration
-- ═══════════════════════════════════════════════════════════════

-- ── Subscriptions table ──
CREATE TABLE `subscriptions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `stripeCustomerId` varchar(255) NOT NULL,
  `stripeSubscriptionId` varchar(255),
  `stripePriceId` varchar(255),
  `stripeProductId` varchar(255),
  `plan` enum('free','pro','business') NOT NULL DEFAULT 'free',
  `status` enum('active','canceled','past_due','trialing','incomplete','incomplete_expired','paused','unpaid') NOT NULL DEFAULT 'active',
  `currentPeriodStart` timestamp,
  `currentPeriodEnd` timestamp,
  `cancelAtPeriodEnd` boolean DEFAULT false,
  `canceledAt` timestamp,
  `trialStart` timestamp,
  `trialEnd` timestamp,
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
  CONSTRAINT `subscriptions_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`)
);
--> statement-breakpoint

-- ── Payment history table ──
CREATE TABLE `payments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `stripePaymentIntentId` varchar(255),
  `stripeInvoiceId` varchar(255),
  `amount` int NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'usd',
  `status` enum('succeeded','pending','failed','refunded') NOT NULL DEFAULT 'pending',
  `description` text,
  `receiptUrl` text,
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- ── Update users table to include stripeCustomerId ──
ALTER TABLE `users` ADD COLUMN `stripeCustomerId` varchar(255) AFTER `plan`;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `plan` enum('free','pro','business') NOT NULL DEFAULT 'free';
--> statement-breakpoint

-- ── Indexes ──
CREATE INDEX `idx_subscriptions_userId` ON `subscriptions` (`userId`);
CREATE INDEX `idx_subscriptions_stripeCustomerId` ON `subscriptions` (`stripeCustomerId`);
CREATE INDEX `idx_subscriptions_stripeSubscriptionId` ON `subscriptions` (`stripeSubscriptionId`);
CREATE INDEX `idx_payments_userId` ON `payments` (`userId`);
CREATE INDEX `idx_payments_stripeInvoiceId` ON `payments` (`stripeInvoiceId`);
CREATE INDEX `idx_users_stripeCustomerId` ON `users` (`stripeCustomerId`);
