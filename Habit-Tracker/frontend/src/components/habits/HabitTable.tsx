"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

import Link from "next/link";

import {
  useState,
  type MouseEvent,
} from "react";

import {
  getHabitIconComponent,
} from "@/constants/habit-icons";

import type {
  HabitCurrentProgress,
} from "@/services/habit-records.service";

import type {
  Habit,
} from "@/types/habit";

import {
  getFrequencyLabel,
  getPriorityLabel,
} from "./habitLabels";

type HabitTableProps = {
  habits: Habit[];

  progress: Record<
    string,
    HabitCurrentProgress
  >;

  onToggle: (
    habitId: string,
  ) => void;

  onDelete: (
    habit: Habit,
  ) => void;

  onTrack?: (
    habit: Habit,
  ) => void;
};

function getProgressText(
  habit: Habit,
  progress?: HabitCurrentProgress,
) {
  if (
    habit.frequency ===
    "custom" &&
    progress &&
    !progress.scheduledToday
  ) {
    return "No programado hoy";
  }

  if (
    habit.trackingType ===
    "quantity"
  ) {
    const currentValue =
      progress?.currentValue ??
      0;

    const targetValue =
      progress?.targetValue ??
      habit.targetValue ??
      0;

    const unit =
      progress?.record?.unit?.trim() ||
      habit.unit?.trim() ||
      "";

    return unit
      ? `${currentValue} / ${targetValue} ${unit}`
      : `${currentValue} / ${targetValue}`;
  }

  return progress?.completed
    ? "Completado"
    : "Pendiente";
}

