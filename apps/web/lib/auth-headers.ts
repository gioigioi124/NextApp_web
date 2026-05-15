export function getClientAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem("auth-storage");
  if (!raw) {
    return {};
  }

  try {
    const token = JSON.parse(raw)?.state?.tokens?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
