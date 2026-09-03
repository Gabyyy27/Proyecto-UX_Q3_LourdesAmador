import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';

import { HabitsService } from './habits.service.js';

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
};

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(
    private readonly habitsService:
      HabitsService,
  ) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createHabitDto: CreateHabitDto,
  ) {
    return this.habitsService.create(
      request.user.id,
      createHabitDto,
    );
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.habitsService.findAll(
      request.user.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitsService.findOne(
      id,
      request.user.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,

    @Req()
    request: AuthenticatedRequest,

    @Body()
    updateHabitDto: UpdateHabitDto,
  ) {
    return this.habitsService.update(
      id,
      request.user.id,
      updateHabitDto,
    );
  }

  @Patch(':id/toggle')
  toggleActive(
    @Param('id') id: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitsService.toggleActive(
      id,
      request.user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.habitsService.remove(
      id,
      request.user.id,
    );
  }
}