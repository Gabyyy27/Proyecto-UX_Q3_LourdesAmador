import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

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

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  date!: Date;

  @Prop({
    required: true,
    index: true,
  })
  dateKey!: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  completed!: boolean;
}

export const HabitRecordSchema =
  SchemaFactory.createForClass(HabitRecord);

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