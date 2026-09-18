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