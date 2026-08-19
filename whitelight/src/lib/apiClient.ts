/** API base for DigitalOcean Node backend. Empty / same-origin = relative `/api` paths. */
export function getApiBase(): string {
  const raw = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").trim();
  if (!raw || raw === "same-origin" || raw === "/") return "";
  return raw.replace(/\/$/, "");
}

/** Store runs on the self-hosted Node API (Supabase removed). */
export function isApiMode(): boolean {
  return true;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const base = getApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `API ${res.status}`);
  }
  return data as T;
}

export function getAdminToken(): string | null {
  return localStorage.getItem("admin_token");
}
