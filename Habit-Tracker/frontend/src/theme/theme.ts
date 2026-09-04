"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#6C63FF",
    },

    background: {
      default: "#F7F7FA",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#25252D",
      secondary: "#73737D",
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
        },
      },
    },
  },
});