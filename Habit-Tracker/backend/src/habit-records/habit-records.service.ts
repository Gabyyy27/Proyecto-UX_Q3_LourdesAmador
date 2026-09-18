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

import {
  HabitFrequency,
  HabitTrackingType,
} from '../habits/habits.constants.js';

import {
  HabitDocument,
} from '../habits/schemas/habit.schema.js';

import {
  HabitsService,
} from '../habits/habits.service.js';

import {
  HabitProgressEntry,
  HabitProgressEntryDocument,
} from './schemas/habit-progress-entry.schema.js';

import {
  HabitRecord,
  HabitRecordDocument,
} from './schemas/habit-record.schema.js';

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
};

type PeriodDescriptor = {
  dateKey: string;
  periodStart: Date;
  periodEnd: Date;
};

@Injectable()
export class HabitRecordsService {
  constructor(
    @InjectModel(HabitRecord.name)
    private readonly habitRecordModel:
      Model<HabitRecordDocument>,

    @InjectModel(HabitProgressEntry.name)
    private readonly habitProgressEntryModel:
      Model<HabitProgressEntryDocument>,

    private readonly habitsService:
      HabitsService,
  ) {}

  /*
   * Verifica que la zona horaria
   * guardada en el usuario sea válida.
   */
  private validateTimezone(
    timezone: string,
  ): string {
    try {
      new Intl.DateTimeFormat(
        'en-US',
        {
          timeZone: timezone,
        },
      ).format(new Date());

      return timezone;
    } catch {
      throw new BadRequestException(
        'La zona horaria del usuario no es válida',
      );
    }
  }

  /*
   * Obtiene año, mes y día según
   * la zona horaria del usuario.
   */
  private getLocalDateParts(
    date: Date,
    timezone: string,
  ): LocalDateParts {
    const safeTimezone =
      this.validateTimezone(
        timezone,
      );

    const formatter =
      new Intl.DateTimeFormat(
        'en-US',
        {
          timeZone:
            safeTimezone,

          year:
            'numeric',

          month:
            '2-digit',

          day:
            '2-digit',
        },
      );

    const parts =
      formatter.formatToParts(
        date,
      );

    const year =
      Number(
        parts.find(
          (part) =>
            part.type ===
            'year',
        )?.value,
      );

    const month =
      Number(
        parts.find(
          (part) =>
            part.type ===
            'month',
        )?.value,
      );

    const day =
      Number(
        parts.find(
          (part) =>
            part.type ===
            'day',
        )?.value,
      );

    if (
      !year ||
      !month ||
      !day
    ) {
      throw new BadRequestException(
        'No se pudo determinar la fecha local del usuario',
      );
    }

    return {
      year,
      month,
      day,
    };
  }

  private formatCalendarDate(
    date: Date,
  ): string {
    const year =
      date.getUTCFullYear();

    const month =
      String(
        date.getUTCMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getUTCDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  }

  /*
   * Convierte la fecha local del
   * usuario en una fecha calendario
   * normalizada.
   *
   * Estos Date se utilizan para
   * representar límites lógicos
   * del período.
   */
  private getCalendarDate(
    date: Date,
    timezone: string,
  ): Date {
    const {
      year,
      month,
      day,
    } =
      this.getLocalDateParts(
        date,
        timezone,
      );

    return new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );
  }

