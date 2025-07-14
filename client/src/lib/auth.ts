export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",
} as const;

export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
} as const;
