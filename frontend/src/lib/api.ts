const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UpdateBookmarkData {
  title?: string;
  url?: string;
  description?: string;
  tags?: string[];
}

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    removeToken();
    globalThis.location.href = "/login";
    return { error: "Unauthorized" };
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function register(email: string, password: string) {
  return fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getBookmarks(page = 1, limit = 10, search?: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.append("search", search);

  return fetchAPI(`/bookmarks?${params.toString()}`);
}

export function createBookmark(
  title: string,
  url: string,
  description?: string,
  tags?: string[],
) {
  return fetchAPI("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ title, url, description, tags }),
  });
}

export function updateBookmark(id: string, data: UpdateBookmarkData) {
  return fetchAPI(`/bookmarks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteBookmark(id: string) {
  return fetchAPI(`/bookmarks/${id}`, {
    method: "DELETE",
  });
}
