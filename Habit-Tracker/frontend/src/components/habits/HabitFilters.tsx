"use client";

import {
  Button,
  Stack,
} from "@mui/material";

export type HabitFilter =
  | "all"
  | "active"
  | "finished";

type HabitFiltersProps = {
  value: HabitFilter;
  onChange: (
    value: HabitFilter,
  ) => void;
};

export function HabitFilters({
  value,
  onChange,
}: HabitFiltersProps) {
  const options: {
    label: string;
    value: HabitFilter;
  }[] = [
    {
      label: "Todos",
      value: "all",
    },
    {
      label: "Activos",
      value: "active",
    },
    {
      label: "Inactivos",
      value: "finished",
    },
  ];

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{
        flexWrap: "wrap",
      }}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          variant={
            value === option.value
              ? "contained"
              : "outlined"
          }
          onClick={() =>
            onChange(option.value)
          }
          sx={{
            minWidth: 90,
          }}
        >
          {option.label}
        </Button>
      ))}
    </Stack>
  );
}