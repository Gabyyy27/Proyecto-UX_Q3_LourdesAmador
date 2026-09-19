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
  /*
   * RACHA DIARIA
   *
   * Calcula:
   * - racha diaria actual
   * - mejor racha diaria
   *
   * Reglas:
   *
   * 1. Solo participan hábitos DAILY.
   *
   * 2. Para que un día se considere
   *    completado, todos los hábitos
   *    diarios que correspondían a ese
   *    día deben estar completados.
   *
   * 3. Un día sin hábitos aplicables
   *    no suma racha, pero tampoco la
   *    rompe.
   *
   * 4. El día actual todavía no rompe
   *    la racha mientras no haya
   *    terminado.
   *
   * 5. Los registros antiguos con
   *    dateKey YYYY-MM-DD siguen siendo
   *    compatibles.
   */
  async getDailyStreak(
    userId: string,
    timezone: string,
  ) {
    const safeTimezone =
      this.validateTimezone(
        timezone,
      );

    /*
     * Obtenemos todos los hábitos
     * pertenecientes al usuario.
     */
    const habits =
      await this.habitsService
        .findAll(
          userId,
        );

    /*
     * Saber si existen hábitos diarios
     * será útil para el frontend.
     *
     * Aunque estén inactivos, podemos
     * distinguir entre:
     *
     * - usuario sin hábitos diarios
     * - usuario con hábitos diarios,
     *   pero sin una racha activa
     */
    const allDailyHabits =
      habits.filter(
        (habit) =>
          habit.frequency ===
          HabitFrequency.DAILY,
      );

    if (
      allDailyHabits.length ===
      0
    ) {
      return {
        hasDailyHabits: false,
        currentStreak: 0,
        bestStreak: 0,
      };
    }

    /*
     * Para la racha actual utilizamos
     * los hábitos diarios que están
     * activos actualmente.
     *
     * El modelo actual no almacena un
     * historial de activaciones y
     * desactivaciones, por lo que no
     * intentamos inventar períodos de
     * actividad pasados.
     */
    const dailyHabits =
      allDailyHabits.filter(
        (habit) =>
          habit.active,
      );

    if (
      dailyHabits.length ===
      0
    ) {
      return {
        hasDailyHabits: true,
        currentStreak: 0,
        bestStreak: 0,
      };
    }

    const today =
      this.getCalendarDate(
        new Date(),
        safeTimezone,
      );

    const todayKey =
      this.formatCalendarDate(
        today,
      );

    /*
     * Determinamos la fecha más antigua
     * desde la cual necesitamos evaluar
     * la racha.
     */
    const earliestStart =
      dailyHabits.reduce(
        (
          earliest,
          habit,
        ) => {
          const habitStart =
            new Date(
              Date.UTC(
                habit.startDate
                  .getUTCFullYear(),

                habit.startDate
                  .getUTCMonth(),

                habit.startDate
                  .getUTCDate(),
              ),
            );

          if (
            habitStart.getTime() <
            earliest.getTime()
          ) {
            return habitStart;
          }

          return earliest;
        },
        new Date(
          Date.UTC(
            dailyHabits[0]
              .startDate
              .getUTCFullYear(),

            dailyHabits[0]
              .startDate
              .getUTCMonth(),

            dailyHabits[0]
              .startDate
              .getUTCDate(),
          ),
        ),
      );

    /*
     * Obtenemos únicamente registros
     * completados de los hábitos diarios
     * que participan en la racha.
     */
    const habitIds =
      dailyHabits.map(
        (habit) =>
          new Types.ObjectId(
            String(
              habit._id,
            ),
          ),
      );

    const completedRecords =
      await this.habitRecordModel
        .find({
          userId:
            new Types.ObjectId(
              userId,
            ),

          habitId: {
            $in:
              habitIds,
          },

          completed:
            true,
        });

    /*
     * Mapa:
     *
     * YYYY-MM-DD
     *   -> Set de habitId completados
     *
     * Ejemplo:
     *
     * 2026-09-18
     *   -> beberAgua
     *   -> estudiar
     */
    const completedByDate =
      new Map<
        string,
        Set<string>
      >();

    for (
      const record of
      completedRecords
    ) {
      let recordDateKey:
        | string
        | null = null;

      /*
       * Formato actual:
       *
       * daily:2026-09-18
       */
      if (
        record.dateKey?.startsWith(
          'daily:',
        )
      ) {
        recordDateKey =
          record.dateKey.replace(
            'daily:',
            '',
          );
      } else if (
        /*
         * Compatibilidad con registros
         * antiguos:
         *
         * 2026-09-18
         */
        /^\d{4}-\d{2}-\d{2}$/.test(
          record.dateKey ?? '',
        )
      ) {
        recordDateKey =
          record.dateKey;
      } else if (
        record.periodStart
      ) {
        /*
         * Último respaldo en caso de
         * encontrar un registro antiguo
         * sin una clave reconocible.
         */
        recordDateKey =
          this.formatCalendarDate(
            record.periodStart,
          );
      }

      if (
        !recordDateKey
      ) {
        continue;
      }

      const habitId =
        String(
          record.habitId,
        );

      const completedHabits =
        completedByDate.get(
          recordDateKey,
        ) ??
        new Set<string>();

      completedHabits.add(
        habitId,
      );

      completedByDate.set(
        recordDateKey,
        completedHabits,
      );
    }

    type DayStatus = {
      dateKey: string;

      hasHabits:
        boolean;

      completed:
        boolean;
    };

    const days:
      DayStatus[] = [];

    /*
     * Recorremos cada fecha calendario
     * desde el hábito diario más antiguo
     * hasta hoy.
     */
    const cursor =
      new Date(
        earliestStart.getTime(),
      );

    while (
      cursor.getTime() <=
      today.getTime()
    ) {
      const dateKey =
        this.formatCalendarDate(
          cursor,
        );

      /*
       * Hábitos que correspondían a
       * esta fecha según startDate y
       * endDate.
       */
      const expectedHabits =
        dailyHabits.filter(
          (habit) => {
            const startDate =
              habit.startDate
                .toISOString()
                .slice(
                  0,
                  10,
                );

            const endDate =
              habit.endDate
                ? habit.endDate
                    .toISOString()
                    .slice(
                      0,
                      10,
                    )
                : null;

            if (
              dateKey <
              startDate
            ) {
              return false;
            }

            if (
              endDate &&
              dateKey >
                endDate
            ) {
              return false;
            }

            return true;
          },
        );

      if (
        expectedHabits.length ===
        0
      ) {
        days.push({
          dateKey,
          hasHabits: false,
          completed: false,
        });

        cursor.setUTCDate(
          cursor.getUTCDate() +
            1,
        );

        continue;
      }

      const completedHabits =
        completedByDate.get(
          dateKey,
        ) ??
        new Set<string>();

      /*
       * El día solo está cumplido si
       * TODOS los hábitos esperados
       * fueron completados.
       */
      const completed =
        expectedHabits.every(
          (habit) =>
            completedHabits.has(
              String(
                habit._id,
              ),
            ),
        );

      days.push({
        dateKey,
        hasHabits: true,
        completed,
      });

      cursor.setUTCDate(
        cursor.getUTCDate() +
          1,
      );
    }

    /*
     * MEJOR RACHA
     *
     * Los días sin hábitos se ignoran.
     *
     * El día actual incompleto tampoco
     * rompe una racha histórica porque
     * todavía puede completarse.
     */
    let runningStreak =
      0;

    let bestStreak =
      0;

    for (
      const day of days
    ) {
      if (
        !day.hasHabits
      ) {
        continue;
      }

      if (
        day.completed
      ) {
        runningStreak +=
          1;

        bestStreak =
          Math.max(
            bestStreak,
            runningStreak,
          );

        continue;
      }

      /*
       * Hoy todavía no terminó.
       */
      if (
        day.dateKey ===
        todayKey
      ) {
        continue;
      }

      runningStreak =
        0;
    }

    /*
     * RACHA ACTUAL
     *
     * Recorremos hacia atrás.
     *
     * Si hoy todavía está incompleto,
     * simplemente lo ignoramos.
     *
     * El primer día pasado incompleto
     * sí rompe la racha.
     */
    let currentStreak =
      0;

    for (
      let index =
        days.length - 1;
      index >= 0;
      index -= 1
    ) {
      const day =
        days[index];

      if (
        !day.hasHabits
      ) {
        continue;
      }

      if (
        day.dateKey ===
          todayKey &&
        !day.completed
      ) {
        continue;
      }

      if (
        day.completed
      ) {
        currentStreak +=
          1;

        continue;
      }

      break;
    }

    return {
      hasDailyHabits: true,

      currentStreak,

      bestStreak,
    };
  }

    /*
   * RACHA SEMANAL
   *
   * Calcula:
   * - racha semanal actual
   * - mejor racha semanal
   *
   * Las semanas utilizan ISO:
   *
   * weekly:2026-W38
   */
  async getWeeklyStreak(
    userId: string,
    timezone: string,
  ) {
    const safeTimezone =
      this.validateTimezone(
        timezone,
      );

    const habits =
      await this.habitsService
        .findAll(
          userId,
        );

    /*
     * Todos los hábitos semanales
     * creados por el usuario.
     *
     * Esto nos permite saber si la
     * tarjeta semanal debe existir
     * en el frontend.
     */
    const allWeeklyHabits =
      habits.filter(
        (habit) =>
          habit.frequency ===
          HabitFrequency.WEEKLY,
      );

    if (
      allWeeklyHabits.length ===
      0
    ) {
      return {
        hasWeeklyHabits: false,
        currentStreak: 0,
        bestStreak: 0,
      };
    }

    /*
     * Igual que con la racha diaria,
     * utilizamos los hábitos que están
     * activos actualmente.
     *
     * No inventamos un historial de
     * activaciones/desactivaciones que
     * el modelo todavía no almacena.
     */
    const weeklyHabits =
      allWeeklyHabits.filter(
        (habit) =>
          habit.active,
      );

    if (
      weeklyHabits.length ===
      0
    ) {
      return {
        hasWeeklyHabits: true,
        currentStreak: 0,
        bestStreak: 0,
      };
    }

    /*
     * Fecha calendario local de hoy.
     */
    const today =
      this.getCalendarDate(
        new Date(),
        safeTimezone,
      );

    /*
     * Obtiene el lunes correspondiente
     * a una fecha calendario.
     */
    const getWeekStart = (
      date: Date,
    ) => {
      const weekStart =
        new Date(
          date.getTime(),
        );

      const weekday =
        weekStart.getUTCDay() ||
        7;

      weekStart.setUTCDate(
        weekStart.getUTCDate() -
          weekday +
          1,
      );

      return weekStart;
    };

    const currentWeekStart =
      getWeekStart(
        today,
      );

    const {
      year:
        currentWeekYear,

      week:
        currentWeekNumber,
    } =
      this.getIsoWeek(
        currentWeekStart,
      );

    const currentWeekKey =
      `weekly:${currentWeekYear}-W${String(
        currentWeekNumber,
      ).padStart(
        2,
        '0',
      )}`;

    /*
     * Buscamos el hábito semanal
     * más antiguo.
     */
    const earliestStart =
      weeklyHabits.reduce(
        (
          earliest,
          habit,
        ) => {
          const habitStart =
            new Date(
              Date.UTC(
                habit.startDate
                  .getUTCFullYear(),

                habit.startDate
                  .getUTCMonth(),

                habit.startDate
                  .getUTCDate(),
              ),
            );

          if (
            habitStart.getTime() <
            earliest.getTime()
          ) {
            return habitStart;
          }

          return earliest;
        },
        new Date(
          Date.UTC(
            weeklyHabits[0]
              .startDate
              .getUTCFullYear(),

            weeklyHabits[0]
              .startDate
              .getUTCMonth(),

            weeklyHabits[0]
              .startDate
              .getUTCDate(),
          ),
        ),
      );

    const earliestWeekStart =
      getWeekStart(
        earliestStart,
      );

    /*
     * Buscamos únicamente registros
     * completados de hábitos semanales.
     */
    const habitIds =
      weeklyHabits.map(
        (habit) =>
          new Types.ObjectId(
            String(
              habit._id,
            ),
          ),
      );

    const completedRecords =
      await this.habitRecordModel
        .find({
          userId:
            new Types.ObjectId(
              userId,
            ),

          habitId: {
            $in:
              habitIds,
          },

          completed:
            true,
        });

    /*
     * Mapa:
     *
     * weekly:2026-W38
     *   -> habitId completados
     */
    const completedByWeek =
      new Map<
        string,
        Set<string>
      >();

    for (
      const record of
      completedRecords
    ) {
      let recordWeekKey:
        | string
        | null = null;

      /*
       * Formato actual.
       */
      if (
        record.dateKey?.startsWith(
          'weekly:',
        )
      ) {
        recordWeekKey =
          record.dateKey;
      } else {
        /*
         * Compatibilidad con registros
         * antiguos cuyo dateKey podía
         * ser solamente YYYY-MM-DD.
         */
        let legacyDate:
          | Date
          | null = null;

        if (
          /^\d{4}-\d{2}-\d{2}$/.test(
            record.dateKey ?? '',
          )
        ) {
          legacyDate =
            new Date(
              `${record.dateKey}T00:00:00.000Z`,
            );
        } else if (
          record.periodStart
        ) {
          legacyDate =
            new Date(
              record.periodStart,
            );
        } else if (
          record.completedAt
        ) {
          legacyDate =
            this.getCalendarDate(
              record.completedAt,
              safeTimezone,
            );
        }

        if (
          legacyDate &&
          !Number.isNaN(
            legacyDate.getTime(),
          )
        ) {
          const {
            year,
            week,
          } =
            this.getIsoWeek(
              legacyDate,
            );

          recordWeekKey =
            `weekly:${year}-W${String(
              week,
            ).padStart(
              2,
              '0',
            )}`;
        }
      }

      if (
        !recordWeekKey
      ) {
        continue;
      }

      const habitId =
        String(
          record.habitId,
        );

      const completedHabits =
        completedByWeek.get(
          recordWeekKey,
        ) ??
        new Set<string>();

      completedHabits.add(
        habitId,
      );

      completedByWeek.set(
        recordWeekKey,
        completedHabits,
      );
    }

    type WeekStatus = {
      weekKey: string;

      hasHabits:
        boolean;

      completed:
        boolean;
    };

    const weeks:
      WeekStatus[] = [];

    /*
     * Recorremos semana por semana
     * desde la semana más antigua
     * hasta la semana actual.
     */
    const cursor =
      new Date(
        earliestWeekStart.getTime(),
      );

    while (
      cursor.getTime() <=
      currentWeekStart.getTime()
    ) {
      const weekStart =
        new Date(
          cursor.getTime(),
        );

      const weekEnd =
        new Date(
          weekStart.getTime(),
        );

      weekEnd.setUTCDate(
        weekEnd.getUTCDate() +
          6,
      );

      const {
        year,
        week,
      } =
        this.getIsoWeek(
          weekStart,
        );

      const weekKey =
        `weekly:${year}-W${String(
          week,
        ).padStart(
          2,
          '0',
        )}`;

      /*
       * Un hábito semanal corresponde
       * a esta semana si su intervalo
       * startDate/endDate intersecta
       * cualquier día de la semana.
       *
       * Ejemplo:
       * si se creó el miércoles,
       * esa primera semana sí cuenta.
       */
      const expectedHabits =
        weeklyHabits.filter(
          (habit) => {
            const habitStart =
              new Date(
                Date.UTC(
                  habit.startDate
                    .getUTCFullYear(),

                  habit.startDate
                    .getUTCMonth(),

                  habit.startDate
                    .getUTCDate(),
                ),
              );

            const habitEnd =
              habit.endDate
                ? new Date(
                    Date.UTC(
                      habit.endDate
                        .getUTCFullYear(),

                      habit.endDate
                        .getUTCMonth(),

                      habit.endDate
                        .getUTCDate(),
                    ),
                  )
                : null;

            if (
              habitStart.getTime() >
              weekEnd.getTime()
            ) {
              return false;
            }

            if (
              habitEnd &&
              habitEnd.getTime() <
                weekStart.getTime()
            ) {
              return false;
            }

            return true;
          },
        );

      if (
        expectedHabits.length ===
        0
      ) {
        weeks.push({
          weekKey,
          hasHabits: false,
          completed: false,
        });

        cursor.setUTCDate(
          cursor.getUTCDate() +
            7,
        );

        continue;
      }

      const completedHabits =
        completedByWeek.get(
          weekKey,
        ) ??
        new Set<string>();

      /*
       * La semana está completada
       * solamente si TODOS los hábitos
       * semanales esperados se
       * completaron.
       */
      const completed =
        expectedHabits.every(
          (habit) =>
            completedHabits.has(
              String(
                habit._id,
              ),
            ),
        );

      weeks.push({
        weekKey,
        hasHabits: true,
        completed,
      });

      cursor.setUTCDate(
        cursor.getUTCDate() +
          7,
      );
    }

    /*
     * MEJOR RACHA SEMANAL
     *
     * Las semanas sin hábitos se
     * ignoran.
     *
     * La semana actual incompleta
     * todavía no rompe la racha.
     */
    let runningStreak =
      0;

    let bestStreak =
      0;

    for (
      const week of weeks
    ) {
      if (
        !week.hasHabits
      ) {
        continue;
      }

      if (
        week.completed
      ) {
        runningStreak +=
          1;

        bestStreak =
          Math.max(
            bestStreak,
            runningStreak,
          );

        continue;
      }

      if (
        week.weekKey ===
        currentWeekKey
      ) {
        continue;
      }

      runningStreak =
        0;
    }

    /*
     * RACHA SEMANAL ACTUAL
     *
     * Recorremos desde la semana
     * presente hacia atrás.
     *
     * Si la semana actual todavía no
     * se completa, simplemente la
     * ignoramos hasta que termine.
     */
    let currentStreak =
      0;

    for (
      let index =
        weeks.length - 1;
      index >= 0;
      index -= 1
    ) {
      const week =
        weeks[index];

      if (
        !week.hasHabits
      ) {
        continue;
      }

      if (
        week.weekKey ===
          currentWeekKey &&
        !week.completed
      ) {
        continue;
      }

      if (
        week.completed
      ) {
        currentStreak +=
          1;

        continue;
      }

      break;
    }

    return {
      hasWeeklyHabits: true,

      currentStreak,

      bestStreak,
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