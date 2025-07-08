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

  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log("API Request:", {
    url: fullUrl,
    method: options.method || "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const response = await fetch(fullUrl, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log("API Response:", {
    status: response.status,
    statusText: response.statusText,
    url: fullUrl,
    ok: response.ok,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    console.error("API Error:", {
      status: response.status,
      statusText: response.statusText,
      url: fullUrl,
      error,
    });
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("API Response Data:", responseData);
  return responseData;
}
