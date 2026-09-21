import api from "./api";

import type {
  Habit,
  HabitFrequency,
  HabitTrackingType,
} from "@/types/habit";

export type HabitRecord = {
  _id: string;

  habitId: string;

  userId: string;

  date: string;

  dateKey: string;

  frequency: HabitFrequency;

  trackingType: HabitTrackingType;

  targetValue: number;

  currentValue: number;

  unit: string;

  periodStart: string | null;

  periodEnd: string | null;

  completed: boolean;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;
};

export type HabitProgressEntry = {
  _id: string;

  habitId: string;

  userId: string;

  habitRecordId: string;

  dateKey: string;

  amount: number;

  occurredAt: string;

  createdAt: string;

  updatedAt: string;
};

export type CompleteHabitResponse = {
  message: string;

  record: HabitRecord;
};

export type AddProgressResponse = {
  message: string;

  record: HabitRecord;

  entry: HabitProgressEntry;
};

export type DailyStreakResponse = {
  hasDailyHabits: boolean;

  currentStreak: number;

  bestStreak: number;
};

export type WeeklyStreakResponse = {
  hasWeeklyHabits: boolean;

  currentStreak: number;

  bestStreak: number;
};

export type WeeklyProgressPoint = {
  date: string;

  label: string;

  percentage: number | null;

  scheduledHabits: number;

  completedHabits: number;

  isToday: boolean;

  isFuture: boolean;
};

export type WeeklyProgressResponse = {
  weekStart: string;

  weekEnd: string;

  points: WeeklyProgressPoint[];
};

export type MonthlyProgressPoint = {
  label: string;

  percentage: number | null;

  weekStart: string;

  weekEnd: string;

  scheduledHabits: number;

  completedHabits: number;

  isFuture: boolean;
};

export type MonthlyProgressResponse = {
  month: string;

  monthStart: string;

  monthEnd: string;

  points: MonthlyProgressPoint[];
};

/*
 * Información resumida que utilizarán
 * las cards de la página de hábitos.
 */
export type HabitCurrentProgress = {
  record: HabitRecord | null;

  percentage: number;

  currentValue: number;

  targetValue: number;

  completed: boolean;

  label: string;

  scheduledToday: boolean;
};

const HABIT_TIMEZONE =
  "America/Tegucigalpa";

/*
 * Devuelve la fecha actual respetando
 * la zona horaria utilizada por la app.
 */
function getCurrentDateString() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          HABIT_TIMEZONE,

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
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

/*
 * Día actual:
 *
 * monday
 * tuesday
 * ...
 *
 * Se utiliza para los hábitos
 * personalizados.
 */
function getCurrentWeekday() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        HABIT_TIMEZONE,

      weekday: "long",
    },
  )
    .format(
      new Date(),
    )
    .toLowerCase();
}

/*
 * Calcula año y semana ISO.
 *
 * Ejemplo:
 *
 * 2026-W38
 */
function getIsoWeekKey(
  dateString: string,
) {
  const date =
    new Date(
      `${dateString}T00:00:00Z`,
    );

  const day =
    date.getUTCDay() || 7;

  date.setUTCDate(
    date.getUTCDate() +
      4 -
      day,
  );

  const isoYear =
    date.getUTCFullYear();

  const yearStart =
    new Date(
      Date.UTC(
        isoYear,
        0,
        1,
      ),
    );

  const weekNumber =
    Math.ceil(
      (
        (
          date.getTime() -
          yearStart.getTime()
        ) /
          86400000 +
        1
      ) / 7,
    );

  return `${isoYear}-W${String(
    weekNumber,
  ).padStart(2, "0")}`;
}

/*
 * Construye la misma clave de período
 * utilizada por los registros.
 */
function getCurrentDateKey(
  frequency: HabitFrequency,
) {
  const today =
    getCurrentDateString();

  if (
    frequency === "weekly"
  ) {
    return `weekly:${getIsoWeekKey(
      today,
    )}`;
  }

  if (
    frequency === "monthly"
  ) {
    return `monthly:${today.slice(
      0,
      7,
    )}`;
  }

  if (
    frequency === "custom"
  ) {
    return `custom:${today}`;
  }

  return `daily:${today}`;
}

/*
 * Texto correspondiente al período
 * actual del hábito.
 */
function getPeriodLabel(
  frequency: HabitFrequency,
) {
  if (
    frequency === "weekly"
  ) {
    return "esta semana";
  }

  if (
    frequency === "monthly"
  ) {
    return "este mes";
  }

  return "hoy";
}

