import type { Habit } from "./habit";

export type DashboardHabit = Habit & {
  /*
   * Lo conservamos temporalmente
   * porque el dashboard actual todavía
   * utiliza este campo.
   *
   * En el siguiente paso adaptaremos
   * la pantalla a períodos diarios,
   * semanales y mensuales.
   */
  completedToday: boolean;

  /*
   * Estado del período actual.
   */
  periodCompleted?: boolean;

  /*
   * Progreso acumulado.
   *
   * Binario:
   * 0 / 1
   *
   * Cantidad:
   * 800 / 2000 ml
   */
  currentValue?: number;

  /*
   * Objetivo almacenado en el
   * HabitRecord del período.
   */
  periodTargetValue?: number;

  /*
   * Unidad almacenada como snapshot
   * en el período.
   */
  periodUnit?: string;

  /*
   * Porcentaje entre 0 y 100.
   */
  progressPercent?: number;
};

export type DashboardData = {
  activeHabits: number;

  completedToday: number;

  dailyProgress: number;

  todayHabits: DashboardHabit[];
};