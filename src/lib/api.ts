const apiBase = import.meta.env.VITE_API_BASE_URL || "";

const buildUrl = (path: string, query?: Record<string, any>) => {
  const url = new URL(path, apiBase || window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

const request = async (input: RequestInfo, init: RequestInit = {}) => {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || response.statusText || "Ağ isteği başarısız oldu");
  }

  return data;
};

export const api = {
  get: async (path: string, query?: Record<string, any>) => request(buildUrl(path, query)),
  post: async (path: string, body?: any, query?: Record<string, any>) =>
    request(buildUrl(path, query), {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: async (path: string, body?: any, query?: Record<string, any>) =>
    request(buildUrl(path, query), {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: async (path: string, query?: Record<string, any>) =>
    request(buildUrl(path, query), {
      method: "DELETE",
    }),
};

export const auth = {
  getSession: async () => api.get("/api/auth/session"),
  login: async (email: string, password: string) => api.post("/api/auth/login", { email, password }),
  logout: async () => api.post("/api/auth/logout"),
};

export default api;
