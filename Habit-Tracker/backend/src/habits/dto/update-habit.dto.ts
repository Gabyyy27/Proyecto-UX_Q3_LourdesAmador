import { Type } from 'class-transformer';

import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  HabitFrequency,
  HabitPriority,
  HabitTrackingType,
} from '../habits.constants.js';

export class UpdateHabitDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  category?: string;

  @IsEnum(HabitFrequency)
  @IsOptional()
  frequency?: HabitFrequency;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  customDays?: string[];

  @IsEnum(HabitPriority)
  @IsOptional()
  priority?: HabitPriority;

  @IsEnum(HabitTrackingType)
  @IsOptional()
  trackingType?: HabitTrackingType;

  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @IsPositive()
  @IsOptional()
  targetValue?: number;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  unit?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}