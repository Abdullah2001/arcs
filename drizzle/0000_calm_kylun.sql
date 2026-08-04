CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`image_path` text NOT NULL,
	`object_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `projects` (`id`, `title`, `location`, `image_path`, `object_key`, `sort_order`) VALUES
	('woonkamer-renovatie', 'Complete woonkamer renovatie', 'Eindhoven · binnenafwerking', '/project-aanbouw.jpg', NULL, 1),
	('badkamerrenovatie', 'Badkamerrenovatie', 'Veldhoven · tegel- & montagewerk', '/project-renovatie.jpg', NULL, 2),
	('stuc-en-schilderwerk', 'Stuc- en schilderwerk', 'Helmond · wanden & plafonds', '/project-interieur.jpg', NULL, 3);
