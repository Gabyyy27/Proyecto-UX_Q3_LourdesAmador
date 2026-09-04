"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { StatCard } from "@/components/dashboard/StatCard";

import {
  completeHabit,
  getHabitHistory,
} from "@/services/habit-records.service";

import {
  getHabits,
} from "@/services/habits.service";

import type {
  DashboardData,
} from "@/types/dashboard";

function getTodayDateKey() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "America/Tegucigalpa",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(new Date());
}

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    completingId,
    setCompletingId,
  ] = useState<string | null>(
    null,
  );

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const habits =
          await getHabits();

        const activeHabits =
          habits.filter(
            (habit) =>
              habit.active,
          );

        const today =
          getTodayDateKey();

        const habitsWithStatus =
          await Promise.all(
            activeHabits.map(
              async (habit) => {
                const history =
                  await getHabitHistory(
                    habit._id,
                  );

                const completedToday =
                  history.some(
                    (record) =>
                      record.completed &&
                      record.dateKey ===
                        today,
                  );

                return {
                  ...habit,
                  completedToday,
                };
              },
            ),
          );

        const completedToday =
          habitsWithStatus.filter(
            (habit) =>
              habit.completedToday,
          ).length;

        const dailyProgress =
          activeHabits.length === 0
            ? 0
            : Math.round(
                (completedToday /
                  activeHabits.length) *
                  100,
              );

        setData({
          activeHabits:
            activeHabits.length,

          completedToday,

          dailyProgress,

          todayHabits:
            habitsWithStatus,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el dashboard",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleComplete(
    habitId: string,
  ) {
    try {
      setCompletingId(
        habitId,
      );

      setError("");
      setSuccess("");

      await completeHabit(
        habitId,
      );

      setSuccess(
        "Hábito marcado como completado.",
      );

      await loadDashboard();
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "No se pudo completar el hábito",
      );
    } finally {
      setCompletingId(null);
    }
  }

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
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

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },

          gap: 2,
        }}
      >
        <StatCard
          label="Hábitos activos"
          value={
            data?.activeHabits ??
            0
          }
        />

        <StatCard
          label="Completados hoy"
          value={
            data?.completedToday ??
            0
          }
        />

        <StatCard
          label="Progreso diario"
          value={`${
            data?.dailyProgress ??
            0
          }%`}
        />
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
              }}
            >
              <Typography>
                Progreso diario
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {data?.dailyProgress ??
                  0}
                %
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={
                data?.dailyProgress ??
                0
              }
              sx={{
                height: 8,
                borderRadius: 999,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
            >
              Hábitos de hoy
            </Typography>

            {data?.todayHabits
              .length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign:
                    "center",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  No tienes hábitos activos.
                </Typography>
              </Box>
            ) : (
              data?.todayHabits.map(
                (habit) => (
                  <Stack
                    key={
                      habit._id
                    }
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={2}
                    sx={{
                      py: 1.5,

                      alignItems: {
                        xs: "stretch",
                        sm: "center",
                      },

                      justifyContent:
                        "space-between",

                      borderBottom:
                        "1px solid",

                      borderColor:
                        "divider",

                      "&:last-child":
                        {
                          borderBottom:
                            "none",
                        },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {habit.name}
                    </Typography>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1.5}
                      sx={{
                        alignItems: {
                          xs: "stretch",
                          sm: "center",
                        },
                      }}
                    >
                      <Chip
                        label={
                          habit.completedToday
                            ? "Completado"
                            : "Pendiente"
                        }
                        color={
                          habit.completedToday
                            ? "success"
                            : "warning"
                        }
                        size="small"
                        variant="outlined"
                      />

                      <Button
                        disabled={
                          habit.completedToday ||
                          completingId ===
                            habit._id
                        }
                        onClick={() =>
                          void handleComplete(
                            habit._id,
                          )
                        }
                      >
                        {completingId ===
                        habit._id
                          ? "Guardando..."
                          : habit.completedToday
                            ? "Hecho"
                            : "Marcar completado"}
                      </Button>
                    </Stack>
                  </Stack>
                ),
              )
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}