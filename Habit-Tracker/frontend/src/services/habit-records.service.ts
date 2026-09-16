import api from "./api";

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

export async function completeHabit(
  habitId: string,
): Promise<CompleteHabitResponse> {
  const response =
    await api.post<CompleteHabitResponse>(
      `/habits/${habitId}/complete`,
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