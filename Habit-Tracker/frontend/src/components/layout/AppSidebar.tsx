"use client";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "./navigation";

export const drawerWidth = 220;

type AppSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function AppSidebar({
  mobileOpen,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const content = (
    <Box>
      <Toolbar
        sx={{
          px: 2,
          minHeight: "64px !important",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          Habit Tracker
        </Typography>
      </Toolbar>

      <List
        sx={{
          px: 1.5,
        }}
      >
        {navigationItems.map(
          (item) => {
            const selected =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={selected}
                onClick={onClose}
                sx={{
                  mb: 1,
                  borderRadius: 2,

                  "&.Mui-selected": {
                    bgcolor:
                      "rgba(108, 99, 255, 0.12)",
                    color:
                      "primary.main",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor:
                      "rgba(108, 99, 255, 0.16)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected
                      ? "primary.main"
                      : "text.secondary",
                  }}
                >
                  <Icon />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                />
              </ListItemButton>
            );
          },
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* Móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width: drawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight:
              "1px solid",
            borderColor:
              "divider",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}