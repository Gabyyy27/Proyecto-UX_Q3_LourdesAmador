"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import {
  LineChart,
} from "@mui/x-charts/LineChart";

import type {
  StatisticsMonthlyProgress,
} from "@/services/statistics.service";

type StatisticsMonthlyProgressChartProps = {
  data:
    | StatisticsMonthlyProgress
    | null;
};

const MONTH_LABELS: Record<
  string,
  string
> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

export function StatisticsMonthlyProgressChart({
  data,
}: StatisticsMonthlyProgressChartProps) {
  /*
   * Si todavía no se seleccionó
   * un mes y un año concretos,
   * no existe un único mes que
   * podamos representar.
   */
  if (!data) {
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
                Progreso mensual
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                }}
              >
                Evolución semanal del
                progreso durante el mes
                seleccionado.
              </Typography>
            </Box>

            <Box
              sx={{
                minHeight: 260,

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                textAlign:
                  "center",

                px: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Selecciona un mes y un
                año para visualizar el
                progreso mensual.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const labels =
    data.points.map(
      (point) =>
        point.label,
    );

  const chartValues:
    Array<number | null> =
    data.points.map(
      (point) =>
        point.percentage,
    );

  const hasData =
    data.points.some(
      (point) =>
        point.percentage !==
        null,
    );

  const monthLabel =
    MONTH_LABELS[
      data.month
    ] ?? data.month;

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
              Progreso mensual
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              {monthLabel}{" "}
              {data.year} · evolución
              semanal del progreso.
            </Typography>
          </Box>

          {!hasData ? (
            <Box
              sx={{
                minHeight: 260,

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                textAlign:
                  "center",

                px: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No hay registros
                disponibles para este
                período.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",

                minWidth: 0,

                overflowX:
                  "hidden",
              }}
            >
              <LineChart
                height={300}
                xAxis={[
                  {
                    scaleType:
                      "point",

                    data:
                      labels,
                  },
                ]}
                yAxis={[
                  {
                    min: 0,

                    max: 100,

                    valueFormatter:
                      (
                        value:
                          number,
                      ) =>
                        `${value}%`,
                  },
                ]}
                series={[
                  {
                    label:
                      "Progreso",

                    data:
                      chartValues,

                    valueFormatter:
                      (
                        value:
                          number | null,
                      ) =>
                        value ===
                        null
                          ? "Sin datos"
                          : `${value}%`,

                    showMark: true,

                    curve:
                      "linear",
                  },
                ]}
                grid={{
                  horizontal: true,
                }}
                margin={{
                  left: 45,

                  right: 20,

                  top: 20,

                  bottom: 30,
                }}
              />
            </Box>
          )}

          {hasData ? (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Cada punto representa el
              promedio de progreso de
              los períodos registrados
              durante esa semana.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}