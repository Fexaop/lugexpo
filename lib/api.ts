/**
 * Prefer same-origin /api (proxied by Next → pwncore via BACKEND_URL).
 * Override with NEXT_PUBLIC_API_URL only if you want the browser to call the API host directly.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export type CtfChallenge = {
  id: number;
  name: string;
  description: string;
  points: number;
  author: string;
  tags?: number;
  ports: number[];
  static_url: string | null;
  host: string;
  running: boolean;
  solves: number;
};

export type FlagSubmitBody = {
  flag: string;
  name: string;
  email: string;
  reg_no: string;
};

export type FlagSubmitResult = {
  status: boolean;
  msg?: string;
  msg_code?: number;
  ctf_id?: number;
  solves?: number;
  ports?: number[];
  static_url?: string | null;
  host?: string;
  running?: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { msg?: string }).msg || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export function listCtfs(): Promise<CtfChallenge[]> {
  return request<CtfChallenge[]>("/api/ctf/list");
}

export function getCtf(id: number): Promise<CtfChallenge> {
  return request<CtfChallenge>(`/api/ctf/${id}`);
}

export async function submitFlag(
  id: number,
  body: FlagSubmitBody
): Promise<FlagSubmitResult> {
  const res = await fetch(`${API_BASE}/api/ctf/${id}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as FlagSubmitResult;
  if (typeof data.status === "boolean") {
    return data;
  }
  if (!res.ok) {
    throw new Error(data.msg || `Request failed (${res.status})`);
  }
  return data;
}

export { API_BASE };
