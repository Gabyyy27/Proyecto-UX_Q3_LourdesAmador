import { apiFetch } from "./api";

import type {
  LoginData,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
} from "@/types/auth";

export function login(
  data: LoginData,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function register(
  data: RegisterData,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getProfile(): Promise<User> {
  return apiFetch<User>(
    "/auth/profile",
    {
      method: "GET",
      authenticated: true,
    },
  );
}