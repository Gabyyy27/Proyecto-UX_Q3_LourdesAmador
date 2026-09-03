import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  HabitFrequency,
  HabitPriority,
} from '../habits.constants.js';

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

  @IsEnum(HabitFrequency)
  frequency!: HabitFrequency;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customDays?: string[];

  @IsEnum(HabitPriority)
  priority!: HabitPriority;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}