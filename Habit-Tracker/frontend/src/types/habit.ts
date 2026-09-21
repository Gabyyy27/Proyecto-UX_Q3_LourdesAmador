export type HabitFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export type HabitPriority =
  | "low"
  | "medium"
  | "high";

export type HabitTrackingType =
  | "binary"
  | "quantity";

export type Habit = {
  _id: string;

  name: string;

  description: string;

  category: string;

  /*
   * Es opcional temporalmente porque
   * los hábitos creados antes de agregar
   * esta propiedad pueden no tenerla
   * guardada todavía en MongoDB.
   */
  icon?: string;

  frequency: HabitFrequency;

  customDays: string[];

  priority: HabitPriority;

  trackingType: HabitTrackingType;

  targetValue: number;

  unit: string;

  startDate: string;

  endDate: string | null;

  active: boolean;

  userId: string;

  createdAt: string;

  updatedAt: string;
};

export type HabitFormData = {
  name: string;

  description: string;

  category: string;

  /*
   * En el formulario siempre tendremos
   * un ícono seleccionado.
   *
   * Si el usuario no cambia nada,
   * utilizaremos "task_alt".
   */
  icon: string;

  frequency: HabitFrequency;

  customDays: string[];

  priority: HabitPriority;

  trackingType: HabitTrackingType;

  targetValue: string;

  unit: string;

  startDate: string;

  endDate: string;
};

export type CreateHabitData = {
  name: string;

  description?: string;

  category?: string;

  /*
   * Es opcional para que el backend
   * pueda aplicar "task_alt" como
   * valor predeterminado si no llega.
   */
  icon?: string;

  frequency: HabitFrequency;

  customDays?: string[];

  priority: HabitPriority;

  trackingType: HabitTrackingType;

  targetValue?: number;

  unit?: string;

  startDate: string;

  endDate?: string;
};

export type UpdateHabitData =
  Partial<CreateHabitData>;