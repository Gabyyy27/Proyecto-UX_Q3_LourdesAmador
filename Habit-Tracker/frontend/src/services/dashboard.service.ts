import {
  getDailyStreak,
  getHabitHistory,
  getMonthlyProgress,
  getWeeklyProgress,
  getWeeklyStreak,
  type MonthlyProgressResponse,
  type WeeklyProgressResponse,
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

export type DashboardViewData =
  DashboardData & {
    weeklyProgress:
      WeeklyProgressResponse;

    monthlyProgress:
      MonthlyProgressResponse;
  };

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
  frequency:
    HabitFrequency,
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
    frequency ===
    "daily"
  ) {
    return `daily:${dateKey}`;
  }

  if (
    frequency ===
    "weekly"
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
    frequency ===
    "monthly"
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

  return (
    habit.customDays
      ?.includes(
        weekday
      ) ?? false
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

/*
 * Obtiene y prepara toda la
 * información necesaria para
 * renderizar el Dashboard.
 */
export async function getDashboardData():
  Promise<DashboardViewData> {
  /*
   * Cargamos en paralelo:
   *
   * - hábitos
   * - racha diaria
   * - racha semanal
   * - progreso semanal
   * - progreso mensual
   */
  const [
    habits,
    dailyStreak,
    weeklyStreak,
    weeklyProgress,
    monthlyProgress,
  ] =
    await Promise.all([
      getHabits(),

      getDailyStreak(),

      getWeeklyStreak(),

      getWeeklyProgress(),

      getMonthlyProgress(),
    ]);

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

  /*
   * Para el resumen mostramos
   * solamente hábitos que
   * corresponden al día actual.
   */
  const availableHabits =
    activeHabits.filter(
      (habit) =>
        isHabitAvailableToday(
          habit,
          now,
          DASHBOARD_TIMEZONE
        )
    );

  /*
   * Obtenemos el registro del
   * período actual de cada hábito.
   */
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
           * formato actual:
           *
           * daily:YYYY-MM-DD
           * custom:YYYY-MM-DD
           * weekly:YYYY-WNN
           * monthly:YYYY-MM
           */
          let currentRecord =
            history.find(
              (record) =>
                record.dateKey ===
                periodKey
            );

          /*
           * Compatibilidad con
           * registros antiguos:
           *
           * YYYY-MM-DD
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
           * únicamente finalizaciones
           * que ocurrieron hoy.
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

  /*
   * Promedio del progreso
   * de los hábitos actuales.
   */
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

  return {
    activeHabits:
      activeHabits.length,

    completedToday,

    dailyProgress,

    todayHabits:
      habitsWithStatus,

    dailyStreak,

    weeklyStreak,

    weeklyProgress,

    monthlyProgress,
  };
}