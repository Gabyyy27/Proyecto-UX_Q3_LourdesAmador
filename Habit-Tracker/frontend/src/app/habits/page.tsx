"use client";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import {
  Alert,
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

export default function HabitsPage() {
  const [
    habits,
    setHabits,
  ] = useState<Habit[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<HabitFilter>(
    "all",
  );

  const [
    habitToDelete,
    setHabitToDelete,
  ] = useState<Habit | null>(
    null,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const loadHabits =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getHabits();

        setHabits(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los hábitos",
        );
      } finally {
        setLoading(false);
      }
    }, []);

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
                normalizedSearch,
              ) ||
            habit.category
              .toLowerCase()
              .includes(
                normalizedSearch,
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
        },
      );
    }, [
      habits,
      search,
      filter,
    ]);

  async function handleToggle(
    habitId: string,
  ) {
    try {
      setError("");

      const updated =
        await toggleHabit(
          habitId,
        );

      setHabits(
        (current) =>
          current.map(
            (habit) =>
              habit._id ===
              updated._id
                ? updated
                : habit,
          ),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo cambiar el estado",
      );
    }
  }

  async function handleDelete() {
    if (!habitToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteHabit(
        habitToDelete._id,
      );

      setHabits(
        (current) =>
          current.filter(
            (habit) =>
              habit._id !==
              habitToDelete._id,
          ),
      );

      setSuccess(
        "Hábito eliminado correctamente.",
      );

      setHabitToDelete(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el hábito",
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
          startIcon={<AddIcon />}
        >
          Crear hábito
        </Button>
      </Stack>

      {error ? (
        <Alert
          severity="error"
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess("")
          }
        >
          {success}
        </Alert>
      ) : null}

      <Stack spacing={2}>
        <TextField
          placeholder="Buscar hábito"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
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
                      habit={habit}
                      onToggle={
                        handleToggle
                      }
                      onDelete={
                        setHabitToDelete
                      }
                    />
                  ),
                )}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <DeleteHabitDialog
        habit={habitToDelete}
        loading={deleting}
        onClose={() =>
          setHabitToDelete(
            null,
          )
        }
        onConfirm={() =>
          void handleDelete()
        }
      />
    </Stack>
  );
}