import { API_CONFIG } from "../config/environment";

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { body, ...restOptions } = options;

  // localStorage에서 토큰 가져오기
  const token = localStorage.getItem("authToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // 토큰이 있으면 Authorization 헤더에 추가
  if (token) {
    const trimmedToken = token.trim();

    // Bearer로 시작하면 그대로 사용, 아니면 Bearer 추가
    let authToken;
    if (trimmedToken.startsWith("Bearer")) {
      // Bearer로 시작하지만 공백이 없으면 공백 추가
      if (trimmedToken.startsWith("Bearer ")) {
        authToken = trimmedToken;
      } else {
        authToken = trimmedToken.replace("Bearer", "Bearer ");
      }
    } else {
      authToken = `Bearer ${trimmedToken}`;
    }

    headers.Authorization = authToken;
  }

  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log("API Request:", {
    url: fullUrl,
    method: options.method || "GET",
    headers: {
      ...headers,
      Authorization: headers.Authorization
        ? `${headers.Authorization.substring(0, 20)}...`
        : undefined,
    },
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

    // 새로운 백엔드 v2 응답 구조에 맞는 에러 처리
    if (error.status === "BAD_REQUEST" && error.msg) {
      throw new Error(error.msg);
    } else if (error.status === "INTERNAL_SERVER_ERROR" && error.msg) {
      throw new Error(error.msg);
    }

    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("API Response Data:", responseData);

  // 새로운 백엔드 v2 응답 구조에 맞는 추가 검증
  if (responseData.success === false && responseData.msg) {
    throw new Error(responseData.msg);
  }

  return responseData;
}
