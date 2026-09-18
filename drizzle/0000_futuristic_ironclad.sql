CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'bank' NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`current_balance` real DEFAULT 0 NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`transaction_id` integer,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`annotation` text DEFAULT '' NOT NULL,
	`ocr_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`direction` text NOT NULL,
	`counterparty` text NOT NULL,
	`title` text NOT NULL,
	`principal` real NOT NULL,
	`outstanding` real NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`weekly_review_day` integer DEFAULT 0 NOT NULL,
	`weekly_review_time` text DEFAULT '21:00' NOT NULL,
	`base_currency` text DEFAULT 'CNY' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_owner_email_unique` ON `settings` (`owner_email`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`transaction_date` text NOT NULL,
	`kind` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`category` text,
	`note` text DEFAULT '' NOT NULL,
	`account_id` integer,
	`to_account_id` integer,
	`project_id` integer,
	`source_project_id` integer,
	`target_project_id` integer,
	`source_image_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
