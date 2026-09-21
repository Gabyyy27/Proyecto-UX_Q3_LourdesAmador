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

type HabitMobileCardProps = {
  habit: Habit;

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

export function HabitMobileCard({
  habit,
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

    onToggle(
      habit._id,
    );
  }

  function handleDelete() {
    handleMenuClose();

    onDelete(
      habit,
    );
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

          borderRadius: 3,

          overflow: "visible",
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
               * ÍCONO
               */}
              <Box
                sx={{
                  width: 48,
                  height: 48,

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
               * NOMBRE Y ESTADO
               */}
              <Stack
                spacing={0.6}
                sx={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,

                    lineHeight: 1.3,

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

                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    alignItems:
                      "center",

                    flexWrap:
                      "wrap",

                    rowGap: 0.75,
                  }}
                >
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

                  <Chip
                    label={
                      getFrequencyLabel(
                        habit.frequency,
                      )
                    }
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              {/*
               * MENÚ SECUNDARIO
               */}
              <IconButton
                size="small"
                aria-label={`Más opciones para ${habit.name}`}
                aria-haspopup="menu"
                onClick={
                  handleMenuOpen
                }
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
              >
                {
                  habit.description
                }
              </Typography>
            ) : null}

            {/*
             * INFORMACIÓN SECUNDARIA
             */}
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                flexWrap:
                  "wrap",

                rowGap: 0.75,
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
                    : "Sí / No"
                }
                size="small"
                variant="outlined"
              />
            </Stack>

            {/*
             * ACCIÓN PRINCIPAL
             */}
            {onTrack ? (
              <Button
                fullWidth
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
                  minHeight: 44,
                  fontWeight: 600,
                }}
              >
                {habit.active
                  ? "Seguimiento"
                  : "Ver historial"}
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {/*
       * MENÚ DE ACCIONES
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