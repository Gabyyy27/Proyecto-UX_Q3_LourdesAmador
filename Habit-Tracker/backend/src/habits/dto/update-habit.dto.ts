import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  HabitFrequency,
  HabitPriority,
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
  @IsString({ each: true })
  @IsOptional()
  customDays?: string[];

  @IsEnum(HabitPriority)
  @IsOptional()
  priority?: HabitPriority;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}