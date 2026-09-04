import { apiFetch } from "./api";

export type HabitRecord = {
  _id: string;
  habitId: string;
  userId: string;
  date: string;
  dateKey: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type CompleteHabitResponse = {
  message: string;
  record: HabitRecord;
};

export function completeHabit(
  habitId: string,
): Promise<CompleteHabitResponse> {
  return apiFetch<CompleteHabitResponse>(
    `/habits/${habitId}/complete`,
    {
      method: "POST",
      authenticated: true,
    },
  );
}

export function getHabitHistory(
  habitId: string,
): Promise<HabitRecord[]> {
  return apiFetch<HabitRecord[]>(
    `/habits/${habitId}/history`,
    {
      method: "GET",
      authenticated: true,
    },
  );
}