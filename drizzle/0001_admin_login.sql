CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`must_change_password` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_unique` ON `admin_users` (`username`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `title_en` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `location_en` text;--> statement-breakpoint
-- Eerste beheerder met een tijdelijk wachtwoord. Bij de eerste keer inloggen
-- moet dit wachtwoord verplicht worden vervangen.
INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `must_change_password`) VALUES ('8127c613-d413-4a96-b80c-2260204d9c66', 'abdullah', 'pbkdf2$100000$m0VySHvk9Lv61ZWArynLaQ==$047SoG6LBp3o742R7WaFcjDX/x1wgQu+59JDgjFlJtU=', 1);--> statement-breakpoint
UPDATE `projects` SET `title_en` = 'Complete living room renovation', `location_en` = 'Eindhoven · interior finishing' WHERE `id` = 'woonkamer-renovatie';--> statement-breakpoint
UPDATE `projects` SET `title_en` = 'Bathroom renovation', `location_en` = 'Veldhoven · tiling & fitting' WHERE `id` = 'badkamerrenovatie';--> statement-breakpoint
UPDATE `projects` SET `title_en` = 'Plastering and painting', `location_en` = 'Helmond · walls & ceilings' WHERE `id` = 'stuc-en-schilderwerk';
