export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const withAuth = (token) =>
  token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;

function buildUrl(path, token) {
  const url = new URL(`${API_BASE}${path}`);
  if (token) {
    url.searchParams.set("api_token", token);
  }
  return url.toString();
}

export async function fetchPanoramaItems({ signal, token } = {}) {
  const response = await fetch(buildUrl("/api/panorama/", token), {
    method: "GET",
    headers: withAuth(token),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Panorama API gaf status ${response.status}`);
  }

  const data = await response.json();
  return data?.pages ?? data ?? [];
}

export async function fetchUserProfile({ signal, token } = {}) {
  const response = await fetch(buildUrl("/api/user/", token), {
    method: "GET",
    headers: withAuth(token),
    signal,
  });

  if (!response.ok) {
    throw new Error(`User API gaf status ${response.status}`);
  }

  return response.json();
}

export async function createPanoramaItem(payload, token) {
  const response = await fetch(buildUrl("/api/panorama/", token), {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(`Kon item niet aanmaken (${response.status}): ${message}`);
  }

  return response.json();
}

export async function updatePanoramaItem(id, payload, token) {
  const response = await fetch(buildUrl(`/api/panorama/${id}/`, token), {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(
      `Kon item ${id} niet opslaan (${response.status}): ${message}`
    );
  }

  return response.json();
}

export async function deletePanoramaItem(id, token) {
  const response = await fetch(buildUrl(`/api/panorama/${id}/`, token), {
    method: "DELETE",
    headers: withAuth(token),
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(
      `Kon item ${id} niet verwijderen (${response.status}): ${message}`
    );
  }
}

async function safeReadError(response) {
  try {
    const data = await response.json();
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
  } catch (err) {}
  return response.statusText || "Onbekende fout";
}

export function resolveMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;

  // Eerst proberen public (relative naar Vite public root)
  if (path.startsWith("/")) return path;
  const cleaned = path.replace(/^\.?\//, "");
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(cleaned)) {
    return `/${cleaned}`;
  }

  // Anders via API_BASE als fallback
  return `${API_BASE}/${cleaned}`;
}
