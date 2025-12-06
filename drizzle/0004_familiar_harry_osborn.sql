CREATE TABLE `contact_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`business_name` text,
	`message` text NOT NULL,
	`preferred_contact` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`internal_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_request_status_idx` ON `contact_requests` (`status`);--> statement-breakpoint
CREATE INDEX `contact_request_created_at_idx` ON `contact_requests` (`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`appointment_id` integer,
	`tenant_id` integer NOT NULL,
	`customer_id` integer,
	`guest_name` text,
	`guest_email` text,
	`rating` integer NOT NULL,
	`comment` text,
	`business_reply` text,
	`business_replied_at` text,
	`is_approved` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `review_tenant_idx` ON `reviews` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `review_appointment_idx` ON `reviews` (`appointment_id`);--> statement-breakpoint
CREATE INDEX `review_customer_idx` ON `reviews` (`customer_id`);--> statement-breakpoint
CREATE INDEX `review_rating_idx` ON `reviews` (`rating`);--> statement-breakpoint
ALTER TABLE `appointments` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `global_settings` ADD `admin_whatsapp` text;--> statement-breakpoint
ALTER TABLE `global_settings` ADD `admin_email` text;--> statement-breakpoint
ALTER TABLE `global_settings` ADD `auto_reply_template_en` text;--> statement-breakpoint
ALTER TABLE `global_settings` ADD `auto_reply_template_fr` text;--> statement-breakpoint
ALTER TABLE `global_settings` ADD `auto_reply_template_ar` text;--> statement-breakpoint
ALTER TABLE `tenants` ADD `gallery_images` text;--> statement-breakpoint
ALTER TABLE `tenants` ADD `is_active` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` integer DEFAULT true;