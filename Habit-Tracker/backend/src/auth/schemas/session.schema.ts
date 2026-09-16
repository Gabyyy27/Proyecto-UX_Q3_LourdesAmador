import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type SessionDocument =
  HydratedDocument<Session>;

@Schema({
  timestamps: true,
  collection: 'sessions',
})
export class Session {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  refreshTokenHash: string;

  @Prop({
    type: Date,
    required: true,
  })
  expiresAt: Date;
}

export const SessionSchema =
  SchemaFactory.createForClass(Session);

/*
 * MongoDB eliminará automáticamente
 * las sesiones cuya fecha de expiración
 * ya haya pasado.
 */
SessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);