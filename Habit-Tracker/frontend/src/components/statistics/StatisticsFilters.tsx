"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import type {
  Habit,
} from "@/types/habit";

type StatisticsFiltersProps = {
  habits: Habit[];

  selectedHabitId: string;

  selectedMonth: string;

  selectedYear: string;

  years: number[];

  onHabitChange: (
    habitId: string,
  ) => void;

  onMonthChange: (
    month: string,
  ) => void;

  onYearChange: (
    year: string,
  ) => void;
};

const MONTHS = [
  {
    value: "01",
    label: "Enero",
  },
  {
    value: "02",
    label: "Febrero",
  },
  {
    value: "03",
    label: "Marzo",
  },
  {
    value: "04",
    label: "Abril",
  },
  {
    value: "05",
    label: "Mayo",
  },
  {
    value: "06",
    label: "Junio",
  },
  {
    value: "07",
    label: "Julio",
  },
  {
    value: "08",
    label: "Agosto",
  },
  {
    value: "09",
    label: "Septiembre",
  },
  {
    value: "10",
    label: "Octubre",
  },
  {
    value: "11",
    label: "Noviembre",
  },
  {
    value: "12",
    label: "Diciembre",
  },
];

export function StatisticsFilters({
  habits,
  selectedHabitId,
  selectedMonth,
  selectedYear,
  years,
  onHabitChange,
  onMonthChange,
  onYearChange,
}: StatisticsFiltersProps) {
  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",

          sm:
            "repeat(2, minmax(0, 1fr))",

          md:
            "repeat(3, minmax(0, 1fr))",
        },

        gap: 2,

        maxWidth: 900,
      }}
    >
      {/*
       * HÁBITO
       */}
      <FormControl
        fullWidth
        size="small"
      >
        <InputLabel id="statistics-habit-filter-label">
          Hábito
        </InputLabel>

        <Select
          labelId="statistics-habit-filter-label"
          label="Hábito"
          value={
            selectedHabitId
          }
          onChange={(
            event,
          ) =>
            onHabitChange(
              event.target.value,
            )
          }
        >
          <MenuItem value="all">
            Todos los hábitos
          </MenuItem>

          {habits.map(
            (habit) => (
              <MenuItem
                key={
                  habit._id
                }
                value={
                  habit._id
                }
              >
                {
                  habit.name
                }
              </MenuItem>
            ),
          )}
        </Select>
      </FormControl>

      {/*
       * MES
       */}
      <FormControl
        fullWidth
        size="small"
      >
        <InputLabel id="statistics-month-filter-label">
          Mes
        </InputLabel>

        <Select
          labelId="statistics-month-filter-label"
          label="Mes"
          value={
            selectedMonth
          }
          onChange={(
            event,
          ) =>
            onMonthChange(
              event.target.value,
            )
          }
        >
          <MenuItem value="all">
            Todos los meses
          </MenuItem>

          {MONTHS.map(
            (month) => (
              <MenuItem
                key={
                  month.value
                }
                value={
                  month.value
                }
              >
                {
                  month.label
                }
              </MenuItem>
            ),
          )}
        </Select>
      </FormControl>

      {/*
       * AÑO
       */}
      <FormControl
        fullWidth
        size="small"
      >
        <InputLabel id="statistics-year-filter-label">
          Año
        </InputLabel>

        <Select
          labelId="statistics-year-filter-label"
          label="Año"
          value={
            selectedYear
          }
          onChange={(
            event,
          ) =>
            onYearChange(
              event.target.value,
            )
          }
        >
          <MenuItem value="all">
            Todos los años
          </MenuItem>

          {years.map(
            (year) => (
              <MenuItem
                key={
                  year
                }
                value={
                  String(
                    year,
                  )
                }
              >
                {year}
              </MenuItem>
            ),
          )}
        </Select>
      </FormControl>
    </Box>
  );
}