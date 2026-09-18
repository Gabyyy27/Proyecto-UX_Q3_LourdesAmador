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
  TextField,
  Typography,
} from "@mui/material";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { StatCard } from "@/components/dashboard/StatCard";

import {
  addHabitProgress,
  completeHabit,
  getHabitHistory,
} from "@/services/habit-records.service";

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

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    savingId,
    setSavingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    progressAmounts,
    setProgressAmounts,
  ] =
    useState<
      Record<string, string>
    >({});

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
                 * También aceptamos el
                 * dateKey antiguo para
                 * mantener compatibilidad
                 * con registros previos a
                 * la migración.
                 */
                const currentRecord =
                  history.find(
                    (record) =>
                      record.dateKey ===
                        periodKey ||
                      record.dateKey ===
                        today
                  );

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
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el dashboard"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  function handleProgressAmountChange(
    habitId: string,
    value: string
  ) {
    setProgressAmounts(
      (current) => ({
        ...current,
        [habitId]: value,
      })
    );
  }

  async function handleComplete(
    habitId: string
  ) {
    try {
      setSavingId(
        habitId
      );

      setError("");
      setSuccess("");

      await completeHabit(
        habitId
      );

      setSuccess(
        "Hábito marcado como completado."
      );

      await loadDashboard();
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "No se pudo completar el hábito"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleAddProgress(
    habitId: string
  ) {
    const rawAmount =
      progressAmounts[
        habitId
      ] ?? "";

    const amount =
      Number(
        rawAmount
      );

    if (
      rawAmount.trim() ===
        "" ||
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      setError(
        "Ingresa una cantidad mayor que 0."
      );

      return;
    }

    try {
      setSavingId(
        habitId
      );

      setError("");
      setSuccess("");

      const response =
        await addHabitProgress(
          habitId,
          amount
        );

      setProgressAmounts(
        (current) => ({
          ...current,
          [habitId]: "",
        })
      );

      setSuccess(
        response.message
      );

      await loadDashboard();
    } catch (progressError) {
      setError(
        progressError instanceof Error
          ? progressError.message
          : "No se pudo registrar el progreso"
      );
    } finally {
      setSavingId(null);
    }
  }

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
          label="Progreso actual"
          value={`${
            data?.dailyProgress ??
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
              }}
            >
              <Typography>
                Progreso general
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

      <Card
        variant="outlined"
      >
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
                  No tienes hábitos
                  programados para hoy.
                </Typography>
              </Box>
            ) : (
              data?.todayHabits.map(
                (habit) => {
                  const isSaving =
                    savingId ===
                    habit._id;

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

                  const amountValue =
                    progressAmounts[
                      habit._id
                    ] ?? "";

                  const parsedAmount =
                    Number(
                      amountValue
                    );

                  const validAmount =
                    amountValue.trim() !==
                      "" &&
                    Number.isFinite(
                      parsedAmount
                    ) &&
                    parsedAmount >
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
                        spacing={2}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1.5}
                          sx={{
                            justifyContent:
                              "space-between",

                            alignItems: {
                              xs:
                                "stretch",
                              sm:
                                "center",
                            },
                          }}
                        >
                          <Stack
                            spacing={0.5}
                          >
                            <Typography
                              sx={{
                                fontWeight:
                                  600,
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
                              {habit.trackingType ===
                              "quantity"
                                ? `${currentValue} / ${targetValue}${
                                    unit
                                      ? ` ${unit}`
                                      : ""
                                  }`
                                : completed
                                  ? "Completado en el período actual"
                                  : "Pendiente en el período actual"}
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
                          />
                        </Stack>

                        {habit.trackingType ===
                        "quantity" ? (
                          <>
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
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Progreso
                                </Typography>

                                <Typography
                                  variant="caption"
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
                                  height: 8,
                                  borderRadius:
                                    999,
                                }}
                              />
                            </Stack>

                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              spacing={1.5}
                              sx={{
                                alignItems: {
                                  xs:
                                    "stretch",
                                  sm:
                                    "flex-start",
                                },
                              }}
                            >
                              <TextField
                                label={
                                  unit
                                    ? `Cantidad (${unit})`
                                    : "Cantidad"
                                }
                                type="number"
                                size="small"
                                value={
                                  amountValue
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleProgressAmountChange(
                                    habit._id,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  completed ||
                                  isSaving
                                }
                                slotProps={{
                                  htmlInput:
                                    {
                                      min: 0,
                                      step:
                                        "any",
                                    },
                                }}
                                sx={{
                                  width: {
                                    xs:
                                      "100%",
                                    sm: 180,
                                  },
                                }}
                              />

                              <Button
                                onClick={() =>
                                  void handleAddProgress(
                                    habit._id
                                  )
                                }
                                disabled={
                                  completed ||
                                  isSaving ||
                                  !validAmount
                                }
                              >
                                {isSaving
                                  ? "Guardando..."
                                  : completed
                                    ? "Objetivo completado"
                                    : "Agregar progreso"}
                              </Button>
                            </Stack>
                          </>
                        ) : (
                          <Stack
                            direction="row"
                            sx={{
                              justifyContent:
                                "flex-end",
                            }}
                          >
                            <Button
                              disabled={
                                completed ||
                                isSaving
                              }
                              onClick={() =>
                                void handleComplete(
                                  habit._id
                                )
                              }
                            >
                              {isSaving
                                ? "Guardando..."
                                : completed
                                  ? "Hecho"
                                  : "Marcar completado"}
                            </Button>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  );
                }
              )
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}