import {
  getDailyStreak,
  getHabitHistory,
  type HabitRecord,
} from "@/services/habit-records.service";

import {
  getHabits,
} from "@/services/habits.service";

import type {
  Habit,
} from "@/types/habit";

export type HabitHistoryItem = {
  habit: Habit;
  records: HabitRecord[];
};

export type StatisticsRecordItem = {
  habit: Habit;
  record: HabitRecord;
};

export type StatisticsSummary = {
  totalPeriods: number;
  completedPeriods: number;
  compliance: number;
};

export type StatisticsOverview = {
  totalHabits: number;
  activeHabits: number;
  finishedHabits: number;
  consecutiveDays: number;
};

export type StatisticsMonthlyProgressPoint = {
  label: string;

  percentage: number | null;

  weekStart: string;

  weekEnd: string;

  totalPeriods: number;

  completedPeriods: number;
};

export type StatisticsMonthlyProgress = {
  year: string;

  month: string;

  points:
    StatisticsMonthlyProgressPoint[];
};
export type StatisticsComplianceTrendPoint = {
  month: string;

  label: string;

  compliance: number | null;

  totalPeriods: number;

  completedPeriods: number;
};

export type StatisticsComplianceTrend = {
  year: string;

  points:
    StatisticsComplianceTrendPoint[];
};
type RecordDateParts = {
  year: string;
  month: string;
};

const STATISTICS_TIMEZONE =
  "America/Tegucigalpa";

/*
 * Obtiene la fecha calendario
 * actual en la zona horaria
 * utilizada por la aplicación.
 */
function getCurrentDateKey() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          STATISTICS_TIMEZONE,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
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
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value;

  return `${year}-${month}-${day}`;
}

/*
 * Convierte una fecha calendario
 * en YYYY-MM-DD.
 */
