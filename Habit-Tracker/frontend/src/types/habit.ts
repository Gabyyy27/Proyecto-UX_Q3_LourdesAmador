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