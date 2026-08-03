import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

/** Mongoose document interface for User */
export interface UserDocument extends Document {
  email: string;
  password: string;
  createdAt: Date;
  /** Compares a plain-text password against the stored hash */
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ret as any).password = undefined;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<UserDocument>('User', userSchema);
