"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  authService,
  type User,
} from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authenticated: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  /*
   * Consulta al backend para saber
   * si existe una sesión válida.
   *
   * El navegador envía automáticamente
   * las cookies HttpOnly.
   */
  const refreshUser =
    useCallback(async (): Promise<void> => {
      try {
        const currentUser =
          await authService.me();

        setUser(currentUser);
      } catch {
        setUser(null);
      }
    }, []);

  /*
   * Al cargar la aplicación comprobamos
   * si el usuario ya tiene una sesión.
   */
  useEffect(() => {
    const loadSession = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, [refreshUser]);

  /*
   * Login.
   *
   * El backend crea las cookies:
   * - access_token
   * - refresh_token
   *
   * Después consultamos /auth/profile
   * para cargar al usuario en el contexto.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    await authService.login({
      email,
      password,
    });

    const currentUser =
      await authService.me();

    setUser(currentUser);
  };

  /*
   * Logout.
   *
   * El backend:
   * - elimina la sesión de MongoDB
   * - elimina las cookies
   *
   * El frontend elimina al usuario
   * del estado.
   */
  const logout =
    async (): Promise<void> => {
      try {
        await authService.logout();
      } finally {
        setUser(null);
      }
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: Boolean(user),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}