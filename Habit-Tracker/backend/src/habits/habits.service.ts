import {
  BadRequestException,
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

import {
  HabitTrackingType,
} from './habits.constants.js';

import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name)
    private readonly habitModel:
      Model<HabitDocument>,
  ) {}

  /*
   * Normaliza y valida los campos
   * de seguimiento cuando se crea
   * un hábito.
   */
  private getCreateTrackingData(
    createHabitDto: CreateHabitDto,
  ) {
    const trackingType =
      createHabitDto.trackingType ??
      HabitTrackingType.BINARY;

    /*
     * Los hábitos binarios siempre
     * tienen objetivo 1 y no necesitan
     * unidad de medida.
     */
    if (
      trackingType ===
      HabitTrackingType.BINARY
    ) {
      if (
        createHabitDto.targetValue !==
          undefined &&
        createHabitDto.targetValue !== 1
      ) {
        throw new BadRequestException(
          'Los hábitos binarios deben tener targetValue igual a 1',
        );
      }

      return {
        trackingType:
          HabitTrackingType.BINARY,

        targetValue: 1,

        unit: '',
      };
    }

    /*
     * Los hábitos cuantificables
     * necesitan un objetivo mayor a 0.
     */
    const targetValue =
      createHabitDto.targetValue;

    if (
      typeof targetValue !== 'number' ||
      !Number.isFinite(targetValue) ||
      targetValue <= 0
    ) {
      throw new BadRequestException(
        'Los hábitos cuantificables necesitan un targetValue mayor que 0',
      );
    }

    return {
      trackingType:
        HabitTrackingType.QUANTITY,

      targetValue,

      unit:
        createHabitDto.unit?.trim() ??
        '',
    };
  }

  /*
   * Normaliza y valida trackingType,
   * targetValue y unit durante una
   * actualización.
   *
   * Aquí sí podemos utilizar los datos
   * que ya existen en MongoDB.
   */
  private getUpdateTrackingData(
    habit: HabitDocument,
    updateHabitDto: UpdateHabitDto,
  ) {
    const currentTrackingType =
      habit.trackingType ??
      HabitTrackingType.BINARY;

    const trackingType =
      updateHabitDto.trackingType ??
      currentTrackingType;

    /*
     * Si el hábito final será binario,
     * su objetivo siempre será 1.
     */
    if (
      trackingType ===
      HabitTrackingType.BINARY
    ) {
      if (
        updateHabitDto.targetValue !==
          undefined &&
        updateHabitDto.targetValue !== 1
      ) {
        throw new BadRequestException(
          'Los hábitos binarios deben tener targetValue igual a 1',
        );
      }

      return {
        trackingType:
          HabitTrackingType.BINARY,

        targetValue: 1,

        unit: '',
      };
    }

    /*
     * Si estamos cambiando un hábito
     * binario a uno cuantificable,
     * exigimos que el usuario indique
     * explícitamente el nuevo objetivo.
     */
    const changingToQuantity =
      currentTrackingType !==
        HabitTrackingType.QUANTITY &&
      updateHabitDto.trackingType ===
        HabitTrackingType.QUANTITY;

    if (
      changingToQuantity &&
      updateHabitDto.targetValue ===
        undefined
    ) {
      throw new BadRequestException(
        'Debes indicar targetValue al cambiar un hábito a tipo quantity',
      );
    }

    /*
     * Si ya era quantity y no recibimos
     * un nuevo targetValue, conservamos
     * el que ya estaba guardado.
     */
    const targetValue =
      updateHabitDto.targetValue ??
      habit.targetValue;

    if (
      typeof targetValue !== 'number' ||
      !Number.isFinite(targetValue) ||
      targetValue <= 0
    ) {
      throw new BadRequestException(
        'Los hábitos cuantificables necesitan un targetValue mayor que 0',
      );
    }

    return {
      trackingType:
        HabitTrackingType.QUANTITY,

      targetValue,

      unit:
        updateHabitDto.unit !== undefined
          ? updateHabitDto.unit.trim()
          : habit.unit ?? '',
    };
  }

  async create(
    userId: string,
    createHabitDto: CreateHabitDto,
  ) {
    const trackingData =
      this.getCreateTrackingData(
        createHabitDto,
      );

    const habit = new this.habitModel({
      ...createHabitDto,

      ...trackingData,

      startDate:
        new Date(
          createHabitDto.startDate,
        ),

      endDate:
        createHabitDto.endDate
          ? new Date(
              createHabitDto.endDate,
            )
          : null,

      userId:
        new Types.ObjectId(
          userId,
        ),
    });

    return habit.save();
  }

  async findAll(
    userId: string,
  ) {
    return this.habitModel
      .find({
        userId:
          new Types.ObjectId(
            userId,
          ),
      })
      .sort({
        createdAt: -1,
      });
  }

  async findOne(
    habitId: string,
    userId: string,
  ) {
    if (
      !Types.ObjectId.isValid(
        habitId,
      )
    ) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    const habit =
      await this.habitModel.findOne({
        _id:
          new Types.ObjectId(
            habitId,
          ),

        userId:
          new Types.ObjectId(
            userId,
          ),
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
    /*
     * Primero obtenemos el hábito
     * existente.
     *
     * Esto también verifica:
     * - que el ID sea válido
     * - que exista
     * - que pertenezca al usuario
     */
    const habit =
      await this.findOne(
        habitId,
        userId,
      );

    const trackingData =
      this.getUpdateTrackingData(
        habit,
        updateHabitDto,
      );

    const updateData = {
      ...updateHabitDto,

      ...trackingData,

      ...(updateHabitDto.startDate
        ? {
            startDate:
              new Date(
                updateHabitDto.startDate,
              ),
          }
        : {}),

      ...(updateHabitDto.endDate
        ? {
            endDate:
              new Date(
                updateHabitDto.endDate,
              ),
          }
        : {}),
    };

    /*
     * Como ya tenemos el documento,
     * aplicamos los cambios directamente
     * y utilizamos save().
     */
    habit.set(
      updateData,
    );

    return habit.save();
  }

  async remove(
    habitId: string,
    userId: string,
  ) {
    if (
      !Types.ObjectId.isValid(
        habitId,
      )
    ) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    const habit =
      await this.habitModel.findOneAndDelete({
        _id:
          new Types.ObjectId(
            habitId,
          ),

        userId:
          new Types.ObjectId(
            userId,
          ),
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

    habit.active =
      !habit.active;

    await habit.save();

    return habit;
  }
}