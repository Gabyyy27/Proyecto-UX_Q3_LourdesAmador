"use client";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import {
  Box,
  Button,
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
  HabitCategoryFilters,
} from "@/components/habits/HabitCategoryFilters";

import {
  HabitFilters,
  type HabitFilter,
  type HabitPriorityFilter,
} from "@/components/habits/HabitFilters";

import {
  HabitTable,
} from "@/components/habits/HabitTable";

import {
  HabitMobileCard,
} from "@/components/habits/HabitMobileCard";

import {
  DeleteHabitDialog,
} from "@/components/habits/DeleteHabitDialog";

import {
  HabitTrackingDialog,
} from "@/components/habits/HabitTrackingDialog";

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
    "all",
  );

  const [
    priority,
    setPriority,
  ] =
    useState<HabitPriorityFilter>(
      "all",
    );

  const [
    category,
    setCategory,
  ] = useState("all");

  const [
    habitToDelete,
    setHabitToDelete,
  ] = useState<Habit | null>(
    null,
  );

  const [
    habitToTrack,
    setHabitToTrack,
  ] = useState<Habit | null>(
    null,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /*
   * Carga inicial de hábitos.
   */
  const loadHabits =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const data =
            await getHabits();

          setHabits(data);
        } catch (
          loadError
        ) {
          enqueueSnackbar(
            loadError instanceof
              Error
              ? loadError.message
              : "No se pudieron cargar los hábitos",
            {
              variant:
                "error",
            },
          );
        } finally {
          setLoading(false);
        }
      },
      [enqueueSnackbar],
    );

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  /*
   * Categorías disponibles.
   *
   * - ignoramos categorías vacías
   * - quitamos espacios
   * - evitamos duplicados
   * - ordenamos alfabéticamente
   */
  const categories =
    useMemo(() => {
      const uniqueCategories =
        new Map<
          string,
          string
        >();

      for (
        const habit of habits
      ) {
        const trimmedCategory =
          (
            habit.category ??
            ""
          ).trim();

        if (
          !trimmedCategory
        ) {
          continue;
        }

        const normalized =
          trimmedCategory.toLowerCase();

        if (
          !uniqueCategories.has(
            normalized,
          )
        ) {
          uniqueCategories.set(
            normalized,
            trimmedCategory,
          );
        }
      }

      return Array.from(
        uniqueCategories.values(),
      ).sort(
        (first, second) =>
          first.localeCompare(
            second,
            "es",
          ),
      );
    }, [habits]);

  /*
   * Filtrado por:
   *
   * - búsqueda
   * - estado
   * - prioridad
   * - categoría
   */
  const filteredHabits =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const normalizedCategory =
        category === "all"
          ? "all"
          : category
              .trim()
              .toLowerCase();

      return habits.filter(
        (habit) => {
          const habitCategory =
            (
              habit.category ??
              ""
            )
              .trim()
              .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            habit.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            habitCategory.includes(
              normalizedSearch,
            );

          const matchesStatus =
            filter === "all"
              ? true
              : filter ===
                  "active"
                ? habit.active
                : !habit.active;

          const matchesPriority =
            priority === "all"
              ? true
              : habit.priority ===
                priority;

          const matchesCategory =
            normalizedCategory ===
            "all"
              ? true
              : habitCategory ===
                normalizedCategory;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesCategory
          );
        },
      );
    }, [
      habits,
      search,
      filter,
      priority,
      category,
    ]);

  /*
   * Activa o desactiva
   * un hábito.
   */
  async function handleToggle(
    habitId: string,
  ) {
    try {
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

      /*
       * Si se desactiva un hábito
       * que está abierto en seguimiento,
       * cerramos también el diálogo.
       */
      if (
        !updated.active &&
        habitToTrack?._id ===
          updated._id
      ) {
        setHabitToTrack(
          null,
        );
      }

      enqueueSnackbar(
        updated.active
          ? "Hábito activado correctamente."
          : "Hábito desactivado correctamente.",
        {
          variant:
            "success",
        },
      );
    } catch (
      toggleError
    ) {
      enqueueSnackbar(
        toggleError instanceof
          Error
          ? toggleError.message
          : "No se pudo cambiar el estado del hábito",
        {
          variant:
            "error",
        },
      );
    }
  }

  /*
   * Elimina el hábito
   * seleccionado.
   */
  async function handleDelete() {
    if (!habitToDelete) {
      return;
    }

    try {
      setDeleting(true);

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

      /*
       * Si el mismo hábito estuviera
       * abierto en seguimiento,
       * limpiamos también ese estado.
       */
      if (
        habitToTrack?._id ===
        habitToDelete._id
      ) {
        setHabitToTrack(
          null,
        );
      }

      enqueueSnackbar(
        "Hábito eliminado correctamente.",
        {
          variant:
            "success",
        },
      );

      setHabitToDelete(
        null,
      );
    } catch (
      deleteError
    ) {
      enqueueSnackbar(
        deleteError instanceof
          Error
          ? deleteError.message
          : "No se pudo eliminar el hábito",
        {
          variant:
            "error",
        },
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Stack spacing={3}>
      {/*
       * ENCABEZADO
       */}
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
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
            }}
          >
            Hábitos
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Gestiona tus hábitos y
            registra tu progreso.
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/habits/new"
          variant="contained"
          startIcon={
            <AddIcon />
          }
        >
          Crear hábito
        </Button>
      </Stack>

      {/*
       * BÚSQUEDA
       */}
      <TextField
        placeholder="Buscar hábito"
        value={search}
        onChange={(
          event,
        ) =>
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

      {/*
       * ESTADO + PRIORIDAD
       */}
      <HabitFilters
        value={filter}
        onChange={
          setFilter
        }
        priority={
          priority
        }
        onPriorityChange={
          setPriority
        }
      />

      {/*
       * CATEGORÍAS
       */}
      <HabitCategoryFilters
        categories={
          categories
        }
        value={
          category
        }
        onChange={
          setCategory
        }
      />

      {/*
       * CONTENIDO
       */}
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

            px: 2,

            textAlign:
              "center",

            border:
              "1px solid",

            borderColor:
              "divider",

            borderRadius: 3,

            bgcolor:
              "background.paper",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            No hay hábitos para
            mostrar
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
          {/*
           * ESCRITORIO
           */}
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

          {/*
           * MÓVIL
           */}
          <Stack
            spacing={2}
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
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
              ),
            )}
          </Stack>
        </>
      )}

      {/*
       * SEGUIMIENTO
       */}
      <HabitTrackingDialog
        habit={
          habitToTrack
        }
        open={
          habitToTrack !==
          null
        }
        onClose={() =>
          setHabitToTrack(
            null,
          )
        }
      />

      {/*
       * ELIMINACIÓN
       */}
      <DeleteHabitDialog
        habit={
          habitToDelete
        }
        loading={
          deleting
        }
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