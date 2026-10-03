const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

type ApiResponse<T> = {
  data: T | null;
  status: number;
  ok: boolean;
  errorType?: "network" | "parse" | "none";
};

export async function apiFetch<T = unknown>(
  path: string,
  options?: ApiFetchOptions
): Promise<ApiResponse<T>> {
  let res: Response;

  try {
    res = await fetch(`/api${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // aqui o problema é de REDE — servidor inacessível, sem internet, CORS bloqueando
    return { data: null, status: 0, ok: false, errorType: "network" };
  }

  if (res.status === 204) {
    return { data: null, status: res.status, ok: res.ok, errorType: "none" };
  }

  try {
    const data = await res.json();
    return { data: data as T, status: res.status, ok: res.ok, errorType: "none" };
  } catch {
    // aqui a conexão funcionou, mas a resposta não era JSON válido
    return { data: null, status: res.status, ok: false, errorType: "parse" };
  }
}