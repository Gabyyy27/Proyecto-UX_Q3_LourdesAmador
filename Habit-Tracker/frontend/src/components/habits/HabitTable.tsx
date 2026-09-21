"use client";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

import {
  Box,
  Button,
  Chip,
  IconButton,
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

  onTrack?: (
    habit: Habit,
  ) => void;
};

function getTrackingLabel(
  habit: Habit,
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

    onDelete(
      habit,
    );
  }

  return (
    <>
      <Stack
        spacing={1.5}
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },
        }}
      >
        {habits.map(
          (habit) => {
            const HabitIcon =
              getHabitIconComponent(
                habit.icon,
              );

            return (
              <Box
                key={
                  habit._id
                }
                sx={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "minmax(0, 1fr) auto",

                  gap: 3,

                  alignItems:
                    "center",

                  px: 2.5,
                  py: 2,

                  border:
                    "1px solid",

                  borderColor:
                    "divider",

                  borderRadius: 3,

                  bgcolor:
                    "background.paper",

                  transition:
                    "border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",

                  "&:hover": {
                    borderColor:
                      "primary.light",

                    boxShadow: 1,

                    transform:
                      "translateY(-1px)",
                  },
                }}
              >
                {/*
                 * INFORMACIÓN PRINCIPAL
                 */}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    minWidth: 0,
                    alignItems:
                      "center",
                  }}
                >
                  {/*
                   * ÍCONO
                   */}
                  <Box
                    sx={{
                      width: 52,
                      height: 52,

                      flexShrink: 0,

                      borderRadius: 2.5,

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
                   * NOMBRE + METADATOS
                   */}
                  <Stack
                    spacing={0.8}
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

                        flexWrap:
                          "wrap",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,

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
                        variant="outlined"
                        color={
                          habit.active
                            ? "success"
                            : "default"
                        }
                      />
                    </Stack>

                    {habit.description ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 620,

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

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap:
                          "wrap",

                        rowGap: 1,
                      }}
                    >
                      {habit.category ? (
                        <Chip
                          label={
                            habit.category
                          }
                          size="small"
                          variant="outlined"
                        />
                      ) : null}

                      <Chip
                        label={
                          getFrequencyLabel(
                            habit.frequency,
                          )
                        }
                        size="small"
                        variant="outlined"
                      />

                      <Chip
                        label={`Prioridad ${getPriorityLabel(
                          habit.priority,
                        ).toLowerCase()}`}
                        size="small"
                        variant="outlined"
                      />

                      <Chip
                        label={
                          habit.trackingType ===
                          "quantity"
                            ? `Objetivo: ${getTrackingLabel(
                                habit,
                              )}`
                            : "Seguimiento Sí / No"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Stack>

                {/*
                 * ACCIÓN PRINCIPAL
                 */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems:
                      "center",

                    flexShrink: 0,
                  }}
                >
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
                        minWidth: 150,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {habit.active
                        ? "Seguimiento"
                        : "Ver historial"}
                    </Button>
                  ) : null}

                  <IconButton
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
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Box>
            );
          },
        )}
      </Stack>

      {/*
       * MENÚ DE ACCIONES SECUNDARIAS
       */}
      <Menu
        anchorEl={
          anchorEl
        }
        open={
          menuOpen
        }
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
            Editar
          </MenuItem>
        ) : null}

        <MenuItem
          onClick={
            handleToggle
          }
        >
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
          Eliminar
        </MenuItem>
      </Menu>
    </>
  );
}