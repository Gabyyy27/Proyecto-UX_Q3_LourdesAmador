"use client";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSnackbar,
} from "notistack";

import {
  deleteHabit,
  getHabits,
  toggleHabit,
} from "@/services/habits.service";

import type {
  Habit,
} from "@/types/habit";

import {
  HabitFilters,
  type HabitFilter,
} from "@/components/habits/HabitFilters";

import { HabitTable } from "@/components/habits/HabitTable";

import { HabitMobileCard } from "@/components/habits/HabitMobileCard";

import { DeleteHabitDialog } from "@/components/habits/DeleteHabitDialog";

import { HabitTrackingDialog } from "@/components/habits/HabitTrackingDialog";

export default function HabitsPage() {
  const {
    enqueueSnackbar,
  } = useSnackbar();

  const [
    habits,
    setHabits,
  ] = useState<Habit[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<HabitFilter>(
    "all"
  );

  const [
    habitToDelete,
    setHabitToDelete,
  ] = useState<Habit | null>(
    null
  );

  const [
    habitToTrack,
    setHabitToTrack,
  ] = useState<Habit | null>(
    null
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const loadHabits =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getHabits();

        setHabits(data);
      } catch (loadError) {
        enqueueSnackbar(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los hábitos",
          {
            variant: "error",
          }
        );
      } finally {
        setLoading(false);
      }
    }, [enqueueSnackbar]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const filteredHabits =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return habits.filter(
        (habit) => {
          const matchesSearch =
            !normalizedSearch ||
            habit.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            habit.category
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesFilter =
            filter === "all"
              ? true
              : filter ===
                  "active"
                ? habit.active
                : !habit.active;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      habits,
      search,
      filter,
    ]);

  async function handleToggle(
    habitId: string
  ) {
    try {
      const updated =
        await toggleHabit(
          habitId
        );

      setHabits(
        (current) =>
          current.map(
            (habit) =>
              habit._id ===
              updated._id
                ? updated
                : habit
          )
      );

      /*
       * Si el usuario desactiva un
       * hábito que tenía abierto en
       * seguimiento, cerramos también
       * el diálogo.
       */
      if (
        !updated.active &&
        habitToTrack?._id ===
          updated._id
      ) {
        setHabitToTrack(
          null
        );
      }

      enqueueSnackbar(
        updated.active
          ? "Hábito activado correctamente."
          : "Hábito desactivado correctamente.",
        {
          variant: "success",
        }
      );
    } catch (toggleError) {
      enqueueSnackbar(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo cambiar el estado del hábito",
        {
          variant: "error",
        }
      );
    }
  }

  async function handleDelete() {
    if (!habitToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteHabit(
        habitToDelete._id
      );

      setHabits(
        (current) =>
          current.filter(
            (habit) =>
              habit._id !==
              habitToDelete._id
          )
      );

      /*
       * Por seguridad, si el mismo
       * hábito estuviera seleccionado
       * para seguimiento, lo limpiamos.
       */
      if (
        habitToTrack?._id ===
        habitToDelete._id
      ) {
        setHabitToTrack(
          null
        );
      }

      enqueueSnackbar(
        "Hábito eliminado correctamente.",
        {
          variant: "success",
        }
      );

      setHabitToDelete(null);
    } catch (deleteError) {
      enqueueSnackbar(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el hábito",
        {
          variant: "error",
        }
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent:
            "space-between",

          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Typography
          variant="h5"
          component="h2"
        >
          Hábitos
        </Typography>

        <Button
          component={Link}
          href="/habits/new"
          startIcon={
            <AddIcon />
          }
        >
          Crear hábito
        </Button>
      </Stack>

      <Stack spacing={2}>
        <TextField
          placeholder="Buscar hábito"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          sx={{
            maxWidth: {
              xs: "100%",
              md: 420,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />

        <HabitFilters
          value={filter}
          onChange={setFilter}
        />
      </Stack>

      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
          >
            Lista de hábitos
          </Typography>

          {loading ? (
            <Box
              sx={{
                minHeight: 250,
                display: "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredHabits.length ===
            0 ? (
            <Box
              sx={{
                py: 8,
                textAlign:
                  "center",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
              >
                No hay hábitos para mostrar
              </Typography>

              <Typography
                color="text.secondary"
              >
                {habits.length ===
                0
                  ? "Crea tu primer hábito para comenzar."
                  : "Prueba cambiando la búsqueda o los filtros."}
              </Typography>
            </Box>
          ) : (
            <>
              <HabitTable
                habits={
                  filteredHabits
                }
                onToggle={
                  handleToggle
                }
                onDelete={
                  setHabitToDelete
                }
                onTrack={
                  setHabitToTrack
                }
              />

              <Stack
                spacing={2}
                sx={{
                  display: {
                    xs: "flex",
                    md: "none",
                  },
                  mt: 2,
                }}
              >
                {filteredHabits.map(
                  (habit) => (
                    <HabitMobileCard
                      key={
                        habit._id
                      }
                      habit={
                        habit
                      }
                      onToggle={
                        handleToggle
                      }
                      onDelete={
                        setHabitToDelete
                      }
                      onTrack={
                        setHabitToTrack
                      }
                    />
                  )
                )}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <HabitTrackingDialog
        habit={habitToTrack}
        open={
          habitToTrack !==
          null
        }
        onClose={() =>
          setHabitToTrack(
            null
          )
        }
      />

      <DeleteHabitDialog
        habit={habitToDelete}
        loading={deleting}
        onClose={() =>
          setHabitToDelete(
            null
          )
        }
        onConfirm={() =>
          void handleDelete()
        }
      />
    </Stack>
  );
}