"use client";

import {
  Button,
  Chip,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import Link from "next/link";

import type {
  Habit,
} from "@/types/habit";

import {
  getFrequencyLabel,
  getPriorityLabel,
} from "./habitLabels";

type HabitTableProps = {
  habits: Habit[];

  onToggle: (
    habitId: string,
  ) => void;

  onDelete: (
    habit: Habit,
  ) => void;
};

export function HabitTable({
  habits,
  onToggle,
  onDelete,
}: HabitTableProps) {
  return (
    <TableContainer
      sx={{
        display: {
          xs: "none",
          md: "block",
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Hábito
            </TableCell>

            <TableCell>
              Categoría
            </TableCell>

            <TableCell>
              Frecuencia
            </TableCell>

            <TableCell>
              Prioridad
            </TableCell>

            <TableCell>
              Estado
            </TableCell>

            <TableCell align="right">
              Acción
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {habits.map((habit) => (
            <TableRow
              key={habit._id}
              hover
            >
              <TableCell>
                {habit.name}
              </TableCell>

              <TableCell>
                {habit.category ||
                  "Sin categoría"}
              </TableCell>

              <TableCell>
                {getFrequencyLabel(
                  habit.frequency,
                )}
              </TableCell>

              <TableCell>
                <Chip
                  label={getPriorityLabel(
                    habit.priority,
                  )}
                  size="small"
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                <Switch
                  checked={habit.active}
                  onChange={() =>
                    onToggle(
                      habit._id,
                    )
                  }
                  slotProps={{
                    input: {
                    "aria-label":
                      `Cambiar estado de ${habit.name}`,
                    },
                  }}
                />
              </TableCell>

              <TableCell align="right">
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    justifyContent:
                      "flex-end",
                  }}
                >
                  <Button
                    component={Link}
                    href={
                      `/habits/${habit._id}/edit`
                    }
                    size="small"
                  >
                    Editar
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() =>
                      onDelete(habit)
                    }
                  >
                    Eliminar
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}