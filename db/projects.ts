import { asc } from "drizzle-orm";
import { getDb } from "./index";
import { projects, type Project } from "./schema";

export const fallbackProjects: Project[] = [
  {
    id: "woonkamer-renovatie",
    title: "Complete woonkamer renovatie",
    location: "Eindhoven · binnenafwerking",
    titleEn: "Complete living room renovation",
    locationEn: "Eindhoven · interior finishing",
    imagePath: "/project-aanbouw.jpg",
    objectKey: null,
    sortOrder: 1,
    createdAt: "2026-07-25 00:00:00",
  },
  {
    id: "badkamerrenovatie",
    title: "Badkamerrenovatie",
    location: "Veldhoven · tegel- & montagewerk",
    titleEn: "Bathroom renovation",
    locationEn: "Veldhoven · tiling & fitting",
    imagePath: "/project-renovatie.jpg",
    objectKey: null,
    sortOrder: 2,
    createdAt: "2026-07-25 00:00:00",
  },
  {
    id: "stuc-en-schilderwerk",
    title: "Stuc- en schilderwerk",
    location: "Helmond · wanden & plafonds",
    titleEn: "Plastering and painting",
    locationEn: "Helmond · walls & ceilings",
    imagePath: "/project-interieur.jpg",
    objectKey: null,
    sortOrder: 3,
    createdAt: "2026-07-25 00:00:00",
  },
];

export async function listProjects(): Promise<Project[]> {
  const db = getDb();
  return db.select().from(projects).orderBy(asc(projects.sortOrder));
}

export async function listProjectsWithFallback(): Promise<Project[]> {
  try {
    return await listProjects();
  } catch {
    return fallbackProjects;
  }
}
