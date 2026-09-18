import type {
  HabitFrequency,
  HabitPriority,
} from "@/types/habit";

export function getFrequencyLabel(
  frequency: HabitFrequency
) {
  switch (frequency) {
    case "daily":
      return "Diario";

    case "weekly":
      return "Semanal";

    case "monthly":
      return "Mensual";

    case "custom":
      return "Personalizada";
  }
}

export function getPriorityLabel(
  priority: HabitPriority
) {
  switch (priority) {
    case "low":
      return "Baja";

    case "medium":
      return "Media";

    case "high":
      return "Alta";
  }
}