// // src/services/auth.service.ts
// import api from "@/lib/axios";
// import type { AuthUser } from "@/store/auth.store";

// export interface RegisterPayload {
//   name: string;
//   email: string;
//   password: string;
//   role: "CUSTOMER" | "ORGANIZER";
//   referralCode?: string;
// }

// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export async function registerApi(payload: RegisterPayload): Promise<AuthUser> {
//   const res = await api.post("/auth/register", payload);
//   return res.data.data;
// }

// export async function loginApi(payload: LoginPayload): Promise<AuthUser> {
//   const res = await api.post("/auth/login", payload);
//   return res.data.data;
// }

// export async function logoutApi(): Promise<void> {
//   await api.post("/auth/logout");
// }

// export async function getMeApi(): Promise<AuthUser> {
//   const res = await api.get("/auth/me");
//   return res.data.data;
// }

// src/services/auth.service.ts
import api from "@/lib/axios";
import type { AuthUser } from "@/store/auth.store";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ORGANIZER";
  referralCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthUser> {
  const res = await api.post("/auth/register", payload);
  // simpan token ke localStorage sebagai fallback
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data.data;
}

export async function loginApi(payload: LoginPayload): Promise<AuthUser> {
  const res = await api.post("/auth/login", payload);
  // simpan token ke localStorage sebagai fallback
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data.data;
}

export async function logoutApi(): Promise<void> {
  await api.post("/auth/logout");
  localStorage.removeItem("token");
}

export async function getMeApi(): Promise<AuthUser> {
  const res = await api.get("/auth/me");
  return res.data.data;
}
