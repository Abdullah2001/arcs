import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Let op: de tabelnamen zijn bewust anders dan die van de vorige website,
// zodat de nieuwe migratie niet botst met tabellen die al bestaan.

/** Projectfoto's die op de website staan. */
export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  titleNl: text("title_nl").notNull(),
  titleEn: text("title_en"),
  placeNl: text("place_nl").notNull(),
  placeEn: text("place_en"),
  objectKey: text("object_key").notNull(),
  version: integer("version").notNull().default(1),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export type Photo = typeof photos.$inferSelect;

/** Vaste fotoplekken op de site, zoals de grote foto bovenaan ("hero"). */
export const siteImages = sqliteTable("site_images", {
  slot: text("slot").primaryKey(),
  objectKey: text("object_key").notNull(),
  altNl: text("alt_nl").notNull().default(""),
  altEn: text("alt_en").notNull().default(""),
  version: integer("version").notNull().default(1),
});
export type SiteImage = typeof siteImages.$inferSelect;

/** Beheerders die inloggen met gebruikersnaam en wachtwoord. */
export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export type Admin = typeof admins.$inferSelect;

/** Ingelogde sessies; alleen een hash van het token wordt bewaard. */
export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  adminId: text("admin_id")
    .notNull()
    .references(() => admins.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

/** Mislukte inlogpogingen per IP-adres. */
export const loginFailures = sqliteTable("login_failures", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: integer("window_start").notNull(),
});
