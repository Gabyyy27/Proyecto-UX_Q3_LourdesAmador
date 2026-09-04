import type { Habit } from "./habit";

export type DashboardHabit = Habit & {
  completedToday: boolean;
};

export type DashboardData = {
  activeHabits: number;
  completedToday: number;
  dailyProgress: number;
  todayHabits: DashboardHabit[];
};