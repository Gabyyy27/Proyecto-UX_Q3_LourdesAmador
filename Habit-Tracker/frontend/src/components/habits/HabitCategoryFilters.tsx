"use client";

import {
  Button,
  Stack,
  Typography,
} from "@mui/material";

type HabitCategoryFiltersProps = {
  categories: string[];

  value: string;

  onChange: (
    category: string,
  ) => void;
};

export function HabitCategoryFilters({
  categories,
  value,
  onChange,
}: HabitCategoryFiltersProps) {
  /*
   * Si ningún hábito tiene categoría,
   * no mostramos esta sección.
   */
  if (categories.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
        }}
      >
        Categorías
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          /*
           * En móvil dejamos desplazamiento
           * horizontal si existen muchas
           * categorías.
           */
          overflowX: {
            xs: "auto",
            sm: "visible",
          },

          flexWrap: {
            xs: "nowrap",
            sm: "wrap",
          },

          pb: {
            xs: 0.5,
            sm: 0,
          },

          "& > *": {
            flexShrink: 0,
          },
        }}
      >
        <Button
          size="small"
          variant={
            value === "all"
              ? "contained"
              : "outlined"
          }
          onClick={() =>
            onChange("all")
          }
          sx={{
            minWidth: "auto",
            px: 2,
          }}
        >
          Todas
        </Button>

        {categories.map(
          (category) => (
            <Button
              key={category}
              size="small"
              variant={
                value === category
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                onChange(
                  category,
                )
              }
              sx={{
                minWidth: "auto",
                px: 2,
              }}
            >
              {category}
            </Button>
          ),
        )}
      </Stack>
    </Stack>
  );
}