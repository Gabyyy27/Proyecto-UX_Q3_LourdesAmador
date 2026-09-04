import { apiFetch } from "./api";

import type {
  CreateHabitData,
  Habit,
  UpdateHabitData,
} from "@/types/habit";

export function getHabits(): Promise<Habit[]> {
  return apiFetch<Habit[]>(
    "/habits",
    {
      method: "GET",
      authenticated: true,
    },
  );
}

export function getHabit(
  habitId: string,
): Promise<Habit> {
  return apiFetch<Habit>(
    `/habits/${habitId}`,
    {
      method: "GET",
      authenticated: true,
    },
  );
}

export function createHabit(
  data: CreateHabitData,
): Promise<Habit> {
  return apiFetch<Habit>(
    "/habits",
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(data),
    },
  );
}

export function updateHabit(
  habitId: string,
  data: UpdateHabitData,
): Promise<Habit> {
  return apiFetch<Habit>(
    `/habits/${habitId}`,
    {
      method: "PATCH",
      authenticated: true,
      body: JSON.stringify(data),
    },
  );
}

export function deleteHabit(
  habitId: string,
): Promise<{
  message: string;
}> {
  return apiFetch(
    `/habits/${habitId}`,
    {
      method: "DELETE",
      authenticated: true,
    },
  );
}

export function toggleHabit(
  habitId: string,
): Promise<Habit> {
  return apiFetch<Habit>(
    `/habits/${habitId}/toggle`,
    {
      method: "PATCH",
      authenticated: true,
    },
  );
}