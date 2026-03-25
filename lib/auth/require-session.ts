import { getSession } from "@/lib/auth/session";

interface SessionPayload {
  userId: string;
  telegramId: string;
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthRequiredError();
  }
  return session;
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}
