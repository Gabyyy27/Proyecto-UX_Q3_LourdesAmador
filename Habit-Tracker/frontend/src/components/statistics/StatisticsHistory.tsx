"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type {
  HabitRecord,
} from "@/services/habit-records.service";

import type {
  StatisticsRecordItem,
} from "@/services/statistics.service";

type StatisticsHistoryProps = {
  records: StatisticsRecordItem[];
};

function getFrequencyLabel(
  record: HabitRecord,
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
  record: HabitRecord,
) {
  const dateKey =
    record.dateKey ?? "";

  if (
    dateKey.startsWith(
      "daily:",
    )
  ) {
    return dateKey.replace(
      "daily:",
      "",
    );
  }

  if (
    dateKey.startsWith(
      "weekly:",
    )
  ) {
    return dateKey
      .replace(
        "weekly:",
        "",
      )
      .replace(
        "-W",
        " · Semana ",
      );
  }

  if (
    dateKey.startsWith(
      "monthly:",
    )
  ) {
    return dateKey.replace(
      "monthly:",
      "",
    );
  }

  if (
    dateKey.startsWith(
      "custom:",
    )
  ) {
    return dateKey.replace(
      "custom:",
      "",
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
  record: HabitRecord,
) {
  const trackingType =
    record.trackingType ??
    "binary";

  if (
    trackingType ===
    "binary"
  ) {
    return record.completed
      ? "1 / 1"
      : "0 / 1";
  }

  const currentValue =
    record.currentValue ??
    0;

  const targetValue =
    record.targetValue ??
    0;

  const unit =
    record.unit?.trim();

  const values =
    `${currentValue} / ${targetValue}`;

  return unit
    ? `${values} ${unit}`
    : values;
}

function formatCompletedAt(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-HN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

export function StatisticsHistory({
  records,
}: StatisticsHistoryProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Historial
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              Registros de progreso de
              tus hábitos.
            </Typography>
          </Box>

          {records.length ===
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
               * ESCRITORIO
               */}
              <TableContainer
                sx={{
                  display: {
                    xs: "none",

                    md:
                      "block",
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
                    {records.map(
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
                              record,
                            )}
                          </TableCell>

                          <TableCell>
                            {getFrequencyLabel(
                              record,
                            )}
                          </TableCell>

                          <TableCell>
                            {getProgressText(
                              record,
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
                              record.completedAt,
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/*
               * MÓVIL
               */}
              <Stack
                spacing={2}
                sx={{
                  display: {
                    xs: "flex",

                    md:
                      "none",
                  },
                }}
              >
                {records.map(
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

                                minWidth: 0,

                                wordBreak:
                                  "break-word",
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
                              sx={{
                                flexShrink: 0,

                                ml: 1,
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="body2"
                          >
                            <strong>
                              Período:
                            </strong>{" "}
                            {getPeriodLabel(
                              record,
                            )}
                          </Typography>

                          <Typography
                            variant="body2"
                          >
                            <strong>
                              Frecuencia:
                            </strong>{" "}
                            {getFrequencyLabel(
                              record,
                            )}
                          </Typography>

                          <Typography
                            variant="body2"
                          >
                            <strong>
                              Progreso:
                            </strong>{" "}
                            {getProgressText(
                              record,
                            )}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Completado:{" "}
                            {formatCompletedAt(
                              record.completedAt,
                            )}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ),
                )}
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}