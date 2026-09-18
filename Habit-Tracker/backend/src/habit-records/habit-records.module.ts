import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { HabitsModule } from '../habits/habits.module.js';

import {
  HabitRecord,
  HabitRecordSchema,
} from './schemas/habit-record.schema.js';

import {
  HabitProgressEntry,
  HabitProgressEntrySchema,
} from './schemas/habit-progress-entry.schema.js';

import { HabitRecordsController } from './habit-records.controller.js';
import { HabitRecordsService } from './habit-records.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: HabitRecord.name,
        schema: HabitRecordSchema,
      },
      {
        name: HabitProgressEntry.name,
        schema: HabitProgressEntrySchema,
      },
    ]),

    AuthModule,
    HabitsModule,
  ],

  controllers: [
    HabitRecordsController,
  ],

  providers: [
    HabitRecordsService,
  ],

  exports: [
    HabitRecordsService,
  ],
})
export class HabitRecordsModule {}