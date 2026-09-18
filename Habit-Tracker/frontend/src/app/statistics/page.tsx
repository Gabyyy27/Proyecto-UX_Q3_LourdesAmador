"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getHabitHistory,
  type HabitRecord,
} from "@/services/habit-records.service";

import {
  getHabits,
} from "@/services/habits.service";

import type {
  Habit,
} from "@/types/habit";

type HabitHistoryItem = {
  habit: Habit;
  records: HabitRecord[];
};

function getFrequencyLabel(
  record: HabitRecord
) {
  switch (record.frequency) {
    case "daily":
      return "Diario";

    case "weekly":
      return "Semanal";

    case "monthly":
      return "Mensual";

    case "custom":
      return "Personalizada";

    default:
      return "Período";
  }
}

function getPeriodLabel(
  record: HabitRecord
) {
  const dateKey =
    record.dateKey ?? "";

  if (
    dateKey.startsWith("daily:")
  ) {
    return dateKey.replace(
      "daily:",
      ""
    );
  }

  if (
    dateKey.startsWith("weekly:")
  ) {
    return dateKey
      .replace(
        "weekly:",
        ""
      )
      .replace(
        "-W",
        " · Semana "
      );
  }

  if (
    dateKey.startsWith("monthly:")
  ) {
    return dateKey.replace(
      "monthly:",
      ""
    );
  }

  if (
    dateKey.startsWith("custom:")
  ) {
    return dateKey.replace(
      "custom:",
      ""
    );
  }

  /*
   * Compatibilidad con registros
   * antiguos cuyo dateKey era
   * solamente YYYY-MM-DD.
   */
  return dateKey;
}

function getProgressText(
  record: HabitRecord
) {
  const trackingType =
    record.trackingType ??
    "binary";

  if (
    trackingType === "binary"
  ) {
    return record.completed
      ? "1 / 1"
      : "0 / 1";
  }

  const currentValue =
    record.currentValue ?? 0;

  const targetValue =
    record.targetValue ?? 0;

  const unit =
    record.unit?.trim();

  const values =
    `${currentValue} / ${targetValue}`;

  return unit
    ? `${values} ${unit}`
    : values;
}

function formatCompletedAt(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-HN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function StatisticsPage() {
  const [
    historyItems,
    setHistoryItems,
  ] =
    useState<
      HabitHistoryItem[]
    >([]);

  const [
    selectedHabitId,
    setSelectedHabitId,
  ] =
    useState("all");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const loadStatistics =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const habits =
          await getHabits();

        const items =
          await Promise.all(
            habits.map(
              async (habit) => {
                const records =
                  await getHabitHistory(
                    habit._id
                  );

                return {
                  habit,
                  records,
                };
              }
            )
          );

        setHistoryItems(
          items
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las estadísticas"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const allRecords =
    useMemo(() => {
      return historyItems.flatMap(
        (item) =>
          item.records.map(
            (record) => ({
              habit:
                item.habit,
              record,
            })
          )
      );
    }, [historyItems]);

  const filteredRecords =
    useMemo(() => {
      const records =
        selectedHabitId === "all"
          ? allRecords
          : allRecords.filter(
              (item) =>
                item.habit._id ===
                selectedHabitId
            );

      return [...records].sort(
        (a, b) => {
          const firstDate =
            new Date(
              a.record.date
            ).getTime();

          const secondDate =
            new Date(
              b.record.date
            ).getTime();

          return (
            secondDate -
            firstDate
          );
        }
      );
    }, [
      allRecords,
      selectedHabitId,
    ]);

  const completedPeriods =
    filteredRecords.filter(
      (item) =>
        item.record.completed
    ).length;

  const totalPeriods =
    filteredRecords.length;

  const compliance =
    totalPeriods === 0
      ? 0
      : Math.round(
          (
            completedPeriods /
            totalPeriods
          ) * 100
        );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
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
          Estadísticas
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Revisa tu cumplimiento y
          el historial de tus hábitos.
        </Typography>
      </Box>

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

      <FormControl
        sx={{
          maxWidth: 320,
        }}
      >
        <InputLabel id="habit-filter-label">
          Hábito
        </InputLabel>

        <Select
          labelId="habit-filter-label"
          label="Hábito"
          value={
            selectedHabitId
          }
          onChange={(
            event
          ) =>
            setSelectedHabitId(
              event.target.value
            )
          }
        >
          <MenuItem value="all">
            Todos los hábitos
          </MenuItem>

          {historyItems.map(
            (item) => (
              <MenuItem
                key={
                  item.habit._id
                }
                value={
                  item.habit._id
                }
              >
                {
                  item.habit.name
                }
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            {
              xs: "1fr",
              sm:
                "repeat(3, 1fr)",
            },

          gap: 2,
        }}
      >
        <Card
          variant="outlined"
        >
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Períodos registrados
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {totalPeriods}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
        >
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Períodos completados
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {completedPeriods}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
        >
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Cumplimiento
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {compliance}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card
        variant="outlined"
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
            >
              Historial
            </Typography>

            {filteredRecords.length ===
            0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign:
                    "center",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  Todavía no hay
                  períodos registrados.
                </Typography>
              </Box>
            ) : (
              <>
                {/*
                 * Escritorio
                 */}
                <TableContainer
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          Hábito
                        </TableCell>

                        <TableCell>
                          Período
                        </TableCell>

                        <TableCell>
                          Frecuencia
                        </TableCell>

                        <TableCell>
                          Progreso
                        </TableCell>

                        <TableCell>
                          Estado
                        </TableCell>

                        <TableCell>
                          Completado
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredRecords.map(
                        ({
                          habit,
                          record,
                        }) => (
                          <TableRow
                            key={
                              record._id
                            }
                            hover
                          >
                            <TableCell>
                              {
                                habit.name
                              }
                            </TableCell>

                            <TableCell>
                              {getPeriodLabel(
                                record
                              )}
                            </TableCell>

                            <TableCell>
                              {getFrequencyLabel(
                                record
                              )}
                            </TableCell>

                            <TableCell>
                              {getProgressText(
                                record
                              )}
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={
                                  record.completed
                                    ? "Completado"
                                    : "Pendiente"
                                }
                                color={
                                  record.completed
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              {formatCompletedAt(
                                record.completedAt
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/*
                 * Móvil
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
                  {filteredRecords.map(
                    ({
                      habit,
                      record,
                    }) => (
                      <Card
                        key={
                          record._id
                        }
                        variant="outlined"
                      >
                        <CardContent>
                          <Stack
                            spacing={1}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                justifyContent:
                                  "space-between",

                                alignItems:
                                  "flex-start",
                              }}
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

                              <Chip
                                label={
                                  record.completed
                                    ? "Completado"
                                    : "Pendiente"
                                }
                                color={
                                  record.completed
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                                variant="outlined"
                              />
                            </Stack>

                            <Typography
                              variant="body2"
                            >
                              <strong>
                                Período:
                              </strong>{" "}
                              {getPeriodLabel(
                                record
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                            >
                              <strong>
                                Frecuencia:
                              </strong>{" "}
                              {getFrequencyLabel(
                                record
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                            >
                              <strong>
                                Progreso:
                              </strong>{" "}
                              {getProgressText(
                                record
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Completado:{" "}
                              {formatCompletedAt(
                                record.completedAt
                              )}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    )
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}