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

type HabitMobileCardProps = {
  habit: Habit;
  progress?: HabitCurrentProgress;
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
      progress?.currentValue ?? 0;

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

export function HabitMobileCard({
  habit,
  progress,
  onToggle,
  onDelete,
  onTrack,
}: HabitMobileCardProps) {
  const [
    anchorEl,
    setAnchorEl,
  ] =
    useState<HTMLElement | null>(
      null,
    );

  const menuOpen =
    Boolean(anchorEl);

  const HabitIcon =
    getHabitIconComponent(
      habit.icon,
    );

  const percentage =
    progress?.percentage ?? 0;

  const scheduledToday =
    progress?.scheduledToday ??
    true;

  const progressText =
    getProgressText(
      habit,
      progress,
    );

  function handleMenuOpen(
    event:
      MouseEvent<HTMLElement>,
  ) {
    setAnchorEl(
      event.currentTarget,
    );
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleToggle() {
    handleMenuClose();
    onToggle(habit._id);
  }

  function handleDelete() {
    handleMenuClose();
    onDelete(habit);
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        <CardContent
          sx={{
            p: 2,
            "&:last-child": {
              pb: 2,
            },
          }}
        >
          <Stack spacing={2}>
            {/* CABECERA */}
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                alignItems:
                  "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "flex",
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

              <Stack
                spacing={1}
                sx={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
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
                      fontWeight: 700,
                      lineHeight: 1.2,
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
                    onClick={
                      handleMenuOpen
                    }
                    sx={{
                      flexShrink: 0,
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
            {/* DESCRIPCIÓN */}
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

                {/* FILA 2 EN VERTICAL */}
                <Stack spacing={0.5}>
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
                        fontWeight: 500,
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
                        fontWeight: 500,
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
                        fontWeight: 500,
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

            {/* PORCENTAJE */}
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {scheduledToday
                ? `${percentage}%`
                : "—"}
            </Typography>

            {/* BARRA + BOTÓN */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems:
                  "center",
              }}
            >
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
                    borderRadius: 999,
                    bgcolor:
                      "action.hover",
                    "& .MuiLinearProgress-bar":
                      {
                        borderRadius: 999,
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
                  {progressText}
                </Typography>
              </Box>

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
                    onTrack(habit)
                  }
                  sx={{
                    minWidth: 132,
                    px: 1.5,
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
        <MenuItem
          component={Link}
          href={`/habits/${habit._id}/edit`}
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
          {habit.active
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