import api from "./api";

import type {
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

export async function completeHabit(
  habitId: string
): Promise<CompleteHabitResponse> {
  const response =
    await api.post<CompleteHabitResponse>(
      `/habits/${habitId}/complete`
    );

  return response.data;
}

export async function addHabitProgress(
  habitId: string,
  amount: number
): Promise<AddProgressResponse> {
  const response =
    await api.post<AddProgressResponse>(
      `/habits/${habitId}/progress`,
      {
        amount,
      }
    );

  return response.data;
}

export async function getHabitHistory(
  habitId: string
): Promise<HabitRecord[]> {
  const response =
    await api.get<HabitRecord[]>(
      `/habits/${habitId}/history`
    );

  return response.data;
}

export async function getDailyStreak(): Promise<DailyStreakResponse> {
  const response =
    await api.get<DailyStreakResponse>(
      "/habits/streaks/daily"
    );

  return response.data;
}

export async function getWeeklyStreak(): Promise<WeeklyStreakResponse> {
  const response =
    await api.get<WeeklyStreakResponse>(
      "/habits/streaks/weekly"
    );

  return response.data;
}