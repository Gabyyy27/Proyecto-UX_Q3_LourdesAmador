"use client";

import MenuIcon from "@mui/icons-material/Menu";

import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

type AppNavbarProps = {
  onMenuClick: () => void;
};

export function AppNavbar({
  onMenuClick,
}: AppNavbarProps) {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor:
          "background.paper",

        borderBottom:
          "1px solid",

        borderColor:
          "divider",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={
            onMenuClick
          }
          sx={{
            mr: 2,

            display: {
              xs: "inline-flex",
              md: "none",
            },
          }}
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            color:
              "primary.main",

            fontWeight: 700,
          }}
        >
          Habit Tracker
        </Typography>
      </Toolbar>
    </AppBar>
  );
}