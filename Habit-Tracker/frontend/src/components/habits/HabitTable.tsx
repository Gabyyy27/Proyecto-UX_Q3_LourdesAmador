"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

import {
  Chip,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

type HabitTableProps = {
  habits: Habit[];

  onToggle: (
    habitId: string
  ) => void;

  onDelete: (
    habit: Habit
  ) => void;

  /*
   * Será conectado desde HabitsPage
   * cuando creemos el diálogo de
   * seguimiento.
   *
   * Lo dejamos opcional para que este
   * paso compile sin modificar todavía
   * la página principal.
   */
  onTrack?: (
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

export function HabitTable({
  habits,
  onToggle,
  onDelete,
  onTrack,
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
              Seguimiento
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
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {habits.map(
            (habit) => (
              <TableRow
                key={habit._id}
                hover
              >
                <TableCell>
                  <Stack
                    spacing={0.25}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {habit.name}
                    </Typography>

                    {habit.description ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          maxWidth: 240,
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          habit.description
                        }
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>

                <TableCell>
                  {habit.category ||
                    "Sin categoría"}
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      getTrackingLabel(
                        habit
                      )
                    }
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  {getFrequencyLabel(
                    habit.frequency
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={getPriorityLabel(
                      habit.priority
                    )}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
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
                </TableCell>

                <TableCell
                  align="right"
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      justifyContent:
                        "flex-end",
                    }}
                  >
                    {onTrack ? (
                      <Tooltip
                        title={
                          habit.active
                            ? "Registrar seguimiento"
                            : "Activa el hábito para registrar seguimiento"
                        }
                        arrow
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={
                              !habit.active
                            }
                            aria-label={
                              `Registrar seguimiento de ${habit.name}`
                            }
                            onClick={() =>
                              onTrack(
                                habit
                              )
                            }
                          >
                            <TrackChangesIcon
                              fontSize="small"
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : null}

                    <Tooltip
                      title="Editar hábito"
                      arrow
                    >
                      <IconButton
                        component={Link}
                        href={
                          `/habits/${habit._id}/edit`
                        }
                        size="small"
                        aria-label={
                          `Editar ${habit.name}`
                        }
                      >
                        <EditIcon
                          fontSize="small"
                        />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title="Eliminar hábito"
                      arrow
                    >
                      <IconButton
                        size="small"
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
                        <DeleteIcon
                          fontSize="small"
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}