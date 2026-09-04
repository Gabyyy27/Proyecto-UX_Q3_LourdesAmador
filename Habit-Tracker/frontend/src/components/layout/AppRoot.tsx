"use client";

import {
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { AppShell } from "./AppShell";

type AppRootProps = {
  children: ReactNode;
};

const publicRoutes = [
  "/",
  "/login",
  "/register",
];

export function AppRoot({
  children,
}: AppRootProps) {
  const pathname = usePathname();

  const isPublic =
    publicRoutes.includes(
      pathname,
    );

  if (isPublic) {
    return children;
  }

  return (
    <ProtectedRoute>
      <AppShell>
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}