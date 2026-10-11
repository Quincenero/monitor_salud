import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },

    // --- Verificación de email ---
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    emailVerified: this.emailVerified ?? true, // undefined => true (por compatibilidad con usuarios antiguos)
    createdAt: this.createdAt,
  };
};

// Comparación dummy para mitigar timing attacks en /login
let dummyHashPromise = null;
userSchema.statics.dummyCompare = async function (password) {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash('timing-attack-mitigation', 12);
  }
  const hash = await dummyHashPromise;
  return bcrypt.compare(password, hash);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);