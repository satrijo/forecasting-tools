const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new APIError(res.status, data.error || `HTTP ${res.status}`);
  }

  return data;
}
