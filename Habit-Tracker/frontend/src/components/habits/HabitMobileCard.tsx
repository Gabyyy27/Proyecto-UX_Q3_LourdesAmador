"use client";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import Link from "next/link";

import type {
  Habit,
} from "@/types/habit";

import {
  getFrequencyLabel,
  getPriorityLabel,
} from "./habitLabels";

type HabitMobileCardProps = {
  habit: Habit;

  onToggle: (
    habitId: string,
  ) => void;

  onDelete: (
    habit: Habit,
  ) => void;
};

export function HabitMobileCard({
  habit,
  onToggle,
  onDelete,
}: HabitMobileCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        display: {
          xs: "block",
          md: "none",
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
            >
              {habit.name}
            </Typography>

            <Switch
              checked={habit.active}
              onChange={() =>
                onToggle(habit._id)
              }
            />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>
                Categoría:
              </strong>{" "}
              {habit.category ||
                "Sin categoría"}
            </Typography>

            <Typography variant="body2">
              <strong>
                Frecuencia:
              </strong>{" "}
              {getFrequencyLabel(
                habit.frequency,
              )}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems:
                  "center",
              }}
            >
              <Typography variant="body2">
                <strong>
                  Prioridad:
                </strong>
              </Typography>

              <Chip
                label={getPriorityLabel(
                  habit.priority,
                )}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
          >
            <Button
              component={Link}
              href={
                `/habits/${habit._id}/edit`
              }
              fullWidth
            >
              Editar
            </Button>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() =>
                onDelete(habit)
              }
            >
              Eliminar
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}