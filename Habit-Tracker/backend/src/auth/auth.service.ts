import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email
      .trim()
      .toLowerCase();

    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      12,
    );

    const user = await this.usersService.create({
      name: registerDto.name.trim(),
      email,
      passwordHash,
    });

    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email
      .trim()
      .toLowerCase();

    const user =
      await this.usersService.findByEmailWithPassword(
        email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const passwordIsValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      message: 'Inicio de sesión exitoso',
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
    };
  }
}