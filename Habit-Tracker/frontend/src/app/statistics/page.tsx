"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StatCard,
} from "@/components/dashboard/StatCard";

import {
  StatisticsComplianceTrendChart,
} from "@/components/statistics/StatisticsComplianceTrendChart";

import {
  StatisticsFilters,
} from "@/components/statistics/StatisticsFilters";

import {
  StatisticsHistory,
} from "@/components/statistics/StatisticsHistory";

import {
  StatisticsMonthlyProgressChart,
} from "@/components/statistics/StatisticsMonthlyProgressChart";

import {
  getFilteredStatisticsRecords,
  getStatisticsAvailableYears,
  getStatisticsComplianceTrend,
  getStatisticsData,
  getStatisticsMonthlyProgress,
  getStatisticsOverview,
  getStatisticsSummary,
  type HabitHistoryItem,
  type StatisticsOverview,
} from "@/services/statistics.service";

const INITIAL_OVERVIEW:
  StatisticsOverview = {
    totalHabits: 0,
    activeHabits: 0,
    finishedHabits: 0,
    consecutiveDays: 0,
  };

const STATISTICS_TIMEZONE =
  "America/Tegucigalpa";

/*
 * Obtiene el mes y año actuales
 * usando la misma zona horaria
 * que estamos utilizando para
 * las estadísticas.
 */
function getCurrentPeriod() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          STATISTICS_TIMEZONE,

        year: "numeric",
        month: "2-digit",
      },
    );

  const parts =
    formatter.formatToParts(
      new Date(),
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "";

  return {
    year,
    month,
  };
}

const CURRENT_PERIOD =
  getCurrentPeriod();

