import { cookies } from "next/headers";

type ServerResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

export async function serverFetch<T>(path: string): Promise<ServerResponse<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { ok: false, status: 401, data: null, error: "Not authenticated" };

  try {
    const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}${path}`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });
    const body = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: body?.error ?? `Request failed (${res.status})`,
      };
    }

    return { ok: true, status: res.status, data: body as T, error: null };
  } catch {
    return { ok: false, status: 0, data: null, error: "Unable to connect to the server" };
  }
}