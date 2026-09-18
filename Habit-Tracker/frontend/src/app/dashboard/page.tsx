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

import { StatCard } from "@/components/dashboard/StatCard";

import { getHabitHistory } from "@/services/habit-records.service";

import {
  getHabits,
} from "@/services/habits.service";

import type {
  Habit,
  HabitFrequency,
} from "@/types/habit";

import type {
  DashboardData,
} from "@/types/dashboard";

const DASHBOARD_TIMEZONE =
  "America/Tegucigalpa";

function getCalendarDate(
  date: Date,
  timeZone: string
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

  const parts =
    formatter.formatToParts(
      date
    );

  const year =
    Number(
      parts.find(
        (part) =>
          part.type === "year"
      )?.value
    );

  const month =
    Number(
      parts.find(
        (part) =>
          part.type === "month"
      )?.value
    );

  const day =
    Number(
      parts.find(
        (part) =>
          part.type === "day"
      )?.value
    );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}

function formatCalendarDate(
  date: Date
) {
  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function getDateKey(
  date: Date,
  timeZone: string
) {
  return formatCalendarDate(
    getCalendarDate(
      date,
      timeZone
    )
  );
}

function getIsoWeek(
  calendarDate: Date
) {
  const workingDate =
    new Date(
      calendarDate.getTime()
    );

  const weekday =
    workingDate.getUTCDay() ||
    7;

  workingDate.setUTCDate(
    workingDate.getUTCDate() +
    4 -
    weekday
  );

  const isoYear =
    workingDate.getUTCFullYear();

  const yearStart =
    new Date(
      Date.UTC(
        isoYear,
        0,
        1
      )
    );

  const week =
    Math.ceil(
      (
        (
          workingDate.getTime() -
          yearStart.getTime()
        ) /
        86400000 +
        1
      ) / 7
    );

  return {
    year: isoYear,
    week,
  };
}

function getCurrentPeriodKey(
  frequency: HabitFrequency,
  date: Date,
  timeZone: string
) {
  const calendarDate =
    getCalendarDate(
      date,
      timeZone
    );

  const dateKey =
    formatCalendarDate(
      calendarDate
    );

  if (
    frequency === "daily"
  ) {
    return `daily:${dateKey}`;
  }

  if (
    frequency === "weekly"
  ) {
    const {
      year,
      week,
    } =
      getIsoWeek(
        calendarDate
      );

    return `weekly:${year}-W${String(
      week
    ).padStart(
      2,
      "0"
    )}`;
  }

  if (
    frequency === "monthly"
  ) {
    const year =
      calendarDate
        .getUTCFullYear();

    const month =
      String(
        calendarDate
          .getUTCMonth() + 1
      ).padStart(
        2,
        "0"
      );

    return `monthly:${year}-${month}`;
  }

  return `custom:${dateKey}`;
}

function getCurrentWeekday(
  date: Date,
  timeZone: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      weekday: "long",
    }
  )
    .format(date)
    .toLowerCase();
}

function isHabitAvailableToday(
  habit: Habit,
  date: Date,
  timeZone: string
) {
  const today =
    getDateKey(
      date,
      timeZone
    );

  const startDate =
    habit.startDate.slice(
      0,
      10
    );

  if (
    today < startDate
  ) {
    return false;
  }

  if (
    habit.endDate &&
    today >
    habit.endDate.slice(
      0,
      10
    )
  ) {
    return false;
  }

  if (
    habit.frequency !==
    "custom"
  ) {
    return true;
  }

  const weekday =
    getCurrentWeekday(
      date,
      timeZone
    );

  return habit.customDays.includes(
    weekday
  );
}

