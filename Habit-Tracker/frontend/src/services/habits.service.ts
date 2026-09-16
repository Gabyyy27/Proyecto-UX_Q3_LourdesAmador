import api from "./api";

import type {
  CreateHabitData,
  Habit,
  UpdateHabitData,
} from "@/types/habit";

export async function getHabits(): Promise<Habit[]> {
  const response =
    await api.get<Habit[]>(
      "/habits",
    );

  return response.data;
}

export async function getHabit(
  habitId: string,
): Promise<Habit> {
  const response =
    await api.get<Habit>(
      `/habits/${habitId}`,
    );

  return response.data;
}

export async function createHabit(
  data: CreateHabitData,
): Promise<Habit> {
  const response =
    await api.post<Habit>(
      "/habits",
      data,
    );

  return response.data;
}

export async function updateHabit(
  habitId: string,
  data: UpdateHabitData,
): Promise<Habit> {
  const response =
    await api.patch<Habit>(
      `/habits/${habitId}`,
      data,
    );

  return response.data;
}

export async function deleteHabit(
  habitId: string,
): Promise<{
  message: string;
}> {
  const response =
    await api.delete<{
      message: string;
    }>(
      `/habits/${habitId}`,
    );

  return response.data;
}

export async function toggleHabit(
  habitId: string,
): Promise<Habit> {
  const response =
    await api.patch<Habit>(
      `/habits/${habitId}/toggle`,
    );

  return response.data;
}