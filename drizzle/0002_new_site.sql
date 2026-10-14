CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`must_change_password` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `login_failures` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title_nl` text NOT NULL,
	`title_en` text,
	`place_nl` text NOT NULL,
	`place_en` text,
	`object_key` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `site_images` (
	`slot` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`alt_nl` text DEFAULT '' NOT NULL,
	`alt_en` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
-- Eerste beheerder met een tijdelijk wachtwoord dat bij de eerste keer inloggen verplicht vervangen moet worden.
INSERT INTO `admins` (`id`, `username`, `password_hash`, `must_change_password`) VALUES ('ba148e95-7270-41e4-a86f-aa54ce628f49', 'abdullah', 'pbkdf2$100000$4jdFfEObf8N+08289aEXug==$ACdDQTtVRXmnthryw5CPpnAXI5SqLZJXtQRgLqRGQ0Y=', 1);