export function HabitTable({
  habits,
  progress,
  onToggle,
  onDelete,
  onTrack,
}: HabitTableProps) {
  const [
    anchorEl,
    setAnchorEl,
  ] =
    useState<HTMLElement | null>(
      null,
    );

  const [
    selectedHabit,
    setSelectedHabit,
  ] =
    useState<Habit | null>(
      null,
    );

  const menuOpen =
    Boolean(anchorEl);

  function handleMenuOpen(
    event:
      MouseEvent<HTMLElement>,
    habit: Habit,
  ) {
    setAnchorEl(
      event.currentTarget,
    );

    setSelectedHabit(
      habit,
    );
  }

  function handleMenuClose() {
    setAnchorEl(null);

    setSelectedHabit(null);
  }

  function handleToggle() {
    if (!selectedHabit) {
      return;
    }

    onToggle(
      selectedHabit._id,
    );

    handleMenuClose();
  }

  function handleDelete() {
    if (!selectedHabit) {
      return;
    }

    const habit =
      selectedHabit;

    handleMenuClose();

    onDelete(habit);
  }

  return (
    <>
      <Box
        sx={{
          display: {
            xs: "none",
            md: "grid",
          },

          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",

          gap: 2,
        }}
      >
        {habits.map(
          (habit) => {
            const HabitIcon =
              getHabitIconComponent(
                habit.icon,
              );

            const habitProgress =
              progress[
              habit._id
              ];

            const percentage =
              habitProgress
                ?.percentage ??
              0;

            const scheduledToday =
              habitProgress
                ?.scheduledToday ??
              true;

            const progressText =
              getProgressText(
                habit,
                habitProgress,
              );

            return (
              <Card
                key={habit._id}
                variant="outlined"
                sx={{
                  minWidth: 0,

                  transition:
                    "border-color 150ms ease, box-shadow 150ms ease",

                  "&:hover": {
                    borderColor:
                      "primary.light",

                    boxShadow: 1,
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 2.25,

                    "&:last-child": {
                      pb: 2.25,
                    },
                  }}
                >
                  <Stack spacing={2}>
                    {/*
                     * CABECERA
                     */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems:
                          "flex-start",
                      }}
                    >
                      {/*
                       * ÍCONO DEL HÁBITO
                       */}
                      <Box
                        sx={{
                          width: 52,
                          height: 52,

                          flexShrink: 0,

                          borderRadius:
                            "50%",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          bgcolor:
                            "action.selected",

                          color:
                            "primary.main",
                        }}
                      >
                        <HabitIcon />
                      </Box>

                      {/*
                       * NOMBRE + DATOS
                       */}
                      <Stack
                        spacing={1}
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {/*
                         * NOMBRE
                         * ACTIVO/INACTIVO
                         * MENÚ
                         */}
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems:
                              "center",

                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight:
                                700,

                              lineHeight:
                                1.2,

                              minWidth: 0,

                              flex: 1,

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {habit.name}
                          </Typography>

                          <Chip
                            label={
                              habit.active
                                ? "Activo"
                                : "Inactivo"
                            }
                            size="small"
                            color={
                              habit.active
                                ? "success"
                                : "default"
                            }
                            variant="outlined"
                            sx={{
                              flexShrink: 0,
                            }}
                          />

                          <IconButton
                            size="small"
                            aria-label={`Más opciones para ${habit.name}`}
                            aria-haspopup="menu"
                            onClick={(
                              event,
                            ) =>
                              handleMenuOpen(
                                event,
                                habit,
                              )
                            }
                            sx={{
                              flexShrink: 0,
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
{/*
                     * DESCRIPCIÓN
                     */}
                    {habit.description ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
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
                        {/*
                         * CATEGORÍA
                         * FRECUENCIA
                         * PRIORIDAD
                         */}
                        <Stack
                          direction="column"
                          spacing={0.5}
                          useFlexGap
                          sx={{
                            flexWrap:
                              "wrap",

                            rowGap: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Categoría:{" "}
                            <Box
                              component="span"
                              sx={{
                                color:
                                  "text.secondary",

                                fontWeight:
                                  50,
                              }}
                            >
                              {habit.category ||
                                "Sin categoría"}
                            </Box>
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Frecuencia:{" "}
                            <Box
                              component="span"
                              sx={{
                                color:
                                  "text.secondary",

                                fontWeight:
                                  50,
                              }}
                            >
                              {getFrequencyLabel(
                                habit.frequency,
                              )}
                            </Box>
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Prioridad:{" "}
                            <Box
                              component="span"
                              sx={{
                                color:
                                  "text.secondary",

                                fontWeight:
                                  50,
                              }}
                            >
                              {getPriorityLabel(
                                habit.priority,
                              )}
                            </Box>
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/*
                     * PORCENTAJE
                     */}
                    <Typography
                      sx={{
                        fontSize:
                          "1.25rem",

                        fontWeight: 700,

                        lineHeight: 1.2,
                      }}
                    >
                      {scheduledToday
                        ? `${percentage}%`
                        : "—"}
                    </Typography>

                    {/*
                     * BARRA + BOTÓN
                     */}
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: "center",
                      }}
                    >
                      {/*
                       * BARRA Y TEXTO
                       */}
                      <Box
                        sx={{
                          flex: 1,

                          minWidth: 0,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={
                            scheduledToday
                              ? percentage
                              : 0
                          }
                          sx={{
                            height: 8,

                            borderRadius:
                              999,

                            bgcolor:
                              "action.hover",

                            "& .MuiLinearProgress-bar":
                            {
                              borderRadius:
                                999,
                            },
                          }}
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.4,
                          }}
                        >
                          {
                            progressText
                          }
                        </Typography>
                      </Box>

                      {/*
                       * ACCIÓN PRINCIPAL
                       */}
                      {onTrack ? (
                        <Button
                          variant={
                            habit.active
                              ? "contained"
                              : "outlined"
                          }
                          startIcon={
                            <TrackChangesIcon />
                          }
                          onClick={() =>
                            onTrack(
                              habit,
                            )
                          }
                          sx={{
                            minWidth:
                              100,

                            px: 2,

                            whiteSpace:
                              "nowrap",

                            flexShrink: 0,

                          }}
                        >
                          {habit.active
                            ? "Seguimiento"
                            : "Ver historial"}
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          },
        )}
      </Box>

      {/*
       * MENÚ DE ACCIONES
       */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={
          handleMenuClose
        }
        slotProps={{
          paper: {
            sx: {
              minWidth: 190,
            },
          },
        }}
      >
        {selectedHabit ? (
          <MenuItem
            component={Link}
            href={`/habits/${selectedHabit._id}/edit`}
            onClick={
              handleMenuClose
            }
          >
            <EditIcon
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />

            Editar
          </MenuItem>
        ) : null}

        <MenuItem
          onClick={
            handleToggle
          }
        >
          <PowerSettingsNewIcon
            fontSize="small"
            sx={{
              mr: 1.5,
            }}
          />

          {selectedHabit?.active
            ? "Desactivar"
            : "Activar"}
        </MenuItem>

        <MenuItem
          onClick={
            handleDelete
          }
          sx={{
            color:
              "error.main",
          }}
        >
          <DeleteIcon
            fontSize="small"
            sx={{
              mr: 1.5,
            }}
          />

          Eliminar
        </MenuItem>
      </Menu>
    </>
  );
}