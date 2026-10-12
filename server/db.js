import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Todos opcionales. null = no medido en este registro.
    glucose: { type: Number, min: 1, max: 600, default: null },
    bpm: { type: Number, min: 1, max: 250, default: null },
    systolic: { type: Number, min: 1, max: 260, default: null },
    diastolic: { type: Number, min: 1, max: 160, default: null },
    context: {
      type: String,
      enum: ['ayunas', 'postprandial', 'reposo', 'actividad', 'noche', 'otro'],
      default: 'reposo',
    },
    notes: { type: String, default: '', trim: true, maxlength: 500 },
    measuredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

healthRecordSchema.index({ userId: 1, measuredAt: -1 });

const HealthRecord =
  mongoose.models.HealthRecord ||
  mongoose.model('HealthRecord', healthRecordSchema);

// Cache global (serverless-friendly)
let cachedConnection = null;

export async function connectDatabase() {
  if (cachedConnection) return cachedConnection;
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definido en las variables de entorno.');
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  cachedConnection = conn;
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
  return conn;
}

mongoose.connection.on('disconnected', () => {
  cachedConnection = null;
});

export function getDatabaseStatus() {
  return {
    isMongoConnected: mongoose.connection.readyState === 1,
    mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'disconnected',
    databaseName: mongoose.connection.name || '',
    mongoUriConfigured: Boolean(process.env.MONGODB_URI),
  };
}

function normalizeRecord(record) {
  return {
    id: record._id.toString(),
    _id: record._id.toString(),
    glucose: record.glucose ?? null,
    bpm: record.bpm ?? null,
    systolic: record.systolic ?? null,
    diastolic: record.diastolic ?? null,
    context: record.context,
    notes: record.notes,
    measuredAt: record.measuredAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getAllRecords(userId, { limit = 200, skip = 0 } = {}) {
  const records = await HealthRecord.find({ userId })
    .sort({ measuredAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return records.map(normalizeRecord);
}

export async function createRecord(userId, data) {
  const record = await HealthRecord.create({
    userId,
    glucose: data.glucose ?? null,
    bpm: data.bpm ?? null,
    systolic: data.systolic ?? null,
    diastolic: data.diastolic ?? null,
    context: data.context,
    notes: data.notes,
    measuredAt: data.measuredAt,
  });
  return normalizeRecord(record);
}

const UPDATABLE_FIELDS = [
  'glucose',
  'bpm',
  'systolic',
  'diastolic',
  'context',
  'notes',
  'measuredAt',
];

export async function updateRecord(userId, id, data) {
  if (!mongoose.isValidObjectId(id)) return null;

  const patch = {};
  for (const key of UPDATABLE_FIELDS) {
    if (data[key] !== undefined) patch[key] = data[key];
  }

  const updated = await HealthRecord.findOneAndUpdate(
    { _id: id, userId },
    { $set: patch },
    { returnDocument: 'after', runValidators: true }
  );

  return updated ? normalizeRecord(updated) : null;
}

export async function deleteRecord(userId, id) {
  if (!mongoose.isValidObjectId(id)) return false;
  const deleted = await HealthRecord.findOneAndDelete({ _id: id, userId });
  return Boolean(deleted);
}