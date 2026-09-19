"use client";

import type {
  ReactNode,
} from "react";

import {
  SnackbarProvider,
} from "notistack";

type AppSnackbarProviderProps = {
  children: ReactNode;
};

export function AppSnackbarProvider({
  children,
}: AppSnackbarProviderProps) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={1200}
      preventDuplicate
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      {children}
    </SnackbarProvider>
  );
}