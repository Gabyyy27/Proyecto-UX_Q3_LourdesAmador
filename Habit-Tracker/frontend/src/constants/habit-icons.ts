import type {
  SvgIconComponent,
} from "@mui/icons-material";

import {
  Bedtime,
  CleaningServices,
  DirectionsWalk,
  Favorite,
  FitnessCenter,
  LocalDrink,
  MenuBook,
  MusicNote,
  Pets,
  Restaurant,
  Savings,
  School,
  SelfImprovement,
  SportsSoccer,
  TaskAlt,
  Work,
} from "@mui/icons-material";

export type HabitIconOption = {
  value: string;
  label: string;
  category: string | null;
  Icon: SvgIconComponent;
};

/*
 * Catálogo disponible para el usuario.
 *
 * Guardamos "value" en MongoDB.
 * "label" se muestra en la interfaz.
 * "Icon" es el componente visual de MUI.
 */
export const HABIT_ICON_OPTIONS:
  HabitIconOption[] = [
    {
      value: "local_drink",
      label: "Agua",
      category: "Agua",
      Icon: LocalDrink,
    },
    {
      value: "fitness_center",
      label: "Ejercicio",
      category: "Ejercicio",
      Icon: FitnessCenter,
    },
    {
      value: "menu_book",
      label: "Lectura",
      category: "Lectura",
      Icon: MenuBook,
    },
    {
      value: "school",
      label: "Estudio",
      category: "Estudio",
      Icon: School,
    },
    {
      value: "bedtime",
      label: "Dormir",
      category: "Dormir",
      Icon: Bedtime,
    },
    {
      value: "self_improvement",
      label: "Meditación",
      category: "Meditación",
      Icon: SelfImprovement,
    },
    {
      value: "directions_walk",
      label: "Caminar",
      category: "Caminar",
      Icon: DirectionsWalk,
    },
    {
      value: "restaurant",
      label: "Alimentación",
      category: "Alimentación",
      Icon: Restaurant,
    },
    {
      value: "savings",
      label: "Ahorro",
      category: "Ahorro",
      Icon: Savings,
    },
    {
      value: "cleaning_services",
      label: "Limpieza",
      category: "Limpieza",
      Icon: CleaningServices,
    },
    {
      value: "work",
      label: "Trabajo",
      category: "Trabajo",
      Icon: Work,
    },
    {
      value: "music_note",
      label: "Música",
      category: "Música",
      Icon: MusicNote,
    },
    {
      value: "pets",
      label: "Mascotas",
      category: "Mascotas",
      Icon: Pets,
    },
    {
      value: "favorite",
      label: "Bienestar",
      category: "Bienestar",
      Icon: Favorite,
    },
    {
      value: "sports_soccer",
      label: "Deporte",
      category: "Deporte",
      Icon: SportsSoccer,
    },

    /*
     * Siempre debe quedar de último.
     * Permite que el usuario escriba
     * una categoría personalizada.
     */
    {
      value: "task_alt",
      label: "Otro",
      category: null,
      Icon: TaskAlt,
    },
  ];

/*
 * Ícono predeterminado.
 */
export const DEFAULT_HABIT_ICON =
  "task_alt";

/*
 * Devuelve la información completa
 * del ícono seleccionado.
 *
 * Si un hábito antiguo no tiene icon
 * o contiene una clave desconocida,
 * utilizamos TaskAlt.
 */
export function getHabitIconOption(
  icon?: string,
): HabitIconOption {
  return (
  HABIT_ICON_OPTIONS.find(
    (option) =>
      option.value === icon,
  ) ??
  HABIT_ICON_OPTIONS.find(
    (option) =>
      option.value ===
      DEFAULT_HABIT_ICON,
  ) ??
  HABIT_ICON_OPTIONS[0]
);
}

/*
 * Atajo para obtener solamente
 * el componente de Material UI.
 *
 * Ejemplo:
 *
 * const HabitIcon =
 *   getHabitIconComponent(habit.icon);
 */
export function getHabitIconComponent(
  icon?: string,
): SvgIconComponent {
  return getHabitIconOption(
    icon,
  ).Icon;
}