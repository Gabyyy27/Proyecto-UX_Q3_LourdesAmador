import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';

import {
  Habit,
  HabitSchema,
} from './schemas/habit.schema.js';

import { HabitsController } from './habits.controller.js';
import { HabitsService } from './habits.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Habit.name,
        schema: HabitSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [HabitsController],

  providers: [HabitsService],

  exports: [HabitsService],
})
export class HabitsModule {}