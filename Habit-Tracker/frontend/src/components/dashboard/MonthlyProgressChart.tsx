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
  MonthlyProgressResponse,
} from "@/services/habit-records.service";

type MonthlyProgressChartProps = {
  data: MonthlyProgressResponse;
};

export function MonthlyProgressChart({
  data,
}: MonthlyProgressChartProps) {
  /*
   * Una semana con percentage = null
   * todavía no tiene información
   * medible.
   */
  const hasMeasurableData =
    data.points.some(
      (point) =>
        point.percentage !==
        null
    );

  const labels:
    string[] =
    data.points.map(
      (point) =>
        point.label
    );

  const chartValues:
    Array<number | null> =
    data.points.map(
      (point) =>
        point.percentage
    );

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
              Tendencia semanal de tu
              cumplimiento durante el
              mes actual.
            </Typography>
          </Box>

          {!hasMeasurableData ? (
            <Box
              sx={{
                minHeight: 240,

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
                Todavía no hay datos
                suficientes para mostrar
                tu progreso mensual.
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
                          number
                      ) =>
                        `${value}%`,
                  },
                ]}
                series={[
                  {
                    label:
                      "Cumplimiento",

                    data:
                      chartValues,

                    valueFormatter:
                      (
                        value:
                          number | null
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

          {hasMeasurableData ? (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Cada punto representa el
              promedio de cumplimiento de
              una semana del mes. Las
              semanas futuras no se
              contabilizan.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}