export default function StatisticsPage() {
  const [
    historyItems,
    setHistoryItems,
  ] =
    useState<
      HabitHistoryItem[]
    >([]);

  const [
    overview,
    setOverview,
  ] =
    useState<StatisticsOverview>(
      INITIAL_OVERVIEW,
    );

  const [
    selectedHabitId,
    setSelectedHabitId,
  ] =
    useState("all");

  /*
   * Por defecto mostramos
   * el mes actual.
   */
  const [
    selectedMonth,
    setSelectedMonth,
  ] =
    useState(
      CURRENT_PERIOD.month,
    );

  /*
   * Por defecto mostramos
   * el año actual.
   */
  const [
    selectedYear,
    setSelectedYear,
  ] =
    useState(
      CURRENT_PERIOD.year,
    );

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

  /*
   * Carga los datos generales
   * necesarios para Estadísticas.
   */
  const loadStatistics =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const data =
            await getStatisticsData();

          const overviewData =
            await getStatisticsOverview(
              data,
            );

          setHistoryItems(
            data,
          );

          setOverview(
            overviewData,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar las estadísticas",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  /*
   * Hábitos disponibles para
   * el selector.
   */
  const habits =
    useMemo(
      () =>
        historyItems.map(
          (item) =>
            item.habit,
        ),
      [historyItems],
    );

  /*
   * Años encontrados realmente
   * dentro del historial.
   *
   * También incluimos el año actual
   * para evitar que el Select tenga
   * un valor que no exista todavía
   * si aún no hay registros.
   */
  const availableYears =
    useMemo(
      () => {
        const years =
          getStatisticsAvailableYears(
            historyItems,
          );

        const currentYear =
          Number(
            CURRENT_PERIOD.year,
          );

        if (
          Number.isFinite(
            currentYear,
          ) &&
          !years.includes(
            currentYear,
          )
        ) {
          return [
            currentYear,
            ...years,
          ].sort(
            (
              first,
              second,
            ) =>
              second -
              first,
          );
        }

        return years;
      },
      [historyItems],
    );

  /*
   * Registros filtrados por:
   *
   * - hábito
   * - mes
   * - año
   */
  const filteredRecords =
    useMemo(
      () =>
        getFilteredStatisticsRecords(
          historyItems,
          selectedHabitId,
          selectedMonth,
          selectedYear,
        ),
      [
        historyItems,
        selectedHabitId,
        selectedMonth,
        selectedYear,
      ],
    );

  /*
   * Métricas correspondientes
   * al período filtrado.
   */
  const summary =
    useMemo(
      () =>
        getStatisticsSummary(
          filteredRecords,
        ),
      [filteredRecords],
    );

  /*
   * PROGRESO MENSUAL
   *
   * Utiliza:
   *
   * - hábito seleccionado
   * - mes seleccionado
   * - año seleccionado
   */
  const monthlyProgress =
    useMemo(
      () =>
        getStatisticsMonthlyProgress(
          filteredRecords,
          selectedMonth,
          selectedYear,
        ),
      [
        filteredRecords,
        selectedMonth,
        selectedYear,
      ],
    );

  /*
   * TENDENCIA DE CUMPLIMIENTO
   *
   * Utiliza:
   *
   * - hábito seleccionado
   * - año seleccionado
   *
   * Ignora el filtro de mes porque
   * compara todos los meses del año.
   */
  const complianceTrend =
    useMemo(
      () =>
        getStatisticsComplianceTrend(
          historyItems,
          selectedHabitId,
          selectedYear,
        ),
      [
        historyItems,
        selectedHabitId,
        selectedYear,
      ],
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
          Estadísticas
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Analiza tu actividad,
          cumplimiento y progreso
          histórico.
        </Typography>
      </Box>

      {/*
       * ERROR
       */}
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

      {/*
       * RESUMEN GENERAL
       */}
      <Stack spacing={1.5}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Resumen general
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Estado general de tus
            hábitos y racha actual.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm:
                "repeat(2, minmax(0, 1fr))",

              lg:
                "repeat(4, minmax(0, 1fr))",
            },

            gap: 2,
          }}
        >
          <StatCard
            label="Total de hábitos"
            value={
              overview.totalHabits
            }
          />

          <StatCard
            label="Hábitos activos"
            value={
              overview.activeHabits
            }
          />

          <StatCard
            label="Hábitos finalizados"
            value={
              overview.finishedHabits
            }
          />

          <StatCard
            label="Días consecutivos"
            value={
              overview.consecutiveDays
            }
          />
        </Box>
      </Stack>

      {/*
       * ANÁLISIS HISTÓRICO
       */}
      <Stack spacing={1.5}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Análisis histórico
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Filtra los registros por
            hábito, mes y año.
          </Typography>
        </Box>

        <StatisticsFilters
          habits={
            habits
          }
          selectedHabitId={
            selectedHabitId
          }
          selectedMonth={
            selectedMonth
          }
          selectedYear={
            selectedYear
          }
          years={
            availableYears
          }
          onHabitChange={
            setSelectedHabitId
          }
          onMonthChange={
            setSelectedMonth
          }
          onYearChange={
            setSelectedYear
          }
        />
      </Stack>

      {/*
       * MÉTRICAS DEL PERÍODO
       */}
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm:
              "repeat(3, minmax(0, 1fr))",
          },

          gap: 2,
        }}
      >
        <StatCard
          label="Períodos registrados"
          value={
            summary.totalPeriods
          }
        />

        <StatCard
          label="Períodos completados"
          value={
            summary.completedPeriods
          }
        />

        <StatCard
          label="Cumplimiento"
          value={`${summary.compliance}%`}
        />
      </Box>

      {/*
       * GRÁFICAS
       */}
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            lg:
              "repeat(2, minmax(0, 1fr))",
          },

          gap: 2,

          alignItems:
            "stretch",

          "& > *": {
            minWidth: 0,
          },
        }}
      >
        <StatisticsMonthlyProgressChart
          data={
            monthlyProgress
          }
        />

        <StatisticsComplianceTrendChart
          data={
            complianceTrend
          }
        />
      </Box>

      {/*
       * HISTORIAL FILTRADO
       */}
      <StatisticsHistory
        records={
          filteredRecords
        }
      />
    </Stack>
  );
}