import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

import {
  HabitFrequency,
  HabitPriority,
  HabitTrackingType,
} from '../habits.constants.js';

export type HabitDocument =
  HydratedDocument<Habit>;

@Schema({
  timestamps: true,
  collection: 'habits',
})
export class Habit {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    trim: true,
    default: '',
  })
  description!: string;

  @Prop({
    trim: true,
    default: '',
  })
  category!: string;

  /*
   * Ícono visual seleccionado
   * por el usuario.
   *
   * Guardamos únicamente una clave
   * de texto, no el componente de
   * Material UI.
   *
   * Ejemplos:
   *
   * local_drink
   * fitness_center
   * menu_book
   * bedtime
   */
  @Prop({
    type: String,
    trim: true,
    default: 'task_alt',
  })
  icon!: string;

  @Prop({
    required: true,
    enum: HabitFrequency,
  })
  frequency!: HabitFrequency;

  @Prop({
    type: [String],
    default: [],
  })
  customDays!: string[];

  @Prop({
    required: true,
    enum: HabitPriority,
    default: HabitPriority.MEDIUM,
  })
  priority!: HabitPriority;

  @Prop({
    required: true,
    enum: HabitTrackingType,
    default: HabitTrackingType.BINARY,
  })
  trackingType!: HabitTrackingType;

  @Prop({
    type: Number,
    required: true,
    default: 1,
  })
  targetValue!: number;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  unit!: string;

  @Prop({
    required: true,
    type: Date,
  })
  startDate!: Date;

  @Prop({
    type: Date,
    default: null,
  })
  endDate!: Date | null;

  @Prop({
    default: true,
  })
  active!: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;
}

export const HabitSchema =
  SchemaFactory.createForClass(Habit);