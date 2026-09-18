import { Type } from 'class-transformer';

import {
  IsNumber,
  IsPositive,
} from 'class-validator';

export class AddProgressDto {
  /*
   * Cantidad que el usuario desea
   * agregar al progreso actual.
   *
   * Ejemplos:
   * 200 ml
   * 1.5 km
   * 10 páginas
   */
  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @IsPositive({
    message:
      'La cantidad debe ser mayor que 0',
  })
  amount!: number;
}