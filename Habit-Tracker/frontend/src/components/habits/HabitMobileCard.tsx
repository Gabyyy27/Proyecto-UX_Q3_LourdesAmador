"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Switch,
  Tooltip,
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
    habitId: string
  ) => void;

  onDelete: (
    habit: Habit
  ) => void;
};

function getTrackingLabel(
  habit: Habit
) {
  const trackingType =
    habit.trackingType ??
    "binary";

  if (
    trackingType ===
    "quantity"
  ) {
    const targetValue =
      habit.targetValue ?? 0;

    const unit =
      habit.unit?.trim();

    return unit
      ? `${targetValue} ${unit}`
      : `${targetValue}`;
  }

  return "Sí / No";
}

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
            spacing={2}
            sx={{
              justifyContent:
                "space-between",

              alignItems:
                "flex-start",
            }}
          >
            <Stack
              spacing={0.5}
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  overflow:
                    "hidden",

                  textOverflow:
                    "ellipsis",

                  wordBreak:
                    "break-word",
                }}
              >
                {habit.name}
              </Typography>

              {habit.description ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {habit.description}
                </Typography>
              ) : null}
            </Stack>

            <Switch
              checked={
                habit.active
              }
              onChange={() =>
                onToggle(
                  habit._id
                )
              }
              slotProps={{
                input: {
                  "aria-label":
                    `Cambiar estado de ${habit.name}`,
                },
              }}
            />
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Typography
              variant="body2"
            >
              <strong>
                Categoría:
              </strong>{" "}
              {habit.category ||
                "Sin categoría"}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>
                Frecuencia:
              </strong>{" "}
              {getFrequencyLabel(
                habit.frequency
              )}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems:
                  "center",

                flexWrap:
                  "wrap",
              }}
            >
              <Typography
                variant="body2"
              >
                <strong>
                  Seguimiento:
                </strong>
              </Typography>

              <Chip
                label={
                  getTrackingLabel(
                    habit
                  )
                }
                size="small"
                variant="outlined"
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems:
                  "center",

                flexWrap:
                  "wrap",
              }}
            >
              <Typography
                variant="body2"
              >
                <strong>
                  Prioridad:
                </strong>
              </Typography>

              <Chip
                label={getPriorityLabel(
                  habit.priority
                )}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              justifyContent:
                "flex-end",
            }}
          >
            <Tooltip
              title="Editar hábito"
              arrow
            >
              <IconButton
                component={Link}
                href={
                  `/habits/${habit._id}/edit`
                }
                aria-label={
                  `Editar ${habit.name}`
                }
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            <Tooltip
              title="Eliminar hábito"
              arrow
            >
              <IconButton
                color="error"
                aria-label={
                  `Eliminar ${habit.name}`
                }
                onClick={() =>
                  onDelete(
                    habit
                  )
                }
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}