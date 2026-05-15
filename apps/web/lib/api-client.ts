const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await this.request(endpoint, options);

    if (response.status === 401 && endpoint !== "/auth/refresh") {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const retryResponse = await this.request(endpoint, options);
        return this.parseResponse<T>(retryResponse);
      }
    }

    return this.parseResponse<T>(response);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (!this.accessToken && typeof window !== "undefined") {
      this.accessToken = getStoredAccessToken();
    }

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new ApiError(error?.message || "Request failed", response.status);
    }

    return response.json();
  }

  private async refreshToken() {
    if (typeof window === "undefined") {
      return false;
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const json = await response.json();
    const tokens = json.data;
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      return false;
    }

    this.accessToken = tokens.accessToken;
    updateStoredTokens(tokens);
    setCookie("auth-token", tokens.accessToken, 60 * 60 * 24 * 7);
    return true;
  }
}

export const apiClient = new ApiClient();

function getStoredAuthState() {
  const raw = window.localStorage.getItem("auth-storage");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getStoredAccessToken() {
  return getStoredAuthState()?.state?.tokens?.accessToken || null;
}

function getStoredRefreshToken() {
  return getStoredAuthState()?.state?.tokens?.refreshToken || null;
}

function updateStoredTokens(tokens: { accessToken: string; refreshToken: string }) {
  const current = getStoredAuthState();
  if (!current?.state) {
    return;
  }

  window.localStorage.setItem(
    "auth-storage",
    JSON.stringify({
      ...current,
      state: {
        ...current.state,
        tokens,
        isAuthenticated: true,
      },
    }),
  );
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}
