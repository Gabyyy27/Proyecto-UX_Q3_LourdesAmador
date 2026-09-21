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
  StatisticsComplianceTrend,
} from "@/services/statistics.service";

type StatisticsComplianceTrendChartProps = {
  data:
    | StatisticsComplianceTrend
    | null;
};

export function StatisticsComplianceTrendChart({
  data,
}: StatisticsComplianceTrendChartProps) {
  /*
   * Si todavía no existe un año
   * concreto seleccionado, no hay
   * una tendencia anual que mostrar.
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
                Tendencia de cumplimiento
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                }}
              >
                Evolución mensual del
                cumplimiento durante un
                año.
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
                Selecciona un año para
                visualizar la tendencia
                de cumplimiento.
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
        point.compliance,
    );

  const hasData =
    data.points.some(
      (point) =>
        point.compliance !==
        null,
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
              Tendencia de cumplimiento
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              {data.year} · porcentaje de
              períodos completados por mes.
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
                disponibles para este año.
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
                      "Cumplimiento",

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
              Los meses sin registros se
              muestran sin valor y no se
              consideran como 0% de
              cumplimiento.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}