"use client";

import {
  Box,
  CircularProgress,
} from "@mui/material";

import { useRouter } from "next/navigation";

import {
  type ReactNode,
  useEffect,
} from "react";

import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const {
    loading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated
    ) {
      router.replace("/login");
    }
  }, [
    loading,
    isAuthenticated,
    router,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}