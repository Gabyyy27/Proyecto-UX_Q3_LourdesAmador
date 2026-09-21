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
      value: "task_alt",
      label: "General",
      Icon: TaskAlt,
    },
    {
      value: "local_drink",
      label: "Agua",
      Icon: LocalDrink,
    },
    {
      value: "fitness_center",
      label: "Ejercicio",
      Icon: FitnessCenter,
    },
    {
      value: "menu_book",
      label: "Lectura",
      Icon: MenuBook,
    },
    {
      value: "school",
      label: "Estudio",
      Icon: School,
    },
    {
      value: "bedtime",
      label: "Dormir",
      Icon: Bedtime,
    },
    {
      value: "self_improvement",
      label: "Meditación",
      Icon: SelfImprovement,
    },
    {
      value: "directions_walk",
      label: "Caminar",
      Icon: DirectionsWalk,
    },
    {
      value: "restaurant",
      label: "Alimentación",
      Icon: Restaurant,
    },
    {
      value: "savings",
      label: "Ahorro",
      Icon: Savings,
    },
    {
      value: "cleaning_services",
      label: "Limpieza",
      Icon: CleaningServices,
    },
    {
      value: "work",
      label: "Trabajo",
      Icon: Work,
    },
    {
      value: "music_note",
      label: "Música",
      Icon: MusicNote,
    },
    {
      value: "pets",
      label: "Mascotas",
      Icon: Pets,
    },
    {
      value: "favorite",
      label: "Bienestar",
      Icon: Favorite,
    },
    {
      value: "sports_soccer",
      label: "Deporte",
      Icon: SportsSoccer,
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