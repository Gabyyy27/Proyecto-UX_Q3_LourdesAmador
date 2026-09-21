"use client";

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

export type HabitFilter =
  | "all"
  | "active"
  | "finished";

export type HabitPriorityFilter =
  | "all"
  | "high"
  | "medium"
  | "low";

type HabitFiltersProps = {
  value: HabitFilter;

  onChange: (
    value: HabitFilter,
  ) => void;

  /*
   * Estas propiedades son opcionales
   * temporalmente para poder actualizar
   * este componente antes de conectar
   * el filtro en HabitsPage.
   */
  priority?: HabitPriorityFilter;

  onPriorityChange?: (
    value: HabitPriorityFilter,
  ) => void;
};

export function HabitFilters({
  value,
  onChange,
  priority,
  onPriorityChange,
}: HabitFiltersProps) {
  const statusOptions: {
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
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={2}
      sx={{
        alignItems: {
          xs: "stretch",
          sm: "center",
        },

        justifyContent:
          "space-between",
      }}
    >
      {/*
       * ESTADO
       */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          flexWrap: "wrap",
        }}
      >
        {statusOptions.map(
          (option) => (
            <Button
              key={
                option.value
              }
              variant={
                value ===
                option.value
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                onChange(
                  option.value,
                )
              }
              sx={{
                minWidth: 90,
              }}
            >
              {option.label}
            </Button>
          ),
        )}
      </Stack>

      {/*
       * PRIORIDAD
       *
       * Solo aparece cuando HabitsPage
       * ya envía las propiedades.
       */}
      {priority &&
      onPriorityChange ? (
        <FormControl
          size="small"
          sx={{
            minWidth: {
              xs: "100%",
              sm: 180,
            },
          }}
        >
          <InputLabel id="habit-priority-filter-label">
            Prioridad
          </InputLabel>

          <Select
            labelId="habit-priority-filter-label"
            label="Prioridad"
            value={
              priority
            }
            onChange={(
              event,
            ) =>
              onPriorityChange(
                event.target
                  .value as HabitPriorityFilter,
              )
            }
          >
            <MenuItem value="all">
              Todas
            </MenuItem>

            <MenuItem value="high">
              Alta
            </MenuItem>

            <MenuItem value="medium">
              Media
            </MenuItem>

            <MenuItem value="low">
              Baja
            </MenuItem>
          </Select>
        </FormControl>
      ) : null}
    </Stack>
  );
}