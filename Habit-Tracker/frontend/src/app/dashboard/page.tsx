"use client";

import {
  Box,
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

import {
  useSnackbar,
} from "notistack";

import {
  StatCard,
} from "@/components/dashboard/StatCard";

import {
  StreakCard,
} from "@/components/dashboard/StreakCard";

import {
  WeeklyProgressChart,
} from "@/components/dashboard/WeeklyProgressChart";

import {
  getDashboardData,
  type DashboardViewData,
} from "@/services/dashboard.service";

import type {
  HabitFrequency,
} from "@/types/habit";

function getFrequencyLabel(
  frequency: HabitFrequency
) {
  switch (frequency) {
    case "daily":
      return "Diario";

    case "weekly":
      return "Semanal";

    case "monthly":
      return "Mensual";

    case "custom":
      return "Personalizada";

    default:
      return frequency;
  }
}

export default function DashboardPage() {
  const {
    enqueueSnackbar,
  } = useSnackbar();

  const [
    data,
    setData,
  ] =
    useState<DashboardViewData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);

        const dashboardData =
          await getDashboardData();

        setData(
          dashboardData
        );
      } catch (loadError) {
        enqueueSnackbar(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el dashboard",
          {
            variant: "error",
          }
        );
      } finally {
        setLoading(false);
      }
    }, [enqueueSnackbar]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (
    loading &&
    !data
  ) {
    return (
      <Box
        sx={{
          minHeight: 400,

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/*
       * ENCABEZADO
       */}
      <Box>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
          }}
        >
          Dashboard
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Resumen de tu actividad y
          progreso actual.
        </Typography>
      </Box>

      {/*
       * MÉTRICAS PRINCIPALES
       */}
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

      </Box>

      {/*
       * RACHAS
       */}
      <Stack spacing={1.5}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Rachas
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Mantén tus hábitos para
            aumentar tus rachas.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm:
                "repeat(2, 1fr)",

              lg:
                data?.weeklyStreak
                  .hasWeeklyHabits
                  ? "repeat(4, 1fr)"
                  : "repeat(2, 1fr)",
            },

            gap: 2,
          }}
        >
          <StreakCard
            label="Racha diaria"
            value={
              data?.dailyStreak
                .currentStreak ??
              0
            }
            unit={
              data?.dailyStreak
                .currentStreak ===
              1
                ? "día"
                : "días"
            }
          />

          <StreakCard
            label="Mejor racha diaria"
            value={
              data?.dailyStreak
                .bestStreak ??
              0
            }
            unit={
              data?.dailyStreak
                .bestStreak ===
              1
                ? "día"
                : "días"
            }
          />

          {data?.weeklyStreak
            .hasWeeklyHabits ? (
            <>
              <StreakCard
                label="Racha semanal"
                value={
                  data
                    .weeklyStreak
                    .currentStreak
                }
                unit={
                  data
                    .weeklyStreak
                    .currentStreak ===
                  1
                    ? "semana"
                    : "semanas"
                }
              />

              <StreakCard
                label="Mejor racha semanal"
                value={
                  data
                    .weeklyStreak
                    .bestStreak
                }
                unit={
                  data
                    .weeklyStreak
                    .bestStreak ===
                  1
                    ? "semana"
                    : "semanas"
                }
              />
            </>
          ) : null}
        </Box>
      </Stack>

      {/*
       * PROGRESO SEMANAL
       */}
      {data ? (
        <WeeklyProgressChart
          data={
            data.weeklyProgress
          }
        />
      ) : null}

      {/*
       * CUMPLIMIENTO ACTUAL
       */}
      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",

                alignItems:
                  "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                >
                  Cumplimiento actual
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 700,

                  flexShrink: 0,

                  ml: 2,
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

      {/*
       * RESUMEN DE HÁBITOS
       */}
      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
              >
                Resumen de hábitos
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                El seguimiento se
                registra desde la
                sección Hábitos.
              </Typography>
            </Box>

            {(data?.todayHabits
              .length ?? 0) ===
            0 ? (
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
                  No tienes hábitos
                  programados para este
                  momento.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={0}>
                {data?.todayHabits.map(
                  (habit) => {
                    const completed =
                      habit.periodCompleted ??
                      false;

                    const currentValue =
                      habit.currentValue ??
                      0;

                    const targetValue =
                      habit.periodTargetValue ??
                      habit.targetValue ??
                      1;

                    const unit =
                      habit.periodUnit ??
                      habit.unit ??
                      "";

                    const progressPercent =
                      habit.progressPercent ??
                      0;

                    return (
                      <Box
                        key={
                          habit._id
                        }
                        sx={{
                          py: 2,

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
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{
                            width:
                              "100%",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "flex-start",
                          }}
                        >
                          <Stack
                            spacing={0.25}
                            sx={{
                              flex: 1,

                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight:
                                  600,

                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {
                                habit.name
                              }
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {getFrequencyLabel(
                                habit.frequency
                              )}
                            </Typography>
                          </Stack>

                          <Chip
                            label={
                              completed
                                ? "Completado"
                                : "Pendiente"
                            }
                            color={
                              completed
                                ? "success"
                                : "warning"
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              flexShrink: 0,

                              ml: 1,
                            }}
                          />
                        </Stack>

                        {habit.trackingType ===
                        "quantity" ? (
                          <Stack
                            spacing={0.75}
                            sx={{
                              mt: 1.5,
                            }}
                          >
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent:
                                  "space-between",

                                alignItems:
                                  "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {currentValue}{" "}
                                /{" "}
                                {targetValue}
                                {unit
                                  ? ` ${unit}`
                                  : ""}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    600,

                                  flexShrink:
                                    0,

                                  ml: 2,
                                }}
                              >
                                {
                                  progressPercent
                                }
                                %
                              </Typography>
                            </Stack>

                            <LinearProgress
                              variant="determinate"
                              value={
                                progressPercent
                              }
                              sx={{
                                height: 6,

                                borderRadius:
                                  999,
                              }}
                            />
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1.5,
                            }}
                          >
                            {completed
                              ? "Objetivo cumplido en el período actual."
                              : "Aún no se ha completado en el período actual."}
                          </Typography>
                        )}
                      </Box>
                    );
                  }
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}