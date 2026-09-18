import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type HabitProgressEntryDocument =
  HydratedDocument<HabitProgressEntry>;

@Schema({
  timestamps: true,
  collection:
    'habit_progress_entries',
})
export class HabitProgressEntry {
  /*
   * Hábito al que pertenece
   * este avance.
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true,
  })
  habitId!: Types.ObjectId;

  /*
   * Usuario propietario.
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  /*
   * Referencia al resumen del
   * período correspondiente.
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'HabitRecord',
    required: true,
    index: true,
  })
  habitRecordId!: Types.ObjectId;

  /*
   * Conservamos también la clave
   * del período.
   *
   * Ejemplos:
   * daily:2026-09-17
   * weekly:2026-W38
   * monthly:2026-09
   */
  @Prop({
    required: true,
    index: true,
  })
  dateKey!: string;

  /*
   * Cantidad registrada en esta
   * acción.
   *
   * Ejemplos:
   * 200 ml
   * 1.5 km
   * 10 páginas
   *
   * La unidad vive en HabitRecord,
   * por lo que aquí solamente
   * almacenamos el número.
   */
  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  amount!: number;

  /*
   * Momento exacto en el que
   * el usuario registró el avance.
   */
  @Prop({
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  })
  occurredAt!: Date;
}

export const HabitProgressEntrySchema =
  SchemaFactory.createForClass(
    HabitProgressEntry,
  );

/*
 * Este índice ayudará a consultar
 * todos los avances de un hábito
 * dentro de un período determinado.
 *
 * NO es unique porque puede haber
 * muchos avances dentro del mismo
 * período.
 */
HabitProgressEntrySchema.index({
  userId: 1,
  habitId: 1,
  dateKey: 1,
  occurredAt: -1,
});