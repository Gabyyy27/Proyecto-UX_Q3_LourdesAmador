"use client";

import MenuIcon from "@mui/icons-material/Menu";

import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import { usePathname } from "next/navigation";


const pageTitles: Record<
  string,
  string
> = {
  "/dashboard": "Dashboard",
  "/habits": "Hábitos",
  "/statistics": "Estadísticas",
  "/profile": "Perfil",
};

type AppNavbarProps = {
  onMenuClick: () => void;
};

export function AppNavbar({
  onMenuClick,
}: AppNavbarProps) {
  const pathname = usePathname();

  let title = "Habit Tracker";

  if (pathname === "/habits/new") {
    title = "Crear hábito";
  } else if (
    pathname.startsWith("/habits/") &&
    pathname.endsWith("/edit")
  ) {
    title = "Editar hábito";
  } else {
    for (const [route, routeTitle] of Object.entries(pageTitles)) {
      if (
        pathname === route ||
        pathname.startsWith(`${route}/`)
      ) {
        title = routeTitle;
        break;
      }
    }
  }
  for (const [
    route,
    routeTitle,
  ] of Object.entries(pageTitles)) {
    if (
      pathname === route ||
      pathname.startsWith(
        `${route}/`,
      )
    ) {
      title = routeTitle;
      break;
    }
  }

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
          onClick={onMenuClick}
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
          component="h1"
        >
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}