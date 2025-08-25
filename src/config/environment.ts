export const API_CONFIG = {
  BASE_URL:
    import.meta.env.PROD
      ? import.meta.env.VITE_WWWM_BE_ENDPOINT
      : import.meta.env.VITE_WWWM_BE_DEV_EP || "http://localhost:8080",
  TIMEZONE: "Asia/Seoul",
  USE_MOCK: import.meta.env.VITE_USE_MOCK === "true",
} as const;

export const API_ENDPOINTS = {
  CREATE_APPOINTMENT: "/appointments",
  GET_USER_APPOINTMENTS: "/appointments/me",
  GET_APPOINTMENT: (id: string) => `/appointments/${id}`,
  UPDATE_APPOINTMENT: (id: string) => `/appointments/${id}`,
  DELETE_APPOINTMENT: (id: string) => `/appointments/${id}`,
  UPDATE_SCHEDULE: (appointmentId: string) =>
    `/appointments/${appointmentId}/schedules`,
  TOGGLE_TIMESLOTS_V2: (appointmentId: string, scheduleId: string) =>
    `/appointments/${appointmentId}/schedules/${scheduleId}/timeslots/toggle`,
};

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;
