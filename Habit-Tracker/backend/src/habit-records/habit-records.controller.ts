import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import {
  AddProgressDto,
} from './dto/add-progress.dto.js';

import {
  HabitRecordsService,
} from './habit-records.service.js';

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
};

type AuthenticatedRequest =
  Request & {
    user: AuthenticatedUser;
  };

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitRecordsController {
  constructor(
    private readonly habitRecordsService:
      HabitRecordsService,
  ) {}

  /*
   * Racha diaria global del usuario.
   *
   * {
   *   hasDailyHabits: true,
   *   currentStreak: 4,
   *   bestStreak: 7
   * }
   */
  @Get('streaks/daily')
  getDailyStreak(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitRecordsService
      .getDailyStreak(
        request.user.id,
        request.user.timezone,
      );
  }

  /*
   * Racha semanal global del usuario.
   *
   * {
   *   hasWeeklyHabits: true,
   *   currentStreak: 3,
   *   bestStreak: 5
   * }
   *
   * Si nunca ha creado hábitos
   * semanales:
   *
   * {
   *   hasWeeklyHabits: false,
   *   currentStreak: 0,
   *   bestStreak: 0
   * }
   */
  @Get('streaks/weekly')
  getWeeklyStreak(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitRecordsService
      .getWeeklyStreak(
        request.user.id,
        request.user.timezone,
      );
  }

  /*
   * Progreso de la semana actual.
   *
   * Devuelve el porcentaje de
   * cumplimiento por cada día:
   *
   * Lun - Mar - Mié - Jue -
   * Vie - Sáb - Dom
   *
   * Participan hábitos:
   * - DAILY
   * - CUSTOM cuando corresponden
   *   al día seleccionado
   */
  @Get('progress/weekly')
  getWeeklyProgress(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitRecordsService
      .getWeeklyProgress(
        request.user.id,
        request.user.timezone,
      );
  }

  /*
   * Completa hábitos binarios.
   *
   * Ejemplo:
   * Tender la cama.
   */
  @Post(':habitId/complete')
  completeHabit(
    @Param('habitId')
    habitId: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitRecordsService
      .completeHabit(
        habitId,
        request.user.id,
        request.user.timezone,
      );
  }

  /*
   * Registra progreso para hábitos
   * cuantificables.
   *
   * Ejemplo:
   * +200 ml de agua.
   */
  @Post(':habitId/progress')
  addProgress(
    @Param('habitId')
    habitId: string,

    @Req()
    request: AuthenticatedRequest,

    @Body()
    addProgressDto:
      AddProgressDto,
  ) {
    return this.habitRecordsService
      .addProgress(
        habitId,
        request.user.id,
        request.user.timezone,
        addProgressDto.amount,
      );
  }

  /*
   * Historial de períodos
   * del hábito.
   */
  @Get(':habitId/history')
  getHistory(
    @Param('habitId')
    habitId: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitRecordsService
      .getHabitHistory(
        habitId,
        request.user.id,
      );
  }
}