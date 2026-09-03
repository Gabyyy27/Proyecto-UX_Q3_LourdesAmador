import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Habit,
  HabitDocument,
} from './schemas/habit.schema.js';

import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name)
    private readonly habitModel:
      Model<HabitDocument>,
  ) {}

  async create(
    userId: string,
    createHabitDto: CreateHabitDto,
  ) {
    const habit = new this.habitModel({
      ...createHabitDto,

      startDate:
        new Date(createHabitDto.startDate),

      endDate:
        createHabitDto.endDate
          ? new Date(createHabitDto.endDate)
          : null,

      userId: new Types.ObjectId(userId),
    });

    return habit.save();
  }

  async findAll(userId: string) {
    return this.habitModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({
        createdAt: -1,
      });
  }

  async findOne(
    habitId: string,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(habitId)) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    const habit =
      await this.habitModel.findOne({
        _id: new Types.ObjectId(habitId),
        userId: new Types.ObjectId(userId),
      });

    if (!habit) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    return habit;
  }

  async update(
    habitId: string,
    userId: string,
    updateHabitDto: UpdateHabitDto,
  ) {
    if (!Types.ObjectId.isValid(habitId)) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    const updateData = {
      ...updateHabitDto,

      ...(updateHabitDto.startDate
        ? {
            startDate: new Date(
              updateHabitDto.startDate,
            ),
          }
        : {}),

      ...(updateHabitDto.endDate
        ? {
            endDate: new Date(
              updateHabitDto.endDate,
            ),
          }
        : {}),
    };

    const habit =
      await this.habitModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(habitId),
          userId: new Types.ObjectId(userId),
        },

        updateData,

        {
          new: true,
          runValidators: true,
        },
      );

    if (!habit) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    return habit;
  }

  async remove(
    habitId: string,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(habitId)) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    const habit =
      await this.habitModel.findOneAndDelete({
        _id: new Types.ObjectId(habitId),
        userId: new Types.ObjectId(userId),
      });

    if (!habit) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    return {
      message:
        'Hábito eliminado correctamente',
    };
  }

  async toggleActive(
    habitId: string,
    userId: string,
  ) {
    const habit =
      await this.findOne(
        habitId,
        userId,
      );

    habit.active = !habit.active;

    await habit.save();

    return habit;
  }
}