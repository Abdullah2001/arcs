import { env } from "cloudflare:workers";
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

function configuredAdminEmail(): string | null {
  const value = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL;
  return value?.trim().toLowerCase() || null;
}

function isConfiguredAdmin(user: ChatGPTUser): boolean {
  const adminEmail = configuredAdminEmail();
  return adminEmail !== null && user.email.trim().toLowerCase() === adminEmail;
}

export async function requireAdminPage(): Promise<ChatGPTUser | null> {
  const user = await requireChatGPTUser("/beheer");
  return isConfiguredAdmin(user) ? user : null;
}

export async function getAdminApiUser(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  return user && isConfiguredAdmin(user) ? user : null;
}

export function isSameOriginWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
