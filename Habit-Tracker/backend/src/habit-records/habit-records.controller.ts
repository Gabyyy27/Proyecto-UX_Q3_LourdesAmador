import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { HabitRecordsService } from './habit-records.service.js';

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