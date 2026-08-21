CREATE TABLE `anniversaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`type` text DEFAULT 'birthday' NOT NULL,
	`reminder_min` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`first_name` text,
	`last_name` text,
	`nickname` text,
	`company` text,
	`job_title` text,
	`tel_home` text,
	`tel_work` text,
	`tel_mobile` text,
	`tel_fax` text,
	`email` text,
	`address_home` text,
	`address_work` text,
	`notes` text,
	`birthday` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contacts_last_name_idx` ON `contacts` (`last_name`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`all_day` integer DEFAULT false NOT NULL,
	`location` text,
	`reminder_min` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_start_at_idx` ON `events` (`start_at`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_type` text NOT NULL,
	`source_id` integer NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`note` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `links_source_idx` ON `links` (`source_type`,`source_id`);--> statement-breakpoint
CREATE INDEX `links_target_idx` ON `links` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`category` text DEFAULT 'General' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notes_category_idx` ON `notes` (`category`);--> statement-breakpoint
CREATE TABLE `planner_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`start_date` text,
	`due_date` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`priority` integer DEFAULT 2 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `planner_items_project_idx` ON `planner_items` (`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`start_date` text,
	`target_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`color` text DEFAULT '#3b82f6' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_sub_endpoint_idx` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`start_date` text,
	`due_date` text,
	`priority` integer DEFAULT 2 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`category` text DEFAULT 'General' NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_due_date_idx` ON `tasks` (`due_date`);--> statement-breakpoint
CREATE INDEX `tasks_status_idx` ON `tasks` (`status`);