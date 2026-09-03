import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import { HabitsService } from '../habits/habits.service.js';

import {
  HabitRecord,
  HabitRecordDocument,
} from './schemas/habit-record.schema.js';

@Injectable()
export class HabitRecordsService {
  constructor(
    @InjectModel(HabitRecord.name)
    private readonly habitRecordModel:
      Model<HabitRecordDocument>,

    private readonly habitsService: HabitsService,
  ) {}

  private getDateKey(
    date: Date,
    timezone: string,
  ): string {
    const formatter =
      new Intl.DateTimeFormat(
        'en-US',
        {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        },
      );

    const parts =
      formatter.formatToParts(date);

    const year =
      parts.find(
        (part) => part.type === 'year',
      )?.value;

    const month =
      parts.find(
        (part) => part.type === 'month',
      )?.value;

    const day =
      parts.find(
        (part) => part.type === 'day',
      )?.value;

    return `${year}-${month}-${day}`;
  }

  async completeHabit(
    habitId: string,
    userId: string,
    timezone: string,
  ) {
    const habit =
      await this.habitsService.findOne(
        habitId,
        userId,
      );

    if (!habit.active) {
      throw new BadRequestException(
        'No puedes completar un hábito inactivo',
      );
    }

    const now = new Date();

    const dateKey = this.getDateKey(
      now,
      timezone,
    );

    const existingRecord =
      await this.habitRecordModel.findOne({
        habitId:
          new Types.ObjectId(habitId),

        userId:
          new Types.ObjectId(userId),

        dateKey,
      });

    if (existingRecord) {
      throw new ConflictException(
        'Este hábito ya fue completado hoy',
      );
    }

    const record =
      new this.habitRecordModel({
        habitId:
          new Types.ObjectId(habitId),

        userId:
          new Types.ObjectId(userId),

        date: now,

        dateKey,

        completed: true,
      });

    await record.save();

    return {
      message:
        'Hábito marcado como completado',
      record,
    };
  }

  async getHabitHistory(
    habitId: string,
    userId: string,
  ) {
    await this.habitsService.findOne(
      habitId,
      userId,
    );

    return this.habitRecordModel
      .find({
        habitId:
          new Types.ObjectId(habitId),

        userId:
          new Types.ObjectId(userId),
      })
      .sort({
        date: -1,
      });
  }
}