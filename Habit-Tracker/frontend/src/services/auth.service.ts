import api from "./api";

export interface User {
  id: number | string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post(
      "/auth/login",
      data
    );

    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post(
      "/auth/register",
      data
    );

    return response.data;
  },

  me: async (): Promise<User> => {
  const response = await api.get(
    "/auth/profile"
  );

  return response.data;
},

 logout: async (): Promise<void> => {
  await api.post("/auth/logout");
},

  refresh: async () => {
    await api.post("/auth/refresh");
  },
};