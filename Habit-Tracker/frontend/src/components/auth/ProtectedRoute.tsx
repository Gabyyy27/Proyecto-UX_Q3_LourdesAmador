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
    authenticated,
  } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !authenticated
    ) {
      router.replace("/login");
    }
  }, [
    loading,
    authenticated,
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

  if (!authenticated) {
    return null;
  }

  return children;
}