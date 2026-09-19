import type { Habit } from "./habit";

export type DashboardHabit = Habit & {
  completedToday: boolean;

  periodCompleted?: boolean;

  currentValue?: number;

  periodTargetValue?: number;

  periodUnit?: string;

  progressPercent?: number;
};

export type DailyStreakData = {
  hasDailyHabits: boolean;

  currentStreak: number;

  bestStreak: number;
};

export type WeeklyStreakData = {
  hasWeeklyHabits: boolean;

  currentStreak: number;

  bestStreak: number;
};

export type DashboardData = {
  activeHabits: number;

  completedToday: number;

  dailyProgress: number;

  todayHabits: DashboardHabit[];

  dailyStreak: DailyStreakData;

  weeklyStreak: WeeklyStreakData;
};