"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getProfile } from "@/services/auth.service";

import type {
  LoginResponse,
  User,
} from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  startSession: (
    response: LoginResponse,
  ) => void;

  logout: () => void;

  refreshUser: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  function clearSession() {
    localStorage.removeItem(
      "accessToken",
    );

    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    try {
      const profile =
        await getProfile();

      setUser(profile);

      localStorage.setItem(
        "user",
        JSON.stringify(profile),
      );
    } catch {
      clearSession();
    }
  }

  useEffect(() => {
    async function restoreSession() {
      const savedToken =
        localStorage.getItem(
          "accessToken",
        );

      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);

      try {
        const profile =
          await getProfile();

        setUser(profile);

        localStorage.setItem(
          "user",
          JSON.stringify(profile),
        );
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, []);

  function startSession(
    response: LoginResponse,
  ) {
    localStorage.setItem(
      "accessToken",
      response.accessToken,
    );

    localStorage.setItem(
      "user",
      JSON.stringify(response.user),
    );

    setToken(response.accessToken);
    setUser(response.user);
  }

  function logout() {
    clearSession();
  }

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        token,
        loading,
        isAuthenticated:
          !!token && !!user,

        startSession,
        logout,
        refreshUser,
      }),
      [user, token, loading],
    );

  return (
    <AuthContext.Provider
      value={value}
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
      "useAuth debe utilizarse dentro de AuthProvider",
    );
  }

  return context;
}