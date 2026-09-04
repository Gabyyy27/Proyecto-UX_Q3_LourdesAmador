"use client";

import {
  Box,
} from "@mui/material";

import {
  type ReactNode,
  useState,
} from "react";

import {
  AppSidebar,
  drawerWidth,
} from "./AppSidebar";

import { AppNavbar } from "./AppNavbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({
  children,
}: AppShellProps) {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        bgcolor:
          "background.default",
      }}
    >
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,

          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <AppNavbar
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <Box
          component="main"
          sx={{
            p: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}