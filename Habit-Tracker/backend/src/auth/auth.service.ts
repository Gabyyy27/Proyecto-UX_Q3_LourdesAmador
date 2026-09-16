import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import {
  Model,
} from 'mongoose';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';

import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

import {
  Session,
  SessionDocument,
} from './schemas/session.schema.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,

    @InjectModel(Session.name)
    private readonly sessionModel:
      Model<SessionDocument>,
  ) {}

  async register(
    registerDto: RegisterDto,
  ) {
    const email =
      registerDto.email
        .trim()
        .toLowerCase();

    const existingUser =
      await this.usersService.findByEmail(
        email,
      );

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        registerDto.password,
        12,
      );

    const user =
      await this.usersService.create({
        name:
          registerDto.name.trim(),

        email,

        passwordHash,
      });

    return {
      message:
        'Usuario registrado correctamente',

      user: {
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        timezone:
          user.timezone,
      },
    };
  }

  async login(
    loginDto: LoginDto,
  ) {
    const email =
      loginDto.email
        .trim()
        .toLowerCase();

    const user =
      await this.usersService
        .findByEmailWithPassword(
          email,
        );

    if (!user) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    const passwordIsValid =
      await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Correo o contraseña incorrectos',
      );
    }

    /*
     * Payload que llevará el JWT.
     */
    const payload = {
      sub:
        user._id.toString(),

      email:
        user.email,
    };

    /*
     * Access token:
     * será nuestro JWT de corta duración.
     */
    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    /*
     * Creamos un refresh token
     * completamente aleatorio.
     */
    const refreshToken =
      this.createRefreshToken();

    /*
     * Nunca guardamos el refresh token
     * real en MongoDB.
     *
     * Solamente almacenamos su hash.
     */
    const refreshTokenHash =
      this.hashRefreshToken(
        refreshToken,
      );

    /*
     * Calculamos cuándo expira
     * el refresh token.
     */
    const expiresAt =
      this.getRefreshTokenExpiration();

    /*
     * Guardamos la sesión.
     */
    await this.sessionModel.create({
      userId:
        user._id,

      refreshTokenHash,

      expiresAt,
    });

    /*
     * Por AHORA devolvemos ambos tokens.
     *
     * En el siguiente paso el Controller
     * los tomará y los convertirá en
     * cookies HttpOnly.
     *
     * Después ya no se enviarán al
     * frontend dentro del JSON.
     */
    return {
      message:
        'Inicio de sesión exitoso',

      accessToken,

      refreshToken,

      user: {
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        timezone:
          user.timezone,
      },
    };
  }

  /*
   * Genera un token aleatorio
   * criptográficamente seguro.
   */
  private createRefreshToken():
    string {
    return randomBytes(48)
      .toString(
        'base64url',
      );
  }

  /*
   * Convierte el refresh token
   * en un hash SHA-256.
   *
   * Ese hash es el que guardamos
   * en MongoDB.
   */
  private hashRefreshToken(
    refreshToken: string,
  ): string {
    return createHash(
      'sha256',
    )
      .update(
        refreshToken,
      )
      .digest(
        'hex',
      );
  }

  /*
   * Calcula la fecha de expiración
   * de la sesión.
   */
  private getRefreshTokenExpiration():
    Date {
    const expirationDays =
      Number(
        this.configService.get(
          'REFRESH_TOKEN_EXPIRES_IN_DAYS',
        ) ?? 7,
      );

    const milliseconds =
      expirationDays *
      24 *
      60 *
      60 *
      1000;

    return new Date(
      Date.now() +
        milliseconds,
    );
  }
  async refreshSession(
  refreshToken: string,
) {
  if (!refreshToken) {
    throw new UnauthorizedException(
      'Refresh token no proporcionado',
    );
  }

  /*
   * Calculamos el mismo hash que
   * almacenamos durante el login.
   */
  const refreshTokenHash =
    this.hashRefreshToken(
      refreshToken,
    );

  /*
   * Buscamos la sesión y, al mismo tiempo,
   * eliminamos el refresh token anterior.
   *
   * Esto hace que cada refresh token
   * solamente pueda utilizarse una vez.
   */
  const session =
    await this.sessionModel.findOneAndDelete({
      refreshTokenHash,

      expiresAt: {
        $gt: new Date(),
      },
    });

  if (!session) {
    throw new UnauthorizedException(
      'La sesión no es válida o ha expirado',
    );
  }

  /*
   * Obtenemos nuevamente al usuario
   * asociado con la sesión.
   */
  const user =
    await this.usersService.findById(
      session.userId.toString(),
    );

  if (!user) {
    throw new UnauthorizedException(
      'Usuario no encontrado',
    );
  }

  /*
   * Creamos un nuevo access JWT.
   */
  const payload = {
    sub: user._id.toString(),
    email: user.email,
  };

  const accessToken =
    await this.jwtService.signAsync(
      payload,
    );

  /*
   * También rotamos el refresh token.
   *
   * El token viejo acaba de ser eliminado,
   * por lo que generamos uno completamente
   * nuevo.
   */
  const newRefreshToken =
    this.createRefreshToken();

  const newRefreshTokenHash =
    this.hashRefreshToken(
      newRefreshToken,
    );

  const expiresAt =
    this.getRefreshTokenExpiration();

  /*
   * Guardamos la nueva sesión.
   */
  await this.sessionModel.create({
    userId: user._id,

    refreshTokenHash:
      newRefreshTokenHash,

    expiresAt,
  });

  return {
    accessToken,

    refreshToken:
      newRefreshToken,

    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      timezone: user.timezone,
    },
  };
}
async logoutSession(
  refreshToken?: string,
) {
  /*
   * Si no existe refresh token,
   * simplemente consideramos la
   * sesión cerrada.
   */
  if (!refreshToken) {
    return;
  }

  /*
   * Generamos el mismo hash que
   * almacenamos en MongoDB.
   */
  const refreshTokenHash =
    this.hashRefreshToken(
      refreshToken,
    );

  /*
   * Eliminamos únicamente la sesión
   * correspondiente a este navegador.
   */
  await this.sessionModel.deleteOne({
    refreshTokenHash,
  });
}
}