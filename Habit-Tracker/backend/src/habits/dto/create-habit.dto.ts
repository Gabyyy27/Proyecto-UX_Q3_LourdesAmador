import { Type } from 'class-transformer';

import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import {
  HabitFrequency,
  HabitPriority,
  HabitTrackingType,
} from '../habits.constants.js';

/*
 * Valida targetValue dependiendo
 * del tipo de seguimiento.
 *
 * BINARY:
 * - puede omitirse porque MongoDB
 *   utilizará el valor por defecto 1
 * - si se envía, solamente puede ser 1
 *
 * QUANTITY:
 * - es obligatorio
 * - debe ser un número mayor que 0
 */
@ValidatorConstraint({
  name: 'validHabitTargetValue',
  async: false,
})
class ValidHabitTargetValueConstraint
  implements ValidatorConstraintInterface
{
  validate(
    value: unknown,
    args: ValidationArguments,
  ): boolean {
    const dto =
      args.object as CreateHabitDto;

    if (
      dto.trackingType ===
      HabitTrackingType.BINARY
    ) {
      return (
        value === undefined ||
        value === 1
      );
    }

    if (
      dto.trackingType ===
      HabitTrackingType.QUANTITY
    ) {
      return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value > 0
      );
    }

    return false;
  }

  defaultMessage(
    args: ValidationArguments,
  ): string {
    const dto =
      args.object as CreateHabitDto;

    if (
      dto.trackingType ===
      HabitTrackingType.BINARY
    ) {
      return (
        'targetValue debe ser 1 ' +
        'para hábitos binarios'
      );
    }

    if (
      dto.trackingType ===
      HabitTrackingType.QUANTITY
    ) {
      return (
        'targetValue es obligatorio ' +
        'y debe ser mayor que 0 ' +
        'para hábitos cuantificables'
      );
    }

    return 'targetValue no es válido';
  }
}

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsEnum(HabitFrequency)
  frequency!: HabitFrequency;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  customDays?: string[];

  @IsEnum(HabitPriority)
  priority!: HabitPriority;

  /*
   * Si el frontend todavía no envía
   * trackingType, el hábito continúa
   * comportándose como binario.
   */
  @IsEnum(HabitTrackingType)
  trackingType:
    HabitTrackingType =
      HabitTrackingType.BINARY;

  /*
   * @Type convierte, por ejemplo,
   * "2000" recibido desde un input
   * HTML en el número 2000.
   */
  @Type(() => Number)
  @Validate(
    ValidHabitTargetValueConstraint,
  )
  targetValue?: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  unit?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}