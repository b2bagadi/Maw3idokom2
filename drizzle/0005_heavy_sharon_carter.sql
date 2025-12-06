CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name_en` text NOT NULL,
	`name_fr` text NOT NULL,
	`name_ar` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `category_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
ALTER TABLE `tenants` ADD `category_id` integer REFERENCES categories(id);