/*
 * Obtiene el progreso del período
 * actualmente activo para un hábito.
 */
export async function getHabitCurrentProgress(
  habit: Habit,
): Promise<HabitCurrentProgress> {
  const history =
    await getHabitHistory(
      habit._id,
    );

  const dateKey =
    getCurrentDateKey(
      habit.frequency,
    );

  const record =
    history.find(
      (item) =>
        item.dateKey ===
        dateKey,
    ) ?? null;

  /*
   * Para frecuencia personalizada
   * indicamos si realmente corresponde
   * registrar el hábito hoy.
   */
  const scheduledToday =
    habit.frequency !==
      "custom" ||
    (
      habit.customDays ??
      []
    ).includes(
      getCurrentWeekday(),
    );

  const targetValue =
    record?.targetValue ??
    habit.targetValue ??
    1;

  const currentValue =
    record?.currentValue ??
    0;

  const completed =
    record?.completed ??
    false;

  let percentage = 0;

  if (
    habit.trackingType ===
    "quantity"
  ) {
    if (
      targetValue > 0
    ) {
      percentage =
        Math.min(
          100,
          Math.round(
            (
              currentValue /
              targetValue
            ) *
              100,
          ),
        );
    }
  } else {
    percentage =
      completed
        ? 100
        : 0;
  }

  /*
   * Si el hábito personalizado no
   * corresponde a hoy, mostramos un
   * mensaje diferente a 0%.
   */
  if (
    habit.frequency ===
      "custom" &&
    !scheduledToday
  ) {
    return {
      record,
      percentage: 0,
      currentValue,
      targetValue,
      completed,
      scheduledToday,
      label:
        "No programado hoy",
    };
  }

  const periodLabel =
    getPeriodLabel(
      habit.frequency,
    );

  if (
    habit.trackingType ===
    "quantity"
  ) {
    const unit =
      (
        record?.unit ??
        habit.unit ??
        ""
      ).trim();

    const values =
      unit
        ? `${currentValue} de ${targetValue} ${unit}`
        : `${currentValue} de ${targetValue}`;

    return {
      record,
      percentage,
      currentValue,
      targetValue,
      completed,
      scheduledToday,
      label:
        `${values} ${periodLabel}`,
    };
  }

  return {
    record,
    percentage,
    currentValue,
    targetValue,
    completed,
    scheduledToday,
    label: completed
      ? `Completado ${periodLabel}`
      : `Pendiente ${periodLabel}`,
  };
}

/*
 * Obtiene el progreso actual de todos
 * los hábitos recibidos.
 *
 * Para este proyecto hacemos una
 * consulta de historial por hábito.
 */
export async function getHabitsCurrentProgress(
  habits: Habit[],
): Promise<
  Record<
    string,
    HabitCurrentProgress
  >
> {
  const results =
    await Promise.all(
      habits.map(
        async (habit) => {
          const progress =
            await getHabitCurrentProgress(
              habit,
            );

          return [
            habit._id,
            progress,
          ] as const;
        },
      ),
    );

  return Object.fromEntries(
    results,
  );
}

export async function completeHabit(
  habitId: string,
): Promise<CompleteHabitResponse> {
  const response =
    await api.post<CompleteHabitResponse>(
      `/habits/${habitId}/complete`,
    );

  return response.data;
}

export async function addHabitProgress(
  habitId: string,
  amount: number,
): Promise<AddProgressResponse> {
  const response =
    await api.post<AddProgressResponse>(
      `/habits/${habitId}/progress`,
      {
        amount,
      },
    );

  return response.data;
}

export async function getHabitHistory(
  habitId: string,
): Promise<HabitRecord[]> {
  const response =
    await api.get<HabitRecord[]>(
      `/habits/${habitId}/history`,
    );

  return response.data;
}

export async function getDailyStreak(): Promise<DailyStreakResponse> {
  const response =
    await api.get<DailyStreakResponse>(
      "/habits/streaks/daily",
    );

  return response.data;
}

export async function getWeeklyStreak(): Promise<WeeklyStreakResponse> {
  const response =
    await api.get<WeeklyStreakResponse>(
      "/habits/streaks/weekly",
    );

  return response.data;
}

export async function getWeeklyProgress(): Promise<WeeklyProgressResponse> {
  const response =
    await api.get<WeeklyProgressResponse>(
      "/habits/progress/weekly",
    );

  return response.data;
}

export async function getMonthlyProgress(): Promise<MonthlyProgressResponse> {
  const response =
    await api.get<MonthlyProgressResponse>(
      "/habits/progress/monthly",
    );

  return response.data;
}