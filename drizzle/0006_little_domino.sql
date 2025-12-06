PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`service_id` integer,
	`staff_id` integer,
	`customer_id` integer,
	`guest_name` text,
	`guest_email` text,
	`guest_phone` text,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`rejection_reason` text,
	`customer_language` text DEFAULT 'en',
	`notes` text,
	`deleted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_appointments`("id", "tenant_id", "service_id", "staff_id", "customer_id", "guest_name", "guest_email", "guest_phone", "start_time", "end_time", "status", "rejection_reason", "customer_language", "notes", "deleted_at", "created_at", "updated_at") SELECT "id", "tenant_id", "service_id", "staff_id", "customer_id", "guest_name", "guest_email", "guest_phone", "start_time", "end_time", "status", "rejection_reason", "customer_language", "notes", "deleted_at", "created_at", "updated_at" FROM `appointments`;--> statement-breakpoint
DROP TABLE `appointments`;--> statement-breakpoint
ALTER TABLE `__new_appointments` RENAME TO `appointments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `appointment_tenant_idx` ON `appointments` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `appointment_start_time_idx` ON `appointments` (`start_time`);--> statement-breakpoint
CREATE INDEX `appointment_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `appointment_tenant_start_idx` ON `appointments` (`tenant_id`,`start_time`);