import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";

export function authenticateConnection(req: IncomingMessage): string | null {
  const cookies = req.headers.cookie;
  const token = extractTokenFromCookie(cookies); // função auxiliar pra parsear o cookie header
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

function extractTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, pair) => {
    const [key, value] = pair.trim().split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);

  return cookies["token"] ?? null; // "token" precisa bater com o nome usado no res.cookie(...) do apps/api
}
