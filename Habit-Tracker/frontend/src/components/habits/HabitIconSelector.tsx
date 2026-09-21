"use client";

import {
  Box,
  ButtonBase,
  Typography,
} from "@mui/material";

import {
  DEFAULT_HABIT_ICON,
  HABIT_ICON_OPTIONS,
} from "@/constants/habit-icons";

type HabitIconSelectorProps = {
  value?: string;

  onChange: (
    value: string,
  ) => void;

  disabled?: boolean;
};

export function HabitIconSelector({
  value = DEFAULT_HABIT_ICON,
  onChange,
  disabled = false,
}: HabitIconSelectorProps) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          fontWeight: 600,
        }}
      >
        Ícono
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1.5,
        }}
      >
        Selecciona un ícono para
        identificar este hábito.
      </Typography>

      <Box
        role="radiogroup"
        aria-label="Ícono del hábito"
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs:
              "repeat(4, minmax(0, 1fr))",

            sm:
              "repeat(6, minmax(0, 1fr))",

            md:
              "repeat(8, minmax(0, 1fr))",
          },

          gap: 1,
        }}
      >
        {HABIT_ICON_OPTIONS.map(
          ({
            value:
              optionValue,

            label,

            Icon,
          }) => {
            const selected =
              value ===
              optionValue;

            return (
              <ButtonBase
                key={
                  optionValue
                }
                type="button"
                role="radio"
                aria-checked={
                  selected
                }
                aria-label={
                  label
                }
                disabled={
                  disabled
                }
                onClick={() =>
                  onChange(
                    optionValue,
                  )
                }
                sx={{
                  minWidth: 0,

                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap: 0.75,

                  px: 0.75,

                  py: 1,

                  borderRadius: 2,

                  border:
                    "1px solid",

                  borderColor:
                    selected
                      ? "primary.main"
                      : "divider",

                  bgcolor:
                    selected
                      ? "action.selected"
                      : "background.paper",

                  color:
                    selected
                      ? "primary.main"
                      : "text.secondary",

                  transition:
                    "border-color 150ms ease, background-color 150ms ease, color 150ms ease",

                  "&:hover": {
                    borderColor:
                      "primary.main",

                    bgcolor:
                      "action.hover",
                  },

                  "&.Mui-focusVisible":
                    {
                      outline:
                        "2px solid",

                      outlineColor:
                        "primary.main",

                      outlineOffset:
                        "2px",
                    },

                  "&.Mui-disabled":
                    {
                      opacity:
                        0.5,
                    },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,

                    borderRadius:
                      "50%",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    bgcolor:
                      selected
                        ? "primary.main"
                        : "action.hover",

                    color:
                      selected
                        ? "primary.contrastText"
                        : "text.secondary",
                  }}
                >
                  <Icon
                    fontSize="small"
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    width:
                      "100%",

                    textAlign:
                      "center",

                    fontWeight:
                      selected
                        ? 600
                        : 400,

                    color:
                      selected
                        ? "primary.main"
                        : "text.secondary",

                    overflow:
                      "hidden",

                    textOverflow:
                      "ellipsis",

                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {label}
                </Typography>
              </ButtonBase>
            );
          },
        )}
      </Box>
    </Box>
  );
}