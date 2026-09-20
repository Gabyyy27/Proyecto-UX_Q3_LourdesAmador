import api from "./api";

import type {
  CreateHabitData,
  Habit,
  UpdateHabitData,
} from "@/types/habit";

/*
 * Caché temporal en memoria.
 *
 * No usamos localStorage.
 *
 * Su objetivo es reutilizar los hábitos
 * que ya descargamos en la página de
 * hábitos para evitar otra petición al
 * abrir la pantalla de edición.
 */
const habitCache =
  new Map<string, Habit>();

function saveHabitInCache(
  habit: Habit,
) {
  habitCache.set(
    habit._id,
    habit,
  );
}

function removeHabitFromCache(
  habitId: string,
) {
  habitCache.delete(
    habitId,
  );
}

function replaceHabitCache(
  habits: Habit[],
) {
  habitCache.clear();

  for (
    const habit of habits
  ) {
    saveHabitInCache(
      habit,
    );
  }
}

export async function getHabits():
  Promise<Habit[]> {
  const response =
    await api.get<Habit[]>(
      "/habits",
    );

  /*
   * Guardamos la lista obtenida
   * para que getHabit() pueda
   * reutilizarla posteriormente.
   */
  replaceHabitCache(
    response.data,
  );

  return response.data;
}

export async function getHabit(
  habitId: string,
): Promise<Habit> {
  /*
   * Primero intentamos reutilizar
   * el hábito que ya descargamos.
   *
   * Esto hace que Editar abra
   * prácticamente de inmediato
   * cuando venimos desde la lista.
   */
  const cachedHabit =
    habitCache.get(
      habitId,
    );

  if (cachedHabit) {
    return cachedHabit;
  }

  /*
   * Si no existe en memoria,
   * por ejemplo al refrescar
   * directamente:
   *
   * /habits/:id/edit
   *
   * consultamos normalmente
   * al backend.
   */
  const response =
    await api.get<Habit>(
      `/habits/${habitId}`,
    );

  saveHabitInCache(
    response.data,
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

  /*
   * El nuevo hábito queda disponible
   * inmediatamente en caché.
   */
  saveHabitInCache(
    response.data,
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

  /*
   * Sustituimos la versión antigua
   * por la versión actualizada.
   */
  saveHabitInCache(
    response.data,
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

  /*
   * Eliminamos también cualquier
   * copia guardada en memoria.
   */
  removeHabitFromCache(
    habitId,
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

  /*
   * Actualizamos la caché para evitar
   * conservar el estado active anterior.
   */
  saveHabitInCache(
    response.data,
  );

  return response.data;
}