function formatCalendarDate(
  date: Date,
) {
  const year =
    date.getUTCFullYear();

  const month =
    String(
      date.getUTCMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getUTCDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

/*
 * Convierte una semana ISO:
 *
 * weekly:2026-W38
 *
 * en la fecha correspondiente
 * al lunes de esa semana.
 */
function getIsoWeekStart(
  year: number,
  week: number,
): Date {
  const januaryFourth =
    new Date(
      Date.UTC(
        year,
        0,
        4,
      ),
    );

  const januaryFourthWeekday =
    januaryFourth.getUTCDay() ||
    7;

  const firstMonday =
    new Date(
      januaryFourth.getTime(),
    );

  firstMonday.setUTCDate(
    januaryFourth.getUTCDate() -
      januaryFourthWeekday +
      1,
  );

  const weekStart =
    new Date(
      firstMonday.getTime(),
    );

  weekStart.setUTCDate(
    firstMonday.getUTCDate() +
      (week - 1) * 7,
  );

  return weekStart;
}

/*
 * Obtiene el año y mes lógico
 * de un registro.
 */
function getRecordDateParts(
  record: HabitRecord,
): RecordDateParts | null {
  const dateKey =
    record.dateKey ?? "";

  /*
   * DAILY
   *
   * daily:2026-09-19
   */
  const dailyMatch =
    dateKey.match(
      /^daily:(\d{4})-(\d{2})-\d{2}$/,
    );

  if (dailyMatch) {
    return {
      year: dailyMatch[1],
      month: dailyMatch[2],
    };
  }

  /*
   * CUSTOM
   *
   * custom:2026-09-19
   */
  const customMatch =
    dateKey.match(
      /^custom:(\d{4})-(\d{2})-\d{2}$/,
    );

  if (customMatch) {
    return {
      year: customMatch[1],
      month: customMatch[2],
    };
  }

  /*
   * MONTHLY
   *
   * monthly:2026-09
   */
  const monthlyMatch =
    dateKey.match(
      /^monthly:(\d{4})-(\d{2})$/,
    );

  if (monthlyMatch) {
    return {
      year: monthlyMatch[1],
      month: monthlyMatch[2],
    };
  }

  /*
   * WEEKLY
   *
   * weekly:2026-W38
   */
  const weeklyMatch =
    dateKey.match(
      /^weekly:(\d{4})-W(\d{2})$/,
    );

  if (weeklyMatch) {
    const year =
      Number(
        weeklyMatch[1],
      );

    const week =
      Number(
        weeklyMatch[2],
      );

    const weekStart =
      getIsoWeekStart(
        year,
        week,
      );

    return {
      year: String(
        weekStart.getUTCFullYear(),
      ),

      month: String(
        weekStart.getUTCMonth() +
          1,
      ).padStart(
        2,
        "0",
      ),
    };
  }

  /*
   * Formato antiguo:
   *
   * 2026-09-19
   */
  const legacyMatch =
    dateKey.match(
      /^(\d{4})-(\d{2})-\d{2}$/,
    );

  if (legacyMatch) {
    return {
      year: legacyMatch[1],
      month: legacyMatch[2],
    };
  }

  /*
   * Último respaldo:
   * fecha física del registro.
   */
  const fallbackDate =
    new Date(
      record.date,
    );

  if (
    Number.isNaN(
      fallbackDate.getTime(),
    )
  ) {
    return null;
  }

  return {
    year: String(
      fallbackDate.getFullYear(),
    ),

    month: String(
      fallbackDate.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    ),
  };
}

/*
 * Obtiene una fecha calendario
 * representativa del período.
 *
 * DAILY / CUSTOM
 * → fecha exacta.
 *
 * WEEKLY
 * → lunes de la semana.
 *
 * MONTHLY
 * → primer día del mes.
 */
function getRecordCalendarDate(
  record: HabitRecord,
): Date | null {
  const dateKey =
    record.dateKey ?? "";

  /*
   * DAILY
   */
  const dailyMatch =
    dateKey.match(
      /^daily:(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (dailyMatch) {
    return new Date(
      Date.UTC(
        Number(
          dailyMatch[1],
        ),

        Number(
          dailyMatch[2],
        ) - 1,

        Number(
          dailyMatch[3],
        ),
      ),
    );
  }

  /*
   * CUSTOM
   */
  const customMatch =
    dateKey.match(
      /^custom:(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (customMatch) {
    return new Date(
      Date.UTC(
        Number(
          customMatch[1],
        ),

        Number(
          customMatch[2],
        ) - 1,

        Number(
          customMatch[3],
        ),
      ),
    );
  }

  /*
   * WEEKLY
   */
  const weeklyMatch =
    dateKey.match(
      /^weekly:(\d{4})-W(\d{2})$/,
    );

  if (weeklyMatch) {
    return getIsoWeekStart(
      Number(
        weeklyMatch[1],
      ),

      Number(
        weeklyMatch[2],
      ),
    );
  }

  /*
   * MONTHLY
   */
  const monthlyMatch =
    dateKey.match(
      /^monthly:(\d{4})-(\d{2})$/,
    );

  if (monthlyMatch) {
    return new Date(
      Date.UTC(
        Number(
          monthlyMatch[1],
        ),

        Number(
          monthlyMatch[2],
        ) - 1,

        1,
      ),
    );
  }

  /*
   * Formato antiguo:
   *
   * YYYY-MM-DD
   */
  const legacyMatch =
    dateKey.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (legacyMatch) {
    return new Date(
      Date.UTC(
        Number(
          legacyMatch[1],
        ),

        Number(
          legacyMatch[2],
        ) - 1,

        Number(
          legacyMatch[3],
        ),
      ),
    );
  }

  /*
   * Último respaldo.
   */
  const fallbackDate =
    new Date(
      record.date,
    );

  if (
    Number.isNaN(
      fallbackDate.getTime(),
    )
  ) {
    return null;
  }

  return new Date(
    Date.UTC(
      fallbackDate.getUTCFullYear(),
      fallbackDate.getUTCMonth(),
      fallbackDate.getUTCDate(),
    ),
  );
}

/*
 * Convierte un registro en un
 * porcentaje de progreso.
 *
 * BINARIO:
 *
 * pendiente   -> 0%
 * completado  -> 100%
 *
 * CANTIDAD:
 *
 * también reconoce progreso
 * parcial antes de completar.
 */
function getRecordProgressPercentage(
  record: HabitRecord,
) {
  if (record.completed) {
    return 100;
  }

  const trackingType =
    record.trackingType ??
    "binary";

  if (
    trackingType !==
    "quantity"
  ) {
    return 0;
  }

  const currentValue =
    record.currentValue ??
    0;

  const targetValue =
    record.targetValue ??
    0;

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
      ) * 100,
    ),
  );
}

/*
 * Carga todos los hábitos y
 * sus registros históricos.
 */
export async function getStatisticsData():
  Promise<HabitHistoryItem[]> {
  const habits =
    await getHabits();

  const items =
    await Promise.all(
      habits.map(
        async (habit) => {
          const records =
            await getHabitHistory(
              habit._id,
            );

          return {
            habit,
            records,
          };
        },
      ),
    );

  return items;
}

/*
 * Métricas generales de hábitos.
 *
 * Aquí reutilizamos la racha diaria
 * calculada por el backend.
 */
export async function getStatisticsOverview(
  historyItems: HabitHistoryItem[],
): Promise<StatisticsOverview> {
  const habits =
    historyItems.map(
      (item) =>
        item.habit,
    );

  const dailyStreak =
    await getDailyStreak();

  const today =
    getCurrentDateKey();

  /*
   * Un hábito se considera finalizado
   * cuando tiene endDate y esa fecha
   * ya quedó en el pasado.
   */
  const finishedHabits =
    habits.filter(
      (habit) => {
        if (!habit.endDate) {
          return false;
        }

        const endDate =
          habit.endDate.slice(
            0,
            10,
          );

        return (
          endDate <
          today
        );
      },
    ).length;

  /*
   * Activo significa:
   *
   * - active === true
   * - todavía no terminó por fecha
   */
  const activeHabits =
    habits.filter(
      (habit) => {
        if (!habit.active) {
          return false;
        }

        if (!habit.endDate) {
          return true;
        }

        const endDate =
          habit.endDate.slice(
            0,
            10,
          );

        return (
          endDate >=
          today
        );
      },
    ).length;

  return {
    totalHabits:
      habits.length,

    activeHabits,

    finishedHabits,

    consecutiveDays:
      dailyStreak.currentStreak,
  };
}

/*
 * Convierte los historiales en
 * una única lista de registros.
 */
export function flattenStatisticsRecords(
  historyItems: HabitHistoryItem[],
): StatisticsRecordItem[] {
  return historyItems.flatMap(
    (item) =>
      item.records.map(
        (record) => ({
          habit:
            item.habit,

          record,
        }),
      ),
  );
}

/*
 * Obtiene automáticamente todos
 * los años disponibles.
 */
export function getStatisticsAvailableYears(
  historyItems: HabitHistoryItem[],
): number[] {
  const years =
    new Set<number>();

  const records =
    flattenStatisticsRecords(
      historyItems,
    );

  for (
    const item of records
  ) {
    const dateParts =
      getRecordDateParts(
        item.record,
      );

    if (!dateParts) {
      continue;
    }

    const year =
      Number(
        dateParts.year,
      );

    if (
      Number.isFinite(
        year,
      )
    ) {
      years.add(
        year,
      );
    }
  }

  return Array.from(
    years,
  ).sort(
    (first, second) =>
      second - first,
  );
}

/*
 * Filtra por:
 *
 * - hábito
 * - mes
 * - año
 */
export function getFilteredStatisticsRecords(
  historyItems: HabitHistoryItem[],
  selectedHabitId: string,
  selectedMonth = "all",
  selectedYear = "all",
): StatisticsRecordItem[] {
  const allRecords =
    flattenStatisticsRecords(
      historyItems,
    );

  const filteredRecords =
    allRecords.filter(
      (item) => {
        /*
         * FILTRO POR HÁBITO
         */
        if (
          selectedHabitId !==
            "all" &&
          item.habit._id !==
            selectedHabitId
        ) {
          return false;
        }

        const dateParts =
          getRecordDateParts(
            item.record,
          );

        /*
         * Sin filtro temporal,
         * mantenemos el registro.
         */
        if (
          selectedMonth ===
            "all" &&
          selectedYear ===
            "all"
        ) {
          return true;
        }

        if (!dateParts) {
          return false;
        }

        /*
         * FILTRO POR MES
         */
        if (
          selectedMonth !==
            "all" &&
          dateParts.month !==
            selectedMonth
        ) {
          return false;
        }

        /*
         * FILTRO POR AÑO
         */
        if (
          selectedYear !==
            "all" &&
          dateParts.year !==
            selectedYear
        ) {
          return false;
        }

        return true;
      },
    );

  return [
    ...filteredRecords,
  ].sort(
    (
      first,
      second,
    ) => {
      const firstDate =
        new Date(
          first.record.date,
        ).getTime();

      const secondDate =
        new Date(
          second.record.date,
        ).getTime();

      return (
        secondDate -
        firstDate
      );
    },
  );
}

/*
 * Calcula las métricas del
 * conjunto actualmente filtrado.
 */
export function getStatisticsSummary(
  records: StatisticsRecordItem[],
): StatisticsSummary {
  const totalPeriods =
    records.length;

  const completedPeriods =
    records.filter(
      (item) =>
        item.record.completed,
    ).length;

  const compliance =
    totalPeriods === 0
      ? 0
      : Math.round(
          (
            completedPeriods /
            totalPeriods
          ) * 100,
        );

  return {
    totalPeriods,
    completedPeriods,
    compliance,
  };
}

/*
 * PROGRESO MENSUAL HISTÓRICO
 *
 * Agrupa los registros de un
 * mes concreto por semanas de
 * calendario.
 *
 * Ejemplo:
 *
 * Sem 1
 * Sem 2
 * Sem 3
 * Sem 4
 * Sem 5
 *
 * La primera y última semana
 * pueden estar incompletas porque
 * se recortan al mes seleccionado.
 */
export function getStatisticsMonthlyProgress(
  records: StatisticsRecordItem[],
  selectedMonth: string,
  selectedYear: string,
): StatisticsMonthlyProgress | null {
  /*
   * Para construir una gráfica
   * mensual necesitamos saber
   * exactamente qué mes y año
   * se quieren analizar.
   *
   * Si alguno está en "all",
   * todavía no existe un único
   * mes que podamos representar.
   */
  if (
    selectedMonth === "all" ||
    selectedYear === "all"
  ) {
    return null;
  }

  const year =
    Number(
      selectedYear,
    );

  const month =
    Number(
      selectedMonth,
    );

  if (
    !Number.isInteger(
      year,
    ) ||
    !Number.isInteger(
      month,
    ) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  const normalizedMonth =
    String(
      month,
    ).padStart(
      2,
      "0",
    );

  const monthStart =
    new Date(
      Date.UTC(
        year,
        month - 1,
        1,
      ),
    );

  const monthEnd =
    new Date(
      Date.UTC(
        year,
        month,
        0,
      ),
    );

  /*
   * Aunque normalmente recibiremos
   * filteredRecords desde page.tsx,
   * volvemos a comprobar mes/año
   * para que esta función sea segura
   * y reutilizable por sí sola.
   */
  const monthRecords =
    records.filter(
      (item) => {
        const dateParts =
          getRecordDateParts(
            item.record,
          );

        if (!dateParts) {
          return false;
        }

        return (
          dateParts.year ===
            String(year) &&
          dateParts.month ===
            normalizedMonth
        );
      },
    );

  const points:
    StatisticsMonthlyProgressPoint[] =
    [];

  let weekNumber =
    1;

  let weekCursor =
    new Date(
      monthStart.getTime(),
    );

  while (
    weekCursor.getTime() <=
    monthEnd.getTime()
  ) {
    const weekStart =
      new Date(
        weekCursor.getTime(),
      );

    /*
     * Domingo = 0.
     *
     * Con || 7 convertimos domingo
     * en 7 para trabajar con semanas
     * lunes-domingo.
     */
    const weekday =
      weekStart.getUTCDay() ||
      7;

    const daysUntilSunday =
      7 -
      weekday;

    const naturalWeekEnd =
      new Date(
        weekStart.getTime(),
      );

    naturalWeekEnd.setUTCDate(
      naturalWeekEnd.getUTCDate() +
        daysUntilSunday,
    );

    /*
     * La última semana se recorta
     * al último día real del mes.
     */
    const weekEnd =
      naturalWeekEnd.getTime() >
      monthEnd.getTime()
        ? new Date(
            monthEnd.getTime(),
          )
        : naturalWeekEnd;

    /*
     * Registros cuyo período lógico
     * pertenece a esta semana.
     */
    const weekRecords =
      monthRecords.filter(
        (item) => {
          const recordDate =
            getRecordCalendarDate(
              item.record,
            );

          if (!recordDate) {
            return false;
          }

          return (
            recordDate.getTime() >=
              weekStart.getTime() &&
            recordDate.getTime() <=
              weekEnd.getTime()
          );
        },
      );

    const totalPeriods =
      weekRecords.length;

    const completedPeriods =
      weekRecords.filter(
        (item) =>
          item.record.completed,
      ).length;

    /*
     * Para "progreso" no nos
     * limitamos a completado sí/no.
     *
     * Un hábito por cantidad con
     * progreso parcial también aporta
     * al porcentaje de la semana.
     */
    const percentage =
      totalPeriods === 0
        ? null
        : Math.round(
            weekRecords.reduce(
              (
                total,
                item,
              ) =>
                total +
                getRecordProgressPercentage(
                  item.record,
                ),
              0,
            ) /
              totalPeriods,
          );

    points.push({
      label:
        `Sem ${weekNumber}`,

      percentage,

      weekStart:
        formatCalendarDate(
          weekStart,
        ),

      weekEnd:
        formatCalendarDate(
          weekEnd,
        ),

      totalPeriods,

      completedPeriods,
    });

    weekNumber +=
      1;

    weekCursor =
      new Date(
        weekEnd.getTime(),
      );

    weekCursor.setUTCDate(
      weekCursor.getUTCDate() +
        1,
    );
  }

  return {
    year:
      String(year),

    month:
      normalizedMonth,

    points,
  };

}
/*
 * TENDENCIA DE CUMPLIMIENTO
 *
 * Muestra la evolución del
 * cumplimiento mes a mes dentro
 * de un año concreto.
 *
 * A diferencia de "progreso mensual":
 *
 * Progreso mensual
 * → analiza semanas de un mes.
 *
 * Tendencia de cumplimiento
 * → compara meses de un año.
 */
export function getStatisticsComplianceTrend(
  historyItems: HabitHistoryItem[],
  selectedHabitId: string,
  selectedYear: string,
): StatisticsComplianceTrend | null {
  /*
   * Para construir una tendencia
   * anual necesitamos un año
   * concreto.
   */
  if (
    selectedYear ===
    "all"
  ) {
    return null;
  }

  const year =
    Number(
      selectedYear,
    );

  if (
    !Number.isInteger(
      year,
    )
  ) {
    return null;
  }

  const MONTH_LABELS = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const allRecords =
    flattenStatisticsRecords(
      historyItems,
    );

  /*
   * Primero aplicamos:
   *
   * - hábito
   * - año
   *
   * No usamos selectedMonth porque
   * la finalidad de esta gráfica es
   * comparar todos los meses.
   */
  const yearRecords =
    allRecords.filter(
      (item) => {
        if (
          selectedHabitId !==
            "all" &&
          item.habit._id !==
            selectedHabitId
        ) {
          return false;
        }

        const dateParts =
          getRecordDateParts(
            item.record,
          );

        if (!dateParts) {
          return false;
        }

        return (
          dateParts.year ===
          String(
            year,
          )
        );
      },
    );

  const points:
    StatisticsComplianceTrendPoint[] =
    [];

  /*
   * Siempre generamos Enero-Diciembre
   * para mantener una escala temporal
   * consistente.
   */
  for (
    let monthIndex = 0;
    monthIndex < 12;
    monthIndex += 1
  ) {
    const month =
      String(
        monthIndex + 1,
      ).padStart(
        2,
        "0",
      );

    const monthRecords =
      yearRecords.filter(
        (item) => {
          const dateParts =
            getRecordDateParts(
              item.record,
            );

          return (
            dateParts?.month ===
            month
          );
        },
      );

    const totalPeriods =
      monthRecords.length;

    const completedPeriods =
      monthRecords.filter(
        (item) =>
          item.record.completed,
      ).length;

    const compliance =
      totalPeriods ===
      0
        ? null
        : Math.round(
            (
              completedPeriods /
              totalPeriods
            ) * 100,
          );

    points.push({
      month,

      label:
        MONTH_LABELS[
          monthIndex
        ],

      compliance,

      totalPeriods,

      completedPeriods,
    });
  }

  return {
    year:
      String(
        year,
      ),

    points,
  };
}