function getProgressPercent(
  currentValue: number,
  targetValue: number
) {
  if (
    targetValue <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (
        currentValue /
        targetValue
      ) * 100
    )
  );
}

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
    useState<DashboardData | null>(
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


        const habits =
          await getHabits();

        const activeHabits =
          habits.filter(
            (habit) =>
              habit.active
          );

        const now =
          new Date();

        const today =
          getDateKey(
            now,
            DASHBOARD_TIMEZONE
          );

        const availableHabits =
          activeHabits.filter(
            (habit) =>
              isHabitAvailableToday(
                habit,
                now,
                DASHBOARD_TIMEZONE
              )
          );

        const habitsWithStatus =
          await Promise.all(
            availableHabits.map(
              async (habit) => {
                const history =
                  await getHabitHistory(
                    habit._id
                  );

                const periodKey =
                  getCurrentPeriodKey(
                    habit.frequency,
                    now,
                    DASHBOARD_TIMEZONE
                  );

                /*
                 * Primero buscamos el
                 * registro con la nueva
                 * clave de período.
                 */
                let currentRecord =
                  history.find(
                    (record) =>
                      record.dateKey ===
                      periodKey
                  );

                /*
                 * Compatibilidad con los
                 * registros antiguos.
                 *
                 * Solo aplicamos el
                 * dateKey YYYY-MM-DD a
                 * frecuencias que realmente
                 * trabajan por día.
                 */
                if (
                  !currentRecord &&
                  (
                    habit.frequency ===
                    "daily" ||
                    habit.frequency ===
                    "custom"
                  )
                ) {
                  currentRecord =
                    history.find(
                      (record) =>
                        record.dateKey ===
                        today
                    );
                }

                const trackingType =
                  habit.trackingType ??
                  "binary";

                const targetValue =
                  currentRecord
                    ?.targetValue ??
                  (
                    trackingType ===
                      "binary"
                      ? 1
                      : habit.targetValue ??
                      1
                  );

                const currentValue =
                  currentRecord
                    ?.currentValue ??
                  (
                    currentRecord
                      ?.completed
                      ? targetValue
                      : 0
                  );

                const periodCompleted =
                  currentRecord
                    ?.completed ??
                  false;

                const progressPercent =
                  periodCompleted
                    ? 100
                    : getProgressPercent(
                      currentValue,
                      targetValue
                    );

                const completedAt =
                  currentRecord
                    ?.completedAt;

                /*
                 * "Completados hoy" cuenta
                 * solamente los hábitos que
                 * efectivamente fueron
                 * completados hoy.
                 *
                 * Un hábito semanal que se
                 * completó ayer sigue
                 * completado esta semana,
                 * pero no cuenta como
                 * completado hoy.
                 */
                const completedToday =
                  Boolean(
                    periodCompleted &&
                    completedAt &&
                    getDateKey(
                      new Date(
                        completedAt
                      ),
                      DASHBOARD_TIMEZONE
                    ) === today
                  );

                return {
                  ...habit,

                  completedToday,

                  periodCompleted,

                  currentValue,

                  periodTargetValue:
                    targetValue,

                  periodUnit:
                    currentRecord
                      ?.unit ??
                    habit.unit ??
                    "",

                  progressPercent,
                };
              }
            )
          );

        const completedToday =
          habitsWithStatus.filter(
            (habit) =>
              habit.completedToday
          ).length;

        const dailyProgress =
          habitsWithStatus.length ===
            0
            ? 0
            : Math.round(
              habitsWithStatus.reduce(
                (
                  total,
                  habit
                ) =>
                  total +
                  (
                    habit.progressPercent ??
                    0
                  ),
                0
              ) /
              habitsWithStatus.length
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

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
          {
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
          label="Cumplimiento actual"
          value={`${data?.dailyProgress ??
            0
            }%`}
        />
      </Box>

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

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Promedio del progreso
                  de los hábitos.
                </Typography>
              </Box>

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
                  No tienes hábitos
                  programados para este
                  momento.
                </Typography>
              </Box>
            ) : (
              <Stack
                spacing={0}
              >
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
                            width: "100%",
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
                                fontWeight: 600,
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {habit.name}
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
                          >
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent:
                                  "space-between",
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