  private endOfCalendarDay(
    date: Date,
  ): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
  }

  /*
   * Calcula año y semana ISO.
   *
   * Ejemplo:
   * 2026-W38
   */
  private getIsoWeek(
    calendarDate: Date,
  ) {
    const workingDate =
      new Date(
        calendarDate.getTime(),
      );

    const weekday =
      workingDate.getUTCDay() ||
      7;

    workingDate.setUTCDate(
      workingDate.getUTCDate() +
        4 -
        weekday,
    );

    const isoYear =
      workingDate.getUTCFullYear();

    const yearStart =
      new Date(
        Date.UTC(
          isoYear,
          0,
          1,
        ),
      );

    const week =
      Math.ceil(
        (
          (
            workingDate.getTime() -
            yearStart.getTime()
          ) /
            86400000 +
          1
        ) / 7,
      );

    return {
      year: isoYear,
      week,
    };
  }

  /*
   * Construye la clave y límites
   * correspondientes a la frecuencia
   * del hábito.
   */
  private getPeriodDescriptor(
    frequency: HabitFrequency,
    now: Date,
    timezone: string,
  ): PeriodDescriptor {
    const calendarDate =
      this.getCalendarDate(
        now,
        timezone,
      );

    const localDateKey =
      this.formatCalendarDate(
        calendarDate,
      );

    if (
      frequency ===
      HabitFrequency.DAILY
    ) {
      return {
        dateKey:
          `daily:${localDateKey}`,

        periodStart:
          calendarDate,

        periodEnd:
          this.endOfCalendarDay(
            calendarDate,
          ),
      };
    }

    if (
      frequency ===
      HabitFrequency.WEEKLY
    ) {
      const weekday =
        calendarDate.getUTCDay() ||
        7;

      const monday =
        new Date(
          calendarDate.getTime(),
        );

      monday.setUTCDate(
        monday.getUTCDate() -
          weekday +
          1,
      );

      const sunday =
        new Date(
          monday.getTime(),
        );

      sunday.setUTCDate(
        sunday.getUTCDate() +
          6,
      );

      const {
        year,
        week,
      } =
        this.getIsoWeek(
          calendarDate,
        );

      return {
        dateKey:
          `weekly:${year}-W${String(
            week,
          ).padStart(
            2,
            '0',
          )}`,

        periodStart:
          monday,

        periodEnd:
          this.endOfCalendarDay(
            sunday,
          ),
      };
    }

    if (
      frequency ===
      HabitFrequency.MONTHLY
    ) {
      const year =
        calendarDate
          .getUTCFullYear();

      const monthIndex =
        calendarDate
          .getUTCMonth();

      const firstDay =
        new Date(
          Date.UTC(
            year,
            monthIndex,
            1,
          ),
        );

      const lastDay =
        new Date(
          Date.UTC(
            year,
            monthIndex + 1,
            0,
          ),
        );

      const month =
        String(
          monthIndex + 1,
        ).padStart(
          2,
          '0',
        );

      return {
        dateKey:
          `monthly:${year}-${month}`,

        periodStart:
          firstDay,

        periodEnd:
          this.endOfCalendarDay(
            lastDay,
          ),
      };
    }

    /*
     * CUSTOM funciona por cada día
     * seleccionado.
     *
     * Ejemplo:
     * lunes, miércoles y viernes.
     */
    return {
      dateKey:
        `custom:${localDateKey}`,

      periodStart:
        calendarDate,

      periodEnd:
        this.endOfCalendarDay(
          calendarDate,
        ),
    };
  }

  /*
   * Verifica:
   * - hábito activo
   * - fecha de inicio
   * - fecha final
   * - días personalizados
   */
  private assertHabitAvailable(
    habit: HabitDocument,
    now: Date,
    timezone: string,
  ) {
    if (!habit.active) {
      throw new BadRequestException(
        'No puedes registrar progreso en un hábito inactivo',
      );
    }

    const currentDate =
      this.formatCalendarDate(
        this.getCalendarDate(
          now,
          timezone,
        ),
      );

    /*
     * Las fechas del hábito fueron
     * guardadas desde YYYY-MM-DD.
     * Utilizamos su parte ISO como
     * fecha calendario.
     */
    const startDate =
      habit.startDate
        .toISOString()
        .slice(
          0,
          10,
        );

    if (
      currentDate <
      startDate
    ) {
      throw new BadRequestException(
        'Este hábito todavía no ha comenzado',
      );
    }

    if (habit.endDate) {
      const endDate =
        habit.endDate
          .toISOString()
          .slice(
            0,
            10,
          );

      if (
        currentDate >
        endDate
      ) {
        throw new BadRequestException(
          'Este hábito ya finalizó',
        );
      }
    }

    if (
      habit.frequency ===
      HabitFrequency.CUSTOM
    ) {
      const weekday =
        new Intl.DateTimeFormat(
          'en-US',
          {
            timeZone:
              timezone,

            weekday:
              'long',
          },
        )
          .format(now)
          .toLowerCase();

      const isScheduled =
        habit.customDays?.includes(
          weekday,
        );

      if (!isScheduled) {
        throw new BadRequestException(
          'Este hábito no está programado para hoy',
        );
      }
    }
  }

  private isDuplicateKeyError(
    error: unknown,
  ): error is {
    code: number;
  } {
    return (
      typeof error ===
        'object' &&
      error !== null &&
      'code' in error &&
      (
        error as {
          code?: unknown;
        }
      ).code === 11000
    );
  }

  /*
   * Obtiene o crea el resumen del
   * período actual.
   *
   * Los datos de objetivo y unidad
   * quedan como snapshot del período.
   */
  private async getOrCreateRecord(
    habit: HabitDocument,
    habitId: string,
    userId: string,
    period: PeriodDescriptor,
    now: Date,
  ): Promise<HabitRecordDocument> {
    const trackingType =
      habit.trackingType ??
      HabitTrackingType.BINARY;

    const targetValue =
      trackingType ===
      HabitTrackingType.BINARY
        ? 1
        : habit.targetValue;

    const filter = {
      habitId:
        new Types.ObjectId(
          habitId,
        ),

      userId:
        new Types.ObjectId(
          userId,
        ),

      dateKey:
        period.dateKey,
    };

    try {
      const record =
        await this.habitRecordModel
          .findOneAndUpdate(
            filter,
            {
              $setOnInsert: {
                habitId:
                  new Types.ObjectId(
                    habitId,
                  ),

                userId:
                  new Types.ObjectId(
                    userId,
                  ),

                date:
                  now,

                dateKey:
                  period.dateKey,

                frequency:
                  habit.frequency,

                trackingType,

                targetValue,

                currentValue:
                  0,

                unit:
                  trackingType ===
                  HabitTrackingType.QUANTITY
                    ? habit.unit ?? ''
                    : '',

                periodStart:
                  period.periodStart,

                periodEnd:
                  period.periodEnd,

                completed:
                  false,

                completedAt:
                  null,
              },
            },
            {
              upsert:
                true,

              new:
                true,

              setDefaultsOnInsert:
                true,
            },
          );

      if (!record) {
        throw new ConflictException(
          'No se pudo crear el período del hábito',
        );
      }

      return record;
    } catch (error) {
      /*
       * Si dos peticiones intentan crear
       * el mismo período simultáneamente,
       * el índice unique evita duplicados.
       * En ese caso simplemente obtenemos
       * el registro que ganó la carrera.
       */
      if (
        this.isDuplicateKeyError(
          error,
        )
      ) {
        const existingRecord =
          await this.habitRecordModel
            .findOne(
              filter,
            );

        if (
          existingRecord
        ) {
          return existingRecord;
        }
      }

      throw error;
    }
  }

  /*
   * HÁBITO BINARIO
   *
   * Una sola acción completa todo
   * el período.
   */
  async completeHabit(
    habitId: string,
    userId: string,
    timezone: string,
  ) {
    const habit =
      await this.habitsService
        .findOne(
          habitId,
          userId,
        );

    const now =
      new Date();

    this.assertHabitAvailable(
      habit,
      now,
      timezone,
    );

    const trackingType =
      habit.trackingType ??
      HabitTrackingType.BINARY;

    if (
      trackingType !==
      HabitTrackingType.BINARY
    ) {
      throw new BadRequestException(
        'Los hábitos por cantidad se completan registrando progreso',
      );
    }

    const period =
      this.getPeriodDescriptor(
        habit.frequency,
        now,
        timezone,
      );

    const record =
      await this.getOrCreateRecord(
        habit,
        habitId,
        userId,
        period,
        now,
      );

    if (
      record.completed
    ) {
      throw new ConflictException(
        'Este hábito ya fue completado en el período actual',
      );
    }

    /*
     * La condición completed:false hace
     * que dos clics simultáneos no puedan
     * completar dos veces el mismo período.
     */
    const completedRecord =
      await this.habitRecordModel
        .findOneAndUpdate(
          {
            _id:
              record._id,

            completed:
              false,
          },
          {
            $set: {
              currentValue:
                1,

              completed:
                true,

              completedAt:
                now,
            },
          },
          {
            new:
              true,
          },
        );

    if (
      !completedRecord
    ) {
      throw new ConflictException(
        'Este hábito ya fue completado en el período actual',
      );
    }

    return {
      message:
        'Hábito marcado como completado',

      record:
        completedRecord,
    };
  }

  /*
   * HÁBITO POR CANTIDAD
   *
   * Registra un avance individual
   * y suma su valor al período.
   */
  async addProgress(
    habitId: string,
    userId: string,
    timezone: string,
    amount: number,
  ) {
    if (
      typeof amount !==
        'number' ||
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      throw new BadRequestException(
        'La cantidad debe ser mayor que 0',
      );
    }

    const habit =
      await this.habitsService
        .findOne(
          habitId,
          userId,
        );

    const now =
      new Date();

    this.assertHabitAvailable(
      habit,
      now,
      timezone,
    );

    const trackingType =
      habit.trackingType ??
      HabitTrackingType.BINARY;

    if (
      trackingType !==
      HabitTrackingType.QUANTITY
    ) {
      throw new BadRequestException(
        'Los hábitos de tipo Sí / No no aceptan cantidades',
      );
    }

    const period =
      this.getPeriodDescriptor(
        habit.frequency,
        now,
        timezone,
      );

    const record =
      await this.getOrCreateRecord(
        habit,
        habitId,
        userId,
        period,
        now,
      );

    /*
     * Primero guardamos el evento
     * individual.
     */
    const entry =
      new this
        .habitProgressEntryModel({
          habitId:
            new Types.ObjectId(
              habitId,
            ),

          userId:
            new Types.ObjectId(
              userId,
            ),

          habitRecordId:
            record._id,

          dateKey:
            period.dateKey,

          amount,

          occurredAt:
            now,
        });

    await entry.save();

    let updatedRecord:
      | HabitRecordDocument
      | null = null;

    try {
      /*
       * $inc es atómico.
       *
       * Si el usuario registra varios
       * avances rápidamente, no perdemos
       * incrementos por condiciones
       * de carrera.
       */
      updatedRecord =
        await this.habitRecordModel
          .findByIdAndUpdate(
            record._id,
            {
              $inc: {
                currentValue:
                  amount,
              },
            },
            {
              new:
                true,
            },
          );
    } catch (error) {
      /*
       * Si la suma falla, eliminamos el
       * evento recién creado para evitar
       * dejar información inconsistente.
       */
      await this
        .habitProgressEntryModel
        .deleteOne({
          _id:
            entry._id,
        });

      throw error;
    }

    if (
      !updatedRecord
    ) {
      await this
        .habitProgressEntryModel
        .deleteOne({
          _id:
            entry._id,
        });

      throw new ConflictException(
        'No se pudo actualizar el progreso del hábito',
      );
    }

    /*
     * Al alcanzar o superar el objetivo,
     * el período se completa
     * automáticamente.
     */
    if (
      !updatedRecord.completed &&
      updatedRecord.currentValue >=
        updatedRecord.targetValue
    ) {
      await this.habitRecordModel
        .updateOne(
          {
            _id:
              updatedRecord._id,

            completed:
              false,

            currentValue: {
              $gte:
                updatedRecord.targetValue,
            },
          },
          {
            $set: {
              completed:
                true,

              completedAt:
                now,
            },
          },
        );

      const completedRecord =
        await this.habitRecordModel
          .findById(
            updatedRecord._id,
          );

      if (
        completedRecord
      ) {
        updatedRecord =
          completedRecord;
      }
    }

    return {
      message:
        updatedRecord.completed
          ? 'Progreso registrado. Objetivo completado.'
          : 'Progreso registrado',

      record:
        updatedRecord,

      entry,
    };
  }

  async getHabitHistory(
    habitId: string,
    userId: string,
  ) {
    await this.habitsService
      .findOne(
        habitId,
        userId,
      );

    return this.habitRecordModel
      .find({
        habitId:
          new Types.ObjectId(
            habitId,
          ),

        userId:
          new Types.ObjectId(
            userId,
          ),
      })
      .sort({
        periodStart: -1,
        date: -1,
      });
  }
}