export const API_CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_WWWM_BE_ENDPOINT
      : process.env.REACT_APP_WWWM_BE_DEV_EP || "http://localhost:8080",
  TIMEZONE: "Asia/Seoul",
  USE_MOCK: process.env.REACT_APP_USE_MOCK === "true",
} as const;

export const API_ENDPOINTS = {
  CREATE_APPOINTMENT: "/appointments",
  GET_USER_APPOINTMENTS: "/appointments/me",
  GET_APPOINTMENT: (id: string) => `/appointments/${id}`,
  UPDATE_APPOINTMENT: (id: string) => `/appointments/${id}`,
  DELETE_APPOINTMENT: (id: string) => `/appointments/${id}`,
};

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;
