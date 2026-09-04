import {
  DashboardOutlined,
  InsightsOutlined,
  PersonOutlined,
  TaskAltOutlined,
} from "@mui/icons-material";

export const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardOutlined,
  },

  {
    label: "Hábitos",
    href: "/habits",
    icon: TaskAltOutlined,
  },

  {
    label: "Estadísticas",
    href: "/statistics",
    icon: InsightsOutlined,
  },

  {
    label: "Perfil",
    href: "/profile",
    icon: PersonOutlined,
  },
];