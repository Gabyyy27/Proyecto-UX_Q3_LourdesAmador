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
  HabitTrackingType,
} from '../../habits/habits.constants.js';

export type HabitRecordDocument =
  HydratedDocument<HabitRecord>;

@Schema({
  timestamps: true,
  collection: 'habit_records',
})
export class HabitRecord {
  @Prop({
    type: Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true,
  })
  habitId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  /*
   * Conservamos "date" para mantener
   * compatibilidad con los registros
   * que ya existen.
   *
   * Para los nuevos registros será la
   * fecha en la que se creó el período.
   */
  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  date!: Date;

  /*
   * Aunque el nombre original es
   * dateKey, desde ahora funcionará
   * como identificador único del
   * período.
   *
   * Ejemplos:
   * daily:2026-09-17
   * weekly:2026-W38
   * monthly:2026-09
   *
   * Lo mantenemos así para NO romper
   * el índice único que ya existe en
   * MongoDB.
   */
  @Prop({
    required: true,
    index: true,
  })
  dateKey!: string;

  /*
   * Guardamos una copia de la
   * frecuencia que tenía el hábito
   * durante este período.
   */
  @Prop({
    type: String,
    enum: HabitFrequency,
    default: HabitFrequency.DAILY,
  })
  frequency!: HabitFrequency;

  /*
   * También guardamos el tipo de
   * seguimiento como snapshot.
   *
   * Así, si después el usuario modifica
   * el hábito, el historial anterior
   * conserva su significado original.
   */
  @Prop({
    type: String,
    enum: HabitTrackingType,
    default: HabitTrackingType.BINARY,
  })
  trackingType!: HabitTrackingType;

  /*
   * Objetivo del período.
   *
   * Binario:
   * targetValue = 1
   *
   * Cantidad:
   * targetValue = 2000, 10, 30, etc.
   */
  @Prop({
    type: Number,
    default: 1,
  })
  targetValue!: number;

  /*
   * Progreso acumulado dentro
   * del período.
   */
  @Prop({
    type: Number,
    default: 0,
  })
  currentValue!: number;

  /*
   * Snapshot de la unidad.
   *
   * Ejemplos:
   * ml
   * km
   * páginas
   */
  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  unit!: string;

  /*
   * Inicio y fin reales del período.
   *
   * Los dejamos opcionales para que
   * los registros antiguos existentes
   * continúen siendo compatibles.
   */
  @Prop({
    type: Date,
    default: null,
  })
  periodStart!: Date | null;

  @Prop({
    type: Date,
    default: null,
  })
  periodEnd!: Date | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  completed!: boolean;

  @Prop({
    type: Date,
    default: null,
  })
  completedAt!: Date | null;
}

export const HabitRecordSchema =
  SchemaFactory.createForClass(
    HabitRecord,
  );

/*
 * IMPORTANTE:
 *
 * Conservamos exactamente el mismo
 * índice compuesto que ya utilizabas.
 *
 * Solo cambia el significado de
 * dateKey: ahora identifica un período
 * en lugar de representar solamente
 * un día.
 */
HabitRecordSchema.index(
  {
    habitId: 1,
    userId: 1,
    dateKey: 1,
  },
  {
    unique: true,
  },
);