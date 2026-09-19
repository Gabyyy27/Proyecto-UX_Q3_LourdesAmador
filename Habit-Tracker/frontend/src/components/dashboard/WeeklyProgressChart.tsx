"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import {
  BarChart,
} from "@mui/x-charts/BarChart";

import type {
  WeeklyProgressResponse,
} from "@/services/habit-records.service";

type WeeklyProgressChartProps = {
  data: WeeklyProgressResponse;
};

export function WeeklyProgressChart({
  data,
}: WeeklyProgressChartProps) {
  const hasScheduledHabits =
    data.points.some(
      (point) =>
        point.scheduledHabits >
        0
    );

  const chartValues =
    data.points.map(
      (point) =>
        point.percentage
    );

  const labels =
    data.points.map(
      (point) =>
        point.label
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
              Progreso semanal
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              Cumplimiento de tus
              hábitos diarios y
              personalizados durante
              la semana actual.
            </Typography>
          </Box>

          {!hasScheduledHabits ? (
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
                Todavía no hay hábitos
                diarios o personalizados
                programados para esta
                semana.
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
              <BarChart
                height={300}
                xAxis={[
                  {
                    scaleType:
                      "band",

                    data: labels,
                  },
                ]}
                yAxis={[
                  {
                    min: 0,

                    max: 100,

                    valueFormatter:
                      (value) =>
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
                      (value) =>
                        value ===
                        null
                          ? "Sin datos"
                          : `${value}%`,
                  },
                ]}
                margin={{
                  left: 45,

                  right: 20,

                  top: 20,

                  bottom: 30,
                }}
              />
            </Box>
          )}

          {hasScheduledHabits ? (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Los días futuros o sin
              hábitos programados no se
              contabilizan como
              incumplimiento.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}