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
      autoHideDuration={3500}
      preventDuplicate
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      {children}
    </SnackbarProvider>
  );
}