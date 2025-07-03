import { API_CONFIG } from "../config/environment";

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { body, ...restOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
