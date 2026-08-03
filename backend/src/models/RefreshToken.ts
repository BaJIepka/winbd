import { Schema, model, Document, Types } from 'mongoose';

export interface RefreshTokenDocument extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
});

// TTL index: MongoDB автоматически удаляет истёкшие токены
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);
